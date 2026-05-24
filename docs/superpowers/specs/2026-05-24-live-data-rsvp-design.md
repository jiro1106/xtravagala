# Live Data + RSVP Design

**Date:** 2026-05-24
**Status:** Approved

## Goal

Replace static `src/data/*` imports across the app with Supabase queries via data hooks, and add the attendee RSVP flow on event detail pages. After this work the platform is "live" — events, cities, categories, and attendee counts all come from the database, and signed-in users can RSVP.

## Scope

- One-shot **seed script** that loads the existing static event data into Supabase (fake host accounts + events)
- 5 data hooks: `useEvents`, `useEventDetail`, `useCities`, `useCategories`, `useRsvp`
- A shared `EventVM` view-model so consumer components change minimally
- Swap all data-bound components from `src/data/*` to hooks
- RSVP toggle button on event detail page (optimistic, with capacity guard)
- Skeleton loading states, inline error banners, empty states

**Out of scope:** "My RSVPs" / attendee history page, DB-side full-text search (client-side filtering stays), pagination, realtime subscriptions, RSVP notifications, calendar export.

**Schema:** No schema changes needed. `schedule jsonb` was added in the initial migration (default `'[]'`); `price_php numeric(10,2)`, `slug text unique`, `status text default 'draft'` already exist.

## Architecture

**Pattern:** plain `useState` + `useEffect` hooks. No fetching library — keeps the dep tree small for fast-path delivery. Each hook returns `{ data, loading, error, refetch }`.

```
frontend/scripts/
  seed-events.ts      one-shot Node script (Task 0 — run once)
src/hooks/
  useEvents.ts        list, supports { city?, category?, q? } filters
  useEventDetail.ts   single event + host profile
  useCities.ts        list with event_count
  useCategories.ts    list (sorted by sort_order)
  useRsvp.ts          { rsvped, loading, toggle(), count } for an event
src/types/api.ts      EventVM, CityVM, CategoryVM, HostVM
```

Hooks live independently of components — every consumer imports its hook directly, never `supabase` itself.

## Seeding (Task 0)

A one-shot Node script populates Supabase with the existing static events so we never have to hand-enter data. Lives at `frontend/scripts/seed-events.ts`, run with `npx tsx scripts/seed-events.ts`.

**RLS-respecting flow** (events_insert_host_self requires `auth.uid() = host_id` AND `is_host=true`):

Group events by their `host` string, then for each group:

1. **Sign in or sign up** the seed host with deterministic credentials:
   - email: `seed-${slugify(host)}@xtravagala.dev`
   - password: a fixed dev password baked into the script (e.g. `REDACTED_SEED_CREDENTIAL`)
   - Try `signInWithPassword` first; on `invalid_credentials`, fall back to `signUp({ options: { data: { full_name: host } } })`
   - The `handle_new_user` trigger creates the matching `profiles` row with `full_name` populated
2. **Promote profile to host** (signed in as that user, so `profiles_update_self_or_admin` allows it):
   ```
   update profiles set
     is_host = true,
     host_name = <original host string>,
     host_bio = 'Seeded host — placeholder bio',
     avatar_url = 'https://api.dicebear.com/9.x/initials/svg?seed=' + encodeURIComponent(host)
   where id = auth.uid()
   ```
   Avatar URL is required by the `host_requires_avatar_and_name` check constraint; Dicebear initials provide a stable placeholder with zero dependencies.
3. **Insert this host's events** (still signed in as the host):
   ```
   insert into events {
     host_id: auth.uid(),
     slug: slugify(title) + '-' + 6-char-random,
     title, description, venue, address,
     cover_image_url: event.image,
     city_id: event.city,
     category_id: event.category,
     start_at: parseDate(event.date),
     price_php: event.price === 'Free' ? 0 : parsePeso(event.price),
     capacity: null,
     schedule: event.schedule ?? [],
     status: 'published',
     published_at: now()
   } on conflict (slug) do nothing
   ```
4. **Sign out** before moving to the next host group.

**Date parsing:** Convert `"Sun, May 17 · 2:00 PM PHT"` to UTC ISO via regex. Year defaults to 2026. Events failing parsing are logged and skipped.

**Idempotent:** safe to re-run. Existing events skip on `slug` conflict; existing host profiles reuse the same id (sign-in succeeds on the second run).

**Env requirements:**
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `frontend/.env.local` (loaded via `dotenv`)
- No service-role key — uses anon-key signUp/signIn + RLS-policy-respecting inserts
- Adds `tsx` and `dotenv` as devDependencies. One-line npm script: `"seed:events": "tsx scripts/seed-events.ts"`

