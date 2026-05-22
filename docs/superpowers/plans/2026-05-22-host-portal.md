# Host Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Become a host" entry point in the header and HostSection, a `HostIllustration` component with a dark-teal dashboard panel, and a `/host/login` page that mirrors the existing login layout.

**Architecture:** Four independent file changes wired together by a single new route. `HostIllustration` is a new self-contained component that mirrors `AuthIllustration` in structure. `HostLoginPage` composes existing auth components (`Button`, `EyeIcon`, `GoogleIcon`) with `HostIllustration`. Header and HostSection each get one new button.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Framer Motion, React Router v6. No test runner configured — TypeScript build (`npm run build` from `frontend/`) is the verification step for every task.

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `frontend/src/components/ui/HostIllustration.tsx` | Dark-teal left panel with dashboard SVG + tagline |
| Create | `frontend/src/pages/host-login-page/index.tsx` | Host login page composing `HostIllustration` + form |
| Modify | `frontend/src/App.tsx` | Add `/host/login` route outside `<Layout>` |
| Modify | `frontend/src/components/layout/Header.tsx` | Add "Become a host" ghost button with 20px left margin gap |
| Modify | `frontend/src/pages/landing-page/HostSection.tsx` | Add animated "Become a host" CTA below fan cards |

---

## Task 1: HostIllustration component

**Files:**
- Create: `frontend/src/components/ui/HostIllustration.tsx`

- [ ] **Step 1: Create the file**

```tsx
// frontend/src/components/ui/HostIllustration.tsx
export function HostIllustration() {
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-center justify-center overflow-hidden py-12 px-8
                 h-48 md:h-auto md:w-[55%] bg-[oklch(26%_0.07_170)]"
    >
      {/* Blob decorations */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/[0.05]" />
      <div className="absolute top-[40%] -left-10 h-32 w-32 rounded-full bg-white/[0.04]" />

      {/* Dot grid — top right, desktop only */}
      <div className="absolute top-6 right-6 hidden grid-cols-5 gap-2 opacity-20 md:grid" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="block h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* SVG Illustration — desktop only */}
      <div className="relative z-10 mb-6 hidden w-full justify-center md:flex">
        <svg width="300" height="280" viewBox="0 0 300 280" fill="none">
          {/* Dashboard card */}
          <rect x="30" y="28" width="240" height="162" rx="16" fill="white" fillOpacity="0.10" />
          {/* Top bar */}
          <rect x="30" y="28" width="240" height="36" rx="16" fill="white" fillOpacity="0.14" />
          <rect x="30" y="50" width="240" height="14" fill="white" fillOpacity="0.14" />
          <rect x="48" y="40" width="52" height="8" rx="4" fill="white" fillOpacity="0.50" />
          {/* Live indicator */}
          <circle cx="244" cy="44" r="5" fill="white" fillOpacity="0.22" />
          <circle cx="244" cy="44" r="2.5" fill="white" fillOpacity="0.75" />
          <rect x="212" y="40" width="26" height="8" rx="4" fill="white" fillOpacity="0.30" />

          {/* Stat chips row */}
          <rect x="46" y="76" width="58" height="30" rx="8" fill="white" fillOpacity="0.13" />
          <rect x="50" y="81" width="22" height="6" rx="3" fill="white" fillOpacity="0.38" />
          <rect x="50" y="91" width="32" height="9" rx="4.5" fill="white" fillOpacity="0.55" />

          <rect x="116" y="76" width="58" height="30" rx="8" fill="white" fillOpacity="0.13" />
          <rect x="120" y="81" width="28" height="6" rx="3" fill="white" fillOpacity="0.38" />
          <rect x="120" y="91" width="22" height="9" rx="4.5" fill="white" fillOpacity="0.55" />

          <rect x="186" y="76" width="68" height="30" rx="8" fill="white" fillOpacity="0.13" />
          <rect x="190" y="81" width="30" height="6" rx="3" fill="white" fillOpacity="0.38" />
          <rect x="190" y="91" width="38" height="9" rx="4.5" fill="white" fillOpacity="0.55" />

          {/* Bar chart */}
          <rect x="48" y="158" width="16" height="18" rx="4" fill="white" fillOpacity="0.22" />
          <rect x="70" y="146" width="16" height="30" rx="4" fill="white" fillOpacity="0.30" />
          <rect x="92" y="134" width="16" height="42" rx="4" fill="white" fillOpacity="0.42" />
          <rect x="114" y="140" width="16" height="36" rx="4" fill="white" fillOpacity="0.35" />
          <rect x="136" y="124" width="16" height="52" rx="4" fill="white" fillOpacity="0.58" />
          <rect x="158" y="134" width="16" height="42" rx="4" fill="white" fillOpacity="0.42" />
          <rect x="180" y="128" width="16" height="48" rx="4" fill="white" fillOpacity="0.50" />
          {/* Chart baseline */}
          <line x1="40" y1="178" x2="260" y2="178" stroke="white" strokeOpacity="0.12" strokeWidth="1" />

          {/* Attendee avatar cluster — right of bar chart */}
          <circle cx="214" cy="150" r="11" fill="white" fillOpacity="0.20" />
          <circle cx="230" cy="150" r="11" fill="white" fillOpacity="0.17" />
          <circle cx="246" cy="150" r="11" fill="white" fillOpacity="0.22" />
          <rect x="208" y="164" width="46" height="6" rx="3" fill="white" fillOpacity="0.28" />

          {/* Floating ticket stub — top left, rotated */}
          <g transform="rotate(-8 80 20)">
            <rect x="46" y="6" width="68" height="34" rx="9" fill="white" fillOpacity="0.14" />
            <circle cx="54" cy="23" r="6" fill="white" fillOpacity="0.35" />
            <rect x="64" y="17" width="40" height="6" rx="3" fill="white" fillOpacity="0.38" />
            <rect x="64" y="27" width="28" height="4" rx="2" fill="white" fillOpacity="0.22" />
            <line x1="106" y1="6" x2="106" y2="40" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>

          {/* Sparkle accents */}
          <circle cx="22" cy="110" r="4" fill="white" fillOpacity="0.20" />
          <circle cx="278" cy="130" r="3" fill="white" fillOpacity="0.17" />
          <path d="M268 50 L268 58 M264 54 L272 54" stroke="white" strokeOpacity="0.28" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 160 L22 166 M19 163 L25 163" stroke="white" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="268" cy="200" r="5" fill="white" fillOpacity="0.14" />
        </svg>
      </div>

      {/* Tagline */}
      <div className="relative z-10 text-center">
        <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-white">
          Every event, fully<br />in control.
        </h2>
        <p className="mt-1.5 text-[13px] text-white/60">The host platform for the Philippines</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd frontend && npm run build
```

Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/HostIllustration.tsx
git commit -m "feat: add HostIllustration component with dark-teal dashboard panel"
```

---

## Task 2: HostLoginPage + route

**Files:**
- Create: `frontend/src/pages/host-login-page/index.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create the host login page**

