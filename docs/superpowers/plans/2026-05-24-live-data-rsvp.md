# Live Data + RSVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the React app read events/cities/categories from Supabase (after seeding the existing static data into the DB), and let signed-in users RSVP to events from the event detail page.

**Architecture:** Plain `useState` + `useEffect` data hooks under `src/hooks/`. Each hook returns `{ data, loading, error, refetch }` and produces an `EventVM`/`CityVM`/`CategoryVM` view-model that's near-drop-in compatible with the existing static `Event` interface — so component churn is minimal. A one-shot Node script (`frontend/scripts/seed-events.ts`) signs up fake host accounts via the anon key and inserts events while signed in as each host, satisfying the `events_insert_host_self` RLS policy. RSVP toggle on the event detail page is optimistic, with capacity guard.

**Tech Stack:** React 18, TypeScript, `@supabase/supabase-js`, react-router-dom v6, Framer Motion, Tailwind CSS v3. Adds `tsx` + `dotenv` as devDependencies for the seed script.

**Constraint:** Do NOT run `git commit` — present the commit command to the user at the end of each task and wait. Do NOT run `git add` either.

**Reference spec:** `docs/superpowers/specs/2026-05-24-live-data-rsvp-design.md`.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `frontend/scripts/seed-events.ts` | One-shot seeder — signs up fake hosts, inserts events from `src/data/events.ts` |
| Modify | `frontend/package.json` | Adds `tsx`, `dotenv` devDeps and `seed:events` script |
| Create | `frontend/src/types/api.ts` | Exports `EventVM`, `CityVM`, `CategoryVM` types + `toEventVM` / `toCityVM` / `toCategoryVM` mappers |
| Create | `frontend/src/hooks/useCities.ts` | List cities (from `cities_with_counts` view) |
| Create | `frontend/src/hooks/useCategories.ts` | List categories ordered by `sort_order` |
| Create | `frontend/src/hooks/useEvents.ts` | List events with `{ city?, category?, q? }` filters from `events_with_counts` view |
| Create | `frontend/src/hooks/useEventDetail.ts` | Single event by id (uuid) + host profile join |
| Create | `frontend/src/hooks/useRsvp.ts` | `{ rsvped, count, loading, toggle, error }` for an event |
| Create | `frontend/src/components/ui/EventCardSkeleton.tsx` | Pulse skeleton matching `EventCard` outer shape |
| Create | `frontend/src/components/ui/LoadError.tsx` | Tiny inline banner with retry button |
| Modify | `frontend/src/components/ui/EventCard.tsx` | Swap `import type { Event }` to `import type { EventVM }`; no logic change |
| Modify | `frontend/src/components/ui/SearchBar.tsx` | Read cities from `useCities()` instead of static |
| Modify | `frontend/src/pages/landing-page/HeroSection.tsx` | Read categories from `useCategories()` |
| Modify | `frontend/src/pages/landing-page/EventsSection.tsx` | Read events from `useEvents()` |
| Modify | `frontend/src/pages/landing-page/DestinationsSection.tsx` | Read cities from `useCities()` |
| Modify | `frontend/src/pages/events-page/index.tsx` | Read events from `useEvents()`, keep client-side filters |
| Modify | `frontend/src/pages/destinations-page/index.tsx` | Read cities from `useCities()` |
| Modify | `frontend/src/pages/event-page/index.tsx` | Read from `useEventDetail()`; replace placeholder "Sign in to register" with `RsvpButton` |
| Untouched | `frontend/src/data/*` | Files stay on disk; no consumer imports them after this plan |

---

## Task 1: Shared view-model types + mappers

**Files:**
- Create: `frontend/src/types/api.ts`

**Context:** Every hook and consumer needs a unified row shape. Hooks query Supabase, then map to these view-models. The shape mirrors the existing `Event` interface in `src/data/events.ts` so consumers like `EventCard` change only their `import type` line.

The existing helpers in `frontend/src/lib/time.ts` are:
- `formatEventDateTime(d: Date): string` — produces strings like `"Sun, May 17 · 2:00 PM PHT"`
- `formatPrice(amountPhp: number): string` — `"Free"` if 0, else `"₱<n>"`

Both already used elsewhere. Import them.

- [ ] **Step 1: Create `frontend/src/types/api.ts`**

