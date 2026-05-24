# Auth Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing `/login`, `/signup`, and `/host/login` forms to Supabase Auth, add session persistence via React Context, update the Header to reflect login state, and build the forgot-password / reset-password / auth-callback pages.

**Architecture:** `AuthContext` + `AuthProvider` wrap the entire app in `main.tsx`, subscribing to `supabase.auth.onAuthStateChange` so every consumer re-renders on session change. The `useAuth()` hook exposes `{ user, profile, loading, signOut }` to any component. The `profile` row from `public.profiles` is fetched once per session and cached in context.

**Tech Stack:** React 18, TypeScript, `@supabase/supabase-js`, react-router-dom v6, Framer Motion, Tailwind CSS v3

**Constraint:** Do NOT run `git commit` — present the commit command to the user at the end of each task and wait.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `frontend/src/context/AuthContext.tsx` | AuthProvider, AuthContext, exported types |
| Create | `frontend/src/hooks/useAuth.ts` | Thin hook wrapping `useContext(AuthContext)` |
| Modify | `frontend/src/main.tsx` | Wrap `<App>` with `<AuthProvider>` |
| Modify | `frontend/src/App.tsx` | Add 3 new routes; add imports |
| Modify | `frontend/src/components/ui/Button.tsx` | Add `disabled` prop |
| Create | `frontend/src/pages/auth-callback-page/index.tsx` | OAuth + email-confirm landing, PKCE exchange |
| Modify | `frontend/src/pages/login-page/index.tsx` | Wire email/password + Google OAuth |
| Modify | `frontend/src/pages/signup-page/index.tsx` | Wire email/password + Google OAuth |
| Modify | `frontend/src/pages/host-login-page/index.tsx` | Wire email/password + Google OAuth, redirect → /host/dashboard |
| Modify | `frontend/src/components/layout/Header.tsx` | Show avatar+dropdown when logged in, nothing during load |
| Create | `frontend/src/pages/forgot-password-page/index.tsx` | Email form → resetPasswordForEmail |
| Create | `frontend/src/pages/reset-password-page/index.tsx` | New password form → updateUser |

---

## Task 1: AuthContext + useAuth hook

**Files:**
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/hooks/useAuth.ts`

**Context:** The entire auth wiring depends on this. `AuthProvider` subscribes to `supabase.auth.onAuthStateChange` and fetches the user's `profiles` row once per session. Everything else (`login-page`, `Header`, etc.) calls `useAuth()` to read session state.

`Tables<'profiles'>` is from `frontend/src/types/db.ts` (generated). The `profiles` table has: `id`, `full_name`, `avatar_url`, `is_host`, `is_admin`, `host_name`, `host_bio`, `created_at`, `updated_at`.

- [ ] **Step 1: Create `frontend/src/context/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/db';

type Profile = Tables<'profiles'>;

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) void fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 2: Create `frontend/src/hooks/useAuth.ts`**

```ts
import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npm run build 2>&1 | head -30
```

Expected: no errors. If you see "Cannot find module '@/context/AuthContext'", check that `tsconfig.json` has `"@/*": ["./src/*"]` in `paths`.

- [ ] **Step 4: Present commit command to user**

```bash
git add frontend/src/context/AuthContext.tsx frontend/src/hooks/useAuth.ts
git commit -m "feat(auth): add AuthContext provider and useAuth hook"
```

---

## Task 2: Wire AuthProvider into app + add routes + fix Button disabled

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/ui/Button.tsx`

**Context:** `AuthProvider` must wrap `<App>` so all routes (including the router) have access to auth context. The 3 new routes (`/auth/callback`, `/forgot-password`, `/auth/reset-password`) are added here — pages will be stubbed first, real implementations come in later tasks.

The `Button` component (`frontend/src/components/ui/Button.tsx`) currently accepts `onClick`, `type`, `variant`, `size`, `href`, `to`, `showArrow`, `children`, `className` — but no `disabled`. All auth form submit buttons need it.

- [ ] **Step 1: Add `disabled` prop to `frontend/src/components/ui/Button.tsx`**

Current interface (lines 4–14):
```tsx
interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'on-dark';
  size?: 'default' | 'sm' | 'xs';
  href?: string;
  to?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

Replace with:
```tsx
interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'on-dark';
  size?: 'default' | 'sm' | 'xs';
  href?: string;
  to?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}
```

