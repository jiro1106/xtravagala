# Database Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the XtravaGala Supabase backend (tables, RLS, views, storage) per the schema spec at `docs/superpowers/specs/2026-05-23-database-schema-design.md`, so the React app can authenticate users, host events, RSVP, and run an admin dashboard against a real database.

**Architecture:** A single initial migration creates the entire schema in the linked Supabase Cloud project. After push, TypeScript row types are generated from the live schema, a PHT time helper is added to the React app, and an admin account is bootstrapped via a one-time signup + seed promotion. No backend service code — Postgres + RLS is the entire backend.

**Tech Stack:** Supabase (Postgres 17, Auth, Storage), `@supabase/supabase-js`, `supabase` CLI, TypeScript, Vite/React frontend.

**Project convention note:** Per `CLAUDE.md`, *future* schema changes follow the Studio → `db pull` ritual. This plan is the **initial** schema; writing the migration file directly is the right approach for a clean foundational migration. After this plan ships, all subsequent changes route through Studio first.

**Commit policy:** Per user preference, the human owner runs all `git commit` commands. The plan shows the exact command to run at each commit checkpoint; the executing agent presents them but does not invoke them.

---

## File Structure

**Create:**

| Path | Purpose |
|---|---|
| `supabase/migrations/20260523000000_initial_schema.sql` | All schema, RLS policies, helper functions, views, storage buckets. One file because this is the initial foundation. |
| `supabase/seed.sql` | Seed data for `cities`, `categories`, plus the one-line admin promotion (runs on every `db reset`). |
| `frontend/src/types/db.ts` | Generated TypeScript row types — `supabase gen types typescript --linked` writes this. Never hand-edit. |
| `frontend/src/lib/time.ts` | PHT formatting + parsing helpers used everywhere event times are rendered or accepted. |

**Modify:** none in this plan — landing-page swaps come in a later phase.

---

## Task 1: Write the initial migration SQL

**Files:**
- Create: `supabase/migrations/20260523000000_initial_schema.sql`

- [ ] **Step 1: Create the migrations directory**

Run from repo root:
```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Write the migration file**

Create `supabase/migrations/20260523000000_initial_schema.sql` with the full contents below. This is the entire schema in one file — every table, policy, function, trigger, view, and storage bucket from the spec.

```sql
-- =============================================================================
-- XtravaGala — Initial Schema
-- Spec: docs/superpowers/specs/2026-05-23-database-schema-design.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- 1. Shared trigger functions
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. profiles  (identity + host + admin)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  avatar_url    text,
  host_name     text,
  host_bio      text,
  is_host       boolean not null default false,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint host_requires_avatar_and_name
    check (is_host = false or (avatar_url is not null and host_name is not null))
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin helper (used by RLS policies).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false)
$$;

