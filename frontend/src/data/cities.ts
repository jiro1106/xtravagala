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
    image: 'https://images.unsplash.com/photo-1598258710957-db8614c2881e?auto=format&fit=crop&w=1600&q=80',
    eventCount: 1284,
    soldOut: 38,
    large: true,
  },
  {
    id: 'bgc',
    name: 'Bonifacio Global City',
    image: 'https://images.unsplash.com/photo-1718850114860-58f2a00cf8f5?auto=format&fit=crop&w=1200&q=80',
    eventCount: 612,
  },
  {
    id: 'makati',
    name: 'Makati City',
    image: 'https://images.unsplash.com/photo-1607282729548-e1d13feae36f?auto=format&fit=crop&w=1200&q=80',
    eventCount: 486,
  },
  {
    id: 'cebu',
    name: 'Cebu City',
    image: 'https://images.unsplash.com/photo-1505261476952-32e25cbfc755?auto=format&fit=crop&w=1200&q=80',
    eventCount: 312,
  },
  {
    id: 'davao',
    name: 'Davao City',
    image: 'https://images.unsplash.com/photo-1649177422020-2bbbe0a023c2?auto=format&fit=crop&w=1200&q=80',
    eventCount: 248,
  },
  {
    id: 'quezon',
    name: 'Quezon City',
    image: 'https://images.unsplash.com/photo-1618326889227-8cf3c304ced8?auto=format&fit=crop&w=1200&q=80',
    eventCount: 194,
  },
  {
    id: 'iloilo',
    name: 'Iloilo City',
    image: 'https://images.unsplash.com/photo-1583685133115-90748ccbe274?auto=format&fit=crop&w=1200&q=80',
    eventCount: 156,
  },
  {
    id: 'cdo',
    name: 'Cagayan de Oro',
    image: 'https://images.unsplash.com/photo-1643254181429-19ec3b9db009?auto=format&fit=crop&w=1200&q=80',
    eventCount: 132,
  },
  {
    id: 'baguio',
    name: 'Baguio City',
    image: 'https://images.unsplash.com/photo-1580127252363-1d29a1ff0603?auto=format&fit=crop&w=1200&q=80',
    eventCount: 118,
  },
  {
    id: 'bacolod',
    name: 'Bacolod City',
    image: 'https://images.unsplash.com/photo-1599914195435-d50222bbd2ca?auto=format&fit=crop&w=1200&q=80',
    eventCount: 97,
  },
  {
    id: 'zamboanga',
    name: 'Zamboanga City',
    image: 'https://images.unsplash.com/photo-1710191987214-9d82cd48de77?auto=format&fit=crop&w=1200&q=80',
    eventCount: 74,
  },
  {
    id: 'gensan',
    name: 'General Santos City',
    image: 'https://images.unsplash.com/photo-1519101739220-83f6a14852ca?auto=format&fit=crop&w=1200&q=80',
    eventCount: 58,
  },
];
