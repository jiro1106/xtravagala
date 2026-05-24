import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EventCard } from '@/components/ui/EventCard';
import { EventCardSkeleton } from '@/components/ui/EventCardSkeleton';
import { LoadError } from '@/components/ui/LoadError';
import { useEvents } from '@/hooks/useEvents';
import { EventsFilterBar } from './EventsFilterBar';
import { EventsCityBanner } from './EventsCityBanner';

export function EventsPage() {
  const [searchParams] = useSearchParams();

  const qRaw = (searchParams.get('q') ?? '').trim();
  const city = searchParams.get('city') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const { data: events, loading, error, refetch } = useEvents({
    city: city || undefined,
    category: category || undefined,
    q: qRaw || undefined,
  });

  const filtered = useMemo(() => {
    const result = [...events];
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

  return (
    <>
      <EventsFilterBar />

      <EventsCityBanner count={filtered.length} />

      <div className="wrap section-py">
        {/* "Results for <query>" label — shown when a search query is active */}
        {qRaw && (
          <motion.p
            key={`results-${qRaw}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.36, 1] }}
            style={{
              margin: 0,
              marginBottom: !city ? 10 : 36,
              fontSize: 'clamp(20px, 2.2vw, 26px)',
              fontWeight: 600,
              letterSpacing: '-0.022em',
              color: 'var(--text)',
              lineHeight: 1.2,
            }}
          >
            Results for{' '}
            <span style={{ color: 'var(--primary)' }}>"{qRaw}"</span>
          </motion.p>
        )}

        {/* Results count — hidden when a city filter is active (banner shows the count instead) */}
        {!city && (
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
            {filtered.length} events
          </motion.p>
        )}

        {error && (
          <div style={{ marginBottom: 24 }}>
            <LoadError message={error} onRetry={() => void refetch()} />
          </div>
        )}

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
        {loading ? (
          <div className="events-full-grid" style={city && !qRaw ? { marginTop: 36 } : undefined}>
            {[0, 1, 2, 3, 4, 5].map((i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="events-full-grid" style={city && !qRaw ? { marginTop: 36 } : undefined}>
            {filtered.map((event, index) => (
              <EventCard key={event.id} event={event} delay={index * 0.04} />
            ))}
          </div>
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