-- -----------------------------------------------------------------------------
-- 3. cities
-- -----------------------------------------------------------------------------
create table public.cities (
  id          text primary key,
  name        text not null,
  image_url   text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. categories
-- -----------------------------------------------------------------------------
create table public.categories (
  id          text primary key,
  label       text not null,
  svg_content text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. events
-- -----------------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,

  title           text not null,
  description     text,
  cover_image_url text,

  category_id     text not null references public.categories(id),
  city_id         text not null references public.cities(id),

  venue           text,
  address         text,
  start_at        timestamptz not null,
  end_at          timestamptz,

  price_php       numeric(10,2),
  capacity        int,

  schedule        jsonb not null default '[]',

  status          text not null default 'draft'
                  check (status in ('draft', 'published')),
  published_at    timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index events_host_id_idx      on public.events(host_id);
create index events_city_id_idx      on public.events(city_id);
create index events_category_id_idx  on public.events(category_id);
create index events_status_start_idx on public.events(status, start_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. rsvps
-- -----------------------------------------------------------------------------
create table public.rsvps (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  event_id   uuid not null references public.events(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index rsvps_event_id_idx on public.rsvps(event_id);

-- -----------------------------------------------------------------------------
-- 7. Views (derived counts)
-- -----------------------------------------------------------------------------
-- security_invoker = true makes the view respect the caller's RLS on the
-- underlying tables (instead of running as the view owner).
create view public.events_with_counts
with (security_invoker = true) as
select
  e.*,
  (select count(*) from public.rsvps r where r.event_id = e.id) as attendee_count
from public.events e;

create view public.cities_with_counts
with (security_invoker = true) as
select
  c.*,
  (select count(*) from public.events e
   where e.city_id = c.id and e.status = 'published') as event_count
from public.cities c;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.cities      enable row level security;
alter table public.categories  enable row level security;
alter table public.events      enable row level security;
alter table public.rsvps       enable row level security;

-- ---- profiles ----
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  using (public.is_admin(auth.uid()));

-- (No insert policy: only the on_auth_user_created trigger inserts.)

-- ---- cities ----
create policy "cities_select_all"
  on public.cities for select
  using (true);

-- ---- categories ----
create policy "categories_select_all"
  on public.categories for select
  using (true);

-- ---- events ----
create policy "events_select_published"
  on public.events for select
  using (status = 'published');

create policy "events_select_own_drafts"
  on public.events for select
  using (auth.uid() = host_id or public.is_admin(auth.uid()));

create policy "events_insert_host_self"
  on public.events for insert
  with check (
    auth.uid() = host_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_host = true
    )
  );

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "events_delete_own_or_admin"
  on public.events for delete
  using (auth.uid() = host_id or public.is_admin(auth.uid()));

-- ---- rsvps ----
create policy "rsvps_select_self"
  on public.rsvps for select
  using (auth.uid() = user_id);

create policy "rsvps_select_as_host"
  on public.rsvps for select
  using (
    exists (
      select 1 from public.events e
      where e.id = rsvps.event_id and e.host_id = auth.uid()
    )
  );

create policy "rsvps_insert_self"
  on public.rsvps for insert
  with check (auth.uid() = user_id);

create policy "rsvps_delete_self"
  on public.rsvps for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. Storage buckets
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',      'avatars',      true, 2097152,  array['image/jpeg','image/png','image/webp']),
  ('event-covers', 'event-covers', true, 5242880,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ---- avatars policies ----
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- event-covers policies ----
create policy "event_covers_public_read"
  on storage.objects for select
  using (bucket_id = 'event-covers');

create policy "event_covers_host_write"
  on storage.objects for insert
  with check (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.host_id = auth.uid()
    )
  );

create policy "event_covers_host_update"
  on storage.objects for update
  using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.host_id = auth.uid()
    )
  );

create policy "event_covers_host_delete"
  on storage.objects for delete
  using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.host_id = auth.uid()
    )
  );
```

- [ ] **Step 3: Commit (you run this)**

```bash
git add supabase/migrations/20260523000000_initial_schema.sql
git commit -m "feat(db): initial schema migration — profiles, events, rsvps, lookups, RLS, storage"
```

---

## Task 2: Write the seed file

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write `supabase/seed.sql`**

This file seeds `cities` and `categories` from the existing static data, plus the admin promotion line. Image URLs and SVG paths copied verbatim from `frontend/src/data/cities.ts` and `frontend/src/data/categories.ts`. Sort order matches the source array order.

```sql
-- =============================================================================
-- XtravaGala — Seed Data
-- Runs on `supabase db reset`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- cities (from frontend/src/data/cities.ts)
-- -----------------------------------------------------------------------------
insert into public.cities (id, name, image_url, sort_order) values
  ('manila',    'Manila',                 'https://images.unsplash.com/photo-1598258710957-db8614c2881e?auto=format&fit=crop&w=1600&q=80', 1),
  ('bgc',       'Bonifacio Global City',  'https://images.unsplash.com/photo-1718850114860-58f2a00cf8f5?auto=format&fit=crop&w=1200&q=80', 2),
  ('makati',    'Makati City',            'https://images.unsplash.com/photo-1607282729548-e1d13feae36f?auto=format&fit=crop&w=1200&q=80', 3),
  ('cebu',      'Cebu City',              'https://images.unsplash.com/photo-1505261476952-32e25cbfc755?auto=format&fit=crop&w=1200&q=80', 4),
  ('davao',     'Davao City',             'https://images.unsplash.com/photo-1649177422020-2bbbe0a023c2?auto=format&fit=crop&w=1200&q=80', 5),
  ('quezon',    'Quezon City',            'https://images.unsplash.com/photo-1618326889227-8cf3c304ced8?auto=format&fit=crop&w=1200&q=80', 6),
  ('iloilo',    'Iloilo City',            'https://images.unsplash.com/photo-1583685133115-90748ccbe274?auto=format&fit=crop&w=1200&q=80', 7),
  ('cdo',       'Cagayan de Oro',         'https://images.unsplash.com/photo-1643254181429-19ec3b9db009?auto=format&fit=crop&w=1200&q=80', 8),
  ('baguio',    'Baguio City',            'https://images.unsplash.com/photo-1580127252363-1d29a1ff0603?auto=format&fit=crop&w=1200&q=80', 9),
  ('bacolod',   'Bacolod City',           'https://images.unsplash.com/photo-1599914195435-d50222bbd2ca?auto=format&fit=crop&w=1200&q=80', 10),
  ('zamboanga', 'Zamboanga City',         'https://images.unsplash.com/photo-1710191987214-9d82cd48de77?auto=format&fit=crop&w=1200&q=80', 11),
  ('gensan',    'General Santos City',    'https://images.unsplash.com/photo-1519101739220-83f6a14852ca?auto=format&fit=crop&w=1200&q=80', 12)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- categories (from frontend/src/data/categories.ts)
