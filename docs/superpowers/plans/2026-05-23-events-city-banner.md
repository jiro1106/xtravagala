# Events City Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-width coral banner above the events grid that appears when a city filter is active, displaying the selected city name in editorial italic typography with a clear-filter affordance.

**Architecture:** A single new component `EventsCityBanner` reads the `city` URL param via `useSearchParams`, looks up the city in static `cities.ts` data, and renders a full-width coral panel with two soft radial-glow overlays, the city name in Instrument Serif italic, the filtered event count, and a clear-X button that drops the `city` param. Returns `null` when no city is selected. Mounted by `EventsPage` between the filter bar and the wrap.

**Tech Stack:** React 19 + TypeScript, Framer Motion v12, react-router-dom v7, inline styles (project convention). No test runner is configured — verification is via `npm run lint`, `npm run build` (typecheck), and manual browser checks at `localhost:5173`.

**Note on commits:** This project has a "no auto-commit" rule (the user commits their own changes). Tasks do not include `git commit` steps. Final verification is bundled at the end.

**Reference spec:** `docs/superpowers/specs/2026-05-23-events-city-banner-design.md`

---

## File Structure

| File | Purpose |
|---|---|
| `frontend/src/pages/events-page/EventsCityBanner.tsx` (new) | Self-contained banner component. Reads city from URL, renders or returns null. |
| `frontend/src/pages/events-page/index.tsx` (modify) | Imports `EventsCityBanner` and renders it with `count={filtered.length}` between `EventsFilterBar` and the `wrap section-py` div. |

No other files are touched. No changes to global CSS, routing, or data.

---

### Task 1: Create `EventsCityBanner` component skeleton

**Files:**
- Create: `frontend/src/pages/events-page/EventsCityBanner.tsx`

- [ ] **Step 1: Create the file with the early-return skeleton**

Create `frontend/src/pages/events-page/EventsCityBanner.tsx` with the following exact contents:

