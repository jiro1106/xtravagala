# My Events Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give logged-in users a "My events" tab on `/profile` showing every event they RSVP'd to, split into Upcoming (with cancel action) and Past (auto-flagged Done, read-only).

**Architecture:** New data hook `useMyRsvps` queries the `rsvps` table joined to `events_with_counts` for the current user, splitting client-side by `start_at` vs `now()`. `ProfilePage` is refactored into a tab shell that reads `?tab=` from the URL and renders either `ProfileTab` (existing form, extracted) or `MyEventsTab` (new). Avatar dropdown gets a "My events" link.

**Tech Stack:** React 18 + TypeScript, react-router-dom v6, Supabase JS, Framer Motion, Tailwind CSS. No unit test framework is wired up in this repo; verification is by manual smoke test against the dev server (`npm run dev`) — Playwright is available but used only for e2e flows, not added to this plan.

**Spec:** `docs/superpowers/specs/2026-05-27-my-events-tab-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/hooks/useMyRsvps.ts` | Create | Fetch current user's RSVPs joined to events; split into `upcoming` / `past`; expose `cancelRsvp`. |
| `frontend/src/components/layout/Header.tsx` | Modify | Add "My events" item to avatar dropdown + mobile menu (auth-gated). |
| `frontend/src/pages/profile-page/index.tsx` | Modify | Convert into tab shell driven by `?tab=`. Renders `ProfileTab` or `MyEventsTab`. |
| `frontend/src/pages/profile-page/ProfileTab.tsx` | Create | Existing profile form moved here verbatim. |
| `frontend/src/pages/profile-page/MyEventsTab.tsx` | Create | Upcoming/Past sub-tab shell + lists + empty states. |
| `frontend/src/pages/profile-page/RsvpCard.tsx` | Create | Wraps `EventCard` adding a corner pill ("Going"/"Done") and (upcoming only) a Cancel RSVP button. |

---

### Task 1: Create `useMyRsvps` hook

**Files:**
- Create: `frontend/src/hooks/useMyRsvps.ts`

- [ ] **Step 1: Create the hook file**

Write `frontend/src/hooks/useMyRsvps.ts`:

```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toEventVM, type EventVM } from '@/types/api';

export function useMyRsvps() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<EventVM[]>([]);
  const [past, setPast] = useState<EventVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setUpcoming([]);
      setPast([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: rows, error: err } = await supabase
      .from('rsvps')
      .select(
        `event_id,
         event:events_with_counts!event_id (
           *,
           host:profiles!host_id(id, host_name, full_name, host_bio),
           city:cities!city_id(id, name),
           category:categories!category_id(id, label)
         )`,
      )
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const now = new Date();
    const upcomingList: EventVM[] = [];
    const pastList: EventVM[] = [];

    for (const row of rows ?? []) {
      const e = (row as any).event;
      if (!e) continue;
      const vm = toEventVM(e, e.host, e.city, e.category);
      if (vm.startAt.getTime() >= now.getTime()) upcomingList.push(vm);
      else pastList.push(vm);
    }

    upcomingList.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    pastList.sort((a, b) => b.startAt.getTime() - a.startAt.getTime());

    setUpcoming(upcomingList);
    setPast(pastList);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const cancelRsvp = useCallback(
    async (eventId: string) => {
      if (!user) return;
      // Optimistic: drop from upcoming immediately.
      setUpcoming((list) => list.filter((e) => e.id !== eventId));
      const { error: err } = await supabase
        .from('rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (err) {
        setError(err.message);
        // Refetch to restore truth if the delete failed.
        void refetch();
      }
    },
    [user, refetch],
  );

  return { upcoming, past, loading, error, refetch, cancelRsvp };
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors. If the Supabase nested-select join name (`events_with_counts!event_id`) errors, fall back to the explicit FK syntax used by `useMyEvents.ts` and re-verify.

- [ ] **Step 3: Commit (skip — user commits their own changes)**

Per project preference, do not run `git commit`. Pause here and let the user commit.

---

### Task 2: Add "My events" link to Header avatar dropdown

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Add the dropdown entry**

Find this block around line 219–225:

```tsx
                    <a
                      href="/profile"
                      style={{ display: 'block', padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)', textDecoration: 'none' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''; }}
                    >
                      My profile
                    </a>
```

Immediately after the closing `</a>` of "My profile", insert:

```tsx
                    <a
                      href="/profile?tab=events"
                      style={{ display: 'block', padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)', textDecoration: 'none', borderTop: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''; }}
                    >
                      My events
                    </a>
```

This places "My events" between "My profile" and the host link, matching the existing dropdown item style (10px 16px padding, 13.5px text, top border for separator).

- [ ] **Step 2: Add the mobile menu entry**

Find this block around line 352–371 — the `{!loading && user && (` group with the Sign out button. Replace the entire block:

```tsx
              {!loading && user && (
                <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); requestSignOut(); }}
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
```

With:

```tsx
              {!loading && user && (
                <>
                  <motion.a
                    variants={itemVariants}
                    href="/profile?tab=events"
                    onClick={() => setMenuOpen(false)}
                    style={{ padding: '12px 4px', fontSize: '16px', fontWeight: 500, color: 'var(--text)', textDecoration: 'none', textAlign: 'center', borderBottom: '1px solid var(--border)' }}
                  >
                    My events
                  </motion.a>
                  <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); requestSignOut(); }}
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
                </>
              )}
