<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
	http_response_code(404);
	exit;
}

$email = $argv[1] ?? '';
$name = $argv[2] ?? 'Site Administrator';
$password = getenv('ADMIN_CREATE_PASSWORD') ?: '';
$confirmation = getenv('ADMIN_CREATE_PASSWORD_CONFIRM') ?: '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || trim($name) === '') {
	fwrite(STDERR, "Usage: php api/create_admin.php new-admin@example.com [name]\n");
	exit(1);
}
if (strlen($password) < 12 || !hash_equals($password, $confirmation)) {
	fwrite(STDERR, "Set matching ADMIN_CREATE_PASSWORD and ADMIN_CREATE_PASSWORD_CONFIRM environment values; password must be at least 12 characters.\n");
	exit(1);
}

$dsn = 'mysql:host=' . (getenv('DB_HOST') ?: '127.0.0.1') . ';dbname=' . (getenv('DB_NAME') ?: 'srinidhi_constructions') . ';charset=utf8mb4';
$pdo = new PDO($dsn, getenv('DB_USER') ?: 'root', getenv('DB_PASS') ?: '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$insert = $pdo->prepare('INSERT INTO admins (name,email,password_hash) VALUES (?,?,?)');
try {
	$insert->execute([trim($name), $email, password_hash($password, PASSWORD_DEFAULT)]);
} catch (PDOException $error) {
	if ($error->getCode() === '23000') {
		fwrite(STDERR, "An administrator already exists with that email. No account was changed.\n");
		exit(1);
	}
	throw $error;
}

unset($password, $confirmation);
fwrite(STDOUT, "Administrator account created for {$email}.\n");