Update the destructure (line 35–45):
```tsx
export function Button({
  variant = 'primary',
  size = 'default',
  href,
  to,
  showArrow = false,
  children,
  className = '',
  onClick,
  type,
  disabled = false,
}: ButtonProps) {
```

Update the `hoverAnimation` expression (currently after the `sizes` object) — skip hover when disabled:
```tsx
const hoverAnimation =
  disabled
    ? {}
    : variant === 'primary'
    ? { y: -1, filter: 'brightness(1.1)' }
    : variant === 'ghost'
    ? { y: -1 }
    : {};
```

Update the `motion.button` render (currently lines 107–116) — add `disabled` and visual feedback:
```tsx
return (
  <motion.button
    type={type ?? 'button'}
    className={`${combinedClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    whileHover={hoverAnimation}
    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    onClick={onClick}
    disabled={disabled}
  >
    {content}
  </motion.button>
);
```

- [ ] **Step 2: Wrap `<App>` with `<AuthProvider>` in `frontend/src/main.tsx`**

Replace the entire file:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

- [ ] **Step 3: Present commit command to user**

```bash
git add frontend/src/main.tsx frontend/src/components/ui/Button.tsx
git commit -m "feat(auth): wire AuthProvider into app, add disabled prop to Button"
```

---

## Task 3: Auth callback page

**Files:**
- Create: `frontend/src/pages/auth-callback-page/index.tsx`

**Context:** This page is the redirect target for Google OAuth (PKCE flow) and email confirmation links. Supabase appends `?code=<code>` to the URL. The page calls `exchangeCodeForSession(code)` which completes the login. On success it navigates to `?next=` or `/`. The `?next=` param is forwarded from the Google OAuth initiator (see Task 4).

- [ ] **Step 1: Create `frontend/src/pages/auth-callback-page/index.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (!code) {
      navigate(next, { replace: true });
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(error.message);
      } else {
        navigate(next, { replace: true });
      }
    });
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="mb-4 text-[14px] text-text-mute">{error}</p>
          <a href="/login" className="text-[14px] font-medium text-primary transition-opacity hover:opacity-75">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles for this file**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep auth-callback
```

Expected: no output (no errors for this file).

- [ ] **Step 3: Add `/auth/callback` route to `frontend/src/App.tsx`**

Add import after the existing page imports:
```tsx
import { AuthCallbackPage } from '@/pages/auth-callback-page';
```

Add route inside `<Routes>` but outside the Layout `<Route>` (before the closing `</Routes>`):
```tsx
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

- [ ] **Step 4: Present commit command to user**

```bash
git add frontend/src/pages/auth-callback-page/index.tsx frontend/src/App.tsx
git commit -m "feat(auth): add auth callback page for OAuth and email confirmation"
```

---

## Task 4: Wire login page

**Files:**
- Modify: `frontend/src/pages/login-page/index.tsx`

**Context:** The existing file has the full UI but `onSubmit` just calls `e.preventDefault()`. The Google button is a `<motion.button>` that does nothing. After wiring:
- Email/password calls `supabase.auth.signInWithPassword` → navigate to `?next=` or `/`
- Google calls `supabase.auth.signInWithOAuth` → browser redirect (no navigate needed, browser handles it)
- Already-logged-in users are redirected to `?next=` or `/` immediately
- Errors display inline above the submit button
- Submit button is disabled + shows "Signing in…" during the request

- [ ] **Step 1: Replace `frontend/src/pages/login-page/index.tsx` with the wired version**

```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { EyeIcon, GoogleIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, navigate, next]);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(next, { replace: true });
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // Browser redirects — no further action needed here
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span
            className="text-[17px] uppercase text-primary"
            style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}
          >
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Welcome back</h1>
          <p className="mb-7 text-[13.5px] text-text-mute">Sign in to your account</p>

          <form onSubmit={handleEmailSignIn} className="flex flex-col">
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={loading ? {} : { y: -1 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.36, 1] }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-text-mute">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-text-mute">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-text-mute">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
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

            <div className="mb-5 flex justify-end">
              <Link to="/forgot-password" className="text-[12.5px] text-primary transition-opacity hover:opacity-75">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-text-mute">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary transition-opacity hover:opacity-75">
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-auto pt-6 text-center text-[12.5px] text-text-mute">
          Are you a host?{' '}
          <Link to="/host/login" className="font-medium text-primary transition-opacity hover:opacity-75">
            Sign in to host portal
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep login-page
```

Expected: no output.