## Schema (no changes required)

A re-read of `20260523000000_initial_schema.sql` confirms the events table already has every field the seeder needs:

- `id uuid` (auto-generated, new UUIDs per seed event)
- `slug text unique` (derived from title at seed time)
- `title`, `description`, `cover_image_url`, `venue`, `address` (all nullable except `title`)
- `category_id text` → `categories.id` (slug like `'hobbies'`)
- `city_id text` → `cities.id` (slug like `'makati'`)
- `start_at timestamptz`, optional `end_at`
- `price_php numeric(10,2)` — **note the `_php` suffix; no separate `currency` column**
- `capacity int` (nullable → unlimited)
- `schedule jsonb default '[]'` (already present)
- `status text default 'draft'` — seeds must explicitly set `status='published'` and `published_at=now()` for events to appear in the anon-readable view

The event detail page reads `eventVM.schedule` directly from this column.

## Data Shape: `EventVM`

The DB view `events_with_counts` returns the raw row plus `attendee_count`. We map that to a UI-friendly `EventVM` inside each hook so components don't deal with timestamps and FKs:

To minimize churn in existing components (which read `event.date`, `event.price`, `event.attendees`, etc.), the mapper produces a shape that's near-drop-in compatible with the current static `Event` interface — just enriched with structured fields:

```ts
interface EventVM {
  id: string;                 // uuid
  slug: string;
  title: string;
  description: string | null;
  image: string;              // cover_image_url, fallback to placeholder
  cityId: string;             // for filtering/similar-event matching
  categoryId: string;
  cityName: string;           // resolved for display
  categoryLabel: string;
  host: string;               // resolved host_name (pre-resolved string, so EventCard stays unchanged)
  hostId: string;
  hostBio: string | null;
  startAt: Date;
  date: string;               // formatEventDateTime(startAt) — same field name as current Event interface
  pricePhp: number;
  price: string;              // formatPrice(pricePhp) — "Free" if 0, else "₱<n>"; same name as current Event
  capacity: number | null;
  attendees: number;          // from events_with_counts.attendee_count
  isFull: boolean;
  venue: string | null;
  address: string | null;
  schedule: Array<{ time: string; label: string }>;
  // backward-compat aliases consumers already use:
  city: string;               // alias of cityId — so `e.city === 'makati'` filter keeps working
  category: string;           // alias of categoryId
}
```

`formatEventDateTime` and `formatPrice` already exist in `src/lib/time.ts`. Keeping the legacy field names (`city`, `category`, `host`, `date`, `price`, `attendees`) means `EventCard`, the EventsPage filter logic, and the EventDetailPage all keep compiling with zero changes; only the `import type` line moves from `@/data/events` to `@/types/api`.

## Queries

### `useEvents(filters?)`

```ts
let q = supabase.from('events_with_counts').select('*, host:profiles!host_id(*), city:cities!city_id(*), category:categories!category_id(*)').order('start_at', { ascending: true });
if (filters?.city) q = q.eq('city_id', filters.city);
if (filters?.category) q = q.eq('category_id', filters.category);
// q (text search) is applied client-side via title.includes() after fetch — fast-path, no Postgres FTS
```

Returns `EventVM[]`. Re-fetches when filter object changes (use `JSON.stringify` for dep array).

### `useEventDetail(id)`

Same join, `.eq('id', id).single()`. Returns `EventVM | null`. 404 handling: `data === null && !loading` → consumer renders not-found state.

**Join caveat:** Supabase's `foreignTable!fk_column` join syntax relies on FK metadata. The `events_with_counts` view inherits FK relationships from the underlying `events` table, so joins via `host:profiles!host_id(*)` should work. If the planner reports the relationship as ambiguous during implementation, fall back to: query the view alone, then fetch related rows in parallel (`Promise.all`) and merge in JS. Decide at implementation time based on the actual error.

### `useCities()` / `useCategories()`

Trivial: read from `cities_with_counts` / `categories` ordered by `sort_order`. Return arrays.

### `useRsvp(eventId)`

Reads two things on mount:
1. Total count — already in `events_with_counts.attendee_count` (consumer can use that; this hook returns it for completeness)
2. Whether *current* user has RSVPed — `supabase.from('rsvps').select('id').eq('event_id', eventId).eq('user_id', user.id).maybeSingle()`

