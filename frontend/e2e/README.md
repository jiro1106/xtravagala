# E2E tests

Playwright tests against the running dev server + real Supabase Cloud project.

## One-time setup

### 1. Install Playwright browsers (already done if you ran `npm install`)

```bash
npx playwright install chromium
```

### 2. Create two test users in Supabase Studio

Go to **Authentication → Users → Add user → Create new user**, and create:

- **Attendee user** — any email, any password. Check **Auto Confirm User**.
  - Example: `e2e-attendee@xtravagala.test` / `REDACTED_TEST_CREDENTIAL`
- **Host user** — any email, any password. Check **Auto Confirm User**.
  - Example: `e2e-host@xtravagala.test` / `REDACTED_TEST_CREDENTIAL`

Then in Supabase Studio **Table Editor → profiles**, find the host user's row and update:

- `avatar_url` → any URL (e.g. `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200`)
- `host_name` → e.g. `E2E Host`
- `is_host` → `true`

(The `host_requires_avatar_and_name` check constraint enforces all three.)

### 3. Add credentials to `frontend/.env.local`

```env
E2E_ATTENDEE_EMAIL=e2e-attendee@xtravagala.test
E2E_ATTENDEE_PASSWORD=REDACTED_TEST_CREDENTIAL
E2E_HOST_EMAIL=e2e-host@xtravagala.test
E2E_HOST_PASSWORD=REDACTED_TEST_CREDENTIAL
# Optional: override base URL (default http://localhost:5173)
# E2E_BASE_URL=http://localhost:5173
```

## Run

```bash
npm run test:e2e            # headless run
npm run test:e2e:ui         # interactive UI mode (recommended for debugging)
npm run test:e2e:report     # open last HTML report
```

The dev server (`npm run dev`) is started automatically by Playwright if not already
running. Tests run sequentially (`workers: 1`) because they share Supabase state.

## Conventions

- Tests that create events use the title prefix `[E2E]` so cleanup can match them.
- The host user is cleaned up before/after each `host.spec.ts` test.
- Tests reuse signed-in storage state from `e2e/.auth/` (created by `auth.setup.ts`).
- Never commit `e2e/.auth/` — it's gitignored.