```tsx
// frontend/src/pages/host-login-page/index.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HostIllustration } from '@/components/ui/HostIllustration';
import { EyeIcon, GoogleIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';

export function HostLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <HostIllustration />

      {/* Right: Form panel */}
      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">

        {/* Logo / back to home */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span
            className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] bg-primary text-[13px] font-bold text-white"
            style={{ boxShadow: '0 2px 8px -2px oklch(55% 0.09 170 / 0.5)' }}
          >
            X
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-text">
            XtravaGala
          </span>
        </Link>

        {/* Form */}
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {/* Host portal badge */}
          <span className="mb-3 inline-block w-fit rounded-full bg-[oklch(26%_0.07_170)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[oklch(26%_0.07_170)]">
            Host portal
          </span>

          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
            Welcome back, host
          </h1>
          <p className="mb-7 text-[13.5px] text-text-mute">
            Sign in to your host account
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
            {/* Google OAuth button */}
            <motion.button
              type="button"
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.36, 1] }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            {/* Divider */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-text-mute">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="host-email" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Email
              </label>
              <input
                id="host-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                           placeholder:text-text-mute/50 transition-colors duration-200
                           focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label htmlFor="host-password" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Password
              </label>
              <div className="relative">
                <input
                  id="host-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text
                             placeholder:text-text-mute/50 transition-colors duration-200
                             focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute transition-colors hover:text-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="mb-5 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[12.5px] text-primary transition-opacity hover:opacity-75"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" className="w-full justify-center">
              Sign in to host portal
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the route to App.tsx**

Open `frontend/src/App.tsx`. Add the import after the existing page imports:

```tsx
import { HostLoginPage } from "@/pages/host-login-page";
```

Then add the route after the `/signup` route (outside the `<Layout>` wrapper):

```tsx
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignUpPage />} />
<Route path="/host/login" element={<HostLoginPage />} />
```

The full `App.tsx` after the change:

```tsx
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { SignUpPage } from "@/pages/signup-page";
import { HostLoginPage } from "@/pages/host-login-page";
import { EventsPage } from "@/pages/events-page";
import { DestinationsPage } from "@/pages/destinations-page";
import { EventDetailPage } from "@/pages/event-page";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/host/login" element={<HostLoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd frontend && npm run build
```

Expected: `✓ built` with no TypeScript errors. Navigate to `http://localhost:5173/host/login` in dev mode to confirm the page renders with the dark-teal left panel and form on the right.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/host-login-page/index.tsx frontend/src/App.tsx
git commit -m "feat: add HostLoginPage at /host/login with dark-teal illustration panel"
```

---

## Task 3: Header "Become a host" button

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Update the actions group**

Replace the `{/* Actions */}` block in `frontend/src/components/layout/Header.tsx`:

```tsx
{/* Actions */}
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <Button variant="ghost" size="sm" to="/login">
    Sign in
  </Button>
  <Button variant="primary" size="sm" to="/signup" showArrow>
    Sign up
  </Button>
  <div className="hidden md:block" style={{ marginLeft: "20px" }}>
    <Button variant="ghost" size="sm" to="/host/login">
      Become a host
    </Button>
  </div>
