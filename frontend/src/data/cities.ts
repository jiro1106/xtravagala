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
  {
    id: 'davao',
    name: 'Davao City',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80',
    eventCount: 248,
  },
  {
    id: 'quezon',
    name: 'Quezon City',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    eventCount: 194,
  },
  {
    id: 'iloilo',
    name: 'Iloilo City',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    eventCount: 156,
  },
  {
    id: 'cdo',
    name: 'Cagayan de Oro',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    eventCount: 132,
  },
  {
    id: 'baguio',
    name: 'Baguio City',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    eventCount: 118,
  },
  {
    id: 'bacolod',
    name: 'Bacolod City',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    eventCount: 97,
  },
  {
    id: 'zamboanga',
    name: 'Zamboanga City',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    eventCount: 74,
  },
  {
    id: 'gensan',
    name: 'General Santos City',
    image: 'https://images.unsplash.com/photo-1474823973866-1898a2fccdd6?auto=format&fit=crop&w=1200&q=80',
    eventCount: 58,
  },
];
