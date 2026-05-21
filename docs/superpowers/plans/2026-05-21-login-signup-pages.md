# Login & Sign-Up Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/login` and `/signup` standalone pages with a split-panel layout (teal illustration left, form right), wired into the router and linked from the Header.

**Architecture:** Both pages are standalone routes outside the main Layout (no Header/Footer). They share an `AuthIllustration` component for the left panel. The right panel form differs per page. Auth is UI-only — Supabase wiring is deferred.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Framer Motion, react-router-dom v7

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `frontend/src/components/ui/AuthIllustration.tsx` | Shared teal left panel + exports `EyeIcon` and `GoogleIcon` used by both auth forms |
| Create | `frontend/src/pages/login-page/index.tsx` | Full login page: AuthIllustration + form (Google, email, password, forgot, sign in, sign-up link) |
| Create | `frontend/src/pages/signup-page/index.tsx` | Full sign-up page: AuthIllustration + form (name, email, password, hint, create account, sign-in link) |
| Modify | `frontend/src/App.tsx` | Add `/login` and `/signup` routes outside the Layout wrapper |
| Modify | `frontend/src/components/layout/Header.tsx` | Change "Sign in" `<a>` to `<Link to="/login">` |

---

## Task 1: AuthIllustration — Shared Left Panel

**Files:**
- Create: `frontend/src/components/ui/AuthIllustration.tsx`

- [ ] **Step 1: Create the component**

`EyeIcon` and `GoogleIcon` are exported here so both `LoginPage` and `SignUpPage` import them from one place (DRY).

