# Event Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dynamic `/events/:id` detail page that renders full event information using a single template component driven by static data.

**Architecture:** Look up the event by `id` from the existing `events` array in `events.ts`. Extend the `Event` interface with optional detail fields (`description`, `venue`, `address`, `schedule`). The page renders a full-width hero, a 2-column layout (content left, sticky booking panel right), and a vertical "similar events" list filtered by category. `EventCard` is updated to link to the detail page.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, react-router-dom v6

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `frontend/src/data/events.ts` | Extend `Event` interface; populate detail fields on all 20 events |
| Modify | `frontend/src/App.tsx` | Register `/events/:id` route inside the layout route |
| Modify | `frontend/src/components/ui/EventCard.tsx` | Wrap card in `Link` to `/events/:id` |
| Create | `frontend/src/pages/event-page/index.tsx` | Full detail page template |

---

## Task 0: Add .superpowers/ to root .gitignore

**Files:**
- Create: `.gitignore` (repo root)

- [ ] **Step 1: Create root .gitignore**

```bash
echo ".superpowers/" >> /Users/jirolayug/Documents/projects/react/xtravagala/.gitignore
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers/ brainstorm artifacts"
```

---

## Task 1: Extend the Event data model and populate detail fields

**Files:**
- Modify: `frontend/src/data/events.ts`

- [ ] **Step 1: Extend the `Event` interface**

Replace the existing interface at the top of `frontend/src/data/events.ts` with:

```ts
export interface Event {
  id: string;
  title: string;
  image: string;
  price: string;
  date: string;
  host: string;
  attendees: number;
  category: string;
  city: string;
  // Detail fields — optional so list views work without changes
  description?: string;
  venue?: string;
  address?: string;
  schedule?: Array<{ time: string; label: string }>;
}
```

- [ ] **Step 2: Add detail fields to all 20 events**

Add `description`, `venue`, `address`, and `schedule` to each event object. Below is the full updated `events` array — replace the existing one entirely:

```ts
export const events: Event[] = [
  {
    id: 'e1',
    title: 'Cafe Gathering in Makati — Sunday Slow Morning',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 17 · 2:00 PM PHT',
    host: 'Little Japan in Manila',
    attendees: 13,
    category: 'hobbies',
    city: 'makati',
    description: 'A relaxed Sunday morning gathering for people who enjoy slow coffee, quiet conversation, and good company. Drop in anytime — no agenda, no pressure. Just bring yourself and an open mind.',
    venue: 'Little Japan Cafe',
    address: 'Poblacion, Makati, Metro Manila',
    schedule: [
      { time: '2:00 PM', label: 'Doors open, free seating' },
      { time: '2:30 PM', label: 'Introductions & open chat' },
      { time: '4:00 PM', label: 'Wind down' },
    ],
  },
  {
    id: 'e2',
    title: 'Manila 🇵🇭 — Practical Philosophy Meetup',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 17 · 7:00 PM PHT',
    host: 'Practical Philosophy Club PH',
    attendees: 20,
    category: 'workshops',
    city: 'manila',
    description: 'A weekly discussion group that applies philosophical ideas to everyday life. Each session focuses on a single question or text. No background in philosophy required — just curiosity and willingness to think out loud.',
    venue: 'The Study Room, Fully Booked BGC',
    address: '4F High Street South Corporate Plaza, BGC, Taguig',
    schedule: [
      { time: '7:00 PM', label: 'Doors open' },
      { time: '7:15 PM', label: 'Topic introduction' },
      { time: '7:30 PM', label: 'Open discussion' },
      { time: '9:00 PM', label: 'Close' },
    ],
  },
  {
    id: 'e3',
    title: 'WP Manila Meetup — May 2026 (10th Year)',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80',
    price: '₱350',
    date: 'Sat, May 23 · 1:00 PM PHT',
    host: 'WordPress Manila Meetup',
    attendees: 98,
    category: 'business',
    city: 'manila',
    description: 'Celebrating 10 years of WordPress Manila! Join the community for talks on Gutenberg, WooCommerce, performance, and the future of WordPress in the PH. Includes networking lunch and raffle.',
    venue: 'Globe Tower Events Hall',
    address: 'The Globe Tower, 32nd St, BGC, Taguig, 1634',
    schedule: [
      { time: '1:00 PM', label: 'Registration & networking' },
      { time: '2:00 PM', label: 'Opening keynote' },
      { time: '3:00 PM', label: 'Breakout sessions' },
      { time: '5:00 PM', label: 'Raffle & close' },
    ],
  },
  {
    id: 'e4',
    title: 'Writing for your Mental Health: Poetry 101',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 17 · 1:00 PM PHT',
    host: 'Meetup Philippines',
    attendees: 3,
    category: 'workshops',
    city: 'manila',
    description: 'An introductory poetry workshop focused on using writing as a tool for mental wellness. You don\'t need to be a writer — just bring a pen and whatever is on your mind. Prompts provided.',
    venue: 'Commune Cafe & Bar',
    address: '36 Polaris St, Makati, Metro Manila',
    schedule: [
      { time: '1:00 PM', label: 'Welcome & warm-up writing' },
      { time: '1:30 PM', label: 'Guided poetry prompts' },
      { time: '2:30 PM', label: 'Share & reflect' },
      { time: '3:00 PM', label: 'Close' },
    ],
  },
  {
    id: 'e5',
    title: 'IN PERSON: StarRocks × Apache Kafka — Real-Time Analytics',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Thu, May 28 · 6:30 PM PHT',
    host: 'Manila Apache Kafka Meetup',
    attendees: 15,
    category: 'business',
    city: 'manila',
    description: 'A technical deep-dive into building real-time analytics pipelines with StarRocks and Apache Kafka. Includes live demos, Q&A, and post-event networking. Suitable for engineers and data professionals.',
    venue: 'KMC Coworking Ortigas',
    address: '8/F Robinsons Cybergate Gamma, Ortigas Center, Pasig',
    schedule: [
      { time: '6:30 PM', label: 'Doors open & networking' },
      { time: '7:00 PM', label: 'Talk: StarRocks + Kafka in production' },
      { time: '7:45 PM', label: 'Live demo' },
      { time: '8:15 PM', label: 'Q&A & close' },
    ],
  },
  {
    id: 'e6',
    title: '20s & 30s Global Hangout & Activities in Manila',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sat, May 23 · 7:30 PM PHT',
    host: 'Manila Hangout & Activities',
    attendees: 8,
    category: 'nightlife',
    city: 'manila',
    description: 'A casual Saturday night hangout for expats and locals in their 20s and 30s. Games, drinks, and easy conversation. A great way to meet new people in the city with zero pressure.',
    venue: 'Draft Gastropub BGC',
    address: 'Ground Floor, Petron MegaPlaza, BGC, Taguig',
    schedule: [
      { time: '7:30 PM', label: 'Arrive & mingle' },
      { time: '8:00 PM', label: 'Group games & activities' },
      { time: '10:00 PM', label: 'Free night continues' },
    ],
  },
  {
    id: 'e7',
    title: 'Late Set — Rooftop Jazz Night in BGC',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
    price: '₱500',
    date: 'Sun, May 24 · 9:00 PM PHT',
    host: 'Northbeat Sessions',
    attendees: 42,
    category: 'music',
    city: 'bgc',
    description: 'An intimate rooftop jazz night overlooking the BGC skyline. Featuring some of Manila\'s finest jazz musicians playing late into the night. Drinks available at the bar. Limited spots — come early.',
    venue: 'The Penthouse at High Street South',
    address: '26th St, Bonifacio Global City, Taguig, 1634 Metro Manila',
    schedule: [
      { time: '9:00 PM', label: 'Doors open' },
      { time: '9:30 PM', label: 'First set begins' },
      { time: '11:30 PM', label: 'Late set & close' },
    ],
  },
  {
    id: 'e8',
    title: 'Think Responsibly — Lectures in Bars',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sat, May 23 · 6:30 PM PHT',
    host: 'Think Responsibly',
    attendees: 12,
    category: 'workshops',
    city: 'bgc',
    description: 'Short, sharp talks on ideas that matter — held in a bar. Each event features two 15-minute lectures followed by discussion. Past topics include urban planning, AI ethics, and food systems. Drink in hand, mind wide open.',
    venue: 'The Bottle Shop BGC',
    address: '28th St corner 5th Ave, BGC, Taguig',
    schedule: [
      { time: '6:30 PM', label: 'Doors open' },
      { time: '7:00 PM', label: 'Lecture 1' },
      { time: '7:20 PM', label: 'Break & discussion' },
      { time: '7:40 PM', label: 'Lecture 2' },
      { time: '8:00 PM', label: 'Open floor & drinks' },
    ],
  },
  {
    id: 'e9',
    title: 'Cebu Craft Beer Festival — Summer Edition',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    price: '₱400',
    date: 'Sat, May 30 · 4:00 PM PHT',
    host: 'Cebu Brew Society',
    attendees: 210,
    category: 'food',
    city: 'cebu',
    description: 'Over 20 craft breweries from across the Philippines come together for a summer session in Cebu. Unlimited tasting tokens, live music, and food stalls. The biggest craft beer event in the Visayas.',
    venue: 'Ayala Center Cebu Activity Center',
    address: 'Cebu Business Park, Archbishop Reyes Ave, Cebu City',
    schedule: [
      { time: '4:00 PM', label: 'Gates open & tasting begins' },
      { time: '5:00 PM', label: 'Live band sets' },
      { time: '7:00 PM', label: 'Brewer\'s showcase & awards' },
      { time: '9:00 PM', label: 'Close' },
    ],
  },
  {
    id: 'e10',
    title: 'BGC Night Run 5K — Neon Edition',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    price: '₱350',
    date: 'Sat, May 30 · 8:00 PM PHT',
    host: 'Run BGC',
    attendees: 340,
    category: 'outdoors',
    city: 'bgc',
    description: 'A 5K fun run through the streets of BGC after dark. Wear neon — paint stations along the route. Race kit includes shirt, finisher medal, and glow accessories. All pace levels welcome.',
    venue: 'BGC Track (start/finish)',
    address: '38th St, Bonifacio Global City, Taguig',
    schedule: [
      { time: '8:00 PM', label: 'Assembly & kit check' },
      { time: '8:30 PM', label: 'Race starts' },
      { time: '9:30 PM', label: 'Finisher area & photos' },
      { time: '10:00 PM', label: 'Raffle & close' },
    ],
  },
  {
    id: 'e11',
    title: 'Manila International Jazz Festival 2026',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=900&q=80',
    price: '₱1,200',
    date: 'Fri, May 29 · 7:00 PM PHT',
    host: 'Jazz Manila',
    attendees: 860,
    category: 'music',
    city: 'manila',
    description: 'The premier jazz festival in Southeast Asia returns for its 2026 edition. Three stages, 18 acts across two nights, featuring local and international artists. General admission includes access to all outdoor stages.',
    venue: 'Luneta Park Grandstand',
    address: 'Roxas Blvd, Ermita, Manila',
    schedule: [
      { time: '7:00 PM', label: 'Gates open' },
      { time: '7:30 PM', label: 'Opening act — Main Stage' },
      { time: '9:00 PM', label: 'Headline performance' },
      { time: '11:00 PM', label: 'Close' },
    ],
  },
  {
    id: 'e12',
    title: 'Makati Gallery Walk — Contemporary Philippine Art',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 31 · 10:00 AM PHT',
    host: 'Makati Arts Council',
    attendees: 55,
    category: 'hobbies',
    city: 'makati',
    description: 'A self-guided walking tour of six galleries in the Legazpi and Salcedo Village area. Each gallery opens its latest exhibition for free. Maps and artist notes provided at the first stop.',
    venue: 'Starts at Finale Art File',
    address: '3/F Robinsons Galleria Ortigas, Ortigas Ave, Quezon City',
    schedule: [
      { time: '10:00 AM', label: 'Map pickup at Finale Art File' },
      { time: '10:30 AM', label: 'Gallery walk opens (self-guided)' },
      { time: '1:00 PM', label: 'Optional group debrief at last stop' },
    ],
  },
  {
    id: 'e13',
    title: 'Salsa Night at SocialMade — Cebu',
    image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=80',
    price: '₱200',
    date: 'Fri, May 29 · 9:00 PM PHT',
    host: 'Cebu Salsa Community',
    attendees: 78,
    category: 'nightlife',
    city: 'cebu',
    description: 'Weekly salsa social at SocialMade bar. Beginners welcome — a free 30-minute lesson kicks off the night before the social dancing begins. Latin music all night, mixed crowd, great energy.',
    venue: 'SocialMade Bar & Kitchen',
    address: 'Level 1, Ayala Center Cebu, Archbishop Reyes Ave, Cebu City',
    schedule: [
      { time: '9:00 PM', label: 'Beginner lesson (free, included)' },
      { time: '9:30 PM', label: 'Social dancing begins' },
      { time: '1:00 AM', label: 'Close' },
    ],
  },
  {
    id: 'e14',
    title: 'Poblacion Night Market — Food & Culture',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sat, May 23 · 5:00 PM PHT',
    host: 'Poblacion Market Collective',
    attendees: 430,
    category: 'food',
    city: 'manila',
    description: 'Poblacion\'s beloved weekly night market. 40+ food stalls, local designers, live acoustic sets, and the best people-watching in Makati. Entry is free — just bring your appetite.',
    venue: 'Kalayaan Avenue',
    address: 'Kalayaan Ave, Poblacion, Makati, Metro Manila',
    schedule: [
      { time: '5:00 PM', label: 'Market opens' },
      { time: '6:00 PM', label: 'Live acoustic sets begin' },
      { time: '10:00 PM', label: 'Market closes' },
    ],
  },
  {
    id: 'e15',
    title: 'Sunrise Yoga — BGC Commons',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 24 · 6:00 AM PHT',
    host: 'BGC Wellness Collective',
    attendees: 62,
    category: 'outdoors',
    city: 'bgc',
    description: 'Start your Sunday right with an outdoor yoga session at BGC Commons. All levels welcome. Bring your own mat. The session ends with a short breathwork cool-down as the city wakes up around you.',
    venue: 'BGC Commons',
    address: '5th Ave, Bonifacio Global City, Taguig',
    schedule: [
      { time: '6:00 AM', label: 'Gather & set up mats' },
      { time: '6:10 AM', label: 'Session begins' },
      { time: '7:10 AM', label: 'Breathwork & cool-down' },
      { time: '7:30 AM', label: 'Close' },
    ],
  },
  {
    id: 'e16',
    title: 'Davao Durian Heritage Fair 2026',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sat, Jun 6 · 8:00 AM PHT',
    host: 'Davao Tourism Office',
    attendees: 1200,
    category: 'food',
    city: 'davao',
    description: 'An annual celebration of Davao\'s most famous export. 60+ durian varieties to taste, cooking demonstrations, heritage talks, and the famous durian-eating contest. The largest durian fair in Southeast Asia.',
    venue: 'Magsaysay Park',
    address: 'Magsaysay Park, Santa Ana Ave, Davao City',
    schedule: [
      { time: '8:00 AM', label: 'Gates open' },
      { time: '9:00 AM', label: 'Opening ceremony' },
      { time: '10:00 AM', label: 'Durian-eating contest' },
      { time: '12:00 PM', label: 'Cooking demos & tastings' },
      { time: '5:00 PM', label: 'Close' },
    ],
  },
  {
    id: 'e17',
    title: 'Baguio Strawberry Picking & Hillside Picnic',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=80',
    price: '₱650',
    date: 'Sun, Jun 7 · 7:00 AM PHT',
    host: 'La Trinidad Farms',
    attendees: 44,
    category: 'outdoors',
    city: 'baguio',
    description: 'Pick your own strawberries at a working farm in La Trinidad, Benguet, then settle in for a hillside picnic with a view. Ticket includes picking basket, 250g take-home punnet, and picnic spread.',
    venue: 'La Trinidad Strawberry Farm',
    address: 'Km 5, La Trinidad, Benguet, Baguio',
    schedule: [
      { time: '7:00 AM', label: 'Farm arrival & briefing' },
      { time: '7:30 AM', label: 'Strawberry picking session' },
      { time: '9:00 AM', label: 'Hillside picnic setup' },
      { time: '11:00 AM', label: 'Pack up & depart' },
    ],
  },
  {
    id: 'e18',
    title: 'Advanced Cocktail Masterclass — Makati',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=900&q=80',
    price: '₱1,800',
    date: 'Sat, May 30 · 2:00 PM PHT',
    host: 'The Bar Academy PH',
    attendees: 18,
    category: 'food',
    city: 'makati',
    description: 'A hands-on advanced cocktail class covering fat-washing, clarification, and carbonation techniques. Each participant makes and takes home three cocktails. Prerequisite: basic bartending experience or prior Bar Academy class.',
    venue: 'The Bar Academy PH Studio',
    address: '2/F The Beaufort, 5th Ave cor 23rd St, BGC, Taguig',
    schedule: [
      { time: '2:00 PM', label: 'Welcome & ingredient rundown' },
      { time: '2:30 PM', label: 'Technique demo: fat-washing' },
      { time: '3:30 PM', label: 'Hands-on cocktail making' },
      { time: '5:00 PM', label: 'Tasting & wrap-up' },
    ],
  },
  {
    id: 'e19',
    title: 'Open Mic Night — Iloilo Heritage District',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Fri, May 29 · 8:00 PM PHT',
    host: 'Iloilo Creative Arts',
    attendees: 34,
    category: 'music',
    city: 'iloilo',
    description: 'A weekly open mic night in the heart of the Iloilo heritage district. Musicians, poets, comedians, and storytellers all welcome. Sign-up sheet opens at 7:30 PM. The stage is yours — 8 minutes per act.',
    venue: 'Camiña Balay nga Bato Courtyard',
    address: 'Jalandoni-Javellana Heritage House, Mabini St, Iloilo City',
    schedule: [
      { time: '7:30 PM', label: 'Sign-up sheet opens' },
      { time: '8:00 PM', label: 'First act' },
      { time: '10:30 PM', label: 'Last call for performers' },
      { time: '11:00 PM', label: 'Close' },
    ],
  },
  {
    id: 'e20',
    title: 'Philippine Startup Summit — Manila 2026',
    image: 'https://images.unsplash.com/photo-1556761175-4b46d2f12c6a?auto=format&fit=crop&w=900&q=80',
    price: '₱2,500',
    date: 'Thu, Jun 4 · 9:00 AM PHT',
    host: 'Startup PH Network',
    attendees: 620,
    category: 'business',
    city: 'manila',
    description: 'The Philippines\' largest startup conference. 80+ speakers, 6 tracks covering fundraising, product, growth, and policy. Includes expo floor with 40 exhibitors, pitch competition finals, and networking dinner.',
    venue: 'SMX Convention Center Manila',
    address: 'Seashell Lane, Mall of Asia Complex, Pasay City',
    schedule: [
      { time: '9:00 AM', label: 'Registration & expo opens' },
      { time: '10:00 AM', label: 'Keynote: State of PH Startups' },
      { time: '11:00 AM', label: 'Breakout tracks begin' },
      { time: '1:00 PM', label: 'Lunch & networking' },
      { time: '2:00 PM', label: 'Pitch competition finals' },
      { time: '5:00 PM', label: 'Networking dinner & awards' },
    ],
  },
];
```

