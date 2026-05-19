export interface City {
  id: string;
  name: string;
  image: string;
  eventCount: number;
  soldOut?: number;
  large?: boolean;
}

export const cities: City[] = [
  {
    id: 'manila',
    name: 'Manila',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80',
    eventCount: 1284,
    soldOut: 38,
    large: true,
  },
  {
    id: 'bgc',
    name: 'Bonifacio Global City',
    image: 'https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?auto=format&fit=crop&w=1200&q=80',
    eventCount: 612,
  },
  {
    id: 'makati',
    name: 'Makati City',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80',
    eventCount: 486,
  },
  {
    id: 'cebu',
    name: 'Cebu City',
    image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1200&q=80',
    eventCount: 312,
  },
];
