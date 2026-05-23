# Database Schema Design — XtravaGala Backend

**Date:** 2026-05-23
**Status:** Spec — awaiting user review before implementation plan
**Scope:** Supabase schema, RLS policies, storage buckets, and bootstrap data for the XtravaGala MVP backend.

---

## 1. Goals & Scope

Replace the static data files in `src/data/` with a real Supabase backend that supports:

- **Authentication** — Google OAuth + email/password sign-up (full name, email, password)
- **Two personas built on one account model:**
  - **Attendee** — browse events, RSVP, see "your events"
  - **Host** — same account upgraded via a stricter onboarding (avatar + display name required); can create/edit/publish events and view participants
- **Admin role** — pre-defined account with simple CRUD over user and host accounts. Frontend separates the two into tabs; schema does not.
- **No payments.** RSVP is a simple toggle. `price_php` is a display-only number.
- **No event moderation by admin** in v1.

The product is Philippines-only. All event times are PHT.

---

## 2. Design Principles

Reasoning the schema is built on:

1. **Identity layer** — Supabase Auth owns `auth.users`; we mirror with a `profiles` table keyed on the same UUID. Host-ness is an additive set of columns + an `is_host` flag, not a separate table.
2. **Reference data as tables, not enums** — cities and categories carry display payload (image, icon SVG, sort order) and will grow. Lookup tables make joins clean and additions data-only.
3. **One domain entity, sized for the UI** — `events` columns group into identity/ownership, content, classification, logistics, display, sub-data, and state. Sub-data that always loads with the parent and is edited atomically (the schedule) lives in `jsonb`, not a child table.
4. **Actions as join tables** — RSVPs are a composite-PK guest list. No surrogate id, no status column. Presence = registered.
5. **RLS is the entire access layer.** The React client talks directly to Postgres. Every table gets explicit policies for `anon` and `authenticated`. Admin policies layer on top via a `SECURITY DEFINER` helper function.
6. **Computed numbers via views, not stored counters.** Attendee counts and per-city event counts are queried, never stored. Eliminates drift.
7. **PHT enforced at the app boundary, not the storage type.** Columns stay `timestamptz` (industry standard). A single client helper handles parsing host inputs as `Asia/Manila` and formatting all displays in PHT.

---

## 3. Tables

### 3.1 `profiles` — identity + host + admin

```sql
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  avatar_url    text,                          -- optional for attendees
  -- Host fields. Null until host onboarding completes.
  host_name     text,                          -- display name on event cards
  host_bio      text,                          -- short blurb on event detail page
  is_host       boolean not null default false,
  -- Admin
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Enforces stricter host onboarding at the DB level.
  constraint host_requires_avatar_and_name
    check (is_host = false or (avatar_url is not null and host_name is not null))
);
```

**Key choices:**

- 1:1 with `auth.users`, cascade on delete.
- `is_host` is a stored boolean for cheap RLS checks (not derived).
- CHECK constraint guarantees a host can never exist without an avatar and display name.
- `is_admin` is set out-of-band (seed migration or by another admin); no client path can flip it directly.

**Profile-creation trigger** (created in same migration):

```sql
create function public.handle_new_user()
returns trigger
language plpgsql security definer
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
```

`full_name` pulls from Google OAuth metadata when available; falls back to the email for password signups (the sign-up form will pass `full_name` in metadata).

---

### 3.2 `cities`

```sql
create table public.cities (
  id          text primary key,                -- slug: 'manila', 'bgc', 'cebu'
  name        text not null,                   -- 'Manila', 'Bonifacio Global City'
  image_url   text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
```

Slug PKs are readable in URLs and match the IDs already in `src/data/cities.ts` — seed becomes a direct copy. Manila as featured city is hardcoded in the React component, not in data.

---

### 3.3 `categories`

```sql
create table public.categories (
  id          text primary key,                -- slug: 'music', 'food', 'workshops'
  label       text not null,                   -- 'Live music', 'Food & drink'
  svg_content text not null,                   -- inline SVG path data
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
```

---

### 3.4 `events`