```

The mobile entry uses the same visual treatment as the `NAV_LINKS.map` items above it (12px 4px padding, 16px text, centered, border-bottom).

- [ ] **Step 3: Verify it type-checks**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit (skip — user commits their own changes)**

---

### Task 3: Extract `ProfileTab` from `ProfilePage`

**Files:**
- Create: `frontend/src/pages/profile-page/ProfileTab.tsx`
- Modify: `frontend/src/pages/profile-page/index.tsx`

This task is a pure refactor — moving the existing profile form into a new file with no behaviour change. Tab shell wiring happens in Task 4.

- [ ] **Step 1: Read the current `ProfilePage`**

Read `frontend/src/pages/profile-page/index.tsx` end-to-end to understand the full file. The file owns: form state (`fullName`, `avatarUrl`, `hydrated`, `uploading`, `saving`, `error`, `saved`), avatar upload, save handler, and rendered JSX.

- [ ] **Step 2: Create `ProfileTab.tsx`**

Create `frontend/src/pages/profile-page/ProfileTab.tsx` containing the **entire** body of the current `ProfilePage` component — same imports, same state, same handlers, same JSX. Export it as `ProfileTab`. Do not change any logic. Concretely:

```tsx
// frontend/src/pages/profile-page/ProfileTab.tsx
// (Copy the full current contents of ProfilePage's function body here,
// renamed to ProfileTab. Keep every import the current index.tsx uses.
// Do not modify state, handlers, or JSX in this step — refactor only.)
```

When copying:
- Rename the function from `ProfilePage` to `ProfileTab`.
- Keep `useLocation` + `insideHostShell` logic intact — `ProfileTab` will still need it for the host-shell vs. plain-profile branching that may exist in the original render.
- Export named: `export function ProfileTab() { ... }`.

- [ ] **Step 3: Replace `index.tsx` with a thin shell that renders `ProfileTab`**

Overwrite `frontend/src/pages/profile-page/index.tsx` with:

```tsx
import { ProfileTab } from './ProfileTab';

export function ProfilePage() {
  return <ProfileTab />;
}
```

This step keeps the app working with no behavioural change. The tab shell is added in Task 4.

- [ ] **Step 4: Verify the app still runs**

Run: `cd frontend && npm run dev`
Open `http://localhost:5173/profile` while logged in. Confirm the profile page renders exactly as before. Stop the dev server.

- [ ] **Step 5: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit (skip — user commits their own changes)**

---

### Task 4: Add tab shell to `ProfilePage`

**Files:**
- Modify: `frontend/src/pages/profile-page/index.tsx`

- [ ] **Step 1: Replace `index.tsx` with a tab shell**

Overwrite `frontend/src/pages/profile-page/index.tsx`:

```tsx
import { useLocation, useSearchParams } from 'react-router-dom';
import { ProfileTab } from './ProfileTab';
import { MyEventsTab } from './MyEventsTab';

type TabKey = 'profile' | 'events';

function parseTab(value: string | null): TabKey {
  return value === 'events' ? 'events' : 'profile';
}

export function ProfilePage() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const insideHostShell = pathname.startsWith('/host/');

  // Host shell variant: no tabs, original form only.
  if (insideHostShell) {
    return <ProfileTab />;
  }

  const activeTab = parseTab(searchParams.get('tab'));

  const selectTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'profile') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px clamp(22px, 4vw, 48px) 80px' }}>
      <div
        role="tablist"
        aria-label="Profile sections"
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--border)',
          marginBottom: 32,
        }}
      >
        <TabButton label="Profile" active={activeTab === 'profile'} onClick={() => selectTab('profile')} />
        <TabButton label="My events" active={activeTab === 'events'} onClick={() => selectTab('events')} />
      </div>

      {activeTab === 'profile' ? <ProfileTab /> : <MyEventsTab />}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '12px 16px',
        marginBottom: -1,
        fontSize: 14,
        fontWeight: 500,
        color: active ? 'var(--text)' : 'var(--text-mute)',
        borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
```