```ts
import type { Tables } from '@/types/db';
import { formatEventDateTime, formatPrice } from '@/lib/time';

type EventRow = Tables<'events_with_counts'>;
type ProfileRow = Tables<'profiles'>;
type CityRow = Tables<'cities_with_counts'>;
type CategoryRow = Tables<'categories'>;

export interface EventVM {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image: string;
  cityId: string;
  categoryId: string;
  cityName: string;
  categoryLabel: string;
  host: string;
  hostId: string;
  hostBio: string | null;
  startAt: Date;
  date: string;
  pricePhp: number;
  price: string;
  capacity: number | null;
  attendees: number;
  isFull: boolean;
  venue: string | null;
  address: string | null;
  schedule: Array<{ time: string; label: string }>;
  // legacy aliases consumed by existing components
  city: string;
  category: string;
}

export interface CityVM {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
  eventCount: number;
}

export interface CategoryVM {
  id: string;
  label: string;
  svgContent: string;
  sortOrder: number;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80';

export function toEventVM(
  row: EventRow,
  host: Pick<ProfileRow, 'id' | 'host_name' | 'full_name' | 'host_bio'>,
  city: Pick<CityRow, 'id' | 'name'>,
  category: Pick<CategoryRow, 'id' | 'label'>,
): EventVM {
  const startAt = new Date(row.start_at);
  const pricePhp = Number(row.price_php ?? 0);
  const attendees = Number(row.attendee_count ?? 0);
  const capacity = row.capacity ?? null;
  const schedule = Array.isArray(row.schedule)
    ? (row.schedule as Array<{ time: string; label: string }>)
    : [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    image: row.cover_image_url ?? PLACEHOLDER_IMAGE,
    cityId: row.city_id,
    categoryId: row.category_id,
    cityName: city.name,
    categoryLabel: category.label,
    host: host.host_name ?? host.full_name,
    hostId: host.id,
    hostBio: host.host_bio,
    startAt,
    date: formatEventDateTime(startAt),
    pricePhp,
    price: formatPrice(pricePhp),
    capacity,
    attendees,
    isFull: capacity !== null && attendees >= capacity,
    venue: row.venue,
    address: row.address,
    schedule,
    city: row.city_id,
    category: row.category_id,
  };
}

export function toCityVM(row: CityRow): CityVM {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    eventCount: Number(row.event_count ?? 0),
  };
}

export function toCategoryVM(row: CategoryRow): CategoryVM {
  return {
    id: row.id,
    label: row.label,
    svgContent: row.svg_content,
    sortOrder: row.sort_order,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs` with no TS errors. If `formatEventDateTime`/`formatPrice` aren't exported from `lib/time.ts`, open it and check the actual exported names; adjust imports.

- [ ] **Step 3: Present commit command to user**

```bash
git add frontend/src/types/api.ts
git commit -m "feat(types): add EventVM/CityVM/CategoryVM view-model types and mappers"
```

---

## Task 2: Seed script — install deps and write the script

**Files:**
- Modify: `frontend/package.json` (add `tsx`, `dotenv` to devDependencies + `seed:events` script)
- Create: `frontend/scripts/seed-events.ts`

**Context:** Reuses the static `src/data/events.ts`. For each unique `event.host` string the script signs up a fake auth user, promotes them to host, then inserts their events while signed in as that user — satisfying the `events_insert_host_self` RLS policy.

The `events` table requires `slug` (unique, regex `^[a-z0-9][a-z0-9\-]{1,98}[a-z0-9]$`). The script derives a slug from the title and appends a short random suffix to dodge collisions across reruns. `on conflict (slug) do nothing` makes inserts idempotent.

Static date strings look like `"Sun, May 17 · 2:00 PM PHT"`. Parser uses regex; year defaults to 2026.

- [ ] **Step 1: Install dev dependencies**

```bash
cd frontend && npm install -D tsx dotenv
```

Expected: `tsx` and `dotenv` appear under `devDependencies` in `package.json`.

- [ ] **Step 2: Add seed script to `frontend/package.json`**

Find the `"scripts"` object and add the seed entry:

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "seed:events": "tsx scripts/seed-events.ts"
  }
}
```

- [ ] **Step 3: Create `frontend/scripts/seed-events.ts`**

```ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { events as staticEvents } from '../src/data/events';
import type { Database } from '../src/types/db';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env.local');
  process.exit(1);
}

const SEED_PASSWORD = 'REDACTED_SEED_CREDENTIAL';
const DEFAULT_YEAR = 2026;

const MONTH_INDEX: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

function rand6(): string {
  return Math.random().toString(36).slice(2, 8);
}

