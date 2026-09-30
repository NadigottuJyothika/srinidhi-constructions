# AI Log

## 1. Project routing
- Problem: The workspace was empty except for editor metadata.
- Prompt: Build the complete Srinidhi Constructions full-stack website while preserving existing work.
- AI solution: Inspected the directory, confirmed it was empty, and established a Vite React structure.
- Understood: The visual experience and API contract needed to be designed together.
- Changed: Added Vite configuration, React entry files, and package scripts.
- Result: A runnable frontend foundation existed.

## 2. Visual direction
- Problem: The site needed to feel premium and construction-specific rather than like a generic template.
- Prompt: Use charcoal, warm ivory, white, copper, strong typography, architectural imagery, and restrained motion.
- AI solution: Built an editorial layout with Playfair Display, DM Sans, asymmetrical image blocks, copper accents, and Framer Motion project interactions.
- Understood: The brand should communicate calm precision and material care.
- Changed: Added the hero, work, services, numbers, about, contact, and footer sections.
- Result: Public content is responsive and presentation-ready with sample content clearly identifiable in documentation.

## 3. API security
- Problem: Admin data and mutations must not depend only on frontend guards.
- Prompt: Implement PHP REST APIs with PDO, sessions, password hashing, validation, and protected routes.
- AI solution: Added session cookies, session ID regeneration, password verification, prepared statements, CORS, JSON responses, and protected dashboard/mutation paths.
- Understood: Authentication must be enforced at the backend boundary.
- Changed: Added `api/index.php`, `.env.example`, and the secure admin creation helper.
- Result: The API contract is ready for a PHP/MySQL environment.

## 4. Database model
- Problem: Projects, images, services, admins, and enquiries require durable relationships.
- Prompt: Create a normalized MySQL schema with constraints and sample records.
- AI solution: Added foreign-key-linked project images, enums for controlled statuses, indexes, timestamps, and sample services/projects without fabricated achievements.
- Understood: Sample presentation data must not be represented as verified company claims.
- Changed: Added `database/schema.sql` and documented replacement steps.
- Result: The schema can be imported into MySQL.

## 5. Build verification
- Problem: The first production build reported missing Lucide social icon exports.
- Prompt: Resolve the build error and verify the frontend.
- AI solution: Removed unavailable brand icon imports and retained accessible text social links.
- Understood: The installed Lucide package version does not expose those brand names.
- Changed: Updated `src/App.jsx`.
- Result: `npm run build` completed successfully after the fix.