Notes:
- `useSearchParams` from react-router-dom v6 keeps tab state in `?tab=`.
- `replace: true` avoids polluting browser history with every tab click.
- The host-shell variant (`/host/profile`) skips tabs entirely per spec.
- Tab visual is a minimal underline-style bar in inline styles (no Tailwind needed), consistent with the codebase's mixed styling approach.
- The outer container picks up the page padding that the inner `ProfileTab` previously rendered itself with. If `ProfileTab` already has its own outer container padding, the result will look slightly wider; trim either container's padding to taste during the smoke test in Task 6.

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors. `MyEventsTab` will be missing — that's fine for now; Task 5 creates it. If `tsc` errors only on `./MyEventsTab` not existing, create a stub first:

```bash
cat > frontend/src/pages/profile-page/MyEventsTab.tsx << 'EOF'
export function MyEventsTab() {
  return <div>My events</div>;
}
EOF
```

Then re-run `tsc --noEmit`. Expected: No errors.

- [ ] **Step 3: Commit (skip — user commits their own changes)**

---

### Task 5: Build `RsvpCard` (status pill wrapper)

**Files:**
- Create: `frontend/src/pages/profile-page/RsvpCard.tsx`

- [ ] **Step 1: Create `RsvpCard.tsx`**

```tsx
// frontend/src/pages/profile-page/RsvpCard.tsx
import { EventCard } from '@/components/ui/EventCard';
import type { EventVM } from '@/types/api';

type Status = 'going' | 'done';

interface RsvpCardProps {
  event: EventVM;
  status: Status;
  onCancel?: () => void; // only used when status === 'going'
  delay?: number;
}

export function RsvpCard({ event, status, onCancel, delay }: RsvpCardProps) {
  const pillStyle =
    status === 'going'
      ? { background: 'var(--primary)', color: '#fff' }
      : { background: 'var(--muted)', color: 'var(--text-mute)' };
  const pillLabel = status === 'going' ? 'Going' : 'Done';

  return (
    <div style={{ position: 'relative' }}>
      <EventCard event={event} delay={delay} />

      {/* Status pill, overlayed on the card image corner */}
      <span
        aria-label={`Status: ${pillLabel}`}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          zIndex: 2,
          pointerEvents: 'none',
          ...pillStyle,
        }}
      >
        {pillLabel}
      </span>

      {/* Cancel control — only for upcoming */}
      {status === 'going' && onCancel && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text)',
            cursor: 'pointer',
            zIndex: 3,
          }}
        >
          Cancel RSVP
        </button>
      )}
    </div>
  );
}
```

Notes:
- The pill overlays the image corner; pointer-events disabled so clicks pass through to the card link.
- The Cancel button uses `preventDefault` + `stopPropagation` to avoid triggering the underlying `<Link>` navigation.

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit (skip — user commits their own changes)**

---

### Task 6: Build `MyEventsTab`

**Files:**
- Modify (or overwrite the stub from Task 4): `frontend/src/pages/profile-page/MyEventsTab.tsx`

- [ ] **Step 1: Write `MyEventsTab.tsx`**

```tsx
// frontend/src/pages/profile-page/MyEventsTab.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyRsvps } from '@/hooks/useMyRsvps';
import { RsvpCard } from './RsvpCard';
import type { EventVM } from '@/types/api';

type SubTab = 'upcoming' | 'past';

export function MyEventsTab() {
  const { upcoming, past, loading, error, cancelRsvp } = useMyRsvps();
  const [subTab, setSubTab] = useState<SubTab>('upcoming');

  return (
    <div>
      <div
        role="tablist"
        aria-label="RSVP timeline"
        style={{ display: 'flex', gap: 8, marginBottom: 24 }}
      >
        <SubTabButton
          label={`Upcoming${loading ? '' : ` (${upcoming.length})`}`}
          active={subTab === 'upcoming'}
          onClick={() => setSubTab('upcoming')}
        />
        <SubTabButton
          label={`Past${loading ? '' : ` (${past.length})`}`}
          active={subTab === 'past'}
          onClick={() => setSubTab('past')}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{ padding: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 13.5 }}
        >
          Couldn't load your RSVPs: {error}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : subTab === 'upcoming' ? (
        <UpcomingList events={upcoming} onCancel={cancelRsvp} />
      ) : (
        <PastList events={past} />
      )}
    </div>
  );
}

function SubTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: active ? 'var(--text)' : 'transparent',
        color: active ? '#fff' : 'var(--text)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function UpcomingList({ events, onCancel }: { events: EventVM[]; onCancel: (id: string) => void }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="You haven't RSVP'd to anything yet"
        body="Find something worth showing up for."
        ctaLabel="Browse events"
        ctaTo="/events"
      />
    );
  }
  return (
    <div style={gridStyle}>
      {events.map((e, i) => (
        <RsvpCard
          key={e.id}
          event={e}
          status="going"
          delay={i * 0.04}
          onCancel={() => onCancel(e.id)}
        />
      ))}
    </div>
  );
}

function PastList({ events }: { events: EventVM[] }) {
  if (events.length === 0) {
    return <EmptyState title="No past events yet" body="Events you've attended will show up here." />;
  }
  return (
    <div style={gridStyle}>
      {events.map((e, i) => (
        <RsvpCard key={e.id} event={e} status="done" delay={i * 0.04} />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  ctaLabel,
  ctaTo,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 22,
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: ctaLabel ? 18 : 0 }}>{body}</div>
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            borderRadius: 999,
            background: 'var(--primary)',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
      Loading your RSVPs…
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 20,
};
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit (skip — user commits their own changes)**

---

### Task 7: Smoke-test against acceptance criteria

**Files:** none — manual verification only.

- [ ] **Step 1: Start the dev server**

Run: `cd frontend && npm run dev`
Open `http://localhost:5173`.