-- -----------------------------------------------------------------------------
insert into public.categories (id, label, svg_content, sort_order) values
  ('music',      'Live music',     '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', 1),
  ('nightlife',  'Nightlife',      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 2),
  ('food',       'Food & drink',   '<path d="M6 2v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V2"/><path d="M6 2h12"/><path d="M12 11v11"/><path d="M8 22h8"/>', 3),
  ('workshops',  'Workshops',      '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', 4),
  ('outdoors',   'Outdoors',       '<circle cx="12" cy="12" r="9"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/><path d="M3 12h18"/>', 5),
  ('holidays',   'Holidays',       '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M4 10h16"/>', 6),
  ('hobbies',    'Hobbies',        '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>', 7),
  ('business',   'Business',       '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>', 8)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Admin promotion
-- Run AFTER signing up once with admin@xtravagala.com via the app.
-- Safe to leave in seed.sql: it's a no-op until that auth user exists.
-- -----------------------------------------------------------------------------
update public.profiles
set is_admin = true,
    full_name = 'XtravaGala Admin'
where id = (select id from auth.users where email = 'admin@xtravagala.com');
```

- [ ] **Step 2: Commit (you run this)**

```bash
git add supabase/seed.sql
git commit -m "feat(db): seed cities, categories, admin promotion"
```

---

## Task 3: Apply the migration to Supabase Cloud

**Files:** none (CLI action only)

- [ ] **Step 1: Confirm the CLI is linked**

Run from repo root:
```bash
supabase status
```
Expected: status output showing the linked project ref. If it says "not linked," run `supabase link --project-ref <your-ref>` first.

- [ ] **Step 2: Dry-run the push**

```bash
supabase db push --dry-run
```
Expected: lists `20260523000000_initial_schema.sql` as a pending migration with no errors.

- [ ] **Step 3: Push the migration**

```bash
supabase db push
```
Expected: "Finished `supabase db push`." If it fails, the error message will name the SQL line — fix in the migration file and re-run.

- [ ] **Step 4: Apply the seed**

`db push` only runs migrations, not `seed.sql`. To run the seed against the cloud project, pipe it through `psql` using the database URL printed by `supabase status` (key: `DB URL`), or use the Studio SQL editor.

Easiest path — open Supabase Studio → SQL Editor → paste the entire contents of `supabase/seed.sql` → Run.

Expected: 12 rows inserted into cities, 8 into categories, 0 rows updated in profiles (because admin signup hasn't happened yet — that's fine).

---

## Task 4: Verify the schema in Studio

**Files:** none — verification queries only

- [ ] **Step 1: Verify tables exist**

In Studio → SQL Editor, run:
```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```
Expected output includes: `categories`, `cities`, `cities_with_counts`, `events`, `events_with_counts`, `profiles`, `rsvps`.

- [ ] **Step 2: Verify RLS is on**

```sql
select relname, relrowsecurity
from pg_class
where relname in ('profiles','cities','categories','events','rsvps')
order by relname;
```
Expected: every row has `relrowsecurity = true`.

- [ ] **Step 3: Verify storage buckets exist**

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('avatars','event-covers');
```
Expected: two rows, both `public = true`, with the size limits and MIME types from the migration.

- [ ] **Step 4: Verify anon read works on cities/categories**

```sql
set local role anon;
select count(*) from public.cities;
select count(*) from public.categories;
reset role;
```
Expected: `12` and `8`.

- [ ] **Step 5: Verify anon cannot read drafts**

(No data yet, but the policy should still evaluate cleanly.) Run:
```sql
set local role anon;
select * from public.events where status = 'draft';
reset role;
```
Expected: 0 rows (no error). The policy filter applies even when the table is empty.

