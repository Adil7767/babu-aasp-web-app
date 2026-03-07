# API tests (Node.js test runner)

Tests hit the running API. Use a seeded DB so `admin@gmail.com` / `Admin@123` exists.

## Run

1. Start the server: `npm run dev`
2. (Optional) Seed DB: `npx prisma db seed`
3. In another terminal: `npm test`

Or with custom base URL: `TEST_BASE_URL=http://localhost:3000 node --test tests/`

## What is tested

- **api/auth.test.js** – login (400, 401, 200), me (401, 200), forgot-password, profile (401, 200), logout
- **api/plans.test.js** – GET plans, GET plans?payment_details=true
- **api/signup.test.js** – signup validation and duplicate email
- **api/users-and-tenant.test.js** – /users, /tenant, /stats with admin token

## If login returns 500 (Server error)

- Run migrations so table names match the schema: `npx prisma migrate deploy` (creates/renames to `profiles`, `tenants`, etc.).
- Seed the DB: `npx prisma db seed`.
- In dev the API returns `detail` with the real error (e.g. table "Profile" does not exist).
