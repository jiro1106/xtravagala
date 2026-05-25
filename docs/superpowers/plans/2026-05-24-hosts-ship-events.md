# Plan B — Hosts Ship Events

**Goal:** Authenticated users can become hosts, create/edit/publish/delete their own events with cover photos, and view all of them on a dedicated host dashboard styled with a sidebar + topbar layout.

**Architecture:** New `/host/*` route subtree wrapped in `<RequireHost>`. Persistent `HostDashboardLayout` (sidebar + topbar) hosts an `<Outlet>` for dashboard, event editor, and profile pages. All data uses existing tables (`events`, `profiles`, storage buckets `event_covers` + `avatars`) — no schema changes needed. RLS already enforces ownership.

**Tech Stack:** React 18 + TS + Vite + Tailwind, Framer Motion, react-router-dom v6, Supabase JS client. No new deps.

**Reference UI:** Light tinted sidebar (teal-tinted), primary teal pills/CTAs, white cards with subtle borders, 4-KPI grid on top, main content + side column below. Adapted from user-supplied mockup.

---

## File map

**Create:**
- `frontend/src/components/auth/RequireAuth.tsx` — redirects unauthenticated users to `/login?next=`.
- `frontend/src/components/auth/RequireHost.tsx` — redirects to `/host/login` if signed-out, `/host/upgrade` if signed-in but `is_host=false`.
- `frontend/src/hooks/useMyEvents.ts` — host's own events, all statuses, with attendee counts.
- `frontend/src/pages/profile-page/index.tsx` — edit `full_name` + `avatar_url` (upload to `avatars/{uid}/`).
- `frontend/src/pages/host-upgrade-page/index.tsx` — collect `host_name` + `host_bio`, flip `is_host=true`.
- `frontend/src/pages/host-dashboard-page/HostDashboardLayout.tsx` — sidebar + topbar shell.
- `frontend/src/pages/host-dashboard-page/index.tsx` — KPI cards, event list table, quick actions.
- `frontend/src/pages/host-event-editor-page/index.tsx` — shared new/edit form with cover upload.
- `frontend/src/lib/slug.ts` — slug from title + 6-char random suffix.

**Modify:**
- `frontend/src/App.tsx` — add new routes.
- `frontend/src/components/layout/Header.tsx` — show "Host dashboard" link in the avatar dropdown when `profile.is_host`.

**No DB changes.** Schema, RLS, and storage buckets are already in place from `20260523000000_initial_schema.sql`.

---

## Task 1: Slug helper + RequireAuth/RequireHost guards

**Files:** Create `frontend/src/lib/slug.ts`, `frontend/src/components/auth/RequireAuth.tsx`, `frontend/src/components/auth/RequireHost.tsx`.

`slug.ts` derives a `[a-z0-9-]` slug from a title with a 6-char random alphanumeric suffix (matches `event_slug_format` check constraint).

Guards use `useAuth()` and `useLocation()`:
- `RequireAuth`: while loading, render null; if no user, `<Navigate to={`/login?next=${pathname}`} replace />`; else render children.
- `RequireHost`: while loading, render null; if no user, redirect to `/host/login?next=...`; if user but `!profile?.is_host`, redirect to `/host/upgrade`; else children.

## Task 2: useMyEvents hook

**File:** Create `frontend/src/hooks/useMyEvents.ts`.

Query: `events_with_counts` joined with city/category labels, filtered by `host_id=current user`, ordered by `start_at desc`. Returns `{ data: EventVM[], loading, error, refetch }`. Use the same view-model mapper `toEventVM` and join syntax as `useEvents`, but drop the `status='published'` filter. Skip query while `user` from `useAuth()` is null.

## Task 3: ProfilePage (/profile)

**File:** Create `frontend/src/pages/profile-page/index.tsx`. Wrapped in `<RequireAuth>` at the route level.

UI: simple centered card under the existing Header/Footer Layout. Fields: avatar preview, "Upload photo" button, `full_name` input. Save button updates `profiles` row via `supabase.from('profiles').update({...}).eq('id', user.id)`. Upload writes to `avatars/{uid}/avatar-{timestamp}.{ext}`, then sets `avatar_url = publicUrl`. After save, hard-refresh profile in `AuthContext` by re-fetching (use `window.location.reload()` as the cheapest signal — fast-path).

## Task 4: HostUpgradePage (/host/upgrade)