</div>
```

The `hidden md:block` wrapper hides "Become a host" on mobile (screen width below the `md` breakpoint, 768px) while the Sign in / Sign up buttons remain visible. The `20px` left margin creates the visual gap that signals a different audience.

- [ ] **Step 2: Verify build passes**

```bash
cd frontend && npm run build
```

Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 3: Manual check at multiple widths**

Run `npm run dev` and verify:
- At 1280px: three action items visible — Sign in, Sign up, (gap) Become a host
- At 767px: only Sign in and Sign up visible; Become a host hidden
- Logo and center nav do not reflow or overflow at any width

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat: add Become a host button to header with mobile-responsive visibility"
```

---

## Task 4: HostSection CTA button

**Files:**
- Modify: `frontend/src/pages/landing-page/HostSection.tsx`

- [ ] **Step 1: Add Button import and CTA after the fan cards**

Open `frontend/src/pages/landing-page/HostSection.tsx`. Add the `Button` import at the top:

```tsx
import { motion } from "framer-motion";
import { HostCard } from "@/components/ui/HostCard";
import { hostFeatures } from "@/data/hostFeatures";
import { Button } from "@/components/ui/Button";
```

Then add the animated CTA after the closing `</>` of the host-fan fragment, still inside `<div className="wrap">`:

```tsx
        {/* Host cards fan */}
        <>
          <style>{`
            .host-fan {
              display: flex;
              justify-content: center;
              align-items: flex-end;
              padding: 40px 0 80px;
              position: relative;
            }
            @media (max-width: 1100px) {
              .host-fan {
                flex-wrap: wrap;
                gap: 18px;
                padding-bottom: 40px;
              }
            }
          `}</style>
          <motion.div
            className="host-fan"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          >
            {hostFeatures.map((feature, i) => (
              <HostCard
                key={feature.id}
                feature={feature}
                rotation={fanConfig[i].rotation}
                zIndex={fanConfig[i].zIndex}
                marginRight={fanConfig[i].marginRight}
              />
            ))}
          </motion.div>
        </>

        {/* Host CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          className="flex justify-center pb-4"
        >
          <Button variant="primary" to="/host/login" showArrow>
            Become a host
          </Button>
        </motion.div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd frontend && npm run build
```

Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 3: Manual check**

Run `npm run dev`, scroll to the HostSection on the landing page, and verify:
- "Become a host →" teal button appears centered below the fan cards
- Button animates in on scroll (fade up)
- Clicking routes to `/host/login`
- At 375px mobile width: button is full-width-friendly (the Button component uses `inline-flex` so it wraps naturally), centered

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/landing-page/HostSection.tsx
git commit -m "feat: add Become a host CTA to HostSection linking to /host/login"
```

---

## Self-Review

**Spec coverage:**
- ✅ Header "Become a host" ghost button, 20px gap, links to `/host/login`, hidden on mobile — Task 3
- ✅ HostSection CTA "Become a host →", teal primary, animated, links to `/host/login` — Task 4
- ✅ `/host/login` route outside Layout wrapper — Task 2
- ✅ `HostIllustration` — dark teal `oklch(26% 0.07 170)`, dashboard SVG, same blob/dot-grid structure as `AuthIllustration` — Task 1
- ✅ `HostLoginPage` — split-panel, mirrors LoginPage, "Host portal" badge, "Welcome back, host", "Sign in to host portal", no cross-link — Task 2
- ✅ Mobile-responsive: illustration collapses to `h-48` banner on mobile via `h-48 md:h-auto`, "Become a host" header button hidden on mobile via `hidden md:block` — Tasks 1, 3
- ✅ Tailwind-first styling throughout — all tasks
- ✅ No backend: all forms use `onSubmit={(e) => e.preventDefault()}` — Task 2

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" references. All code blocks are complete.

**Type consistency:** `HostIllustration` exported as named export in Task 1, imported as `{ HostIllustration }` in Task 2. `HostLoginPage` exported as named export in Task 2, imported as `{ HostLoginPage }` in Task 2's App.tsx step. `Button` import added in Task 4 matches existing named export in `@/components/ui/Button`.
