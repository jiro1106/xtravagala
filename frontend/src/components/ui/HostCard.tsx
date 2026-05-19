import { motion } from 'framer-motion';
import type { HostFeature } from '@/data/hostFeatures';

interface HostCardProps {
  feature: HostFeature;
  rotation: number;
  zIndex: number;
  marginRight?: number;
}

const colorMap: Record<HostFeature['colorVariant'], string> = {
  'teal-deep': 'var(--primary-deep)',
  slate: '#34393c',
  cream: '#d8d3c5',
  teal: 'var(--primary)',
};

// svgContent is sourced exclusively from static data files in @/data/ and is never user-supplied.
// It contains only safe SVG path/shape elements (no scripts, no event handlers, no external refs).
export function HostCard({ feature, rotation, zIndex, marginRight }: HostCardProps) {
  const isCream = feature.colorVariant === 'cream';
  const nameColor = isCream ? '#2a2e30' : 'rgba(255,255,255,0.95)';

  return (
    <motion.article
      initial={{ rotate: rotation, y: rotation > 0 ? 8 : rotation < 0 ? 8 : -14, zIndex }}
      whileHover={{ rotate: 0, y: -16, zIndex: 10 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{
        width: 200,
        height: 320,
        borderRadius: 18,
        backgroundColor: colorMap[feature.colorVariant],
        boxShadow: '0 24px 56px -12px rgba(0,0,0,0.32)',
        marginRight: marginRight ?? 0,
        position: 'relative',
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          padding: '14px',
          paddingBottom: 22,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Illustration area */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 12,
            flex: 1,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            overflow: 'hidden',
          }}
        >
          <svg
            viewBox="0 0 120 100"
            style={{ width: '100%', height: '100%', maxHeight: 140 }}
            dangerouslySetInnerHTML={{ __html: feature.svgContent }}
            aria-hidden="true"
          />
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 24,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: nameColor,
            marginTop: 'auto',
            paddingLeft: 4,
            paddingRight: 4,
          }}
        >
          {feature.name}
        </div>
      </div>
    </motion.article>
  );
}