```tsx
// frontend/src/components/ui/AuthIllustration.tsx
export const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

export function AuthIllustration() {
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-center justify-end overflow-hidden pb-10 px-8
                 h-48 md:h-auto md:w-[55%]"
      style={{ background: 'var(--primary)' }}
    >
      {/* Blob decorations */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/[0.05]" />
      <div className="absolute top-[40%] -left-10 h-32 w-32 rounded-full bg-white/[0.04]" />

      {/* Dot grid — top right, desktop only */}
      <div className="absolute top-6 right-6 hidden grid-cols-5 gap-2 opacity-20 md:grid">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="block h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* SVG Illustration — desktop only */}
      <div className="relative z-10 mb-6 hidden w-full justify-center md:flex">
        <svg
          width="300"
          height="280"
          viewBox="0 0 300 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Event calendar card */}
          <rect x="70" y="60" width="100" height="112" rx="14" fill="white" fillOpacity="0.18" />
          <rect x="70" y="60" width="100" height="30" rx="14" fill="white" fillOpacity="0.28" />
          <rect x="70" y="74" width="100" height="16" fill="white" fillOpacity="0.28" />
          <rect x="82" y="68" width="30" height="6" rx="3" fill="white" fillOpacity="0.5" />
          <rect x="118" y="68" width="20" height="6" rx="3" fill="white" fillOpacity="0.3" />
          {/* Calendar date cells */}
          <rect x="83" y="104" width="14" height="14" rx="4" fill="white" fillOpacity="0.45" />
          <rect x="103" y="104" width="14" height="14" rx="4" fill="white" fillOpacity="0.3" />
          <rect x="123" y="104" width="14" height="14" rx="4" fill="white" fillOpacity="0.45" />
          <rect x="143" y="104" width="14" height="14" rx="4" fill="white" fillOpacity="0.2" />
          <rect x="83" y="124" width="14" height="14" rx="4" fill="white" fillOpacity="0.3" />
          {/* Highlighted date */}
          <rect x="103" y="124" width="14" height="14" rx="4" fill="white" fillOpacity="0.7" />
          <rect x="123" y="124" width="14" height="14" rx="4" fill="white" fillOpacity="0.3" />
          <rect x="143" y="124" width="14" height="14" rx="4" fill="white" fillOpacity="0.45" />

          {/* Ticket stub — rotated */}
          <g transform="rotate(-10 200 80)">
            <rect x="172" y="52" width="76" height="40" rx="9" fill="white" fillOpacity="0.2" />
            <circle cx="179" cy="72" r="6" fill="white" fillOpacity="0.4" />
            <rect x="190" y="65" width="46" height="6" rx="3" fill="white" fillOpacity="0.4" />
            <rect x="190" y="75" width="32" height="4" rx="2" fill="white" fillOpacity="0.25" />
            <line x1="246" y1="52" x2="246" y2="92" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>

          {/* Person A — left figure */}
          <circle cx="94" cy="196" r="14" fill="white" fillOpacity="0.28" />
          <path d="M72 238 Q94 218 116 238" stroke="white" strokeOpacity="0.28" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Arm reaching right */}
          <path d="M110 220 Q126 214 138 218" stroke="white" strokeOpacity="0.35" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Person B — right figure */}
          <circle cx="196" cy="192" r="14" fill="white" fillOpacity="0.28" />
          <path d="M174 234 Q196 214 218 234" stroke="white" strokeOpacity="0.28" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Arm reaching left */}
          <path d="M180 214 Q162 210 152 216" stroke="white" strokeOpacity="0.35" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Connection point between people */}
          <circle cx="145" cy="216" r="10" fill="white" fillOpacity="0.22" />
          <path d="M139 216 L151 216 M145 210 L145 222" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />

          {/* Map pin accent */}
          <g transform="translate(224, 136)">
            <circle cx="0" cy="-4" r="9" fill="white" fillOpacity="0.22" />
            <circle cx="0" cy="-4" r="4" fill="white" fillOpacity="0.4" />
            <path d="M0 5 L0 14" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Sparkle / dot accents */}
          <circle cx="58" cy="148" r="4" fill="white" fillOpacity="0.25" />
          <circle cx="248" cy="162" r="3" fill="white" fillOpacity="0.2" />
          <circle cx="42" cy="88" r="5" fill="white" fillOpacity="0.15" />
          <circle cx="262" cy="108" r="6" fill="white" fillOpacity="0.12" />
          <path d="M230 52 L230 60 M226 56 L234 56" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M55 170 L55 176 M52 173 L58 173" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Tagline */}
      <div className="relative z-10 text-center">
        <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-white">
          Find events worth<br />showing up for.
        </h2>
        <p className="mt-1.5 text-[13px] text-white/60">Across the Philippines</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors on the new file.

---

## Task 2: LoginPage

**Files:**
- Create: `frontend/src/pages/login-page/index.tsx`

- [ ] **Step 1: Create the login page**

```tsx
// frontend/src/pages/login-page/index.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthIllustration, EyeIcon, GoogleIcon } from '@/components/ui/AuthIllustration';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      {/* Right: Form panel */}
      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">

        {/* Logo / back to home */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
        >
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
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
            Welcome back
          </h1>
          <p className="mb-7 text-[13.5px] text-text-mute">
            Sign in to your account
          </p>

          {/* Google OAuth button */}
          <motion.button
            type="button"
            className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
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
            <label className="mb-1.5 block text-[12px] font-medium text-text-mute">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                         placeholder:text-text-mute/50 transition-colors duration-200
                         focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="mb-1.5 block text-[12px] font-medium text-text-mute">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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
            <a
              href="#"
              className="text-[12.5px] text-primary transition-opacity hover:opacity-75"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <Button variant="primary" className="w-full justify-center">
            Sign in
          </Button>

          {/* Sign-up link */}
          <p className="mt-5 text-center text-[13px] text-text-mute">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary transition-opacity hover:opacity-75"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors on the new file.

---

## Task 3: SignUpPage

**Files:**
- Create: `frontend/src/pages/signup-page/index.tsx`

- [ ] **Step 1: Create the sign-up page**

```tsx
// frontend/src/pages/signup-page/index.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthIllustration, EyeIcon, GoogleIcon } from '@/components/ui/AuthIllustration';
import { Button } from '@/components/ui/Button';

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      {/* Right: Form panel */}
      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">

        {/* Logo / back to home */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
        >
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
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
            Create your account
          </h1>
          <p className="mb-7 text-[13.5px] text-text-mute">
            Join XtravaGala today
          </p>

          {/* Google OAuth button */}
          <motion.button
            type="button"
            className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
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

          {/* Full name */}
          <div className="mb-3">
            <label className="mb-1.5 block text-[12px] font-medium text-text-mute">
              Full name
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                         placeholder:text-text-mute/50 transition-colors duration-200
                         focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="mb-1.5 block text-[12px] font-medium text-text-mute">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                         placeholder:text-text-mute/50 transition-colors duration-200
                         focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="mb-1">
            <label className="mb-1.5 block text-[12px] font-medium text-text-mute">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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
          <p className="mb-5 text-[11px] text-text-mute">
            Use 8 or more characters
          </p>

          {/* Submit */}
          <Button variant="primary" className="w-full justify-center">
            Create account
          </Button>

          {/* Sign-in link */}
          <p className="mt-5 text-center text-[13px] text-text-mute">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary transition-opacity hover:opacity-75"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors.

---

## Task 4: Wire Routes in App.tsx

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add `/login` and `/signup` routes outside the Layout**

Replace the entire file content:

```tsx
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/pages/landing-page';
import { LoginPage } from '@/pages/login-page';
import { SignUpPage } from '@/pages/signup-page';

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
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors.

---

## Task 5: Update Header Sign In Link

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Import Link and update the Sign in anchor**

Add the `Link` import at the top of the file:

```tsx
import { Link } from 'react-router-dom';
```

Then replace the "Sign in" `<a>` element (currently at the Actions section):

```tsx
// Before
<a
  href="#"
  style={{
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 4px',
    color: 'var(--text)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
  }}
>
  Sign in
</a>

// After
<Link
  to="/login"
  style={{
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 4px',
    color: 'var(--text)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
  }}
>
  Sign in
</Link>
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd frontend && npm run lint
```

Expected: no errors.

---

## Task 6: Full Verification

- [ ] **Step 1: Run TypeScript build check**

```bash
cd frontend && npm run build
```

Expected: exits with code 0, no TypeScript errors.

- [ ] **Step 2: Start dev server and verify all routes**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` and check:
- Landing page loads normally with Header/Footer
- "Sign in" link in the Header navigates to `http://localhost:5173/login`
- Login page shows: teal illustration left, form right, logo links back to `/`
- "Sign up" link on login page navigates to `http://localhost:5173/signup`
- Sign-up page shows same layout, different form (name field, "Create account" button)
- "Sign in" link on sign-up page navigates back to `/login`
- Password show/hide toggle works on both pages
- Google button has hover lift animation
- On narrow viewport (`< 768px`): illustration collapses to a short banner, form stacks below