- [ ] **Step 3: Start dev server and verify login works**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173/login`. Test:
1. Enter wrong credentials → error message appears below the divider
2. Modify email → error clears
3. Submit empty form → browser native validation fires (required fields)
4. Submit valid credentials (use `admin@xtravagala.com`) → redirects to `/`
5. Visit `/login` while logged in → redirects to `/` immediately
6. Click "Continue with Google" → browser redirects to Google OAuth

- [ ] **Step 4: Present commit command to user**

```bash
git add frontend/src/pages/login-page/index.tsx
git commit -m "feat(auth): wire login page — email/password + Google OAuth"
```

---

## Task 5: Wire signup page

**Files:**
- Modify: `frontend/src/pages/signup-page/index.tsx`

**Context:** `signUp` passes `full_name` via `options.data` — the `handle_new_user` DB trigger reads `raw_user_meta_data->>'full_name'` to create the `profiles` row. After signup: if a session is returned (email confirmation disabled), redirect to `?next=` or `/`. If no session (confirmation enabled), show "Check your email" message. Already-logged-in users redirect immediately.

- [ ] **Step 1: Replace `frontend/src/pages/signup-page/index.tsx` with the wired version**

```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { EyeIcon, GoogleIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function SignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, navigate, next]);

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      navigate(next, { replace: true });
    } else {
      setCheckEmail(true);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  if (checkEmail) {
    return (
      <div className="flex h-screen overflow-hidden flex-col md:flex-row">
        <AuthIllustration />
        <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
            <span className="text-[17px] uppercase text-primary" style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}>
              Xtravagala
            </span>
          </Link>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
            <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Check your email</h1>
            <p className="text-[13.5px] text-text-mute">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <Link to="/login" className="mt-6 text-[13px] font-medium text-primary transition-opacity hover:opacity-75">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span className="text-[17px] uppercase text-primary" style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}>
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Create your account</h1>
          <p className="mb-7 text-[13.5px] text-text-mute">Join XtravaGala today</p>

          <form onSubmit={handleEmailSignUp} className="flex flex-col">
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={loading ? {} : { y: -1 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.36, 1] }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-text-mute">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="mb-1.5 block text-[12px] font-medium text-text-mute">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-text-mute">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mb-1">
              <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-text-mute">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
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
            <p className="mb-5 text-[11px] text-text-mute">Use 6 or more characters</p>

            {error && (
              <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-text-mute">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary transition-opacity hover:opacity-75">Sign in</Link>
          </p>
        </div>

        <p className="mt-auto pt-6 text-center text-[12.5px] text-text-mute">
          Are you a host?{' '}
          <Link to="/host/login" className="font-medium text-primary transition-opacity hover:opacity-75">Sign in to host portal</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep signup-page
```

Expected: no output.

- [ ] **Step 3: Test signup in browser**

Open `http://localhost:5173/signup`. Test:
1. Submit with short password (< 6 chars) → native validation fires
2. Submit with a new email → either redirects to `/` (confirmation off) or shows "Check your email" screen
3. Submit with an email already in use → error message appears
4. Click "Continue with Google" → browser redirects to Google

- [ ] **Step 4: Present commit command to user**

```bash
git add frontend/src/pages/signup-page/index.tsx
git commit -m "feat(auth): wire signup page — email/password + Google OAuth"
```

---

## Task 6: Wire host login page

**Files:**
- Modify: `frontend/src/pages/host-login-page/index.tsx`

**Context:** Same auth flow as the login page — same Supabase Auth, same email/password + Google. The only difference: on success, always navigate to `/host/dashboard` (intentionally 404 until dashboard is built). No `?next=` redirect.

- [ ] **Step 1: Replace `frontend/src/pages/host-login-page/index.tsx` with the wired version**

```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HostIllustration } from '@/components/ui/HostIllustration';
import { EyeIcon, GoogleIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function HostLoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/host/dashboard', { replace: true });
  }, [user, navigate]);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/host/dashboard', { replace: true });
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/host/dashboard')}`,
      },
    });
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <HostIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span className="text-[17px] uppercase text-primary" style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}>
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <span className="mb-3 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Host portal
          </span>

          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Welcome back, host</h1>
          <p className="mb-7 text-[13.5px] text-text-mute">Sign in to your host account</p>

          <form onSubmit={handleEmailSignIn} className="flex flex-col">
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={loading ? {} : { y: -1 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.36, 1] }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-text-mute">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="mb-3">
              <label htmlFor="host-email" className="mb-1.5 block text-[12px] font-medium text-text-mute">Email</label>
              <input
                id="host-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="host-password" className="mb-1.5 block text-[12px] font-medium text-text-mute">Password</label>
              <div className="relative">
                <input
                  id="host-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
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

            <div className="mb-5 flex justify-end">
              <Link to="/forgot-password" className="text-[12.5px] text-primary transition-opacity hover:opacity-75">Forgot password?</Link>
            </div>

            {error && (
              <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to host portal'}
            </Button>
          </form>
        </div>

        <p className="mt-auto pt-6 text-center text-[12.5px] text-text-mute">
          Not a host?{' '}
          <Link to="/login" className="font-medium text-primary transition-opacity hover:opacity-75">Sign in as attendee</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep host-login
```

Expected: no output.

- [ ] **Step 3: Present commit command to user**

```bash
git add frontend/src/pages/host-login-page/index.tsx
git commit -m "feat(auth): wire host login page — email/password + Google OAuth"
```

---

## Task 7: Update Header — user-aware auth state

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

**Context:** The Header currently always shows "Sign in" + "Sign up" buttons. After this task:
- `loading=true` → render nothing in place of auth buttons (prevents flash on page load)
- `user=null` → show current "Sign in" + "Sign up" buttons
- `user` set → show avatar (image or initials) + a dropdown with "My profile" link + "Sign out" button

The avatar dropdown uses a `useRef` + click-outside `useEffect` pattern. The `useAuth` hook provides `{ user, profile, loading, signOut }`. The `profile.full_name` drives the initials. The `profile.avatar_url` drives the avatar image.

Mobile menu: replaces "Sign in" and "Sign up" items with a "Sign out" button when logged in.

- [ ] **Step 1: Replace `frontend/src/components/layout/Header.tsx` with the user-aware version**

```tsx
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/types/db';

type Profile = Tables<'profiles'>;

const NAV_LINKS = [
  { label: 'Find Events', href: '/#discover' },
  { label: 'Cities', href: '/#destinations' },
  { label: 'For Hosts', href: '/#experience' },
];

const EASE = [0.23, 1, 0.32, 1] as const;

const menuVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.22, ease: EASE, when: 'afterChildren', staggerChildren: 0.04, staggerDirection: -1 },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE, when: 'beforeChildren', staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants = {
  closed: { opacity: 0, y: -8 },
  open: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
};

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function UserAvatar({ profile }: { profile: Profile | null }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.full_name}
        style={{ height: '30px', width: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const initials = profile ? getInitials(profile.full_name) : '?';
  return (
    <div
      style={{
        height: '30px',
        width: '30px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function Header() {
  const { user, profile, loading, signOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close user dropdown on click outside
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const displayName = profile?.full_name ?? user?.email ?? '';

  return (
    <header
      ref={headerRef}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? '0 4px 16px -10px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <div
        className="flex items-center justify-between md:grid md:[grid-template-columns:1fr_auto_1fr]"
        style={{ padding: '10px clamp(20px, 4vw, 48px)', width: '100%' }}
      >
        {/* Brand */}
        <a
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: 'var(--text)' }}
        >
          <img src="/icon.png" alt="XtravaGala" style={{ height: '32px', width: 'auto', flexShrink: 0, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em', fontSize: '17px', textTransform: 'uppercase', color: 'var(--primary)' }}>
            Xtravagala
          </span>
        </a>

        {/* Primary nav — hidden on mobile */}
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '2px' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '14.5px', fontWeight: 500, color: 'var(--text)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions — desktop only */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          {!loading && !user && (
            <>
              <Button variant="ghost" size="sm" to="/login">Sign in</Button>
              <Button variant="primary" size="sm" to="/signup" showArrow>Sign up</Button>
            </>
          )}

          {!loading && user && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  borderRadius: '100px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                <UserAvatar profile={profile} />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      minWidth: '160px',
                      backgroundColor: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      boxShadow: '0 8px 24px -8px rgba(0,0,0,0.14)',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}
                  >
                    <a
                      href="/profile"
                      style={{ display: 'block', padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)', textDecoration: 'none' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''; }}
                    >
                      My profile
                    </a>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); void signOut(); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13.5px',
                        color: 'var(--text)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderTop: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
            <Button variant="ghost" size="sm" to="/host/login">Become a host</Button>
          </div>
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="flex md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <motion.path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" animate={menuOpen ? { d: 'M5 5L19 19' } : { d: 'M3 7L21 7' }} transition={{ duration: 0.3, ease: EASE }} />
            <motion.line x1="3" x2="21" y1="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.2, ease: EASE }} />
            <motion.path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" animate={menuOpen ? { d: 'M5 19L19 5' } : { d: 'M3 17L21 17' }} transition={{ duration: 0.3, ease: EASE }} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 'var(--header-h) 0 0 0', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 90 }}
            />
            <motion.nav
              className="md:hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 95,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 12px 28px -16px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px clamp(20px, 4vw, 48px) 20px',
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  variants={itemVariants}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ padding: '12px 4px', fontSize: '16px', fontWeight: 500, color: 'var(--text)', textDecoration: 'none', textAlign: 'center', borderBottom: '1px solid var(--border)' }}
                >
                  {link.label}
                </motion.a>
              ))}

              {!loading && !user && (
                <>
                  <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '16px' }}>
                    <Button variant="ghost" size="default" to="/login" className="w-full justify-center">Sign in</Button>
                  </motion.div>
                  <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '10px' }}>
                    <Button variant="primary" size="default" to="/signup" showArrow className="w-full justify-center">Sign up</Button>
                  </motion.div>
                </>
              )}

              {!loading && user && (
                <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); void signOut(); }}
                    style={{
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'var(--text)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '100px',
                      cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </button>
                </motion.div>
              )}

              <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '10px' }}>
                <Button variant="ghost" size="default" to="/host/login" className="w-full justify-center">Become a host</Button>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep Header
