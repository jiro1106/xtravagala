import { motion } from 'framer-motion';
import { DestinationCard } from '@/components/ui/DestinationCard';
import { cities } from '@/data/cities';

const totalEvents = cities.reduce((sum, c) => sum + c.eventCount, 0);

export function DestinationsPage() {
  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Page header */}
      <div
        className="wrap"
        style={{
          paddingTop: 64,
          paddingBottom: 48,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: 'var(--text)',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Explore destinations
          </h1>
          <p style={{ color: 'var(--text-mute)', fontSize: 16, lineHeight: 1.5 }}>
            {totalEvents.toLocaleString()} events across {cities.length} cities in the Philippines.
          </p>
        </motion.div>
      </div>

      {/* City grid */}
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 100 }}>
        <>
          <style>{`
            .destinations-full-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 14px;
            }
            .destinations-full-grid .city-card {
              height: 280px;
            }
            @media (max-width: 1100px) {
              .destinations-full-grid {
                grid-template-columns: repeat(3, 1fr);
              }
            }
            @media (max-width: 760px) {
              .destinations-full-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            @media (max-width: 480px) {
              .destinations-full-grid {
                grid-template-columns: 1fr;
              }
              .destinations-full-grid .city-card {
                height: 220px;
              }
            }
          `}</style>
          <div className="destinations-full-grid">
            {cities.map((city, index) => (
              <motion.div
                key={city.id}
                className="city-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.23, 1, 0.32, 1],
                  delay: index * 0.04,
                }}
              >
                <DestinationCard
                  city={city}
                  to={`/events?city=${city.id}`}
                />
              </motion.div>
            ))}
          </div>
        </>
      </div>
    </div>
  );
}