- [ ] **Step 2: Verify avatar dropdown entry (criterion 1)**

Sign in. Click the avatar in the header. Confirm the dropdown shows **My profile → My events → Host dashboard/Become a host → Sign out** in that order. Click "My events". Confirm the URL becomes `/profile?tab=events`.

Open the mobile menu (resize to <768px or use devtools). Confirm "My events" appears under the main NAV_LINKS and above the Sign out button when signed in. Click it; same behaviour.

- [ ] **Step 3: Verify profile tab default (criterion 2)**

Visit `/profile` directly with no query string. Confirm the **Profile** tab is active and the existing form renders.

- [ ] **Step 4: Verify My events tab switch (criterion 3)**

Click the **My events** tab. URL updates to `/profile?tab=events`. Sub-tabs **Upcoming** and **Past** appear, defaulting to Upcoming.

- [ ] **Step 5: Verify Upcoming list (criterion 4)**

If your test account already has RSVPs to future events, confirm:
- Each event shows a **Going** pill (teal, top-left of the card image).
- Events are ordered soonest-first.
- A **Cancel RSVP** button sits in the top-right of each card.

If no RSVPs exist, create one: visit `/events`, open any future event, RSVP. Return to `/profile?tab=events` and confirm it appears.

- [ ] **Step 6: Verify cancel RSVP (criterion 5)**

Click **Cancel RSVP** on an event. Confirm:
- The card disappears from the list immediately (optimistic UI).
- Reloading the page confirms it's gone (i.e., the delete reached Supabase).
- Visiting that event's detail page shows the RSVP button in the un-RSVP'd state.

- [ ] **Step 7: Verify Past sub-tab (criterion 6)**

Click **Past**. If you have past RSVPs (events with `start_at < now()`), confirm:
- Each card shows a muted **Done** pill.
- Ordered most-recent first.
- No Cancel button on the cards.
- Clicking a card navigates to the event detail page.

If you have no past RSVPs to test with, seed one by updating an event's `start_at` to yesterday via Supabase Studio temporarily, RSVP'ing, and verifying. Revert the start_at afterwards.

- [ ] **Step 8: Verify host shell exemption (criterion 7)**

Sign in as a host. Visit `/host/profile`. Confirm the page shows the **original profile form with no tabs and no sub-tabs** — same as before this feature was built.

- [ ] **Step 9: Verify empty states (criterion 8)**

Sign in as a fresh account with zero RSVPs (or temporarily clear your RSVPs in Supabase Studio).
- Upcoming sub-tab: shows "You haven't RSVP'd to anything yet" + "Browse events" CTA linking to `/events`.
- Past sub-tab: shows "No past events yet."

- [ ] **Step 10: Stop the dev server and commit (skip — user commits)**

Stop dev server with Ctrl+C. Per project preference, do not run `git commit` — pause and let the user commit.

---

## Verification summary

After Task 7, all 8 acceptance criteria from the spec should be visually confirmed. If anything regresses or the join query in `useMyRsvps` fails at runtime, fall back to a two-step fetch: first `select('event_id').eq('user_id', user.id)`, then `select('*, host:..., city:..., category:...').in('id', eventIds)` against `events_with_counts`. This mirrors the proven pattern in `useMyEvents.ts` and avoids any nested-select FK ambiguity.
