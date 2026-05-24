# Auth Wiring Design

**Date:** 2026-05-23
**Status:** Approved

## Goal

Connect the existing `/login`, `/signup`, and `/host/login` forms to Supabase Auth (email/password + Google OAuth), add session persistence via React Context, update the Header to reflect the logged-in state, and build the forgot-password / reset-password flow.

## Scope

- Wire email/password and Google OAuth on `/login`, `/signup`, `/host/login`
- `AuthContext` + `useAuth` hook for app-wide session state
- Header: show avatar + dropdown when logged in; "Sign in"/"Sign up" when logged out
- Forgot password page (`/forgot-password`)
- Reset password page (`/auth/reset-password`)
- Auth callback page (`/auth/callback`) — landing target for OAuth and email confirmation
- `?next=` redirect param so users land back where they started after login

**Out of scope:** Protected routes (no dashboard exists yet), onboarding flow, profile editing.

## Architecture

**State management: React Context**

`AuthContext` wraps the entire app (in `main.tsx`). It subscribes to `supabase.auth.onAuthStateChange` and re-renders all consumers when the session changes. No new dependencies.

```ts
interface AuthContextValue {
  user: User | null      // Supabase Auth user object
  profile: Profile | null // public.profiles row (fetched once per session)
  loading: boolean       // true during initial getSession() call
  signOut: () => Promise<void>
}
```

**Session persistence:** Supabase JS client stores the session in `localStorage` and auto-refreshes tokens. No extra code needed. The provider calls `supabase.auth.getSession()` once on mount to hydrate, then `onAuthStateChange` keeps it live.

## Files

| Action | Path |
|---|---|
| Create | `src/context/AuthContext.tsx` |
| Create | `src/hooks/useAuth.ts` |
| Create | `src/pages/forgot-password-page/index.tsx` |
| Create | `src/pages/reset-password-page/index.tsx` |
| Create | `src/pages/auth-callback-page/index.tsx` |
| Modify | `src/pages/login-page/index.tsx` |
| Modify | `src/pages/signup-page/index.tsx` |
| Modify | `src/pages/host-login-page/index.tsx` |
| Modify | `src/components/layout/Header.tsx` |
| Modify | `src/App.tsx` |
| Modify | `src/main.tsx` |

## Auth Flows

### Login (`/login`)

- **Email/password:** `supabase.auth.signInWithPassword({ email, password })` → navigate to `?next=` or `/`
- **Google:** `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })` → browser redirects to Google → returns to `/auth/callback`
- **Already logged in:** redirect to `/` immediately on mount
- **Error display:** inline error message above submit button, clears when user starts typing

### Sign-up (`/signup`)

- **Google:** same OAuth flow as login
- **Email/password:** `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
  - If Supabase email confirmation is **enabled**: show "Check your email to confirm your account" message (no redirect)
  - If email confirmation is **disabled**: navigate to `?next=` or `/`
- The `handle_new_user` DB trigger automatically creates the `profiles` row on signup
- **Errors:** "Email already in use", "Password must be at least 6 characters"

### Host login (`/host/login`)

- Same email/password + Google flow as `/login`
- On success: always navigate to `/host/dashboard` (shows 404 until dashboard is built — intentional)

### Forgot password (`/forgot-password`)

- Email input form
- Submit: `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth/reset-password' })`
- After submit: replace form with a success message ("If that email is registered, you'll receive a reset link")
- Do not reveal whether the email exists

### Reset password (`/auth/reset-password`)

- Supabase redirects here from the password reset email with `?code=...` in the URL
- Call `supabase.auth.exchangeCodeForSession(code)` on mount to establish the recovery session
- Show new password input
- Submit: `supabase.auth.updateUser({ password: newPassword })`
- On success: navigate to `/login`
- On error (expired link, etc.): show error and a link back to `/forgot-password`

### Auth callback (`/auth/callback`)

- Landing target for Google OAuth and email confirmation links
- On mount: `supabase.auth.exchangeCodeForSession(searchParams.get('code'))` (PKCE flow)
- On success: navigate to `?next=` or `/`
- Shows a loading spinner while processing; shows error message if exchange fails

## Header Behaviour

**Logged out (current):**
```
[Sign in]  [Sign up →]  |  [Become a host]
```

**During initial load (`loading=true`):**
- Render nothing in place of auth buttons — prevents flash of wrong state

**Logged in:**
```
[● First Last ▾]  |  [Become a host]
```
- Avatar: circular `<img>` if `profile.avatar_url` exists; otherwise initials on a teal `oklch(55% 0.09 170)` background
- Clicking avatar opens a dropdown with: "My profile" (link, placeholder — page not built yet) + "Sign out" (calls `signOut()`)
- Mobile menu: shows "Sign out" in place of "Sign in" / "Sign up" items

## Error Display Pattern

Consistent across all auth forms — shown above the submit button:

```tsx
{error && (
  <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
    {error}
  </p>
)}
```

Errors clear when the user modifies any input field.

## Loading / Disabled States

- Submit button shows a spinner + disabled state while any async call is in flight
- Google button is also disabled during loading (prevents double-submit)
- Button text examples: "Signing in…", "Creating account…", "Sending reset link…"

## Supabase Configuration Requirements

- Google OAuth provider enabled in Studio → Authentication → Providers (already done)
- Callback URL `https://<your-domain>/auth/callback` added to Google Cloud Console's allowed redirect URIs
- For local dev: `http://localhost:5173/auth/callback` must also be in the Google Console list and in Supabase → Authentication → URL Configuration → Redirect URLs

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| State management | React Context | Zero new deps, idiomatic Supabase + React pattern |
| Post-login redirect | `?next=` param | Users land back where they started |
| Host login destination | `/host/dashboard` | Keeps host/attendee flows visually separate |
| Profile fetch | Once per session in AuthProvider | Avoids per-component fetches; cached in context |
| Forgot password reveal | No (generic success msg) | Prevent user enumeration |
