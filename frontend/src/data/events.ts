export interface Event {
  id: string;
  title: string;
  image: string;
  price: string;
  date: string;
  host: string;
  attendees: number;
}

export const events: Event[] = [
  {
    id: 'e1',
    title: 'Cafe Gathering in Makati — Sunday Slow Morning',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 17 · 2:00 PM PHT',
    host: 'Little Japan in Manila',
    attendees: 13,
  },
  {
    id: 'e2',
    title: 'Manila 🇵🇭 — Practical Philosophy Meetup',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 17 · 7:00 PM PHT',
    host: 'Practical Philosophy Club PH',
    attendees: 20,
  },
  {
    id: 'e3',
    title: 'WP Manila Meetup — May 2026 (10th Year)',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80',
    price: '₱350',
    date: 'Sat, May 23 · 1:00 PM PHT',
    host: 'WordPress Manila Meetup',
    attendees: 98,
  },
  {
    id: 'e4',
    title: 'Writing for your Mental Health: Poetry 101',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sun, May 17 · 1:00 PM PHT',
    host: 'Meetup Philippines',
    attendees: 3,
  },
  {
    id: 'e5',
    title: 'IN PERSON: StarRocks × Apache Kafka — Real-Time Analytics',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Thu, May 28 · 6:30 PM PHT',
    host: 'Manila Apache Kafka Meetup',
    attendees: 15,
  },
  {
    id: 'e6',
    title: '20s & 30s Global Hangout & Activities in Manila',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sat, May 23 · 7:30 PM PHT',
    host: 'Manila Hangout & Activities',
    attendees: 8,
  },
  {
    id: 'e7',
    title: 'Late Set — Rooftop Jazz Night in BGC',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
    price: '₱500',
    date: 'Sun, May 24 · 9:00 PM PHT',
    host: 'Northbeat Sessions',
    attendees: 42,
  },
  {
    id: 'e8',
    title: 'Think Responsibly — Lectures in Bars',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    price: 'Free',
    date: 'Sat, May 23 · 6:30 PM PHT',
    host: 'Think Responsibly',
    attendees: 12,
  },
];