```

Expected: no output.

- [ ] **Step 3: Test Header in browser**

Start dev server (`npm run dev`). Test:
1. Load any page while logged out → "Sign in" + "Sign up" buttons visible
2. Log in via `/login` → Header shows avatar with initials + display name
3. Click avatar → dropdown opens with "My profile" and "Sign out"
4. Click "Sign out" → Header reverts to "Sign in" + "Sign up"
5. Refresh page while logged in → Header shows logged-in state immediately (no flash)
6. On mobile (resize to < 768px): mobile menu shows "Sign out" when logged in

- [ ] **Step 4: Present commit command to user**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat(auth): update Header — avatar + dropdown when logged in"
```

---

## Task 8: Forgot password page

**Files:**
- Create: `frontend/src/pages/forgot-password-page/index.tsx`

**Context:** Simple split-panel page (same layout as login/signup). Calls `resetPasswordForEmail` with a `redirectTo` pointing to `/auth/reset-password`. After submit, replaces the form with a success message regardless of whether the email exists (prevents user enumeration).

- [ ] **Step 1: Create `frontend/src/pages/forgot-password-page/index.tsx`**

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span className="text-[17px] uppercase text-primary" style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}>
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {submitted ? (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Check your email</h1>
              <p className="text-[13.5px] text-text-mute">
                If that email is registered, you'll receive a reset link shortly.
              </p>
              <Link
                to="/login"
                className="mt-6 text-[13px] font-medium text-primary transition-opacity hover:opacity-75"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Forgot password?</h1>
              <p className="mb-7 text-[13.5px] text-text-mute">
                Enter your email and we'll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col">
                {error && (
                  <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
                )}

                <div className="mb-5">
                  <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-text-mute">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <p className="mt-5 text-center text-[13px] text-text-mute">
                <Link to="/login" className="font-medium text-primary transition-opacity hover:opacity-75">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep forgot-password
```

Expected: no output.

- [ ] **Step 3: Test in browser**

Open `http://localhost:5173/forgot-password`. Test:
1. Submit a registered email → form replaced with "Check your email" message
2. Submit an unregistered email → same "Check your email" message (no leak)
3. Check your email inbox for the reset link

- [ ] **Step 4: Add `/forgot-password` route to `frontend/src/App.tsx`**

Add import after the existing page imports:
```tsx
import { ForgotPasswordPage } from '@/pages/forgot-password-page';
```

Add route inside `<Routes>` outside the Layout `<Route>`:
```tsx
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
```

- [ ] **Step 5: Present commit command to user**

```bash
git add frontend/src/pages/forgot-password-page/index.tsx frontend/src/App.tsx
git commit -m "feat(auth): add forgot password page"
```

---

## Task 9: Reset password page

**Files:**
- Create: `frontend/src/pages/reset-password-page/index.tsx`

**Context:** Supabase sends the user here from the password reset email with `?code=<code>` in the URL. On mount, `exchangeCodeForSession(code)` establishes a recovery session. The user then enters a new password, which calls `updateUser({ password })`. On success, navigate to `/login`. On error (expired link), show error and a link back to `/forgot-password`.

- [ ] **Step 1: Create `frontend/src/pages/reset-password-page/index.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { EyeIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [exchanging, setExchanging] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Invalid or expired reset link.');
      setExchanging(false);
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError(error.message);
      setExchanging(false);
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span className="text-[17px] uppercase text-primary" style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}>
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {exchanging ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : error && !password ? (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Link expired</h1>
              <p className="mb-5 text-[13.5px] text-text-mute">{error}</p>
              <Link to="/forgot-password" className="text-[13px] font-medium text-primary transition-opacity hover:opacity-75">
                Request a new reset link
              </Link>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Set new password</h1>
              <p className="mb-7 text-[13.5px] text-text-mute">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} className="flex flex-col">
                {error && (
                  <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
                )}

                <div className="mb-5">
                  <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-text-mute">New password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
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
                  <p className="mt-1 text-[11px] text-text-mute">Use 6 or more characters</p>
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
                  {loading ? 'Saving…' : 'Set new password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Test in browser**

Open `http://localhost:5173/forgot-password`, submit your email, click the reset link in your inbox → lands on `/auth/reset-password`. Test:
1. Spinner shows briefly while the code is exchanged
2. "Set new password" form appears
3. Enter a new password → submits → redirects to `/login`
4. Log in with the new password to confirm it worked

Test expired link (if you have one): should show "Link expired" + link back to forgot-password.

- [ ] **Step 3: Add `/auth/reset-password` route to `frontend/src/App.tsx`**

Add import after the existing page imports:
```tsx
import { ResetPasswordPage } from '@/pages/reset-password-page';
```

Add route inside `<Routes>` outside the Layout `<Route>`:
```tsx
<Route path="/auth/reset-password" element={<ResetPasswordPage />} />
```

- [ ] **Step 4: Verify full TypeScript build passes**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs` with no errors. All 12 files from the file map are now in place.

- [ ] **Step 5: Present commit command to user**

```bash
git add frontend/src/pages/reset-password-page/index.tsx frontend/src/App.tsx
git commit -m "feat(auth): add reset password page"
```

---

## Task 10: End-to-end smoke test

**Files:** No new files. This task verifies the complete auth flow works together.

**Context:** All tasks are complete. This is a systematic browser walkthrough of every flow defined in the spec.

- [ ] **Step 1: Start dev server**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Full build passes**

```bash
cd frontend && npm run build
```

Expected: `✓ built in X.XXs` with zero TypeScript or bundle errors.

- [ ] **Step 3: Test every flow in order**

**Email sign-up (new user):**
1. Open `http://localhost:5173/signup`
2. Fill in name + email + password → submit
3. If confirmation on: "Check your email" screen appears → check inbox → confirm → come back and log in
4. If confirmation off: redirects to `/` → Header shows avatar with initials

**Email sign-in:**
1. Open `http://localhost:5173/login`
2. Sign in with existing credentials → redirects to `/`
3. Header shows avatar + name
4. Click avatar → dropdown opens → click "Sign out" → Header reverts to "Sign in"/"Sign up"

**Google OAuth:**
1. Click "Continue with Google" on `/login`
2. Complete Google flow → lands on `/auth/callback` (spinner) → redirects to `/`
3. Header shows avatar (Google profile photo) and display name

**?next= redirect:**
1. While logged out, navigate to `http://localhost:5173/login?next=/events`
2. Sign in → redirects to `/events` (not home)

**Forgot password:**
1. `/forgot-password` → submit email → "Check your email" message
2. Click reset link in inbox → `/auth/reset-password` shows spinner then form
3. Enter new password → redirect to `/login`
4. Log in with new password → succeeds

**Already-logged-in redirect:**
1. While logged in, visit `/login` → immediately redirects to `/`

**Host login:**
1. `/host/login` → sign in with valid credentials → redirects to `/host/dashboard` (404 expected)

- [ ] **Step 4: Final commit commands to present to user**

All code was committed task by task. No additional commit needed here unless any fixes were made during smoke testing.

If fixes were needed, present:
```bash
git add <fixed files>
git commit -m "fix(auth): <describe what was fixed>"
```
