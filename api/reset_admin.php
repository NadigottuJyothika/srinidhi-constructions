<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$email = $argv[1] ?? '';
$password = getenv('ADMIN_RESET_PASSWORD') ?: '';
$confirmation = getenv('ADMIN_RESET_PASSWORD_CONFIRM') ?: '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Usage: php api/reset_admin.php existing-admin@example.com\n");
    exit(1);
}
if (strlen($password) < 12 || !hash_equals($password, $confirmation)) {
    fwrite(STDERR, "Set matching ADMIN_RESET_PASSWORD and ADMIN_RESET_PASSWORD_CONFIRM environment values; password must be at least 12 characters.\n");
    exit(1);
}

$dsn = 'mysql:host=' . (getenv('DB_HOST') ?: '127.0.0.1') . ';dbname=' . (getenv('DB_NAME') ?: 'srinidhi_constructions') . ';charset=utf8mb4';
$pdo = new PDO($dsn, getenv('DB_USER') ?: 'root', getenv('DB_PASS') ?: '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$lookup = $pdo->prepare('SELECT id FROM admins WHERE email = ?');
$lookup->execute([$email]);
if (!$lookup->fetchColumn()) {
    fwrite(STDERR, "No existing administrator account matches that email. No account was changed.\n");
    exit(1);
}

$update = $pdo->prepare('UPDATE admins SET password_hash = ? WHERE email = ?');
$update->execute([password_hash($password, PASSWORD_DEFAULT), $email]);
unset($password, $confirmation);
fwrite(STDOUT, "Password hash updated for the existing administrator account.\n");
