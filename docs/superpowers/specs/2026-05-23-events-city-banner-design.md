# Events City Banner — Design Spec

**Date:** 2026-05-23
**Scope:** Events page (`/events`)
**Status:** Approved for implementation planning

## Goal

When a user filters events by city (URL contains `?city=<id>`), display a full-width colored banner above the results count that announces the selected city. The banner introduces a new accent color (coral) to the site palette — distinct from the existing teal — so the filtered state feels celebratory and place-specific without competing with event card imagery.

## Scope

- **In scope:** A banner that appears only when `?city=<id>` is present in the URL on the `/events` route. Appears above the existing results count, full-width (edge-to-edge, breaking out of `.wrap`).
- **Out of scope:** Banners for other filters (category, sort, search). Backend changes. Adding new city data fields.

## Trigger & visibility

- Render the banner only when `searchParams.get('city')` returns a non-empty value that matches a city `id` in `src/data/cities.ts`.
- If the param is set but no matching city is found, do not render the banner (defensive fall-through to the existing results count).
- The banner appears below the sticky `EventsFilterBar` and above the `Results count` paragraph inside `EventsPage`.

## Visual design

### Background

- Solid color: `oklch(68% 0.14 35)` — warm coral (≈ `#e88469`).
- Two soft radial-gradient glows layered on top of the solid color:
  - Top-left glow: `radial-gradient(circle at 15% 20%, oklch(78% 0.13 40) 0%, transparent 55%)` at ~60% opacity.
  - Bottom-right glow: `radial-gradient(circle at 85% 90%, oklch(58% 0.14 30) 0%, transparent 60%)` at ~55% opacity.
- 1px bottom border: `oklch(58% 0.14 30)` at 30% opacity, for separation from the results area below.

### Dimensions

- Height: content-driven, target ~96–112px on desktop, ~120–140px on mobile (because content stacks).
- Vertical padding: 28px desktop / 24px mobile.
- Horizontal padding: matches the `.wrap` rhythm (72px → 32px @900px → 22px @600px), applied to the inner content row (not the colored background, which is full-width).

### Content (Option 1 — Editorial typographic)

Single-row layout on desktop, stacked on mobile.

**Left side:**
- Eyebrow: `NOW SHOWING` — uppercase, letter-spacing ~0.14em, font-size 11px, weight 600, white at 70% opacity, margin-bottom 6px.
- Headline: `Events in <CityName>` on one line.
  - `Events in` — Inter, sans, weight 400, white, font-size `clamp(22px, 2.4vw, 30px)`.
  - `<CityName>` — Instrument Serif italic (`.font-serif-accent italic` or `.serif`), white, font-size `clamp(28px, 3vw, 38px)`, with a leading space.

**Right side:**
- Event count: `<N> events` — Inter, weight 500, font-size 14px, white at 80% opacity.
- Clear-X button: 32×32 circular button, transparent background with white 12% fill on hover, white X icon (1.75 stroke), `aria-label="Clear city filter"`. Clicking deletes the `city` param from the URL via `setSearchParams`.

### Mobile layout (< 640px)

- Eyebrow + headline stay left-aligned on row one.
- Event count + clear-X drop to a second row, both still on the same line: count on the left, X on the right.
- Headline font-size scales down per the `clamp()`.

## Motion

- On mount: fade + slide-down — `initial={{ opacity: 0, y: -8 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.4, ease: [0.23, 1, 0.36, 1] }}` (matches the site's `ease-out-quint`).
- No exit animation. When the city param is cleared (via X or filter bar), the banner unmounts immediately.
- Clear-X button: `whileHover={{ scale: 1.08 }}`, `whileTap={{ scale: 0.94 }}`.

## Accessibility

- Wrap the banner in a `<section aria-label="Active city filter">` with `role="status"` so screen readers announce the city when it mounts.
- Clear-X button has `aria-label="Clear city filter"`.
- Color contrast: white text on `oklch(68% 0.14 35)` exceeds WCAG AA for large text. Eyebrow at 70% opacity over coral also clears AA (large or semibold smaller text).

## Component structure

A new component `EventsCityBanner` lives at `src/pages/events-page/EventsCityBanner.tsx`. It:

- Accepts a single prop: `{ count: number }` — the filtered events count to display on the right side.
- Reads the city id from `useSearchParams` internally (the parent already does this, but reading it here keeps the component self-contained).
- Looks up the city in `cities` by id; if no match (or no `city` param), returns `null` so the consumer doesn't need conditional logic.
- Uses `city.name` for display. `city.eventCount` is intentionally **not** used — the visible count is `props.count` (filtered events), which reflects what's actually on screen when category/search filters are also active.

`EventsPage` (`src/pages/events-page/index.tsx`) renders it between `EventsFilterBar` and the `wrap section-py` div, passing `count={filtered.length}`.

## Files touched

- **New:** `frontend/src/pages/events-page/EventsCityBanner.tsx`
- **Modified:** `frontend/src/pages/events-page/index.tsx` (insert banner + import)

No changes to `cities.ts`, no changes to global CSS, no changes to routing.

## Color token decision

The coral color is introduced as a **page-local** style for now (inline in `EventsCityBanner`), not promoted to a global CSS custom property in `index.css`. Rationale: this is the first and only use of coral in the codebase. If coral spreads to other components later, a follow-up can lift it to `--accent-coral` and friends in `index.css`. This avoids polluting the global palette before there is a second consumer.

## Open assumptions

- `filtered.length` (the visible/filtered event count) is what users will want shown in the banner, not the city's total event inventory from `cities.ts`. The two can differ when category or search filters are also active. Showing the filtered count is more accurate to what's on screen.
- The banner appears for **all** cities; there is no allowlist or per-city variation in copy or color. All cities use the same coral.
