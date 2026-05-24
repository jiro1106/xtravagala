import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { events as staticEvents } from '../src/data/events';
import type { Database } from '../src/types/db';

// Load frontend/.env.local explicitly (dotenv defaults to .env)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env.local');
  process.exit(1);
}

// Single fake host owns all seeded events. Display name is generic; the original
// per-event host strings are dropped (Supabase signup rate limits + domain validation
// make per-host signups impractical).
const SEED_EMAIL = 'seed@xtravagala.com';
const SEED_PASSWORD = 'REDACTED_SEED_CREDENTIAL';
const SEED_HOST_NAME = 'XtravaGala Community';
const SEED_HOST_BIO = 'Curated seed events from local PH communities.';
const SEED_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=XtravaGala%20Community';

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
  const m = dateStr.match(/^[A-Za-z]+,\s*([A-Za-z]+)\s+(\d+)\s*[·\-]\s*(\d+):(\d+)\s*(AM|PM)/);
  if (!m) return null;
  const [, monthName, dayStr, hourStr, minStr, ampm] = m;
  const month = MONTH_INDEX[monthName.toLowerCase()];
  if (month === undefined) return null;
  let hour = parseInt(hourStr, 10);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
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

async function signInOrSignUp(): Promise<string> {
  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
  });
  if (!signInErr && signIn.user) {
    console.log(`Signed in as existing seed user ${SEED_EMAIL}`);
    return signIn.user.id;
  }

  console.log(`Signing up seed user ${SEED_EMAIL}…`);
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
    options: { data: { full_name: SEED_HOST_NAME } },
  });
  if (signUpErr || !signUp.user) {
    throw new Error(`Could not sign up seed user: ${signUpErr?.message ?? 'no user returned'}`);
  }
  const { error: secondSignIn } = await supabase.auth.signInWithPassword({
    email: SEED_EMAIL,
    password: SEED_PASSWORD,
  });
  if (secondSignIn) {
    throw new Error(
      `Signed up but couldn't sign in. If Supabase email confirmation is on, disable it in Studio → Auth → Providers → Email, then re-run. (${secondSignIn.message})`,
    );
  }
  return signUp.user.id;
}

async function promoteToHost(): Promise<void> {
  const { data: who } = await supabase.auth.getUser();
  if (!who.user) throw new Error('No authenticated user when promoting to host');
  const { error } = await supabase
    .from('profiles')
    .update({
      is_host: true,
      host_name: SEED_HOST_NAME,
      host_bio: SEED_HOST_BIO,
      avatar_url: SEED_AVATAR,
      full_name: SEED_HOST_NAME,
    })
    .eq('id', who.user.id);
  if (error) throw new Error(`Profile promote failed: ${error.message}`);
}

async function insertEvents(hostId: string): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  for (const ev of staticEvents) {
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
      if (error.code === '23505') {
        skipped++;
        console.log(`  ↺ "${ev.title}" already seeded (slug conflict) — skipped`);
      } else {
        console.error(`  ✗ insert failed for "${ev.title}": ${error.message}`);
        skipped++;
      }
    } else {
      inserted++;
      console.log(`  ✓ "${ev.title}"`);
    }
  }
  return { inserted, skipped };
}

async function main() {
  console.log(`Seeding ${staticEvents.length} events under a single fake host…\n`);
  const hostId = await signInOrSignUp();
  await promoteToHost();
  const { inserted, skipped } = await insertEvents(hostId);
  await supabase.auth.signOut();
  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped/duplicate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