`toggle()`:
- Optimistic: flip local `rsvped` immediately, increment/decrement local `count`
- Insert/delete row in `rsvps`
- On error: revert and surface message
- Logged-out: `toggle()` is a no-op (the button itself handles redirect — see UX below)

## RSVP UX (event detail page)

On the event detail page, replace the existing static "I'm going" placeholder with a real toggle.

**States:**
| Condition | Button label | Action |
|---|---|---|
| Logged out | "Sign in to RSVP" | `navigate('/login?next=/events/<id>')` |
| Logged in, not rsvped, not full | "I'm going" | `toggle()` |
| Logged in, rsvped | "You're going ✓" (with subtle hover hint "Cancel RSVP") | `toggle()` |
| Logged in, full | "Event full" disabled | none |
| Loading own rsvp state | disabled spinner | none |

Optimistic update; error → toast-style inline banner under the button for ~4s, then auto-dismiss.

The attending count beside the button reads from the same `useRsvp().count` so it stays in sync after toggling.

## Loading / Empty / Error UX

**Loading (lists):** 3 placeholder cards using the existing `EventCard` outer shell with `bg-muted animate-pulse` blocks where text/image go.
**Loading (detail):** spinner centered in main area (matches `/auth/callback` style).
**Empty:** existing "No events match" message stays as-is.
**Error:** inline banner above the grid:
```
Couldn't load events. [Retry]
```
Retry calls the hook's `refetch()`.

## Files Touched

**Create:**
- `frontend/scripts/seed-events.ts` (one-shot seeder)
- `src/hooks/useEvents.ts`
- `src/hooks/useEventDetail.ts`
- `src/hooks/useCities.ts`
- `src/hooks/useCategories.ts`
- `src/hooks/useRsvp.ts`
- `src/types/api.ts`

**Modify (swap static import → hook):**
- `src/pages/landing-page/EventsSection.tsx`
- `src/pages/landing-page/DestinationsSection.tsx`
- `src/pages/landing-page/HeroSection.tsx` (category chip row)
- `src/pages/events-page/index.tsx`
- `src/pages/destinations-page/index.tsx`
- `src/pages/event-page/index.tsx` (data + RSVP button)
- `src/components/ui/EventCard.tsx` (accept `EventVM` — date and price now come pre-formatted)
- `src/components/ui/CategoryItem.tsx` (if it consumes static category data)
- `src/components/ui/DestinationCard.tsx` (consume `CityVM.event_count`)
- `src/components/ui/SearchBar.tsx` (city dropdown — read from `useCities` instead of static)

**Untouched:** `Header`, `Footer`, `TrustSection`, `ExperienceSection`, `FinalCTASection`, all auth pages.

**Left on disk but unimported:** `src/data/events.ts`, `cities.ts`, `categories.ts`. (Used as reference until they're confirmed obsolete; cleanup in a later janitorial pass.)

## RLS Assumptions

These should already be in place from the schema migration. Confirm before implementation:

- `events_with_counts` view: `anon` can `SELECT` (public listing)
- `cities`, `categories`: `anon` can `SELECT`
- `profiles`: `anon` can `SELECT` (needed for host name on event cards) — verify; if not, hooks can drop host name from list view and only fetch it on detail page
- `rsvps`: authenticated users can `SELECT` their own rows + `INSERT` / `DELETE` their own rows. No public count exposure needed; count comes from the view.

If `profiles` SELECT is locked down for `anon`, the design degrades gracefully: list cards show "Hosted on XtravaGala" instead of host name; detail page (after login) shows real host.

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Fetching library | None (plain hooks) | Speed; no new dep |
| Filtering | Server-side for city/category; client-side for text query | Avoids Postgres FTS setup; small dataset |
| Optimistic RSVP | Yes | Snappier UX, easy rollback |
| Capacity check | Server-enforced via RLS / trigger (already in schema); client just disables button when `isFull` | Defense-in-depth |
| Static data files | Keep on disk, stop importing | Easy rollback; cleanup later |
| Pagination | Skipped | Dataset is small for MVP |
| Realtime | Skipped | Manual refetch on toggle is enough |
| Seed approach | TS script with anon-key signUp for fake hosts | No service-role key needed; reuses existing TS data verbatim; idempotent |
| Fake host emails | `seed-<slug>@xtravagala.dev` | `.dev` TLD won't collide with real users; deterministic so re-runs are safe |
| Date parsing | Regex parse of existing PHT-formatted strings, year defaults to 2026 | Avoids editing every event in events.ts |