---

## Task 5: Generate TypeScript types from the live schema

**Files:**
- Create: `frontend/src/types/db.ts`

- [ ] **Step 1: Run the type generator**

From repo root:
```bash
supabase gen types typescript --linked > frontend/src/types/db.ts
```
Expected: writes a multi-hundred-line file with a `Database` type containing `public.Tables`, `public.Views`, etc.

- [ ] **Step 2: Spot-check the generated types**

Open `frontend/src/types/db.ts` and confirm:
- A `Tables` key for `events` exists with `host_id: string`, `start_at: string`, `schedule: Json`, `status: 'draft' | 'published'`.
- A `Views` key includes `events_with_counts` and `cities_with_counts`.
- A `Tables` key for `rsvps` exists with composite columns `user_id` and `event_id` (no `id`).

If anything is missing, the migration likely didn't apply — go back and rerun `supabase db push`.

- [ ] **Step 3: Wire the generic into the Supabase client**

Modify `frontend/src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/db";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

- [ ] **Step 4: Confirm the frontend still builds**

```bash
cd frontend && npm run build
```
Expected: build succeeds, no TS errors.

- [ ] **Step 5: Commit (you run this)**

```bash
git add frontend/src/types/db.ts frontend/src/lib/supabase.ts
git commit -m "feat(types): generate Supabase row types + wire into client"
```

---

## Task 6: Add the PHT time helper

**Files:**
- Create: `frontend/src/lib/time.ts`

- [ ] **Step 1: Write the helper**

```ts
// Single source of truth for parsing and formatting event times.
// All event times in the DB are stored as UTC (timestamptz). Display is
// always PHT (Asia/Manila); host inputs are always interpreted as PHT.

const PH_TIMEZONE = "Asia/Manila";
const LOCALE = "en-PH";

/** Format a UTC ISO string as the date line shown on event cards.
 *  e.g. "Sun, May 17 · 2:00 PM PHT" */
export function formatEventDateTime(isoUtc: string): string {
  const date = new Date(isoUtc);
  const dayPart = new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: PH_TIMEZONE,
  }).format(date);
  const timePart = new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: PH_TIMEZONE,
  }).format(date);
  return `${dayPart} · ${timePart} PHT`;
}

/** Format just the time portion in PHT — e.g. "2:00 PM". */
export function formatEventTime(isoUtc: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: PH_TIMEZONE,
  }).format(new Date(isoUtc));
}

/** Parse a host's local PHT datetime input (from <input type="datetime-local">)
 *  and return a UTC ISO string suitable for insert into Postgres.
 *
 *  The input string format is "YYYY-MM-DDTHH:mm" (no timezone). We interpret
 *  it as Asia/Manila wall-clock and produce the corresponding UTC instant. */
export function phLocalInputToUtcIso(input: string): string {
  // PH is UTC+8 year-round (no DST). Subtract 8 hours from the wall-clock
  // value to get UTC.
  const [datePart, timePart] = input.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const utc = Date.UTC(y, m - 1, d, hh - 8, mm);
  return new Date(utc).toISOString();
}

/** Format a price column (numeric) as a peso string, or "Free" when null/0. */
export function formatPrice(pricePhp: number | null): string {
  if (pricePhp === null || pricePhp === 0) return "Free";
  return `₱${pricePhp.toLocaleString("en-PH")}`;
}
```

- [ ] **Step 2: Verify it produces expected output**

There is no test framework wired up yet — installing one is out of scope for this plan. Verify with a one-shot console check during dev:

Open `frontend/src/main.tsx` temporarily and add at the top, just for the check:
```ts
import { formatEventDateTime, phLocalInputToUtcIso, formatPrice } from "./lib/time";
console.log(formatEventDateTime("2026-05-17T06:00:00Z")); // "Sun, May 17 · 2:00 PM PHT"
console.log(phLocalInputToUtcIso("2026-05-17T14:00"));    // "2026-05-17T06:00:00.000Z"
console.log(formatPrice(350));                            // "₱350"
console.log(formatPrice(null));                           // "Free"
```

Run `npm run dev` from `frontend/`, open the browser console at `http://localhost:5173`, confirm the four logged values match the comments.

- [ ] **Step 3: Remove the temporary console checks**

Revert the additions to `frontend/src/main.tsx`. Keep `frontend/src/lib/time.ts`.