```sql
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  host_id         uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,

  -- Content
  title           text not null,
  description     text,
  cover_image_url text,

  -- Classification
  category_id     text not null references public.categories(id),
  city_id         text not null references public.cities(id),

  -- Logistics
  venue           text,
  address         text,
  start_at        timestamptz not null,
  end_at          timestamptz,

  -- Display / capacity
  price_php       numeric(10,2),                -- null = free
  capacity        int,                          -- null = unlimited

  -- Sub-data
  schedule        jsonb not null default '[]',  -- [{ "time": "...", "label": "..." }]

  -- State
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
```

**Key choices:**

- UUID PK lets the client know the ID before insert lands — needed for the cover upload path (`event-covers/<event_id>/...`).
- `slug` is generated app-side from title + short hash; uniqueness enforced by DB.
- `status = 'draft' | 'published'` lets hosts save WIP. RLS exposes only `published` events to the public; hosts see their own drafts.
- `schedule` as `jsonb` — display-only sub-data, edited atomically with the parent.
- No `attendees` column — see `events_with_counts` view.
- All times `timestamptz`; PHT enforced via client helpers.

**`updated_at` trigger** added to `profiles` and `events`:

```sql
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();
```

---

### 3.5 `rsvps`

```sql
create table public.rsvps (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  event_id   uuid not null references public.events(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index rsvps_event_id_idx on public.rsvps(event_id);
```

**Key choices:**

- Composite PK enforces "one RSVP per user per event."
- No surrogate id, no status column. Un-RSVP = delete. Re-RSVP = insert.
- Cascade on both sides — deleting a user or event wipes related rsvps.
- Separate index on `event_id` for the host dashboard "who's coming" query (the composite PK indexes `user_id` first).

---

## 4. Views (derived data)

```sql
create view public.events_with_counts as
select
  e.*,
  (select count(*) from public.rsvps r where r.event_id = e.id) as attendee_count
from public.events e;

create view public.cities_with_counts as
select
  c.*,
  (select count(*) from public.events e
   where e.city_id = c.id and e.status = 'published') as event_count
from public.cities c;
```

Frontend queries the views, not the base tables, whenever a count is needed. Always current, no drift. At portfolio scale, performance is fine; materialized views are the future upgrade path if needed.

---

## 5. Row Level Security

`alter table ... enable row level security` on all five tables. Default-deny — every allowed action gets an explicit policy.

### 5.1 Admin helper

```sql
create function public.is_admin(uid uuid)
returns boolean
language sql security definer stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false)
$$;
```

`stable` allows Postgres to cache the result within a query, so multi-row policy checks don't re-query for each row.

### 5.2 `profiles`

| Action | Policy |
|---|---|
| `select` | Everyone (anon + authenticated) — profile data appears on public event cards |
| `update` | `auth.uid() = id` OR `public.is_admin(auth.uid())` |
| `insert` | Disallowed from client; trigger handles it on signup |
| `delete` | `public.is_admin(auth.uid())` only |

### 5.3 `cities`, `categories`

| Action | Policy |
|---|---|
| `select` | Everyone |
| `insert`/`update`/`delete` | None — managed via migrations/seeds only |

### 5.4 `events`

| Action | Policy |
|---|---|
| `select` (published) | Everyone, where `status = 'published'` |
| `select` (drafts) | `auth.uid() = host_id` OR `public.is_admin(auth.uid())` |
| `insert` | `auth.uid() = host_id` AND `(select is_host from profiles where id = auth.uid())` |
| `update` | `auth.uid() = host_id` |
| `delete` | `auth.uid() = host_id` OR `public.is_admin(auth.uid())` |

Admins are NOT given event update permission in v1 — only delete (for moderation removal). This stays within the "admin manages accounts, not content" scope.

### 5.5 `rsvps`

| Action | Policy |
|---|---|
| `select` (own) | `auth.uid() = user_id` |
| `select` (as host) | Allowed when the rsvp's `event_id` belongs to an event where `auth.uid() = host_id` |
| `insert` | `auth.uid() = user_id` |
| `delete` | `auth.uid() = user_id` |
| `update` | None |

---

## 6. Admin Account Bootstrap

