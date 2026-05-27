# My events tab — design

**Date:** 2026-05-27
**Status:** Approved, ready for implementation plan

## Goal

Give logged-in users a place to see every event they have RSVP'd to. Upcoming events show with a "Going" badge and a way to cancel. Past events (where `start_at < now()`) automatically appear as "Done" and are read-only.

## Scope

- One new tab inside the existing `/profile` page: **My events**.
- Two sub-tabs inside it: **Upcoming** | **Past**.
- One new data hook: `useMyRsvps`.
- No DB schema changes — `rsvps` and `events` tables already exist.
- Host-shell variant (`/host/profile`) is unchanged. The new tabs only render at `/profile`.

## Out of scope (explicitly cut)

- Tri-state RSVP (going / maybe / not going). RSVP stays binary.
- Calendar export, ICS files, reminders, notifications.
- Filtering, sorting, or searching inside the tab.
- Pagination (assume RSVP counts per user stay reasonably small; revisit if needed).

## Route & navigation

- No new top-level route.
- `/profile` gains tabs. Active tab is reflected in the URL as `?tab=profile` (default) or `?tab=events`.
- URL-driven tab state keeps tabs linkable and survives the back button.
- **Avatar dropdown** gets a new "My events" item, placed between "My profile" and the host link. It links to `/profile?tab=events`. The mobile menu mirrors this entry for parity. No new top-level header nav link — personal items stay grouped in the avatar dropdown.

## Page structure

```
ProfilePage (at /profile)
├── Top-level tab bar: [Profile] [My events]
├── Profile tab → ProfileTab.tsx        (existing profile form, extracted)
└── My events tab → MyEventsTab.tsx     (new)
       ├── Sub-tab bar: [Upcoming] [Past]
       ├── UpcomingRsvpsList (grid of EventCards + "Going" pill + Cancel)
       └── PastRsvpsList     (grid of EventCards + "Done" pill, read-only)
```

The existing `ProfilePage` body becomes `ProfileTab` — same form, same behaviour, just relocated into a tab. No functional change to the profile form itself.

## Sub-tab behaviour

**Upcoming**
- Source: RSVPs joined with events where `start_at >= now()`.
- Order: `start_at ascending` (soonest first).
- Card decoration: green "Going" pill in the corner.
- Action: "Cancel RSVP" on each card. On click, optimistically remove from list, delete the row from `rsvps`, refetch on error.
- Empty state: "You haven't RSVP'd to anything yet." + primary button linking to `/events`.

**Past**
- Source: RSVPs joined with events where `start_at < now()`.
- Order: `start_at descending` (most recent first).
- Card decoration: muted "Done" pill.
- Action: none. Card click navigates to `/events/:id` like any other event card.
- Empty state: "No past events yet."

## Data layer

New hook: `frontend/src/hooks/useMyRsvps.ts`.

**Shape:**
```ts
function useMyRsvps(): {
  upcoming: EventVM[];
  past: EventVM[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  cancelRsvp: (eventId: string) => Promise<void>;
};
```

**Query:** Single Supabase call against `rsvps`, nested-selecting the joined event row via `events_with_counts`. Pattern mirrors `useMyEvents`:

```ts
supabase
  .from('rsvps')
  .select(`
    event_id,
    events_with_counts!event_id (
      *,
      host:profiles!host_id(id, host_name, full_name, host_bio),
      city:cities!city_id(id, name),
      category:categories!category_id(id, label)
    )
  `)
  .eq('user_id', user.id);
```

The hook splits results client-side into `upcoming` and `past` using a single `new Date()` snapshot at query time. Past events that pass the boundary mid-session won't move tabs until the next refetch — acceptable.

**Cancel flow:** `cancelRsvp(eventId)` deletes from `rsvps` where `event_id` + `user_id` match, then refetches. On failure, surfaces `error`. Optimistic UI removal happens in `MyEventsTab` (drops the event from local state before awaiting the network call).

**Auth:** If `useAuth().user` is null, hook returns empty arrays and `loading=false`. The tab itself sits inside `<RequireAuth>` already (current `/profile` route), so this is only a defensive default.

## Components touched / created

| File | Action |
|---|---|
| `frontend/src/components/layout/Header.tsx` | Add "My events" link to avatar dropdown and mobile menu, linking to `/profile?tab=events`. |
| `frontend/src/pages/profile-page/index.tsx` | Refactor: introduce tab shell, read `?tab=` from URL, render `ProfileTab` or `MyEventsTab`. |
| `frontend/src/pages/profile-page/ProfileTab.tsx` | New. Existing profile form moved here verbatim. |
| `frontend/src/pages/profile-page/MyEventsTab.tsx` | New. Sub-tab shell + upcoming/past lists. |
| `frontend/src/pages/profile-page/RsvpCard.tsx` | New. Thin wrapper around existing `EventCard` adding the status pill and (for upcoming) the cancel control. |
| `frontend/src/hooks/useMyRsvps.ts` | New. See data layer above. |

## Host-shell variant

`/host/profile` currently reuses `ProfilePage` rendered inside the host dashboard layout. The new tabs should NOT appear there — hosts viewing their own profile in the host shell get the existing form-only experience. Branch on `pathname.startsWith('/host/')` (already computed as `insideHostShell` in the current file) and skip the tab shell when true.

## Visual / design notes

- Tab bar style: follow existing `Header` link / pill patterns. Underline-on-active or pill-on-active — pick whichever already exists in the codebase; do not introduce a new visual primitive.
- Status pills:
  - "Going" — `var(--primary)` background, white text.
  - "Done" — `var(--muted)` background, `var(--text-mute)` text.
- Event cards reuse `EventCard` exactly; the pill overlays in the corner, the cancel link sits below the card meta.
- Empty states match the spacing and copy tone of other empty states on the site.

## Risks / open questions

- **Tab-bar styling**: Whether to match an existing pattern or introduce one. Resolution: scan the codebase during implementation; if no existing tabs, use a minimal underline-style bar in Tailwind.
- **Large RSVP counts**: No pagination. If a user has 200+ RSVPs the past list could get long. Acceptable for MVP per fast-path mode.
- **Stale split at midnight**: An event that crosses `now()` mid-session stays in Upcoming until refetch. Acceptable; refetch on tab switch keeps it cheap to fix later if needed.

## Acceptance criteria

1. Avatar dropdown shows a "My events" link between "My profile" and the host link; the mobile menu mirrors it. Clicking it lands on `/profile?tab=events`.
2. Logged-in user visits `/profile`, sees two tabs: Profile (default) and My events.
3. Clicking **My events** updates the URL to `?tab=events` and shows Upcoming / Past sub-tabs.
4. Upcoming sub-tab lists every event the user RSVP'd to where `start_at >= now()`, soonest first, each with a "Going" pill.
5. Clicking **Cancel RSVP** removes the event from the Upcoming list and deletes the row in Supabase.
6. Past sub-tab lists every event the user RSVP'd to where `start_at < now()`, most recent first, each with a "Done" pill and no cancel action.
7. Visiting `/host/profile` shows the original profile form with no tabs.
8. Empty states render correctly when the user has zero RSVPs (Upcoming or Past).