function parsePeso(p: string): number {
  if (p === 'Free') return 0;
  const n = parseInt(p.replace(/[₱,\s]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function parseEventDate(dateStr: string): string | null {
  // matches e.g. "Sun, May 17 · 2:00 PM PHT" (the middle dot can be · or -)
  const m = dateStr.match(/^[A-Za-z]+,\s*([A-Za-z]+)\s+(\d+)\s*[·\-]\s*(\d+):(\d+)\s*(AM|PM)/);
  if (!m) return null;
  const [, monthName, dayStr, hourStr, minStr, ampm] = m;
  const month = MONTH_INDEX[monthName.toLowerCase()];
  if (month === undefined) return null;
  let hour = parseInt(hourStr, 10);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  // PHT is UTC+8; to get UTC we subtract 8 hours
  const utcMs = Date.UTC(
    DEFAULT_YEAR,
    month,
    parseInt(dayStr, 10),
    hour - 8,
    parseInt(minStr, 10),
  );
  return new Date(utcMs).toISOString();
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signInOrSignUp(host: string): Promise<string> {
  const email = `seed-${slugify(host)}@xtravagala.dev`;

  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: SEED_PASSWORD,
  });
  if (!signInErr && signIn.user) return signIn.user.id;

  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email,
    password: SEED_PASSWORD,
    options: { data: { full_name: host } },
  });
  if (signUpErr || !signUp.user) {
    throw new Error(`Could not sign in or sign up seed host "${host}": ${signUpErr?.message ?? 'no user returned'}`);
  }
  // signUp doesn't always return a session when email confirmation is enabled;
  // sign in explicitly so subsequent inserts run as this user.
  const { error: secondSignIn } = await supabase.auth.signInWithPassword({
    email,
    password: SEED_PASSWORD,
  });
  if (secondSignIn) {
    throw new Error(
      `Signed up "${host}" but couldn't sign in. If Supabase email confirmation is on, disable it in Studio → Auth → Providers → Email for the duration of seeding, then re-run. (${secondSignIn.message})`,
    );
  }
  return signUp.user.id;
}

async function promoteToHost(host: string): Promise<void> {
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(host)}`;
  const { error } = await supabase
    .from('profiles')
    .update({
      is_host: true,
      host_name: host,
      host_bio: 'Seeded host — placeholder bio.',
      avatar_url: avatarUrl,
      full_name: host,
    })
    .eq('host_name', host); // host_name may already be set on rerun; covers both cases
  // The first run inserts a profile via trigger, host_name is null — fall back to auth.uid().
  if (error) throw new Error(`Profile promote failed for "${host}": ${error.message}`);

  // Re-update by auth.uid() in case the host_name match above hit zero rows on first run
  const { data: who } = await supabase.auth.getUser();
  if (who.user) {
    await supabase
      .from('profiles')
      .update({
        is_host: true,
        host_name: host,
        host_bio: 'Seeded host — placeholder bio.',
        avatar_url: avatarUrl,
        full_name: host,
      })
      .eq('id', who.user.id);
  }
}

async function insertEvents(hostId: string, eventsForHost: typeof staticEvents): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  for (const ev of eventsForHost) {
    const startIso = parseEventDate(ev.date);
    if (!startIso) {
      console.warn(`  ! could not parse date "${ev.date}" for event "${ev.title}" — skipping`);
      skipped++;
      continue;
    }
    const slug = `${slugify(ev.title)}-${rand6()}`;
    const { error } = await supabase.from('events').insert({
      host_id: hostId,
      slug,
      title: ev.title,
      description: ev.description ?? null,
      cover_image_url: ev.image,
      category_id: ev.category,
      city_id: ev.city,
      venue: ev.venue ?? null,
      address: ev.address ?? null,
      start_at: startIso,
      price_php: parsePeso(ev.price),
      capacity: null,
      schedule: ev.schedule ?? [],
      status: 'published',
      published_at: new Date().toISOString(),
    });
    if (error) {
      // On unique-conflict (slug) we treat as skip
      if (error.code === '23505') {
        skipped++;
      } else {
        console.error(`  ! insert failed for "${ev.title}": ${error.message}`);
        skipped++;
      }
    } else {
      inserted++;
    }
  }
  return { inserted, skipped };
}

async function main() {
  console.log(`Seeding ${staticEvents.length} events…`);

  // Group by host
  const byHost = new Map<string, typeof staticEvents>();
  for (const ev of staticEvents) {
    const list = byHost.get(ev.host) ?? [];
    list.push(ev);
    byHost.set(ev.host, list);
  }

  let totalInserted = 0;
  let totalSkipped = 0;
  for (const [host, eventsForHost] of byHost) {
    console.log(`\n→ Host: ${host} (${eventsForHost.length} events)`);
    try {
      const hostId = await signInOrSignUp(host);
      await promoteToHost(host);
      const { inserted, skipped } = await insertEvents(hostId, eventsForHost);
      console.log(`  ✓ ${inserted} inserted, ${skipped} skipped`);
      totalInserted += inserted;
      totalSkipped += skipped;
    } catch (err) {
      console.error(`  ✗ ${(err as Error).message}`);
    } finally {
      await supabase.auth.signOut();
    }
  }

  console.log(`\nDone — ${totalInserted} inserted, ${totalSkipped} skipped/duplicate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Type-check the script**

```bash
cd frontend && npx tsc --noEmit -p . 2>&1 | grep -E "scripts/seed-events" || echo "OK"
```

Expected: `OK`. If TS complains about the script not being in `include`, add `"scripts/**/*.ts"` to the `include` array in `frontend/tsconfig.app.json`.

- [ ] **Step 5: Run the seeder (one-time)**

```bash
cd frontend && npm run seed:events
```

