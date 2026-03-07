# Table `public.Profile` does not exist (login/signup/forgot-password 500)

## Symptoms
- `POST /api/auth/login` or signup/forgot-password return **500**
- Error: `The table 'public.Profile' does not exist in the current database`

## Cause
Prisma schema uses `@@map("profiles")` (snake_case table names). The generated client queries the `profiles` table. If the DB still has the old name `Profile` (or tables were never created), the query fails.

## Fix

1. **Regenerate Prisma client and ensure DB matches schema**
   ```bash
   cd web
   npx prisma generate
   ```
2. **If migrations are broken** (e.g. `migrate deploy` reports a failed migration), you can sync the DB to the schema in **dev only**:
   ```bash
   npx prisma db push
   ```
   This creates/updates tables to match the schema (e.g. `profiles`, `tenants`). For production, fix the failed migration instead (see [Prisma: resolve migration issues](https://pris.ly/d/migrate-resolve)).
3. **Restart the dev server** so it loads the new client: stop the server (`Ctrl+C`), then:
   ```bash
   yarn dev:clean
   ```
   or `rm -rf .next && yarn dev`.

---

# Cannot find module './1331.js' / ENOENT .next / clientReferenceManifest

## Symptoms
- `Error: Cannot find module './1331.js'` when hitting `/api/plans` or other routes
- `ENOENT: no such file or directory` for `.next/cache/webpack/.../*.pack.gz` or `.next/server/pages/_document.js`, `routes-manifest.json`, `app/login/page.js`
- `Invariant: Expected clientReferenceManifest to be defined`

## Cause
Stale or corrupted `.next` build/cache, or `.next` was deleted **while the dev server was still running**, so the server is looking for files that no longer exist.

## Fix

1. **Stop the dev server** (`Ctrl+C`). Do **not** delete `.next` while the server is running.
2. Remove build and cache, then start fresh:
   ```bash
   cd web
   rm -rf .next
   yarn dev
   ```
   Or use the clean script (stops nothing; stop the server yourself first):
   ```bash
   yarn dev:clean
   ```
3. If problems persist, clear Node/Next caches and reinstall:
   ```bash
   rm -rf .next node_modules/.cache
   yarn install
   yarn dev
   ```

---

# Next.js UI not loading (404s, blank or unstyled page)

## Symptoms
- Console: `GET http://localhost:3000/_next/static/css/app/layout.css 404`
- Console: `GET http://localhost:3000/_next/static/chunks/main-app.js 404`
- Login (or any) page appears unstyled or broken

## Cause
Stale build cache (`.next`) or browser using old chunk URLs after a new dev server start.

## Fix

### 1. Clean and restart the dev server

```bash
cd web
rm -rf .next
npm run dev
```

Or use the clean script:

```bash
cd web
npm run dev:clean
```

### 2. Hard refresh the browser
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open the app in a **new tab** or **Incognito/Private** window at `http://localhost:3000/login`

### 3. If it still fails
- Stop the dev server (`Ctrl+C`), then run `npm run build` once, then `npm run dev`
- Make sure you open `http://localhost:3000` (not a different port or path)

---

## `Cannot read properties of undefined (reading 'toUpperCase')`

If this appears in the console and the stack trace includes **`content.js`**, it comes from a **browser extension** (e.g. Cursor, React DevTools, ad blocker), not from the Next.js app.

- Try **Incognito/Private** (extensions are usually disabled) or disable extensions for localhost.
- You can ignore this error if the page and API work after fixing the 404s above.
