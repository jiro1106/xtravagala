import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCities } from '@/hooks/useCities';

interface EventsCityBannerProps {
  count: number;
}

export function EventsCityBanner({ count }: EventsCityBannerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityId = searchParams.get('city') ?? '';
  const { data: cities } = useCities();
  const city = cities.find((c) => c.id === cityId);

  function clearCity() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('city');
        return next;
      },
      { replace: true }
    );
  }

  if (!city) return null;

  return (
    <motion.section
      role="status"
      aria-label="Active city filter"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#1a1a1a',
        backgroundImage: `url(${city.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="wrap events-city-banner-row"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          paddingTop: 28,
          paddingBottom: 28,
          color: '#fff',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 6,
            }}
          >
            Now showing
          </div>
          <h2
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 'clamp(24px, 2.6vw, 32px)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
            }}
          >
            Events in{' '}
            <span
              className="font-serif-accent italic"
              style={{
                fontWeight: 400,
                fontSize: 'clamp(30px, 3.2vw, 40px)',
                letterSpacing: '-0.018em',
              }}
            >
              {city.name}
            </span>
          </h2>
        </div>

        <div
          className="events-city-banner-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap',
            }}
          >
            {count.toLocaleString()} {count === 1 ? 'event' : 'events'}
          </span>
          <motion.button
            onClick={clearCity}
            aria-label="Clear city filter"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0)',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.18s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'rgba(255,255,255,0)';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        </div>
      </div>

      <style>{`
        .events-city-banner-row {
          flex-direction: row;
        }
        @media (max-width: 640px) {
          .events-city-banner-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .events-city-banner-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </motion.section>
  );
}
