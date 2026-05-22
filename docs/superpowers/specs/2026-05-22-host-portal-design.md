# Host Portal — Design Spec
**Date:** 2026-05-22
**Status:** Approved

## Overview

Three coordinated changes that introduce the host identity into the product: a "Become a host" entry point in the global header, a CTA in the landing page HostSection, and a dedicated host login page at `/host/login`.

---

## 1. Header — "Become a host" button

**Location:** Rightmost element in the header actions group, separated from the user auth buttons by a `28px` left margin gap (no divider element — gap alone creates the visual boundary).

**Appearance:**
- `variant="ghost"` Button component, `size="sm"` — reuses the existing ghost variant (light border, text color, teal on hover). The wide gap is what signals "different audience", not a different border style.
- Text: `"Become a host"`
- Links to `/host/login` via React Router `to` prop

**Layout:**
```
[Logo]   [Find Events] [Cities] [For Hosts]   [Sign in] [Sign up →]   ← 28px gap →   [Become a host]
```

**Mobile:** Hidden on small screens alongside the other nav actions (`hidden md:flex` scope or equivalent). No hamburger menu required for this iteration.

**Constraints:** Must not reflow the center nav or push the logo off screen at 1024px viewport. Use `flex-shrink-0` on the host button group.

---

## 2. HostSection CTA button

**Location:** Centered below the fan-stacked host feature cards in `HostSection.tsx`, inside the existing `wrap` container.

**Appearance:**
- `variant="primary"` Button (teal filled), `size="default"`, `showArrow`
- Text: `"Become a host"`
- Links to `/host/login`
- Wrapped in a `motion.div` with `whileInView` fade-up consistent with the section's existing animation pattern (`initial={{ opacity: 0, y: 24 }}`, `viewport={{ once: true, margin: "-40px" }}`, `transition={{ duration: 0.7, ease }}`, `delay: 0.15`)
- Centered with `text-center` or `flex justify-center`

---

## 3. Host login page — `/host/login`

### Route
Added to `App.tsx` outside the `<Layout>` wrapper (no Header/Footer), same as `/login` and `/signup`.

```tsx
<Route path="/host/login" element={<HostLoginPage />} />
```

### File structure
```
frontend/src/
  pages/
    host-login-page/
      index.tsx               ← HostLoginPage component
  components/ui/
    HostIllustration.tsx      ← Left panel illustration
```

### HostIllustration component

Mirrors `AuthIllustration.tsx` structure exactly. Key differences:

- **Background:** `bg-[oklch(26%_0.07_170)]` (dark teal, distinct from the user login's `bg-primary`)
- **SVG illustration theme:** Host dashboard — bar chart columns, stat chips row, live-status dot, attendee avatar circles. All elements white at varying `fill-opacity` levels, consistent with the user login illustration style.
- **Tagline:** `"Every event, fully in control."` / `"The host platform for the Philippines"`
- **Blob decorations:** Same `-top-20 -right-20` and `-bottom-16 -left-16` absolute circles, white at 0.05–0.06 opacity
- **Dot grid:** Same `top-6 right-6` grid, `hidden md:grid`, 5×4 dots

### HostLoginPage component

Mirrors `LoginPage` layout and structure:

- Same `flex h-screen overflow-hidden flex-col md:flex-row` wrapper
- Left: `<HostIllustration />` (replaces `<AuthIllustration />`)
- Right: form panel — identical structure to login page with these differences:
  - Badge: small `"Host portal"` label above the heading
  - Heading: `"Welcome back, host"`
  - Subtext: `"Sign in to your host account"`
  - Submit button text: `"Sign in to host portal"`
  - Cross-link at bottom: omitted — no host signup flow exists yet
  - Back link top-left: same logo/brand link back to `/`
- Form fields: email + password (same structure and styling as `/login`)
- Google OAuth button: same component, same styling
- Password show/hide toggle: same `EyeIcon` component

### Mobile behaviour
- On mobile (`< md`): illustration collapses to a short banner at the top (same `h-48 md:h-auto` pattern as `AuthIllustration`)
- Form panel scrolls independently on overflow

---

## Constraints & standards

- **Tailwind-first:** All new styling uses Tailwind utility classes. Inline `style` props only for dynamic values (e.g., oklch colors not available as Tailwind tokens) or when matching existing component patterns.
- **Mobile-responsive:** Every new element tested at 375px, 768px, and 1280px breakpoints.
- **Framer Motion:** Animations follow existing project conventions — `ease: [0.23, 1, 0.32, 1]`, `whileInView` with `viewport={{ once: true }}` for section content.
- **Routing:** New route added outside `<Layout>` wrapper so host login has no global Header/Footer.
- **No backend:** All forms are static for now — `onSubmit={(e) => e.preventDefault()}`. No validation logic beyond what the browser provides natively.
- **Reuse, don't duplicate:** `HostLoginPage` imports and reuses `Button`, `EyeIcon`, `GoogleIcon` from existing component locations. `HostIllustration` is a new component rather than a prop variant of `AuthIllustration` to keep each file focused.
