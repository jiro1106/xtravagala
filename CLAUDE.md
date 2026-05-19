# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**XtravaGala** — An event discovery and hosting platform focused on the Philippines. Tagline: "Find events worth showing up for." The landing page targets event attendees (browse/discover) and event hosts (scheduling, tracking, rentals, catering, consultation).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Routing | react-router-dom v6 |
| Fonts | Inter (UI) + Instrument Serif (editorial accents) via Google Fonts |

Backend is **TBD** — all data is currently static in `src/data/`. Structure data files so they are easy to swap for API calls later.

## Commands

All commands run from the `frontend/` directory:

```bash
cd frontend
npm run dev      # start dev server (localhost:5173)
npm run build    # production build
npm run preview  # preview production build
npm run lint     # lint
```

## Design System

### Color Tokens (CSS custom properties in src/index.css)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `oklch(55% 0.09 170)` | Teal — text, buttons, links, icons |
| `--primary-deep` | `oklch(42% 0.09 170)` | Darker teal for host card bg |
| `--primary-glow` | `oklch(68% 0.11 170)` | Lighter teal for hover glows |
| `--bg` | `#ffffff` | Page background — most sections |
| `--surface` | `#fbfbfa` | Warm off-white — alternating sections |
| `--nav-bg` | `#f4f4f1` | Navbar background |
| `--dark` | `oklch(20% 0.02 170)` | Dark surface |
| `--text` | `#2a2e30` | Primary text |
| `--text-mute` | `#6a6f72` | Secondary/muted text |
| `--text-on-dark` | `oklch(94% 0.012 170)` | Text on dark backgrounds |
| `--muted` | `#ececea` | Muted fill (e.g. avatar placeholder) |
| `--border` | `#e9e9e6` | Borders on light surfaces |
| `--slate` | `#34393c` | Footer + CTA panel background |
| `--experience-bg` | `#eeede9` | Hosts section background |

**Rule:** Teal (`--primary`) is reserved for text accents, buttons, links, and the brand mark. Backgrounds are white or warm grey only.

### Typography

- **UI font**: Inter (weights 300/400/500/600/700)
- **Accent font**: Instrument Serif italic — used sparingly for editorial headline moments only (class `.serif` or Tailwind `font-serif-accent italic`)
- **Base font size**: 17px, line-height 1.55
- **Heading scale**: `clamp(28px, 3.4vw, 40px)` for section h2s; `clamp(32px, 3.8vw, 46px)` for hero h1

### Easing

All motion uses `ease-out-quint`: `cubic-bezier(0.23, 1, 0.36, 1)`. Set as Tailwind custom timing function and CSS `--ease-out-quint` variable.

### Layout

- **Max content width**: 1360px (`.wrap` class)
- **Horizontal padding**: 72px → 32px @900px → 22px @600px
- **Section padding**: 90–110px top/bottom
- **Border radius**: 100px (pills), 22–28px (cards), 14–16px (media thumbnails)

## Folder Structure

The frontend lives in `frontend/` at the repo root. The backend (TBD) will live in a sibling folder (e.g. `backend/`).

```
frontend/
  src/
  components/
    layout/        # Header, Footer — shared across all routes
    ui/            # Reusable primitives: Button, Chip, SearchBar, EventCard,
                   # CategoryItem, DestinationCard, HostCard
  pages/
    landing-page/  # All sections for the landing page route
      index.tsx    # Assembles HeroSection → Events → Destinations → Trust → Experience → FinalCTA
      HeroSection.tsx
      EventsSection.tsx
      DestinationsSection.tsx
      TrustSection.tsx
      ExperienceSection.tsx
      FinalCTASection.tsx
  data/            # Static typed data (swap for API calls later)
    events.ts
    cities.ts
    categories.ts
    testimonials.ts
    logos.ts
  App.tsx          # BrowserRouter + Routes (react-router-dom v6)
  main.tsx
  index.css        # Google Fonts, CSS custom props, Tailwind directives
```

**Page folder convention**: Each route gets a `pages/<route-name>-page/` folder with its own section components. Examples:
- `pages/landing-page/` — home/landing
- `pages/login-page/` — login flow sections
- `pages/dashboard-page/` — host dashboard sections

## Routing (react-router-dom v6)

`App.tsx` uses `BrowserRouter` + `Routes`. A layout route renders `Header` and `Footer` as persistent shell around `<Outlet>`. Each page maps to its `pages/<name>-page/index.tsx`.

```tsx
// App.tsx pattern
<BrowserRouter>
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<LandingPage />} />
      {/* future routes added here */}
    </Route>
  </Routes>
</BrowserRouter>
```

## Animation Conventions (Framer Motion)

| Element | Approach |
|---|---|
| Section content / cards | `motion.div` with `whileInView={{ opacity: 1, y: 0 }}`, `initial={{ opacity: 0, y: 24 }}`, `viewport={{ once: true, margin: "-40px" }}` |
| Staggered grid items | Add `transition={{ delay: index * 0.08 }}` |
| Hero card image | `whileHover={{ scale: 1.05 }}` on background wrapper |
| Event card hover | `whileHover={{ y: -4 }}` + conditional solid bg via state |
| Destination card | `whileHover` image scale + arrow translate |
| Host cards fan | CSS initial rotation; `whileHover={{ y: -16, rotate: 0 }}` + `zIndex: 10` |
| Category ring | `whileHover={{ scale: 1.05 }}` |
| CTA arrows | `whileHover={{ x: 3 }}` on arrow SVG |
| Logo marquee | Pure CSS `@keyframes` infinite scroll (no Framer needed) |
| Testimonials | Framer `AnimatePresence` + `motion.div` opacity crossfade |

## Landing Page Sections (in order)

1. **Header** — sticky white nav, border-bottom shadow on scroll
2. **HeroSection** — search bar → hero card (dark image, teal glow overlay, h1/CTA) → category row in grey rounded card
3. **EventsSection** — 3-col event card grid (PH localized), hover solidify
4. **DestinationsSection** — PH city cards grid (Manila large, BGC/Makati/Cebu stacked), "View more cities" pill
5. **TrustSection** — auto-cycling testimonials (3 quotes, 3.6s) + infinite logo marquee
6. **ExperienceSection** — "For event hosts" intro + 5 fan-stacked host feature cards (Scheduling, Real-time tracking, Equipment rentals, Catering, Consultation)
7. **FinalCTASection** — `#34393c` dark panel with radial teal glows
8. **Footer** — `#34393c`, 4-col grid, copyright
