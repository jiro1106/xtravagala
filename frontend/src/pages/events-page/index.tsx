import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EventCard } from '@/components/ui/EventCard';
import { events } from '@/data/events';
import { EventsFilterBar } from './EventsFilterBar';

function parsePrice(price: string): number {
  if (price === 'Free') return 0;
  return parseInt(price.replace(/[₱,]/g, ''), 10) || 0;
}

export function EventsPage() {
  const [searchParams] = useSearchParams();

  const q = (searchParams.get('q') ?? '').toLowerCase().trim();
  const city = searchParams.get('city') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const filtered = useMemo(() => {
    let result = [...events];

    if (q) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.host.toLowerCase().includes(q)
      );
    }

    if (city) result = result.filter((e) => e.city === city);
    if (category) result = result.filter((e) => e.category === category);

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case 'popularity':
        result.sort((a, b) => b.attendees - a.attendees);
        break;
    }

    return result;
  }, [q, city, category, sort]);

  return (
    <>
      <EventsFilterBar />

      <div className="wrap section-py">
        {/* Results count */}
        <motion.p
          key={filtered.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            color: 'var(--text-mute)',
            fontSize: 14,
            marginBottom: 36,
            fontWeight: 500,
          }}
        >
          {filtered.length === events.length
            ? `${events.length} events`
            : `${filtered.length} of ${events.length} events`}
        </motion.p>

        {filtered.length > 0 ? (
          <>
            <style>{`
              .events-full-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 52px 32px;
              }
              @media (max-width: 1100px) {
                .events-full-grid { grid-template-columns: repeat(2, 1fr); }
              }
              @media (max-width: 640px) {
                .events-full-grid { grid-template-columns: 1fr; }
              }
            `}</style>
            <div className="events-full-grid">
              {filtered.map((event, index) => (
                <EventCard key={event.id} event={event} delay={index * 0.04} />
              ))}
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0 120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--muted)' }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text)',
                letterSpacing: '-0.018em',
              }}
            >
              No events found
            </p>
            <p style={{ color: 'var(--text-mute)', fontSize: 15, maxWidth: '36ch' }}>
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
