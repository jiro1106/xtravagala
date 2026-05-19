import { motion } from 'framer-motion';
import { HostCard } from '@/components/ui/HostCard';
import { hostFeatures } from '@/data/hostFeatures';

const fanConfig = [
  { rotation: -4, zIndex: 1, marginRight: -22 },
  { rotation: -1.5, zIndex: 2, marginRight: -22 },
  { rotation: 0, zIndex: 3, marginRight: -22 },
  { rotation: 1.5, zIndex: 2, marginRight: -22 },
  { rotation: 4, zIndex: 1, marginRight: 0 },
];

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="section-py"
      style={{
        background: 'var(--experience-bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="wrap">
        {/* Centered intro */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{
            maxWidth: 640,
            margin: '0 auto 24px',
            textAlign: 'center',
          }}
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
            For event hosts
          </h2>
          <p
            style={{
              color: 'var(--text-mute)',
              fontSize: 16,
              marginTop: 10,
              lineHeight: 1.6,
            }}
          >
            Everything you need to plan, run, and grow your events — in one place.
          </p>
        </motion.div>

        {/* Host cards fan */}
        <>
          <style>{`
            .host-fan {
              display: flex;
              justify-content: center;
              align-items: flex-end;
              padding: 40px 0 80px;
              position: relative;
            }
            @media (max-width: 1100px) {
              .host-fan {
                flex-wrap: wrap;
                gap: 18px;
                padding-bottom: 40px;
              }
            }
          `}</style>
          <motion.div
            className="host-fan"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          >
            {hostFeatures.map((feature, i) => (
              <HostCard
                key={feature.id}
                feature={feature}
                rotation={fanConfig[i].rotation}
                zIndex={fanConfig[i].zIndex}
                marginRight={fanConfig[i].marginRight}
              />
            ))}
          </motion.div>
        </>
      </div>
    </section>
  );
}
