export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  org: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: 'A simple, reliable way to run our events.',
    author: 'Adaeze O.',
    org: 'Northbeat Sessions',
  },
  {
    id: 't2',
    quote: 'Setup took an afternoon. We sold out our first three shows.',
    author: 'Miguel R.',
    org: 'Hush Hours Manila',
  },
  {
    id: 't3',
    quote: "It's the calmest event tool I've used in fifteen years of doing this.",
    author: 'Daniela K.',
    org: 'FRAME×FRAME',
  },
];
