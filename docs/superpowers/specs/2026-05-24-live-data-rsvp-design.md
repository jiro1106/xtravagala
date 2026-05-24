# Live Data + RSVP Design

**Date:** 2026-05-24
**Status:** Approved

## Goal

Replace static `src/data/*` imports across the app with Supabase queries via data hooks, and add the attendee RSVP flow on event detail pages. After this work the platform is "live" — events, cities, categories, and attendee counts all come from the database, and signed-in users can RSVP.

## Scope

- 5 data hooks: `useEvents`, `useEventDetail`, `useCities`, `useCategories`, `useRsvp`
- A shared `EventVM` view-model so consumer components change minimally
- Swap all data-bound components from `src/data/*` to hooks
- RSVP toggle button on event detail page (optimistic, with capacity guard)
- Skeleton loading states, inline error banners, empty states

**Out of scope:** "My RSVPs" / attendee history page, DB-side full-text search (client-side filtering stays), pagination, realtime subscriptions, RSVP notifications, calendar export.

## Architecture

**Pattern:** plain `useState` + `useEffect` hooks. No fetching library — keeps the dep tree small for fast-path delivery. Each hook returns `{ data, loading, error, refetch }`.

```
src/hooks/
  useEvents.ts        list, supports { city?, category?, q? } filters
  useEventDetail.ts   single event + host profile
  useCities.ts        list with event_count
  useCategories.ts    list (sorted by sort_order)
  useRsvp.ts          { rsvped, loading, toggle(), count } for an event
src/types/api.ts      EventVM, CityVM, CategoryVM, HostVM
```

Hooks live independently of components — every consumer imports its hook directly, never `supabase` itself.

## Data Shape: `EventVM`

The DB view `events_with_counts` returns the raw row plus `attendee_count`. We map that to a UI-friendly `EventVM` inside each hook so components don't deal with timestamps and FKs:

```ts
interface EventVM {
  id: string;
  title: string;
  description: string | null;
  image: string;              // cover_image_url, fallback to placeholder
  city: { id: string; name: string };
  category: { id: string; label: string };
  host: { id: string; name: string; bio: string | null };
  startAt: Date;              // parsed from start_at
  dateLabel: string;          // formatEventDateTime(startAt)
  price: number;
  priceLabel: string;         // formatPrice(price, currency) — "Free" if 0
  capacity: number | null;
  attendees: number;          // from view
  isFull: boolean;            // capacity != null && attendees >= capacity
  venue: string | null;
  address: string | null;
}
```

`formatEventDateTime` and `formatPrice` already exist in `src/lib/time.ts`.

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
