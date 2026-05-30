import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { CityVM } from '@/types/api';

interface DestinationCardProps {
  city: CityVM;
  to?: string;
}

const EASE = [0.23, 1, 0.32, 1] as const;

const containerVariants = {
  rest: {},
  hover: {},
};

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08 },
};

const deepOverlayVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

const infoBarVariants = {
  rest: { y: 0 },
  hover: { y: -5 },
};

const arrowVariants = {
  rest: {
    x: 0,
    y: 0,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  hover: {
    x: 5,
    y: -5,
    backgroundColor: 'var(--primary)',
    borderColor: 'rgba(255,255,255,0)',
  },
};

export function DestinationCard({ city, to }: DestinationCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-card-lg cursor-pointer isolate"
      style={{ height: '100%', width: '100%' }}
      variants={containerVariants}
      initial="rest"
      whileHover="hover"
    >
      {to && (
        <Link
          to={to}
          aria-label={`${city.name} — ${city.eventCount.toLocaleString()} events`}
          className="absolute inset-0 z-20"
          style={{ display: 'block' }}
        />
      )}

      {/* Image — slowest layer, "world breathes open" */}
      <motion.img
        src={city.image}
        alt={city.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ willChange: 'transform' }}
        variants={imageVariants}
        transition={{ duration: 0.65, ease: EASE }}
      />

      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 30%, rgba(20,24,26,0.80) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Deep gradient — fades in on hover to sharpen text contrast */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 18%, rgba(14,18,20,0.96) 100%)',
        }}
        variants={deepOverlayVariants}
        transition={{ duration: 0.45, ease: EASE }}
        aria-hidden="true"
      />

      {/* Info bar — rises toward the user */}
      <motion.div
        className="absolute bottom-5 left-[22px] right-[22px] flex items-end justify-between z-10"
        variants={infoBarVariants}
        transition={{ duration: 0.38, ease: EASE }}
      >
        <div>
          <div
            className="text-white font-semibold -tracking-[0.022em]"
            style={{ fontSize: 'clamp(20px, 1.9vw, 26px)' }}
          >
            {city.name}
          </div>
          <div className="text-white/70 text-[13.5px] mt-2">
            {city.eventCount.toLocaleString()} events
            {city.soldOut ? ` · ${city.soldOut} sold out` : ''}
          </div>
        </div>

        {/* Arrow — snappiest, direct feedback */}
        <motion.span
          className="w-10 h-10 rounded-full border grid place-items-center flex-shrink-0"
          variants={arrowVariants}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 12L12 4M12 4H6M12 4V10"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
