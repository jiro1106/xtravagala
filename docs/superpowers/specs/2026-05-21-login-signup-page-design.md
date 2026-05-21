# Login & Sign-Up Pages — Design Spec

**Date:** 2026-05-21
**Status:** Approved

---

## Overview

Two standalone auth pages — `/login` and `/signup` — for XtravaGala. Both share the same split-panel layout and illustration, differing only in form fields and heading copy. Auth is **progressive** (lazy): users browse the site freely and are prompted to sign in only when they take a gated action (RSVP, create event, etc.).

---

## Authentication Strategy

- **Progressive auth only** — no login wall on the landing page or browse flows.
- The Header "Sign in" button navigates to `/login` voluntarily.
- Gated actions (e.g. joining an event) redirect to `/login?redirect=/events/123` and bounce back after auth.
- Backend: **Supabase** with Google OAuth (`supabase.auth.signInWithOAuth({ provider: 'google' })`). Email/password via `supabase.auth.signInWithPassword`. Auth is UI-only for now — Supabase wiring added when backend is set up.

---

## Routing

Both pages are **outside** the main `<Layout>` wrapper (no shared Header or Footer):

```tsx
// App.tsx
<Route element={<Layout />}>
  <Route path="/" element={<LandingPage />} />
</Route>
<Route path="/login"  element={<LoginPage />} />
<Route path="/signup" element={<SignUpPage />} />
```

Pages live at:
- `frontend/src/pages/login-page/index.tsx`
- `frontend/src/pages/signup-page/index.tsx`

---

## Layout — Split Panel (Option A)

Full-viewport two-column layout. No scroll on desktop.

| Column | Sizing | Content |
|--------|--------|---------|
| Left   | `w-[55%] shrink-0` | Teal illustration panel |
| Right  | `flex-1 min-w-0`   | Form panel |

On mobile (`< md`): stacks vertically — illustration collapses to a short banner, form below.

---

## Left Panel — Illustration

**Background:** `bg-[var(--primary)]` (teal `oklch(55% 0.09 170)`)

**Decorative elements (Tailwind + inline style):**
- Three `absolute` blob circles (`rounded-full`, `bg-white/[0.06]`) positioned top-right, bottom-left, mid-left
- 4×5 dot grid (top-right corner, `opacity-20`, white dots)
- Subtle `ring` accent circle bottom-left

**SVG illustration (inline, `w-full max-w-[300px]`):**
- Event card / calendar — floating card with date grid cells, one highlighted in teal
- Ticket stub — rotated `-10deg`, with perforation line
- Two flat-style people figures reaching toward each other
- Connection point (circle + cross) between the figures — represents people connecting at events
- Floating accents: map pin, sparkle crosses, small circles

**Tagline (bottom of panel):**
```
Find events worth showing up for.
Across the Philippines
```
Typography: `text-[22px] font-semibold text-white tracking-tight leading-snug`

---

## Right Panel — Form

**Background:** `bg-white`
**Padding:** `px-11 py-9`

### Logo / Back link (top-left)
- `<Link to="/">` with the brand mark (teal rounded square with "X") + "XtravaGala" wordmark
- Same mark as Header — reuse markup, not a separate component

### Form heading
- `<h1>`: "Welcome back" / "Create your account" — `text-[24px] font-semibold tracking-tight text-[var(--text)]`
- Subtext: "Sign in to your account" / "Join XtravaGala today" — `text-[13.5px] text-[var(--text-mute)]`

### Google OAuth button
- Full-width, `h-11`, `rounded-[10px]`, `border border-[var(--border)]`, `bg-white`
- Google logo SVG (inline, 18×18) + "Continue with Google"
- Hover: `border-[var(--primary)]` transition

### Divider
- `or` with `flex` + two `border-t` lines (`border-[var(--border)]`)

### Email field
- Label: `text-[12px] font-medium text-[var(--text-mute)]`
- Input: `h-[42px] rounded-[9px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm`
- Focus: `border-[var(--primary)] bg-white outline-none ring-0`

### Password field
- Same as email
- Toggle show/hide icon (eye SVG) — right side of input, `absolute`

### Forgot password link (login only)
- Right-aligned below password field
- `text-[12.5px] text-[var(--primary)]`
- For now: `href="#"` placeholder (links to `/forgot-password` when implemented)

### Submit button
- Full-width, `h-11`, `rounded-[10px]`
- Reuses existing `<Button variant="primary">` component
- Login: "Sign in" | Sign-up: "Create account"

### Footer link
- Login: "Don't have an account? **Sign up**" → `<Link to="/signup">`
- Sign-up: "Already have an account? **Sign in**" → `<Link to="/login">`
- `text-[13px] text-[var(--text-mute)]`, link in `text-[var(--primary)] font-medium`

---

## Sign-Up Page Differences

Same layout and illustration. Form differences:

| Field | Login | Sign-up |
|-------|-------|---------|
| Heading | "Welcome back" | "Create your account" |
| Subtext | "Sign in to your account" | "Join XtravaGala today" |
| Fields | Email, Password | Full name, Email, Password |
| Submit | "Sign in" | "Create account" |
| Footer | "Don't have an account? Sign up" | "Already have an account? Sign in" |

Password field on sign-up: no forgot password link, but add a static hint below the field — "Use 8 or more characters" — in `text-[11px] text-[var(--text-mute)]`. Not a dynamic strength meter.

---

## Styling Rules

- **All styling via Tailwind CSS v3** — no inline `style={{}}` except for CSS custom property values that Tailwind can't express (e.g. `style={{ background: 'var(--primary)' }}`).
- CSS tokens (`--primary`, `--text`, `--border`, etc.) used via Tailwind's `[]` syntax: `text-[var(--text)]`, `border-[var(--border)]`.
- Framer Motion: `whileHover` on the Google button and Submit button (consistent with existing Button component).
- SVG illustration: inline JSX, no external image files.

---

## File Structure

```
frontend/src/
  pages/
    login-page/
      index.tsx          ← LoginPage component
    signup-page/
      index.tsx          ← SignUpPage component
  components/
    ui/
      AuthIllustration.tsx   ← shared left-panel SVG illustration
```

`AuthIllustration` is a shared component used by both pages — single source of truth for the SVG + teal panel.

---

## Header Wiring

`Header.tsx`: Update the "Sign in" `<a href="#">` to `<Link to="/login">` using react-router-dom.

---

## Out of Scope

- Live Supabase OAuth (backend TBD)
- Forgot password page/flow
- Email verification flow
- Session persistence / protected routes
- Mobile hamburger menu on auth pages (no nav present)