- [ ] **Step 4: Confirm the build still passes**

```bash
cd frontend && npm run build
```
Expected: clean build.

- [ ] **Step 5: Commit (you run this)**

```bash
git add frontend/src/lib/time.ts
git commit -m "feat(lib): add PHT time + price formatting helpers"
```

---

## Task 7: Bootstrap the admin account

This is a manual setup step — done once per environment. Document it here so future devs (or future-you on a new machine) can repeat it.

**Files:** none (manual + Studio SQL)

- [ ] **Step 1: Confirm the seed already contains the promotion line**

The line in `supabase/seed.sql` is idempotent: a no-op until an `auth.users` row with `email = 'admin@xtravagala.com'` exists.

- [ ] **Step 2: Sign up via the app**

This depends on the auth UI being built — which is a later phase. Until then, you can still create the user by other means:

**Option A (works today, before auth UI exists):** Studio → Authentication → Users → "Add user" → email `admin@xtravagala.com`, choose a password, untick "Auto-confirm" if you want to test email flow, or tick it for instant access.

**Option B (after the signup UI is built):** Sign up through the app at `/signup` using `admin@xtravagala.com`.

Either way, after this step there is a row in `auth.users` with that email, and the `handle_new_user` trigger has created a matching `profiles` row.

- [ ] **Step 3: Run the admin promotion**

In Studio → SQL Editor, paste and run only this section of `supabase/seed.sql`:
```sql
update public.profiles
set is_admin = true,
    full_name = 'XtravaGala Admin'
where id = (select id from auth.users where email = 'admin@xtravagala.com');
```
Expected: "Success. Rows updated: 1".

- [ ] **Step 4: Verify**

```sql
select id, full_name, is_admin
from public.profiles
where full_name = 'XtravaGala Admin';
```
Expected: one row, `is_admin = true`.

---

## Task 8: End-to-end smoke test from the React app

Confirm the React client can actually read from the database with the publishable key — proving env vars, RLS, and the type wiring all work together.

**Files:**
- Modify (temporarily): `frontend/src/main.tsx`

- [ ] **Step 1: Add a one-shot fetch**

Add this near the top of `frontend/src/main.tsx`, just for verification:
```ts
import { supabase } from "./lib/supabase";
supabase
  .from("cities")
  .select("id, name, sort_order")
  .order("sort_order")
  .then(({ data, error }) => {
    if (error) console.error("[smoke] cities error:", error);
    else console.log("[smoke] cities:", data);
  });
```

- [ ] **Step 2: Run dev server**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` and open the browser console.

Expected: `[smoke] cities:` followed by an array of 12 city objects in sort order (Manila first). No CORS or 401 errors.

If you see `Invalid API key`, your `frontend/.env.local` is missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` — fix that first.

If you see RLS errors, double-check Task 4 — anon reads should work on cities.

- [ ] **Step 3: Remove the smoke test**

Revert the `frontend/src/main.tsx` changes. Keep only the original `createRoot(...)` call.

- [ ] **Step 4: Commit (you run this)**

This task itself doesn't add any code that should ship. Nothing to commit; you've simply verified the foundation works.

---

## Task 9: Wrap-up notes

**Files:** none

- [ ] **Step 1: Update `MEMORY.md` (optional)**

The user's auto-memory file at `/Users/jirolayug/.claude/projects/-Users-jirolayug-Documents-projects-react-xtravagala/memory/project-progress.md` says "backend + auth + API integration still TBD." After this plan completes, the schema portion of that is done — the file may be updated to reflect that (handled outside this plan; mentioned for awareness).

- [ ] **Step 2: Confirm git history**

Run:
```bash
git log --oneline -10
```
Expected: three new commits from this plan — the migration, the seed, the types + client wiring, and the time helpers. (Task 8 adds none.)

---

## What this plan does NOT do

These are explicitly deferred — each has its own future brainstorm → spec → plan cycle:

- **Auth UI** (signup, login, Google OAuth button, navbar profile chip)
- **Landing page swap** (replacing `src/data/events.ts` and `src/data/cities.ts` with Supabase queries)
- **RSVP toggle UI** on event detail
- **Host upgrade form** + host dashboard routes
- **Admin dashboard** routes
- **Profile photo upload UI** wired to the `avatars` bucket
- **Event cover upload UI** wired to the `event-covers` bucket
- **Tests** for `time.ts` (no test runner installed yet)

When the next phase starts, the schema this plan delivers is the foundation it builds on.
