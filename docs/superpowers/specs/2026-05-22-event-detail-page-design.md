# Event Detail Page — Design Spec

**Date:** 2026-05-22
**Status:** Approved

---

## Overview

A dynamic event detail page at `/events/:id` that renders all details for a single event. It is a template — the same component renders for every event, driven by data looked up from the static `events` array by `id`. When the backend is ready, the static lookup swaps for an API call with no structural changes needed.

---

## Route

```
/events/:id
```

Added to `App.tsx` inside the existing layout route (renders with Header + Footer).

---

## Data Model

Extend the existing `Event` interface in `frontend/src/data/events.ts` with optional detail fields:

```ts
export interface Event {
  // existing fields (unchanged)
  id: string;
  title: string;
  image: string;
  price: string;
  date: string;
  host: string;
  attendees: number;
  category: string;
  city: string;

  // new optional detail fields
  description?: string;
  venue?: string;
  address?: string;
  schedule?: Array<{ time: string; label: string }>;
}
```

All 20 existing events get these fields populated with plausible static data. Fields are optional so that list views (EventCard, EventsSection) work without changes.

---

## Page Layout

### Top: Full-width hero image
- Aspect ratio `21/8`, `object-fit: cover`
- No border-radius (edge-to-edge below the navbar)
- Preceded by a `← Back to Events` link (uses `useNavigate(-1)` with fallback to `/events`)

### Below hero: 2-column grid
`grid-template-columns: 1fr 300px`, gap `48px`, max-width `1100px`, centered.

**Left column (main content):**
1. Availability badge — e.g. "Few spots left" (amber pill). Shown only when `attendees < 20`.
2. Event title — large, bold, tight tracking
3. Host row — avatar placeholder + "by [host]" + attendee count + category + Follow button (no-op for now)
4. Location + date rows — icon + text, separated by a divider
5. Overview / About — `description` field, paragraph text
6. Schedule — time | label rows, only rendered if `schedule` exists

**Right column (sticky booking panel):**
- Sticks at `top: 64px` (below the sticky navbar)
- Price (large, bold)
- Date summary (muted)
- Primary CTA: "Sign in to register →" — links to `/login`
- Attendee count (muted, below button)
- Border, rounded card, white background

### Below the 2-col: Similar events
- Heading: "You might also like..."
- Subtitle: "More events in the same category"
- Vertical list — up to 3 events from same `category`, excluding current event
- Each row: title + date + city + price on the left, small thumbnail (100×70px) on the right
- Each row links to that event's detail page (`/events/:id`)
- Separated by dividers

---

## Page Folder

```
frontend/src/pages/event-page/
  index.tsx        ← the detail page component
```

Follows the existing page folder convention (`pages/<name>-page/`).

---

## Event Not Found

If `id` doesn't match any event, render a simple message: "Event not found." with a link back to `/events`.

---

## EventCard Linking

`EventCard` (used in `EventsSection` and `EventsPage`) needs to be wrapped in a `Link to={/events/${event.id}}` so clicking a card navigates to the detail page. The card itself doesn't change visually.

---

## Navigation

- `← Back to Events` uses `useNavigate(-1)` so users return to whatever page they came from (landing or events list), falling back to `/events` if there's no history.
- `ScrollToTop` (already in `App.tsx`) handles scroll reset on navigation.

---

## Animations

Consistent with existing page conventions:
- Hero image: fade in on mount (`motion.div`, `opacity 0→1`, `y 24→0`, `duration 0.7`)
- Left column content: staggered fade-in sections
- Similar event rows: `whileInView` fade-in with `once: true`
- Booking panel: no animation (sticky, should feel anchored)

---

## Out of Scope

- Real ticket purchase / registration flow (backend TBD)
- Follow button functionality (backend TBD)
- Map embed for venue
- Image gallery / multiple photos
- Comments or reviews
