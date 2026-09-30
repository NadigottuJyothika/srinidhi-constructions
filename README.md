# Srinidhi Constructions

A premium React/Vite public website with a PHP/PDO REST API, MySQL schema, and protected admin dashboard.

## Prerequisites

Node.js 20+, npm, PHP 8.1+ with PDO MySQL enabled, and MySQL 8+. Apache or PHP's built-in server is sufficient for local development.

## Setup

1. Create the database and original tables/content: `mysql -u root -p < database/schema.sql`.
2. Add the repeat-safe illustrative portfolio and service-scope content: `mysql -u root -p srinidhi_constructions < database/content_seed.sql`. Existing project and service rows are preserved; added rows are skipped on repeat runs.
3. Configure the PHP host environment from `api/.env.example`: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `FRONTEND_ORIGIN`, and `SESSION_SECURE`. Do not commit environment files or credentials.
4. Start the API from the project root: `php -S localhost:8000 -t .`. Its base URL is `http://localhost:8000/api/index.php`.
5. Install and run the frontend: `npm install`, then `npm run dev`. Set `VITE_API_URL` if the API base URL differs from the default.
6. Visit `/admin` for the protected dashboard. Public pages are served from the Vite fallback route.

## Admin access and password reset

The existing administrator email configured in the current database is `admin@srinidhiconstructions.com`. Passwords are stored as one-way `password_hash()` hashes and cannot be retrieved. No password is included in this repository. Sign in at `/admin` with that email and the password already known to the account owner.

To set a new password for that existing account on Windows, open PowerShell in the project folder. The following prompts use `SecureString`; the password is not placed in the command itself or shell history. Local XAMPP defaults are used by the helper unless the PHP CLI process has the same `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` environment as the API:

```powershell
$secure = Read-Host 'New admin password (12+ characters)' -AsSecureString
$confirmSecure = Read-Host 'Confirm new admin password' -AsSecureString
$password = (New-Object System.Net.NetworkCredential('', $secure)).Password
$confirmation = (New-Object System.Net.NetworkCredential('', $confirmSecure)).Password
if ($password -cne $confirmation) { throw 'Passwords do not match.' }
$env:ADMIN_RESET_PASSWORD = $password
$env:ADMIN_RESET_PASSWORD_CONFIRM = $confirmation
try { & 'C:\xampp\php\php.exe' api/reset_admin.php admin@srinidhiconstructions.com }
finally {
	Remove-Item Env:ADMIN_RESET_PASSWORD, Env:ADMIN_RESET_PASSWORD_CONFIRM -ErrorAction SilentlyContinue
	Remove-Variable password, confirmation, secure, confirmSecure -ErrorAction SilentlyContinue
}
```

The CLI-only helper updates the existing account with `password_hash()` and refuses unknown emails; it does not create accounts and returns 404 outside CLI. Then sign in at `http://localhost:5173/admin` using email `admin@srinidhiconstructions.com` and the new password you entered. Never upload or deploy a plaintext password or reset command containing one.

For a fresh database that has no administrator, enter two `SecureString` prompts in PowerShell the same way, set the temporary values as `ADMIN_CREATE_PASSWORD` and `ADMIN_CREATE_PASSWORD_CONFIRM`, then run `& 'C:\xampp\php\php.exe' api/create_admin.php new-admin@example.com 'Site Administrator'`. The CLI-only creator hashes the password and refuses duplicate emails. Remove both environment variables in a `finally` block just as in the reset example.

## Structure

- `src/`: React public experience and admin console
- `api/index.php`: JSON API, PDO access, sessions, validation, and centralized errors
- `database/schema.sql`: normalized tables and clearly identified sample content
- `postman/`: importable API collection
- `public/`: robots.txt and sitemap.xml

The original project rows are illustrative database seed records, not verified client commissions. The supplemental portfolio rows are explicitly marked as illustrative concepts in their titles and descriptions. Additional service-scope rows are labeled illustrative and require confirmation before being represented as confirmed company offerings. Replace illustrative content with verified company information before launch. Images use Unsplash CDN URLs for illustrative presentation; verify each selected image is suitable and licensed for its intended production use.

## API notes

Public `GET /projects`, `GET /services`, and `POST /enquiries` are available without authentication. Login, logout, dashboard, admin list reads, project/service create-update-delete, enquiry status updates, and enquiry deletion require the PHP session cookie. Passwords are hashed with `password_hash`; IDs and submitted values use prepared statements. Use HTTPS in production and set `SESSION_SECURE=true`.

## Testing

Run `npm run build` for the production frontend check. Import the Postman collection and set its `baseUrl`. Verify projects/services load from MySQL, management CRUD operations, enquiry submission and status changes, and unauthorized dashboard access. The local database currently includes eight illustrative project concepts and seven illustrative service scopes in addition to the original rows; the supplemental seed can be re-run without duplicating them.
