<?php
declare(strict_types=1);
$requestPath=trim(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH),'/');
$requestParts=explode('/',$requestPath);
$customerRoute=in_array('customers',$requestParts,true);
$secureCookie=(getenv('SESSION_SECURE') === 'true') || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
$sameSite=getenv('SESSION_SAMESITE') ?: ($secureCookie ? 'None' : 'Lax');
if ($sameSite==='None' && !$secureCookie) $sameSite='Lax';
session_name($customerRoute ? 'SRINIDHI_CUSTOMER' : 'PHPSESSID');
session_set_cookie_params(['httponly'=>true,'secure'=>$secureCookie,'samesite'=>$sameSite,'path'=>'/']);
session_start();
header('Content-Type: application/json; charset=utf-8');
$allowedOrigins=array_filter(array_map('trim',explode(',',getenv('FRONTEND_ORIGINS') ?: (getenv('FRONTEND_ORIGIN') ?: 'http://localhost:5173'))));
$requestOrigin=$_SERVER['HTTP_ORIGIN']??'';
if ($requestOrigin!=='' && in_array($requestOrigin,$allowedOrigins,true)) header("Access-Control-Allow-Origin: $requestOrigin");
header('Vary: Origin'); header('Access-Control-Allow-Credentials: true'); header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token'); header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
function respond(mixed $data, int $status=200): never { http_response_code($status); echo json_encode(['data'=>$data]); exit; }
function fail(string $message, int $status=400): never { http_response_code($status); echo json_encode(['error'=>$message]); exit; }
function body(): array { $input=json_decode(file_get_contents('php://input'), true); return is_array($input) ? $input : []; }
function requireAuth(): void { if (empty($_SESSION['admin_id'])) fail('Authentication required',401); }
function customerCsrf(): string { if (empty($_SESSION['customer_csrf'])) $_SESSION['customer_csrf']=bin2hex(random_bytes(32)); return $_SESSION['customer_csrf']; }
function requireCustomerCsrf(): void { $provided=$_SERVER['HTTP_X_CSRF_TOKEN']??''; if (!is_string($provided) || $provided==='' || !hash_equals(customerCsrf(),$provided)) fail('Your secure session expired. Refresh and try again.',403); }
function customerData(array $customer): array { return ['id'=>(int)$customer['id'],'name'=>$customer['name'],'email'=>$customer['email'],'phone'=>$customer['phone']]; }
function textField(array $input, string $key, bool $required=true, ?int $maxLength=null): ?string { $value=$input[$key]??null; if ($value===null && !$required) return null; if (!is_string($value)) fail(ucfirst(str_replace('_',' ',$key)).' must be text'); $value=trim($value); if ($required && $value==='') fail(ucfirst(str_replace('_',' ',$key)).' is required'); if ($maxLength!==null && strlen($value)>$maxLength) fail(ucfirst(str_replace('_',' ',$key)).' is too long'); return $value==='' ? null : $value; }
try {
  $dsn='mysql:host='.(getenv('DB_HOST') ?: '127.0.0.1').';dbname='.(getenv('DB_NAME') ?: 'srinidhi_constructions').';charset=utf8mb4';
  $pdo=new PDO($dsn,getenv('DB_USER') ?: 'root',getenv('DB_PASS') ?: '',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
  $parts=$requestParts; $resource=''; $id=null; $customerAction=''; $customerIndex=array_search('customers',$parts,true); if ($customerIndex!==false) { $resource='customers'; $customerAction=$parts[$customerIndex+1]??''; } else { foreach ($parts as $part) { if (in_array($part,['login','logout','projects','services','enquiries','dashboard'],true)) { $resource=$part; } elseif (is_numeric($part)) { $id=(int)$part; } } } $method=$_SERVER['REQUEST_METHOD'];
  if ($resource==='customers') {
    if ($customerAction==='csrf' && $method==='GET') respond(['csrfToken'=>customerCsrf()]);
    if ($customerAction==='register' && $method==='POST') {
      requireCustomerCsrf(); $input=body(); $name=textField($input,'name',true,120); $email=strtolower((string)textField($input,'email',true,190)); $phone=textField($input,'phone',false,30); $password=$input['password']??null;
      if (strlen((string)$name)<2) fail('Please enter your full name');
      if (!filter_var($email,FILTER_VALIDATE_EMAIL)) fail('Please enter a valid email address');
      if (!is_string($password) || strlen($password)<12 || strlen($password)>72) fail('Password must be between 12 and 72 characters');
      if ($phone!==null && !preg_match('/^[+0-9(). -]{7,30}$/',$phone)) fail('Please enter a valid phone number');
      $check=$pdo->prepare('SELECT id FROM customers WHERE email=?'); $check->execute([$email]); if ($check->fetch()) fail('An account with this email already exists',409);
      try { $insert=$pdo->prepare('INSERT INTO customers (full_name,email,phone,password_hash) VALUES (?,?,?,?)'); $insert->execute([$name,$email,$phone,password_hash($password,PASSWORD_DEFAULT)]); } catch (PDOException $exception) { if ($exception->getCode()==='23000') fail('An account with this email already exists',409); throw $exception; }
      session_regenerate_id(true); $_SESSION['customer_id']=(int)$pdo->lastInsertId(); $_SESSION['customer_csrf']=bin2hex(random_bytes(32)); respond(['customer'=>['id'=>$_SESSION['customer_id'],'name'=>$name,'email'=>$email,'phone'=>$phone],'csrfToken'=>$_SESSION['customer_csrf']],201);
    }
    if ($customerAction==='login' && $method==='POST') {
      requireCustomerCsrf(); $input=body(); $email=strtolower((string)textField($input,'email',true,190)); $password=$input['password']??null;
      if (!filter_var($email,FILTER_VALIDATE_EMAIL) || !is_string($password) || $password==='') fail('Enter a valid email address and password');
      $query=$pdo->prepare('SELECT id,full_name AS name,email,phone,password_hash FROM customers WHERE email=?'); $query->execute([$email]); $customer=$query->fetch();
      if (!$customer || !password_verify($password,$customer['password_hash'])) fail('Email or password is incorrect',401);
      session_regenerate_id(true); $_SESSION['customer_id']=(int)$customer['id']; $_SESSION['customer_csrf']=bin2hex(random_bytes(32)); respond(['customer'=>customerData($customer),'csrfToken'=>$_SESSION['customer_csrf']]);
    }
    if ($customerAction==='me' && $method==='GET') {
      if (empty($_SESSION['customer_id'])) fail('Please sign in to continue',401);
      $query=$pdo->prepare('SELECT id,full_name AS name,email,phone FROM customers WHERE id=?'); $query->execute([$_SESSION['customer_id']]); $customer=$query->fetch();
      if (!$customer) { unset($_SESSION['customer_id']); fail('Please sign in to continue',401); }
      respond(['customer'=>customerData($customer),'csrfToken'=>customerCsrf()]);
    }
    if ($customerAction==='logout' && $method==='POST') {
      requireCustomerCsrf(); unset($_SESSION['customer_id']); session_regenerate_id(true); $_SESSION['customer_csrf']=bin2hex(random_bytes(32)); respond(['message'=>'Signed out','csrfToken'=>$_SESSION['customer_csrf']]);
    }
    fail('Customer route not found',404);
  }
  if ($resource==='login' && $method==='POST') { $input=body(); if (!filter_var($input['email']??'',FILTER_VALIDATE_EMAIL) || !is_string($input['password']??'')) fail('Valid email and password are required'); $s=$pdo->prepare('SELECT * FROM admins WHERE email=?'); $s->execute([$input['email']]); $admin=$s->fetch(); if (!$admin || !password_verify($input['password'],$admin['password_hash'])) fail('Invalid credentials',401); session_regenerate_id(true); $_SESSION['admin_id']=$admin['id']; $_SESSION['csrf_token']=bin2hex(random_bytes(32)); respond(['id'=>$admin['id'],'name'=>$admin['name'],'csrf'=>$_SESSION['csrf_token']]); }
  if ($resource==='logout' && $method==='POST') { session_destroy(); respond(['message'=>'Logged out']); }
  if ($resource==='projects' && $method==='GET') { $s=$pdo->query('SELECT * FROM projects ORDER BY created_at DESC'); respond($s->fetchAll()); }
  if ($resource==='services' && $method==='GET') { respond($pdo->query('SELECT * FROM services ORDER BY sort_order,id')->fetchAll()); }
  if ($resource==='enquiries' && $method==='POST') {
    $input=body();
    $name=$input['name']??null; $email=$input['email']??null; $message=$input['message']??null;
    $phone=$input['phone']??null; $subject=$input['subject']??null;
    if (!is_string($name) || trim($name)==='') fail('Name is required');
    if (!is_string($email) || !filter_var(trim($email),FILTER_VALIDATE_EMAIL)) fail('A valid email address is required');
    if (!is_string($message) || trim($message)==='') fail('Project details are required');
    if ($phone!==null && !is_string($phone)) fail('Phone must be text');
    if ($subject!==null && !is_string($subject)) fail('Subject must be text');
    $name=trim($name); $email=trim($email); $message=trim($message);
    $phone=$phone===null || trim($phone)==='' ? null : trim($phone);
    $subject=$subject===null || trim($subject)==='' ? null : trim($subject);
    if (strlen($name)>120 || strlen($email)>190 || ($phone!==null && strlen($phone)>40) || ($subject!==null && strlen($subject)>180)) fail('One or more fields exceed the allowed length');
    $s=$pdo->prepare('INSERT INTO enquiries (name,email,phone,subject,message) VALUES (:name,:email,:phone,:subject,:message)');
    $s->execute(['name'=>$name,'email'=>$email,'phone'=>$phone,'subject'=>$subject,'message'=>$message]);
    respond(['id'=>(int)$pdo->lastInsertId()],201);
  }
  requireAuth();
  if ($resource==='dashboard' && $method==='GET') { respond(['projects'=>(int)$pdo->query('SELECT COUNT(*) FROM projects')->fetchColumn(),'services'=>(int)$pdo->query('SELECT COUNT(*) FROM services')->fetchColumn(),'new_enquiries'=>(int)$pdo->query("SELECT COUNT(*) FROM enquiries WHERE status='New'")->fetchColumn(),'total_enquiries'=>(int)$pdo->query('SELECT COUNT(*) FROM enquiries')->fetchColumn(),'recent_enquiries'=>$pdo->query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 5')->fetchAll()]); }
  if ($resource==='projects' && $method==='POST') {
    $input=body(); $title=textField($input,'title',true,160); $slug=textField($input,'slug',false,180);
    $slug=$slug ?: trim((string)preg_replace('/[^a-z0-9]+/','-',strtolower((string)$title)),'-');
    if ($slug==='') fail('A project slug is required');
    $description=textField($input,'description'); $location=textField($input,'location',true,160);
    $category=textField($input,'category'); $status=textField($input,'status',false) ?: 'Planned'; $coverImage=textField($input,'cover_image',false,500);
    if (!in_array($category,['Residential','Commercial','Renovation','Planning'],true)) fail('Invalid project category');
    if (!in_array($status,['Planned','In progress','Completed'],true)) fail('Invalid project status');
    $s=$pdo->prepare('INSERT INTO projects (title,slug,description,location,category,status,cover_image) VALUES (?,?,?,?,?,?,?)');
    $s->execute([$title,$slug,$description,$location,$category,$status,$coverImage]); respond(['id'=>(int)$pdo->lastInsertId()],201);
  }
  if ($resource==='projects' && $method==='PUT' && $id) {
    $input=body(); $title=textField($input,'title',true,160); $slug=textField($input,'slug',false,180);
    $slug=$slug ?: trim((string)preg_replace('/[^a-z0-9]+/','-',strtolower((string)$title)),'-');
    if ($slug==='') fail('A project slug is required');
    $description=textField($input,'description'); $location=textField($input,'location',true,160);
    $category=textField($input,'category'); $status=textField($input,'status',false) ?: 'Planned'; $coverImage=textField($input,'cover_image',false,500);
    if (!in_array($category,['Residential','Commercial','Renovation','Planning'],true)) fail('Invalid project category');
    if (!in_array($status,['Planned','In progress','Completed'],true)) fail('Invalid project status');
    $s=$pdo->prepare('UPDATE projects SET title=?,slug=?,description=?,location=?,category=?,status=?,cover_image=? WHERE id=?');
    $s->execute([$title,$slug,$description,$location,$category,$status,$coverImage,$id]); respond(['updated'=>$s->rowCount()>0]);
  }
  if ($resource==='services' && $method==='POST') {
    $input=body(); $title=textField($input,'title',true,160); $description=textField($input,'description');
    $sortOrder=($input['sort_order']??'')==='' ? (int)$pdo->query('SELECT COALESCE(MAX(sort_order),0)+1 FROM services')->fetchColumn() : $input['sort_order'];
    if (!is_numeric($sortOrder) || (int)$sortOrder<0 || (int)$sortOrder>65535) fail('Invalid service order');
    $s=$pdo->prepare('INSERT INTO services (title,description,sort_order) VALUES (?,?,?)');
    $s->execute([$title,$description,(int)$sortOrder]); respond(['id'=>(int)$pdo->lastInsertId()],201);
  }
  if ($resource==='services' && $method==='PUT' && $id) {
    $input=body(); $title=textField($input,'title',true,160); $description=textField($input,'description');
    $sortOrder=$input['sort_order']??0;
    if (!is_numeric($sortOrder) || (int)$sortOrder<0 || (int)$sortOrder>65535) fail('Invalid service order');
    $s=$pdo->prepare('UPDATE services SET title=?,description=?,sort_order=? WHERE id=?');
    $s->execute([$title,$description,(int)$sortOrder,$id]); respond(['updated'=>$s->rowCount()>0]);
  }
  if (in_array($resource,['projects','services','enquiries'],true)) { if ($method==='GET') respond($pdo->query("SELECT * FROM $resource ORDER BY created_at DESC")->fetchAll()); if ($method==='DELETE' && $id) { $s=$pdo->prepare("DELETE FROM $resource WHERE id=?"); $s->execute([$id]); respond(['deleted'=>$s->rowCount()]); } if ($method==='PUT' && $id && $resource==='enquiries') { $input=body(); if (!in_array($input['status']??'', ['New','In progress','Closed'],true)) fail('Invalid enquiry status'); $s=$pdo->prepare('UPDATE enquiries SET status=? WHERE id=?'); $s->execute([$input['status'],$id]); respond(['updated'=>true]); } }
  fail('Route not found',404);
} catch (Throwable $e) { error_log($e->getMessage()); fail('Unable to complete the request. Please check the connection and try again.',500); }
