# Babu ISP – Web (Next.js + Prisma + API)

Next.js app that provides the **REST API** and **web portal** for the Babu ISP multi-tenant SaaS. This is the **only** part of the project that connects to the database (Prisma + PostgreSQL).

## Quick start

```bash
cd web
cp .env.example .env   # set DATABASE_URL, DIRECT_URL (Supabase/PostgreSQL)
npm install            # or yarn
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

- **Web UI:** http://localhost:3000  
- **API:** http://localhost:3000/api/* (and http://localhost:3000/v1/api/* via rewrite)

See the **root [README.md](../README.md)** for full setup, seed accounts, and flows.

## Tech stack

- **Next.js 15** (App Router), **React 19**
- **Prisma** (PostgreSQL) – schema, migrations, seed in `prisma/`
- **Zustand** – persisted auth store (user/role) for instant sidebar and no refetch on nav
- **TanStack Query** – `useAuthMe`, `useStats`, `useUsers`, etc.
- **Tailwind CSS**, **shadcn/Base UI** – layout, sidebar, forms, charts (Recharts)

## Key features

- **Auth:** Login, signup, forgot/reset password, profile, change password. Session cookie + Zustand store; logout shows a confirmation dialog then clears store and redirects to `/login`.
- **Roles:** Super Admin (`/super-admin`), Admin/Staff (`/admin` + sidebar), Customer (`/dashboard`). Sidebar and header reflect role from store; no refetch when switching pages.
- **Admin routes:** `/admin` (dashboard), `/admin/users` (Customers), `/admin/packages`, `/admin/billing`, `/admin/payments`, `/admin/complaints`, `/admin/reports`. Redirect: `/admin/user` → `/admin/users`.
- **Super Admin:** Tenants table (approve, suspend, renew, activate), platform stats, Plans & billing (plan prices and payment instructions from env).
- **Centred auth screens:** Login, signup, forgot-password, reset-password, pending-subscription, renew-subscription, suspended use full-viewport centred layout.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run dev:clean` | Clear `.next` and start (use if UI is blank or 404s) |
| `npm run build` | Production build |
| `npm run start` | Production start |
| `npm run db:generate` | Prisma generate |
| `npm run db:push` | Prisma db push |
| `npm run db:seed` | Prisma seed |
| `npm run db:studio` | Prisma Studio |
| `npm run test` | Run API tests |

## Env (`.env` in `web/`)

- `DATABASE_URL`, `DIRECT_URL` – PostgreSQL (e.g. Supabase)
- `PLATFORM_JAZZCASH_NUMBER`, `PLATFORM_EAZYPAISA_NUMBER`, `PLATFORM_BANK_DETAILS` – payment instructions for tenants
- `GOOGLE_GEMINI_API_KEY` – for AI features (optional)
- See `.env.example` for the full list.

## Troubleshooting

See **web/TROUBLESHOOTING.md** for blank UI, 404s, and API errors.