Expected output: lines like `→ Host: Little Japan in Manila (1 events)` then `✓ 1 inserted, 0 skipped`, ending with `Done — N inserted, 0 skipped/duplicate.` on a clean run.

If Supabase email confirmation is on, the script will error after sign-up with a clear message. Disable confirmation temporarily in Studio → Authentication → Providers → Email (turn off "Confirm email"), re-run, then re-enable. The seed users never need to be real.

- [ ] **Step 6: Verify in Studio**

Open https://supabase.com/dashboard → project → Table Editor → `events`. You should see one row per static event, all with `status='published'`. In the `profiles` table, you'll see new rows where `is_host=true` and `host_name` matches the source data.

- [ ] **Step 7: Present commit command to user**

```bash
git add frontend/scripts/seed-events.ts frontend/package.json frontend/package-lock.json
git commit -m "chore(seed): one-shot seeder for static events via fake host accounts"
```

(Do NOT commit `frontend/.env.local`.)

---

## Task 3: `useCities` + `useCategories` + `useEvents` hooks

**Files:**
- Create: `frontend/src/hooks/useCities.ts`
- Create: `frontend/src/hooks/useCategories.ts`
- Create: `frontend/src/hooks/useEvents.ts`

**Context:** Three simple list hooks. All read from public views — RLS allows `anon` SELECT for cities, categories, and `events_with_counts` where `status='published'`. Each hook returns `{ data, loading, error, refetch }`. Filters on `useEvents` apply: `city`/`category` server-side via `.eq()`, free-text `q` client-side.

- [ ] **Step 1: Create `frontend/src/hooks/useCities.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toCityVM, type CityVM } from '@/types/api';

export function useCities() {
  const [data, setData] = useState<CityVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('cities_with_counts')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setData((rows ?? []).map(toCityVM));
    setLoading(false);
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 2: Create `frontend/src/hooks/useCategories.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toCategoryVM, type CategoryVM } from '@/types/api';