- [ ] **Step 3: Verify the dev server still compiles**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` — the landing page and events page should load with no console errors. No visual changes expected yet.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/data/events.ts
git commit -m "feat: extend Event interface with optional detail fields and populate all events"
```

---

## Task 2: Make EventCard navigate to the detail page

**Files:**
- Modify: `frontend/src/components/ui/EventCard.tsx`

- [ ] **Step 1: Wrap the card in a Link**

Open `frontend/src/components/ui/EventCard.tsx`. Import `Link` from react-router-dom and wrap the `motion.article` in a `Link`:

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '@/data/events';

interface EventCardProps {
  event: Event;
  delay?: number;
}

const AVATAR_COUNT = 3;

export function EventCard({ event, delay = 0 }: EventCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay }}
        whileHover={{ y: -4 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: hovered ? 'var(--bg)' : 'transparent',
          borderColor: hovered ? 'var(--border)' : 'transparent',
          boxShadow: hovered
            ? '0 8px 32px -8px rgba(0,0,0,0.12)'
            : '0 0 0 transparent',
          borderWidth: 1,
          borderStyle: 'solid',
          transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
        className="rounded-[22px] p-3 cursor-pointer"
      >
        {/* Media */}
        <div
          className="relative overflow-hidden rounded-[14px]"
          style={{ aspectRatio: '16/10' }}
        >
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
          <span className="absolute top-3 left-3 bg-white text-xs font-semibold rounded-pill px-3 py-1 text-[var(--text)]">
            {event.price}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1 pt-3 px-1">
          <h3
            className="text-[18px] font-semibold leading-tight -tracking-[0.014em] line-clamp-2 text-[var(--text)]"
          >
            {event.title}
          </h3>

          <div className="text-[14px] text-[var(--primary)] font-medium mt-1.5">
            {event.date}
          </div>

          <div className="text-[14px] text-[var(--text-mute)]">
            {event.host}
          </div>

          {/* Footer: avatars + count */}
          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex">
              {Array.from({ length: Math.min(AVATAR_COUNT, event.attendees) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="w-[22px] h-[22px] rounded-full border-2 border-[var(--bg)] bg-[var(--muted)]"
                    style={{ marginLeft: i === 0 ? 0 : -8 }}
                  />
                )
              )}
            </div>
            <span className="text-[12.5px] text-[var(--text-mute)]">
              {event.attendees} going
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
```

- [ ] **Step 2: Verify in browser**

With the dev server running, open `http://localhost:5173`. Hover over an event card — the cursor should still show pointer. Click a card — it should navigate to `/events/e1` (or whichever id). The page will show a 404-style blank since the route doesn't exist yet. That's expected.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/EventCard.tsx
git commit -m "feat: make EventCard link to /events/:id"
```

---

## Task 3: Register the /events/:id route

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Import EventDetailPage and add the route**

Open `frontend/src/App.tsx`. Add the import and route. The full updated file:

```tsx
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LandingPage } from "@/pages/landing-page";
import { LoginPage } from "@/pages/login-page";
import { SignUpPage } from "@/pages/signup-page";
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
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Create the placeholder page so the import resolves**

Create `frontend/src/pages/event-page/index.tsx` with a minimal placeholder so TypeScript doesn't error:

```tsx
export function EventDetailPage() {
  return <div>Event detail coming soon</div>;
}
```

- [ ] **Step 3: Verify the route resolves**

With the dev server running, click any event card on the landing page or events page. You should land on `/events/e1` (or whichever id) and see "Event detail coming soon". No TypeScript errors in the terminal.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/pages/event-page/index.tsx
git commit -m "feat: register /events/:id route with placeholder page"
```

---

## Task 4: Build the EventDetailPage component

**Files:**
- Modify: `frontend/src/pages/event-page/index.tsx`

- [ ] **Step 1: Write the full page component**

Replace the placeholder in `frontend/src/pages/event-page/index.tsx` with the complete implementation:

```tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { events } from '@/data/events';

const ease = [0.23, 1, 0.32, 1] as const;

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: '13.5px',
        fontWeight: 500,
        color: 'var(--primary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      ← Back to Events
    </button>
  );
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '120px auto',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 12,
          }}
        >
          Event not found
        </h1>
        <p style={{ color: 'var(--text-mute)', marginBottom: 24 }}>
          This event may have been removed or the link is incorrect.
        </p>
        <Link
          to="/events"
          style={{
            color: 'var(--primary)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Browse all events →
        </Link>
      </div>
    );
  }

  const similarEvents = events
    .filter((e) => e.category === event.category && e.id !== event.id)
    .slice(0, 3);

  const showBadge = event.attendees < 20;

  return (
    <div>
      {/* Back nav */}
      <div style={{ padding: '20px clamp(20px, 4vw, 48px) 0' }}>
        <BackButton />
      </div>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        style={{
          width: '100%',
          aspectRatio: '21/8',
          overflow: 'hidden',
          marginTop: 16,
        }}
      >
        <img
          src={event.image}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </motion.div>

      {/* 2-col layout */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '36px clamp(20px, 4vw, 48px) 72px',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 48,
          alignItems: 'start',
        }}
        className="event-detail-grid"
      >
        {/* LEFT: main content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          {/* Badge */}
          {showBadge && (
            <span
              style={{
                display: 'inline-block',
                background: 'oklch(92% 0.06 60)',
                color: 'oklch(42% 0.12 50)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 4,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Few spots left
            </span>
          )}

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(24px, 2.8vw, 32px)',
              fontWeight: 700,
              letterSpacing: '-0.022em',
              color: 'var(--text)',
              margin: '0 0 20px',
              lineHeight: 1.2,
            }}
          >
            {event.title}
          </h1>

          {/* Host row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>
                by <strong style={{ color: 'var(--text)' }}>{event.host}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                {event.attendees} attending · {event.category}
              </div>
            </div>
            <button
              style={{
                border: '1px solid var(--border)',
                background: '#fff',
                borderRadius: 100,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Follow
            </button>
          </div>

          {/* Location + date */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: '1px solid var(--border)',
            }}
          >
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📍</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {event.venue}
                  </div>
                  {event.address && (
                    <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 2 }}>
                      {event.address}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🗓</span>
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{event.date}</span>
            </div>
          </div>

          {/* Overview */}
          {event.description && (
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: '0 0 10px',
                  letterSpacing: '-0.015em',
                }}
              >
                Overview
              </h2>
              <p
                style={{
                  fontSize: 14.5,
                  color: 'var(--text-mute)',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {event.description}
              </p>
            </div>
          )}

          {/* Schedule */}
          {event.schedule && event.schedule.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: '0 0 12px',
                  letterSpacing: '-0.015em',
                }}
              >
                Schedule
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {event.schedule.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '10px 0',
                      borderBottom:
                        i < event.schedule!.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--primary)',
                        width: 76,
                        flexShrink: 0,
                      }}
                    >
                      {item.time}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT: sticky booking panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.18 }}
        >
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
              position: 'sticky',
              top: 64,
              background: '#fff',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              {event.price}
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: 'var(--text-mute)',
                marginBottom: 20,
              }}
            >
              {event.date}
            </div>
            <Link
              to="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                padding: '13px 20px',
                borderRadius: 100,
                textDecoration: 'none',
                marginBottom: 12,
                transition: 'background-color 0.2s',
              }}
            >
              Sign in to register →
            </Link>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-mute)',
                textAlign: 'center',
              }}
            >
              {event.attendees} people going
            </div>
          </div>
        </motion.div>
      </div>

      {/* Similar events */}
      {similarEvents.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '40px clamp(20px, 4vw, 48px) 72px',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 6px',
                letterSpacing: '-0.018em',
              }}
            >
              You might also like...
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-mute)',
                margin: '0 0 24px',
              }}
            >
              More events in the same category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {similarEvents.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease, delay: i * 0.07 }}
                >
                  <Link
                    to={`/events/${e.id}`}
                    style={{
                      display: 'flex',
                      gap: 20,
                      padding: '20px 0',
                      borderBottom:
                        i < similarEvents.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                      textDecoration: 'none',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'var(--text)',
                          marginBottom: 5,
                          lineHeight: 1.3,
                        }}
                      >
                        {e.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--text-mute)',
                          marginBottom: 2,
                        }}
                      >
                        {e.date}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--text-mute)',
                          marginBottom: 4,
                          textTransform: 'capitalize',
                        }}
                      >
                        {e.city}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text)',
                        }}
                      >
                        {e.price}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 100,
                        height: 70,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={e.image}
                        alt={e.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 860px) {
          .event-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify the full page in browser**

With the dev server running, click any event card. Check:
- Hero image renders edge-to-edge
- Title, host row, venue, date, description, and schedule all appear
- Booking panel is visible on the right (or below on mobile)
- "Sign in to register →" links to `/login`
- "You might also like" shows up to 3 events of the same category
- Clicking a similar event navigates to that event's detail page
- "← Back to Events" navigates back
- Events with `attendees < 20` show the "Few spots left" badge

- [ ] **Step 3: Check responsive layout**

Resize browser to below 860px wide. The 2-column grid should collapse to a single column, with the booking panel appearing below the description.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/event-page/index.tsx
git commit -m "feat: build EventDetailPage with hero, 2-col layout, schedule, and similar events"
```