```tsx
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cities } from '@/data/cities';

interface EventsCityBannerProps {
  count: number;
}

export function EventsCityBanner({ count }: EventsCityBannerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityId = searchParams.get('city') ?? '';
  const city = cities.find((c) => c.id === cityId);

  if (!city) return null;

  function clearCity() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('city');
        return next;
      },
      { replace: true }
    );
  }

  return (
    <motion.section
      role="status"
      aria-label="Active city filter"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        width: '100%',
        background: 'oklch(68% 0.14 35)',
        borderBottom: '1px solid oklch(58% 0.14 30 / 0.3)',
        overflow: 'hidden',
      }}
    >
      {/* glows + content come in next task */}
      <div style={{ padding: '28px 0', color: '#fff' }}>
        {city.name} — {count} events
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run from `frontend/`:
```bash
npx tsc --noEmit
```

Expected: exits 0 with no output. If `tsc -b` from `package.json` is preferred, run `npm run build` — both should pass.

---

### Task 2: Wire the banner into `EventsPage`

**Files:**
- Modify: `frontend/src/pages/events-page/index.tsx`

- [ ] **Step 1: Add the import**

Open `frontend/src/pages/events-page/index.tsx`. Find the existing imports block at the top (lines 1–6). Add a new import line immediately after the `EventsFilterBar` import (line 6):

```tsx
import { EventsCityBanner } from './EventsCityBanner';
```

The imports block should now end with:
```tsx
import { EventsFilterBar } from './EventsFilterBar';
import { EventsCityBanner } from './EventsCityBanner';
```

- [ ] **Step 2: Render the banner between filter bar and wrap**

In the same file, find the `return` block (starts around line 50). The current JSX starts with:

```tsx
return (
  <>
    <EventsFilterBar />

    <div className="wrap section-py">
```

Insert the banner between `<EventsFilterBar />` and the `<div className="wrap section-py">` so it becomes:

```tsx
return (
  <>
    <EventsFilterBar />

    <EventsCityBanner count={filtered.length} />

    <div className="wrap section-py">
```

- [ ] **Step 3: Verify build + lint pass**

Run from `frontend/`:
```bash
npm run lint && npm run build
```

Expected: both exit 0.

- [ ] **Step 4: Manually verify in browser**

Run from `frontend/`:
```bash
npm run dev
```

In the browser at `http://localhost:5173/events`:
1. Confirm **no banner** is shown.
2. Select a city from the filter bar (or visit `/events?city=manila`).
3. Confirm a **coral banner** appears above the results count, showing the city name and a count.
4. Confirm clearing the city (via filter bar's "Clear all" or the dropdown back to "All cities") **removes** the banner.

Stop the dev server when done (Ctrl-C).

---

### Task 3: Build the final banner content + glows + layout

**Files:**
- Modify: `frontend/src/pages/events-page/EventsCityBanner.tsx`

This task replaces the placeholder body from Task 1 with the full editorial-typographic layout per the spec.

- [ ] **Step 1: Replace the component body with the full implementation**

Open `frontend/src/pages/events-page/EventsCityBanner.tsx` and replace the entire return statement (from `return (` through the closing `);`) with this exact JSX:

```tsx
  return (
    <motion.section
      role="status"
      aria-label="Active city filter"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        width: '100%',
        background: 'oklch(68% 0.14 35)',
        borderBottom: '1px solid oklch(58% 0.14 30 / 0.3)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 20%, oklch(78% 0.13 40 / 0.6) 0%, transparent 55%), radial-gradient(circle at 85% 90%, oklch(58% 0.14 30 / 0.55) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="wrap"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingTop: 28,
          paddingBottom: 28,
          color: '#fff',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 6,
            }}
          >
            Now showing
          </div>
          <h2
            style={{
              margin: 0,
              fontWeight: 400,
              fontSize: 'clamp(22px, 2.4vw, 30px)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            Events in{' '}
            <span
              className="font-serif-accent italic"
              style={{ fontSize: 'clamp(28px, 3vw, 38px)' }}
            >
              {city.name}
            </span>
          </h2>
        </div>

        <div
          className="events-city-banner-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap',
            }}
          >
            {count.toLocaleString()} {count === 1 ? 'event' : 'events'}
          </span>
          <motion.button
            onClick={clearCity}
            aria-label="Clear city filter"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0)',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.18s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(255,255,255,0)';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .events-city-banner-right {
            width: 100%;
          }
        }
      `}</style>
    </motion.section>
  );
```

The full file should now read as the Task 1 skeleton, but with this expanded return block.

- [ ] **Step 2: Verify lint + build pass**

Run from `frontend/`:
```bash
npm run lint && npm run build
```

Expected: both exit 0.

---

### Task 4: Add mobile stacking

**Files:**
- Modify: `frontend/src/pages/events-page/EventsCityBanner.tsx`

The desktop layout uses a horizontal flex row. On mobile (< 640px), the spec calls for the headline to stay on top and count + X to drop to a second row.

- [ ] **Step 1: Expand the existing `<style>` block to stack the inner row**

In `frontend/src/pages/events-page/EventsCityBanner.tsx`, find the `<style>` block near the bottom of the return:

```tsx
      <style>{`
        @media (max-width: 640px) {
          .events-city-banner-right {
            width: 100%;
          }
        }
      `}</style>
```

Replace it with this expanded version:

```tsx
      <style>{`
        .events-city-banner-row {
          flex-direction: row;
        }
        @media (max-width: 640px) {
          .events-city-banner-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .events-city-banner-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
```

- [ ] **Step 2: Add the `events-city-banner-row` class to the inner content wrapper**

In the same file, find the inner content wrapper (the `<div className="wrap">` with the flex layout containing the left text block and the right `events-city-banner-right` block). Change its className from `"wrap"` to `"wrap events-city-banner-row"`:

Before:
```tsx
      <div
        className="wrap"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingTop: 28,
          paddingBottom: 28,
          color: '#fff',
        }}
      >
```

After:
```tsx
      <div
        className="wrap events-city-banner-row"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingTop: 28,
          paddingBottom: 28,
          color: '#fff',
        }}
      >
```

- [ ] **Step 3: Verify lint + build pass**

Run from `frontend/`:
```bash
npm run lint && npm run build
```

Expected: both exit 0.

---

### Task 5: Manual browser verification (final)

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run from `frontend/`:
```bash
npm run dev
```

- [ ] **Step 2: Verify desktop appearance**

In a desktop-width browser at `http://localhost:5173/events?city=manila`:

- [ ] Banner is full-width (no horizontal gap between the banner edges and the viewport edges).
- [ ] Background is coral (warm orange/peach), not teal.
- [ ] Two soft radial glows are visible — lighter glow top-left, deeper glow bottom-right.
- [ ] 1px darker coral bottom border separates the banner from the content below.
- [ ] Eyebrow `NOW SHOWING` appears in uppercase white at slight opacity.
- [ ] Headline reads `Events in Manila`, with `Manila` rendered in Instrument Serif italic, larger than the sans-serif "Events in" prefix.
- [ ] Right side shows `1,284 events` (or whatever the filtered count is) and a circular X button.
- [ ] Hovering the X button shows a subtle white tint background and the icon scales up slightly.
- [ ] Clicking the X removes the banner and clears only the `city` param (other params, if any, remain).

- [ ] **Step 3: Verify mobile appearance**

Resize browser to < 640px (or use DevTools device emulation):

- [ ] Eyebrow + headline stay on top, left-aligned.
- [ ] Count and X button drop to a second row, with the count on the left and X on the right (space-between).
- [ ] No horizontal overflow / scrollbar.

- [ ] **Step 4: Verify other filter routes are unaffected**

- [ ] At `/events` (no params): no banner.
- [ ] At `/events?category=music` (no city): no banner.
- [ ] At `/events?city=manila&category=music`: banner appears, and count reflects the combined-filter result (smaller than 1,284).
- [ ] At `/events?city=notarealcity`: no banner (defensive fall-through).

- [ ] **Step 5: Verify mount animation**

- [ ] Navigate from `/events` → `/events?city=cebu`. The banner fades in and slides down briefly.

- [ ] **Step 6: Stop the dev server**

Ctrl-C in the terminal running `npm run dev`.

---

## Self-Review Notes

- **Spec coverage:** All sections of the spec (trigger, visual design, content, mobile, motion, a11y, component structure, files touched) are covered across Tasks 1–5. The "no coral promotion to global CSS" decision is honored — all coral values are inline in the component.
- **Placeholder check:** No TBDs; every code step shows the complete code.
- **Type consistency:** `EventsCityBanner` prop shape is `{ count: number }` across Tasks 1, 2, and 3. `clearCity` is defined in Task 1 and reused in Task 3.
- **Plural/singular:** Count display uses `count === 1 ? 'event' : 'events'` to avoid "1 events" — small detail not in the spec but obvious correctness.