export function useCategories() {
  const [data, setData] = useState<CategoryVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: rows, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setData((rows ?? []).map(toCategoryVM));
    setLoading(false);
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 3: Create `frontend/src/hooks/useEvents.ts`**

```ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toEventVM, type EventVM } from '@/types/api';

export interface EventFilters {
  city?: string;
  category?: string;
  q?: string;
}

export function useEvents(filters: EventFilters = {}) {
  const [data, setData] = useState<EventVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable dep key so filter object identity doesn't cause refetch storms
  const key = useMemo(
    () => JSON.stringify({ city: filters.city ?? '', category: filters.category ?? '' }),
    [filters.city, filters.category],
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from('events_with_counts')
      .select('*, host:profiles!host_id(id, host_name, full_name, host_bio), city:cities!city_id(id, name), category:categories!category_id(id, label)')
      .eq('status', 'published')
      .order('start_at', { ascending: true });
    if (filters.city) query = query.eq('city_id', filters.city);
    if (filters.category) query = query.eq('category_id', filters.category);

    const { data: rows, error: err } = await query;
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    let vms = (rows ?? []).map((row: any) =>
      toEventVM(row, row.host, row.city, row.category),
    );

    if (filters.q) {
      const needle = filters.q.toLowerCase();
      vms = vms.filter(
        (e) => e.title.toLowerCase().includes(needle) || e.host.toLowerCase().includes(needle),
      );
    }
    setData(vms);
    setLoading(false);
    // key is intentionally read here so the lint rule is satisfied; also guards against stale closures
    void key;
  }, [filters.city, filters.category, filters.q, key]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs` with no errors. If the join syntax (`profiles!host_id(...)`) errors at runtime later, fall back to fetching the view alone and doing a second query for host/city/category — but for now the build should pass either way since it's runtime behavior.

- [ ] **Step 5: Present commit command to user**

```bash
git add frontend/src/hooks/useCities.ts frontend/src/hooks/useCategories.ts frontend/src/hooks/useEvents.ts
git commit -m "feat(hooks): add useCities, useCategories, useEvents data hooks"
```

---

## Task 4: `useEventDetail` hook

**Files:**
- Create: `frontend/src/hooks/useEventDetail.ts`

**Context:** Single-event fetch by `id` (uuid). Joins host profile, city, category. Returns `EventVM | null` plus loading/error.

- [ ] **Step 1: Create `frontend/src/hooks/useEventDetail.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toEventVM, type EventVM } from '@/types/api';

export function useEventDetail(id: string | undefined) {
  const [data, setData] = useState<EventVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: row, error: err } = await supabase
      .from('events_with_counts')
      .select('*, host:profiles!host_id(id, host_name, full_name, host_bio), city:cities!city_id(id, name), category:categories!category_id(id, label)')
      .eq('id', id)
      .maybeSingle();
    if (err) {
      setError(err.message);
      setData(null);
    } else if (!row) {
      setData(null);
    } else {
      const r = row as any;
      setData(toEventVM(r, r.host, r.city, r.category));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean build.

- [ ] **Step 3: Present commit command to user**

```bash
git add frontend/src/hooks/useEventDetail.ts
git commit -m "feat(hooks): add useEventDetail single-event hook"
```

---

## Task 5: `useRsvp` hook

**Files:**
- Create: `frontend/src/hooks/useRsvp.ts`

**Context:** Reads the current user's RSVP state for a single event + the count. `toggle()` does optimistic update: flip local state, mutate row, revert on error. Logged-out users: `toggle()` is a no-op; the consumer handles the redirect.

The `rsvps` table has composite PK `(user_id, event_id)`. RLS allows users to select/insert/delete their own rsvps.

- [ ] **Step 1: Create `frontend/src/hooks/useRsvp.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useRsvp(eventId: string | undefined, initialCount: number) {
  const { user } = useAuth();
  const [rsvped, setRsvped] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep local count in sync when the parent's initial count changes (e.g. after detail refetch)
  useEffect(() => { setCount(initialCount); }, [initialCount]);

  useEffect(() => {
    if (!eventId || !user) {
      setRsvped(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('rsvps')
      .select('event_id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setRsvped(!!data);
        setLoading(false);
      });
  }, [eventId, user]);

  const toggle = useCallback(async () => {
    if (!eventId || !user) return;
    const wasRsvped = rsvped;
    // Optimistic
    setRsvped(!wasRsvped);
    setCount((c) => c + (wasRsvped ? -1 : 1));
    setError(null);

    const op = wasRsvped
      ? supabase.from('rsvps').delete().eq('event_id', eventId).eq('user_id', user.id)
      : supabase.from('rsvps').insert({ event_id: eventId, user_id: user.id });
    const { error: err } = await op;
    if (err) {
      // Revert
      setRsvped(wasRsvped);
      setCount((c) => c + (wasRsvped ? 1 : -1));
      setError(err.message);
    }
  }, [eventId, user, rsvped]);

  return { rsvped, count, loading, toggle, error };
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean build.

- [ ] **Step 3: Present commit command to user**

```bash
git add frontend/src/hooks/useRsvp.ts
git commit -m "feat(hooks): add useRsvp toggle hook with optimistic updates"
```

---

## Task 6: Skeleton + error banner primitives

**Files:**
- Create: `frontend/src/components/ui/EventCardSkeleton.tsx`
- Create: `frontend/src/components/ui/LoadError.tsx`

**Context:** Reusable loading and error UI. Skeleton mirrors `EventCard`'s outer shape (rounded card, 16:10 media area, two text lines, footer row) using `animate-pulse`.

- [ ] **Step 1: Create `frontend/src/components/ui/EventCardSkeleton.tsx`**

```tsx
export function EventCardSkeleton() {
  return (
    <div
      className="rounded-[22px] overflow-hidden flex flex-col h-full animate-pulse"
      style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ aspectRatio: '16/10', backgroundColor: 'var(--muted)' }} />
      <div className="flex flex-col px-5 pt-5 pb-5" style={{ flexGrow: 1 }}>
        <div className="h-5 rounded" style={{ backgroundColor: 'var(--muted)', width: '85%' }} />
        <div className="h-5 rounded mt-2" style={{ backgroundColor: 'var(--muted)', width: '60%' }} />
        <div className="h-3.5 rounded mt-4" style={{ backgroundColor: 'var(--muted)', width: '50%' }} />
        <div className="flex items-center gap-2 mt-auto pt-5">
          <div className="flex">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[20px] h-[20px] rounded-full"
                style={{
                  backgroundColor: 'var(--muted)',
                  marginLeft: i === 0 ? 0 : -7,
                  border: '1.5px solid var(--bg)',
                }}
              />
            ))}
          </div>
          <div className="h-3 rounded" style={{ backgroundColor: 'var(--muted)', width: 60 }} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/ui/LoadError.tsx`**

```tsx
interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-[12px] px-4 py-3 text-[13.5px]"
      style={{
        backgroundColor: 'oklch(96% 0.03 30)',
        border: '1px solid oklch(85% 0.08 30)',
        color: 'oklch(35% 0.12 30)',
      }}
    >
      <span>Couldn't load: {message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-medium underline-offset-2 hover:underline"
        style={{ color: 'oklch(35% 0.12 30)' }}
      >
        Retry
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean.

- [ ] **Step 4: Present commit command to user**

```bash
git add frontend/src/components/ui/EventCardSkeleton.tsx frontend/src/components/ui/LoadError.tsx
git commit -m "feat(ui): add EventCardSkeleton and LoadError primitives"
```

---

## Task 7: Swap `EventCard` to `EventVM`

**Files:**
- Modify: `frontend/src/components/ui/EventCard.tsx`

**Context:** EventVM keeps the same field names as the static `Event` (date, price, image, title, attendees, city, category, host) — so the only change is the import. No render change needed.

- [ ] **Step 1: Edit `frontend/src/components/ui/EventCard.tsx`**

Replace this line:
```tsx
import type { Event } from '@/data/events';
```

With:
```tsx
import type { EventVM } from '@/types/api';
```

And change the props interface:
```tsx
interface EventCardProps {
  event: EventVM;
  delay?: number;
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean. If TS errors about a missing field, double-check `EventVM` includes the legacy aliases (`city`, `category`, `host`, `date`, `price`, `attendees`) — Task 1 added them.

- [ ] **Step 3: Present commit command to user**

```bash
git add frontend/src/components/ui/EventCard.tsx
git commit -m "refactor(EventCard): consume EventVM type from hooks"
```

---

## Task 8: Wire `SearchBar` + `HeroSection` + `DestinationsSection` + `DestinationsPage` to `useCities` / `useCategories`

**Files:**
- Modify: `frontend/src/components/ui/SearchBar.tsx`
- Modify: `frontend/src/pages/landing-page/HeroSection.tsx`
- Modify: `frontend/src/pages/landing-page/DestinationsSection.tsx`
- Modify: `frontend/src/pages/destinations-page/index.tsx`

**Context:** Each of these reads `cities` or `categories` from `@/data/*`. Swap those imports for `useCities()` / `useCategories()`. While `loading`, render nothing (these are background fillers, not blocking content). On `error`, still render nothing — the empty state matches the empty-DB case.

For each file:

- [ ] **Step 1: `frontend/src/components/ui/SearchBar.tsx`** — replace `import { cities } from '@/data/cities'` with `useCities()` inside the component:

```tsx
import { useCities } from '@/hooks/useCities';
// ...
export function SearchBar(/* ...existing props */) {
  const { data: cities } = useCities();
  // ...rest unchanged — `cities` is now an array of CityVM with .id / .name
}
```

Field-name check: existing references like `city.name` and `city.id` still work because `CityVM` exposes both. Anywhere the file referenced `city.image_url`, it's now `city.imageUrl` (camelCase). Search/replace within this file.

- [ ] **Step 2: `frontend/src/pages/landing-page/HeroSection.tsx`** — replace `import { categories } from '@/data/categories'` with `useCategories()` inside the component:

```tsx
import { useCategories } from '@/hooks/useCategories';
// ...
const { data: categories } = useCategories();
```

Field check: `category.svg_content` becomes `category.svgContent`. Search/replace.

- [ ] **Step 3: `frontend/src/pages/landing-page/DestinationsSection.tsx`** — replace `import { cities } from '@/data/cities'` with `useCities()`. Same renaming rules.

- [ ] **Step 4: `frontend/src/pages/destinations-page/index.tsx`** — same.

- [ ] **Step 5: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean. If TS complains about a missing field, the data file referenced something `CityVM`/`CategoryVM` doesn't expose — add it to the VM in `src/types/api.ts`.

- [ ] **Step 6: Manual browser check**

```bash
cd frontend && npm run dev
```

Visit `http://localhost:5173/`:
- Category chips appear in the hero (they should match what's in the `categories` table — same 8 entries you seeded earlier)
- Destinations section shows city cards from `cities_with_counts` — each with the live `event_count`
- Search bar dropdown lists all cities

If a section is blank, open browser DevTools → Network → look for failed Supabase requests (`/rest/v1/cities_with_counts`, etc.). Most common cause: RLS not allowing `anon` SELECT. Verify in Studio → Authentication → Policies.

- [ ] **Step 7: Present commit command to user**

```bash
git add frontend/src/components/ui/SearchBar.tsx frontend/src/pages/landing-page/HeroSection.tsx frontend/src/pages/landing-page/DestinationsSection.tsx frontend/src/pages/destinations-page/index.tsx
git commit -m "feat: wire SearchBar + Hero + Destinations to live Supabase data"
```

---

## Task 9: Wire `EventsSection` + `EventsPage` to `useEvents`

**Files:**
- Modify: `frontend/src/pages/landing-page/EventsSection.tsx`
- Modify: `frontend/src/pages/events-page/index.tsx`

**Context:** `EventsSection` shows a small grid on the landing page (typically first 6 events). `EventsPage` shows the full filtered list. Both swap `import { events } from '@/data/events'` for `useEvents()`. Loading → render `<EventCardSkeleton>` triplet; error → `<LoadError />`.

- [ ] **Step 1: Modify `frontend/src/pages/landing-page/EventsSection.tsx`**

Replace the static import with the hook. Use the same grid markup as before; wrap with loading/error states. Sample shape:

```tsx
import { useEvents } from '@/hooks/useEvents';
import { EventCardSkeleton } from '@/components/ui/EventCardSkeleton';
import { LoadError } from '@/components/ui/LoadError';
// ...
const { data: events, loading, error, refetch } = useEvents();
const featured = events.slice(0, 6);

// inside the grid render:
{loading && (
  <>
    <EventCardSkeleton />
    <EventCardSkeleton />
    <EventCardSkeleton />
  </>
)}
{error && <LoadError message={error} onRetry={() => void refetch()} />}
{!loading && !error && featured.map((event, i) => (
  <EventCard key={event.id} event={event} delay={i * 0.04} />
))}
```

Open the existing file first to see what wraps the grid; preserve the section header, padding, and "View all events" CTA. Only the data source + loading/error branches change.

- [ ] **Step 2: Modify `frontend/src/pages/events-page/index.tsx`**

Replace `import { events } from '@/data/events'` and the `useMemo` filter block. The hook now does city + category filtering server-side; keep the client-side `q` (text), price-sort, and popularity-sort logic local. Sample:

```tsx
import { useEvents } from '@/hooks/useEvents';
import { EventCardSkeleton } from '@/components/ui/EventCardSkeleton';
import { LoadError } from '@/components/ui/LoadError';
// ...
const { data: events, loading, error, refetch } = useEvents({
  city: city || undefined,
  category: category || undefined,
  q: q || undefined,
});

const filtered = useMemo(() => {
  let result = [...events];
  switch (sort) {
    case 'price-asc':
      result.sort((a, b) => a.pricePhp - b.pricePhp);
      break;
    case 'price-desc':
      result.sort((a, b) => b.pricePhp - a.pricePhp);
      break;
    case 'popularity':
      result.sort((a, b) => b.attendees - a.attendees);
      break;
  }
  return result;
}, [events, sort]);
```

Sort now uses `pricePhp: number` directly — drop the `parsePrice(string)` helper. The `q` filter inside the hook means the local `useMemo` no longer applies text search; remove that block.

For the "X of Y events" counter, replace the bare `events.length` reference (which used to count the static array) with a totals query — for the MVP, just render `{filtered.length} events` and drop the "of" suffix. Less precise but no extra round-trip.

Render block:
```tsx
{loading && (
  <div className="events-full-grid">
    {[0, 1, 2, 3, 4, 5].map((i) => <EventCardSkeleton key={i} />)}
  </div>
)}
{error && <LoadError message={error} onRetry={() => void refetch()} />}
{!loading && !error && filtered.length > 0 && (
  /* existing grid */
)}
{!loading && !error && filtered.length === 0 && (
  /* existing "No events found" block */
)}
```

- [ ] **Step 3: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean. Common failure: leftover reference to the old `parsePrice` helper or static `events` import — search the file.

- [ ] **Step 4: Manual browser check**

Run dev server, visit `/`:
- Featured events grid populates with real data (sorted by `start_at`)
- Click "View all events" → `/events` shows the full list
- Apply a city filter from the SearchBar → list narrows
- Type a query → list filters by title/host
- Click an event card → navigates to `/events/<uuid>` (404-style for now, until Task 10)

- [ ] **Step 5: Present commit command to user**

```bash
git add frontend/src/pages/landing-page/EventsSection.tsx frontend/src/pages/events-page/index.tsx
git commit -m "feat: wire EventsSection + EventsPage to live Supabase events"
```

---

## Task 10: Wire `EventDetailPage` to `useEventDetail` + add `RsvpButton`

**Files:**
- Modify: `frontend/src/pages/event-page/index.tsx`
- Create: `frontend/src/components/ui/RsvpButton.tsx`

**Context:** Two changes in one task because they're tightly coupled. `useEventDetail(id)` replaces the static `events.find`. The right-side sticky CTA card replaces its "Sign in to register" placeholder with the new `RsvpButton` component (which internally uses `useRsvp`). Similar-events list also needs a follow-up small query — for MVP, just fetch all events via `useEvents({ category: event.category })` and filter client-side.

- [ ] **Step 1: Create `frontend/src/components/ui/RsvpButton.tsx`**

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRsvp } from '@/hooks/useRsvp';

interface Props {
  eventId: string;
  initialCount: number;
  isFull: boolean;
}

export function RsvpButton({ eventId, initialCount, isFull }: Props) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { rsvped, count, loading, toggle, error } = useRsvp(eventId, initialCount);

  const handleClick = () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (loading || (isFull && !rsvped)) return;
    void toggle();
  };

  const disabled =
    authLoading || loading || (isFull && !rsvped && !!user);

  let label: string;
  if (!user) label = 'Sign in to RSVP';
  else if (loading) label = '…';
  else if (rsvped) label = "You're going ✓";
  else if (isFull) label = 'Event full';
  else label = "I'm going";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          background: rsvped ? 'var(--primary-deep)' : 'var(--primary)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          padding: '13px 20px',
          borderRadius: 100,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          marginBottom: 12,
          transition: 'background-color 0.2s, opacity 0.2s',
        }}
      >
        {label}
      </button>
      <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center' }}>
        {count} {count === 1 ? 'person' : 'people'} going
      </div>
      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'oklch(45% 0.18 25)', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Modify `frontend/src/pages/event-page/index.tsx`**

Replace `import { events } from '@/data/events'` with the hook + `useEvents` for similars. Swap `events.find(...)` for `useEventDetail(id).data`. Render loading spinner + not-found + actual content branches.

Concrete changes inside `EventDetailPage`:

```tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useEvents } from '@/hooks/useEvents';
import { RsvpButton } from '@/components/ui/RsvpButton';

// inside the component:
const { id } = useParams<{ id: string }>();
const { data: event, loading, error } = useEventDetail(id);
const { data: allInCategory } = useEvents(
  event ? { category: event.category } : {}
);

if (loading) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

if (error || !event) {
  // keep the existing "Event not found" block as-is
}

const similarEvents = allInCategory.filter((e) => e.id !== event.id).slice(0, 3);
```

Replace the sticky right-card `<Link to="/login" …>Sign in to register →</Link>` with:

```tsx
<RsvpButton
  eventId={event.id}
  initialCount={event.attendees}
  isFull={event.isFull}
/>
```

(Remove the old `{event.attendees} people going` line right beneath — `RsvpButton` already renders the count.)

The "Few spots left" badge condition (`event.attendees < 20`) can keep working — `attendees` is on EventVM.

- [ ] **Step 3: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: clean.

- [ ] **Step 4: Manual browser smoke test**

```bash
cd frontend && npm run dev
```

1. Visit `/` → click any event card → lands on `/events/<uuid>` with real data
2. Logged out: "Sign in to RSVP" → clicks redirect to `/login?next=/events/<uuid>` → after login redirects back
3. Logged in: click "I'm going" → button changes to "You're going ✓", count increments
4. Refresh page → state persists (re-fetched from `rsvps`)
5. Click "You're going ✓" → reverts; count decrements
6. Navigate away and back → state still correct

If RSVP returns a row-level-security error in DevTools console, double-check the `rsvps_insert_self` policy exists for the authenticated role on the `rsvps` table.

- [ ] **Step 5: Present commit command to user**

```bash
git add frontend/src/components/ui/RsvpButton.tsx frontend/src/pages/event-page/index.tsx
git commit -m "feat(rsvp): wire EventDetailPage to live data, add optimistic RsvpButton"
```

---

## Task 11: End-to-end smoke test + cleanup

**Files:** None modified — verification + final hygiene.

**Context:** All hooks and consumers are wired. Verify the full flow works and confirm `src/data/events.ts`/`cities.ts`/`categories.ts` have no remaining importers.

- [ ] **Step 1: Confirm no remaining static-data imports**

```bash
cd frontend && grep -rn "from '@/data/events'" src/ ; grep -rn "from '@/data/cities'" src/ ; grep -rn "from '@/data/categories'" src/
```

Expected: only matches inside `src/data/*` itself or inside `scripts/seed-events.ts` (the seeder still uses `events.ts`). Any remaining `src/components/*` or `src/pages/*` match is a missed swap from earlier tasks — fix it.

- [ ] **Step 2: Full production build**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs`, only the chunk-size warning (Supabase + Framer Motion).

- [ ] **Step 3: Full browser walkthrough**

```bash
cd frontend && npm run dev
```

Test each in order:

| Flow | Expected |
|---|---|
| Visit `/` logged out | Hero categories, featured events, destinations all populated |
| Hero category click | Filters events page to that category |
| `/events` with no filters | Lists all published events from DB |
| `/events?city=makati` | Lists only Makati events |
| `/events?q=cafe` | Title-search narrows results |
| Click event card | Lands on detail page; all sections render (overview, schedule, similar events) |
| Click "I'm going" while logged out | Redirects to `/login?next=...` |
| Sign in → redirects back to detail page | RSVP button works; count updates |
| Refresh detail page after RSVP | "You're going ✓" persists |
| Click "You're going ✓" | Reverts to "I'm going"; count -1 |
| Visit a non-existent `/events/<random-uuid>` | "Event not found" block renders |

- [ ] **Step 4: Present final commit command to user**

If any small fixes were needed during the smoke test, batch them:

```bash
git add <fixed files>
git commit -m "fix: smoke-test polish on live data + RSVP flow"
```

Otherwise: no extra commit. Plan complete.

---

## Notes on RLS pitfalls (if hooks return empty unexpectedly)

- **`profiles_select_all` is on by default** — the host join inside `useEvents` / `useEventDetail` should return host name. If host comes back `null`, check Studio → Authentication → Policies → `profiles` and confirm a permissive SELECT exists.
- **`events_select_published`** filters by `status='published'`. The seed script sets `status='published'` explicitly — but if events are missing in the UI, verify in Studio → Table Editor → `events` that `status='published'` and `published_at` is non-null.
- **`rsvps` capacity-trigger check** isn't in this migration; the `isFull` gate is purely client-side from the spec. Out of scope.