**File:** Create `frontend/src/pages/host-upgrade-page/index.tsx`. Wrapped in `<RequireAuth>` (not `<RequireHost>` — we're upgrading TO host).

If `profile.is_host` already, redirect to `/host/dashboard`. If `!profile.avatar_url`, show a notice with a "Set up profile first" link to `/profile` and disable the form.

Form: `host_name` (required), `host_bio` (textarea, optional, 280 max). Submit updates profile setting `is_host=true`, `host_name`, `host_bio`. The DB check constraint `host_requires_avatar_and_name` guards us if avatar is somehow null. On success, `window.location.assign('/host/dashboard')` to refresh profile state.

## Task 5: HostDashboardLayout (sidebar + topbar)

**File:** Create `frontend/src/pages/host-dashboard-page/HostDashboardLayout.tsx`.

Self-contained shell — does NOT use the marketing Header/Footer. Renders `<Outlet />` in the main area.

Layout (CSS grid `[sidebar 264px] 1fr`, full viewport height, sidebar collapses to 72px):
- **Sidebar** background: light teal tint, like `oklch(95% 0.02 170)` (we'll use `color-mix(in oklch, var(--primary) 8%, white)` inline). Logo + "Host workspace" label at top. Collapse pill. Nav items (icon + label) — "Dashboard", "My events", "New event", "My profile". Active item gets white pill background + primary text. At the bottom: avatar block + Sign out.
- **Topbar** sticky to top of main area, white bg, border-bottom. Contains a search input (filters events on the dashboard page via URL query param `?q=`), a primary "Create event" pill, the user's avatar.
- **Main scroll area** below topbar with padding for the page.

State for collapse persists in `localStorage` under `xg.hostSidebarCollapsed`.

## Task 6: HostDashboardPage (/host/dashboard)

**File:** Create `frontend/src/pages/host-dashboard-page/index.tsx`. Rendered as a child route inside `HostDashboardLayout`.

Sections (matching the reference layout):
1. **Page header** — eyebrow "HOST", h1 "Dashboard", subtitle "Your events at a glance."
2. **KPI row** — 4 cards: Total events, Published, Drafts, Total RSVPs (sum of attendees across events). Each card: label (uppercase 12px text-mute), big value, sublabel.
3. **Main grid** (2 columns at md+: ~2fr/1fr):
   - **Left "Events" card** — table of `useMyEvents()` rows. Columns: Title (with cover thumbnail), City · Category, Date, Status pill (draft = grey, published = primary), RSVPs (`attendees / capacity`), row-end actions menu (Edit → `/host/events/:id/edit`, Publish/Unpublish, Delete with confirm). Empty state: "No events yet — create your first" + button.
   - **Right column** stacks:
     - "Quick actions" card — bulleted list: Create event, Edit profile, View site as attendee (/).
     - "Profile" card — avatar + host name + bio preview, "Edit profile" link.

Filter the events list by URL `?q=` from the topbar (client-side `title.toLowerCase().includes`). Use the `LoadError` component and a simple skeleton row for loading.

## Task 7: HostEventEditorPage (/host/events/new and /:id/edit)

**File:** Create `frontend/src/pages/host-event-editor-page/index.tsx`. Single component handles both modes — distinguishes by presence of `:id` param.

Rendered inside `HostDashboardLayout` so the sidebar/topbar stay visible.

Form (single column, max 720px):
- **Cover image** uploader at top: big rounded rectangle, click to upload, previews after select. Stored to `event_covers/{eventId}/cover-{timestamp}.{ext}`. For **new** mode, upload must happen AFTER the event row is created (because policy uses event_id in the path). Strategy: create the event row first as draft on first submit, then redirect to edit mode where the upload becomes available. Alternatively: defer upload until after insert and do it in two steps within the same submit handler — pick the two-step submit to keep UX smooth.
- Title (required) → slug auto-derives + suffix on first save (read-only display).
- Description (textarea).
- City + Category (selects from `useCities()` / `useCategories()`).
- Venue, Address.
- Start (datetime-local, required), End (datetime-local, optional).
- Price PHP (number, optional → null means free), Capacity (number, optional).
- Save buttons: "Save as draft" (status='draft') and "Publish" (status='published', sets `published_at=now()`).
- Edit mode: also shows "Delete event" button at the bottom with confirm dialog → `delete().eq('id', id)`.

datetime-local <-> ISO conversion: treat the input as local (Asia/Manila) and convert to UTC ISO before insert by appending `:00+08:00`.

## Task 8: Routes + Header link

**Files:** Modify `frontend/src/App.tsx`, `frontend/src/components/layout/Header.tsx`.

App.tsx additions:
```tsx
<Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
<Route path="/host/upgrade" element={<RequireAuth><HostUpgradePage /></RequireAuth>} />
<Route element={<RequireHost><HostDashboardLayout /></RequireHost>}>
  <Route path="/host/dashboard" element={<HostDashboardPage />} />
  <Route path="/host/events/new" element={<HostEventEditorPage />} />
  <Route path="/host/events/:id/edit" element={<HostEventEditorPage />} />
</Route>
```

Note: `/profile` and `/host/upgrade` use the marketing `Layout` (Header/Footer) — wrap them inside the existing `<Route element={<Layout />}>` block.

Header.tsx: in the avatar dropdown, if `profile?.is_host` show "Host dashboard" (→ `/host/dashboard`); else show "Become a host" (→ `/host/upgrade`).

## Task 9: Build + smoke test

Run `npm run build` from `frontend/`. Fix any TS errors. No automated tests — fast-path mode.

---

## Out of scope (deferred)

- Per-event host display labels (single-host seed limitation — separate cleanup).
- Email template polish.
- Schedule (jsonb) editor on the event form — defaults to `[]`, leave empty.
- Admin views — use Supabase Studio.
- Rich text editor for descriptions — plain textarea is fine.
- Image cropping — accept whatever the user uploads.
