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
  // legacy aliases consumed by existing components
  image: string;
  soldOut: boolean;
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
  const startIso = row.start_at ?? new Date().toISOString();
  const startAt = new Date(startIso);
  const pricePhp = Number(row.price_php ?? 0);
  const attendees = Number(row.attendee_count ?? 0);
  const capacity = row.capacity ?? null;
  const schedule = Array.isArray(row.schedule)
    ? (row.schedule as Array<{ time: string; label: string }>)
    : [];
  const cityId = row.city_id ?? '';
  const categoryId = row.category_id ?? '';

  return {
    id: row.id ?? '',
    slug: row.slug ?? '',
    title: row.title ?? '',
    description: row.description,
    image: row.cover_image_url ?? PLACEHOLDER_IMAGE,
    cityId,
    categoryId,
    cityName: city.name ?? cityId,
    categoryLabel: category.label ?? categoryId,
    host: host.host_name ?? host.full_name ?? 'XtravaGala host',
    hostId: host.id ?? '',
    hostBio: host.host_bio,
    startAt,
    date: formatEventDateTime(startIso),
    pricePhp,
    price: formatPrice(pricePhp),
    capacity,
    attendees,
    isFull: capacity !== null && attendees >= capacity,
    venue: row.venue,
    address: row.address,
    schedule,
    city: cityId,
    category: categoryId,
  };
}

export function toCityVM(row: CityRow): CityVM {
  const imageUrl = row.image_url ?? '';
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    imageUrl,
    sortOrder: row.sort_order ?? 0,
    eventCount: Number(row.event_count ?? 0),
    image: imageUrl,
    soldOut: false,
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
