import { motion } from 'framer-motion';
import { DestinationCard } from '@/components/ui/DestinationCard';
import { cities } from '@/data/cities';

export function DestinationsSection() {
  return (
    <section
      id="destinations"
      className="section-py"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="wrap">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{ marginBottom: 32 }}
        >
          <h2
            style={{
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: 'var(--text)',
              lineHeight: 1.15,
            }}
          >
            Browse by city
          </h2>
          <p
            style={{
              color: 'var(--text-mute)',
              fontSize: 16,
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            Find events in the top cities across the Philippines.
          </p>
        </motion.div>

        {/* Destinations grid */}
        <>
          <style>{`
            .destinations-grid {
              display: grid;
              grid-template-columns: 1.5fr 1fr;
              grid-template-rows: repeat(3, 1fr);
              gap: 14px;
              height: 520px;
            }
            .destinations-grid .city-large {
              grid-row: span 3;
            }
            @media (max-width: 1100px) {
              .destinations-grid {
                grid-template-columns: 1fr;
                grid-template-rows: auto;
                height: auto;
              }
              .destinations-grid .city-large {
                grid-row: span 1;
                height: 320px;
              }
              .destinations-grid .city-regular {
                height: 240px;
              }
            }
          `}</style>
          <motion.div
            className="destinations-grid"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          >
            {cities.map((city, index) => (
              <motion.div
                key={city.id}
                className={city.large ? 'city-large' : 'city-regular'}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.65,
                  ease: [0.23, 1, 0.32, 1],
                  delay: 0.1 + index * 0.08,
                }}
                style={{ height: '100%' }}
              >
                <DestinationCard city={city} />
              </motion.div>
            ))}
          </motion.div>
        </>

        {/* View more cities pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
            whileHover={{
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              y: -1,
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 22px',
              borderRadius: 100,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 14.5,
              fontWeight: 500,
              letterSpacing: '-0.005em',
              textDecoration: 'none',
              transition: 'border-color 0.25s, color 0.25s',
            }}
          >
            View more cities →
          </motion.a>
        </div>
      </div>
    </section>
  );
}