Supabase Auth controls `auth.users` and password hashing — a `INSERT` into that table will not produce a working login. The bootstrap is **two manual steps**, done once per environment:

1. Sign up through the normal app flow with the predefined admin email `admin@xtravagala.com` (chosen password).
2. Run the seed migration `supabase/seed.sql`, which contains:
   ```sql
   update public.profiles
   set is_admin = true, full_name = 'XtravaGala Admin'
   where id = (select id from auth.users where email = 'admin@xtravagala.com');
   ```

Subsequent admins are promoted by an existing admin from the admin dashboard (updating `is_admin` via the policy in 5.2).

---

## 7. Storage Buckets

Two public-read buckets created via `supabase/migrations/<ts>_storage.sql`:

### 7.1 `avatars`

- **Layout:** `<user_id>/<filename>`
- **Public read:** yes
- **Write:** `auth.uid()::text = (storage.foldername(name))[1]`
- **Limits:** 2 MB, `image/jpeg | image/png | image/webp`

### 7.2 `event-covers`

- **Layout:** `<event_id>/<filename>`
- **Public read:** yes
- **Write:** event owner only — policy joins to `events`:
  ```sql
  exists (
    select 1 from public.events e
    where e.id::text = (storage.foldername(name))[1]
      and e.host_id = auth.uid()
  )
  ```
- **Limits:** 5 MB, `image/jpeg | image/png | image/webp`

The React side uploads the file, gets the public URL back, and writes the URL into `profiles.avatar_url` or `events.cover_image_url` as a normal column update.

---

## 8. Seed Data

Loaded by `supabase/seed.sql` on `db reset`:

- **`cities`** — direct copy from `frontend/src/data/cities.ts` (id, name, image_url, sort_order in source order).
- **`categories`** — direct copy from `frontend/src/data/categories.ts` (id, label, svg_content, sort_order).
- **Events seed is deferred.** Existing static events in `frontend/src/data/events.ts` won't be seeded — they'd require fake host accounts. Once auth is working, the dev creates a real host account and adds events through the app. Static `events.ts` stays in place during the transition and is removed once the events query is live.
- **Admin promotion SQL** (per Section 6).

---

## 9. Out of Scope (v1)

Explicitly deferred so the spec stays focused:

- Payments / paid ticketing
- Waitlists, plus-ones, multi-tier tickets
- Multi-image event galleries (single cover only)
- Per-event contact email, social links, external RSVP URL
- Admin event moderation (admin can delete events but not edit)
- Audit logs for admin actions
- Notifications / emails
- Per-event tags beyond category
- Saved/bookmarked events
- Multi-organization hosts (each user is their own host page)
- DST or multi-timezone support — PHT only

---

## 10. Open Questions Resolved During Brainstorming

| Question | Decision |
|---|---|
| Host = separate org or just user? | One user account; host fields on profile, gated by CHECK constraint |
| Avatar required? | Optional for attendees, required for hosts (enforced at DB) |
| RSVP model? | Simple toggle. No plus-ones, no waitlist |
| Time storage? | `timestamptz` (UTC); PHT enforced in client helper |
| Cities `is_large` flag? | Dropped; Manila hardcoded as featured city in component |
| Schedule storage? | `jsonb` on events row |
| Categories/cities as tables? | Yes — lookup tables with slug PKs |
| Admin role? | Yes — `is_admin` flag on profile, predefined bootstrap account, frontend splits Users/Hosts tabs |

---

## 11. Implementation Phasing (informational)

The implementation plan (next step, written via the writing-plans skill) will sequence the work. Expected order:

1. **Backend foundation** — schema + RLS + storage buckets + seed (this spec)
2. **Replace landing-page static data with Supabase queries** — smallest validation
3. **Auth** — Google + email/password, signup trigger, navbar profile
4. **Attendee RSVP** — toggle on event detail page, "your events" list
5. **Host upgrade + host dashboard** — `/host` routes, create/edit/publish, participants view
6. **Admin dashboard** — `/admin/accounts` with Users + Hosts tabs

Each phase will get its own brainstorm → spec → plan cycle.
