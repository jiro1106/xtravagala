import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { City } from '@/data/cities';

interface DestinationCardProps {
  city: City;
  to?: string;
}

const containerVariants = {
  rest: {},
  hover: {},
};

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

const arrowVariants = {
  rest: { x: 0, y: 0, backgroundColor: 'rgba(255,255,255,0.18)' },
  hover: { x: 4, y: -4, backgroundColor: 'var(--primary)' },
};

export function DestinationCard({ city, to }: DestinationCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-card-lg cursor-pointer isolate"
      style={{ height: '100%', width: '100%' }}
      variants={containerVariants}
      initial="rest"
      whileHover="hover"
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
    >
      {to && (
        <Link
          to={to}
          aria-label={`${city.name} — ${city.eventCount.toLocaleString()} events`}
          className="absolute inset-0 z-20"
          style={{ display: 'block' }}
        />
      )}
      {/* Image */}
      <motion.img
        src={city.image}
        alt={city.name}
        className="absolute inset-0 w-full h-full object-cover"
        variants={imageVariants}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 35%, rgba(20,24,26,0.82) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Info bar */}
      <div className="absolute bottom-5 left-[22px] right-[22px] flex items-end justify-between z-10">
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

        {/* Arrow */}
        <motion.span
          className="w-10 h-10 rounded-full border border-white/35 grid place-items-center flex-shrink-0"
          variants={arrowVariants}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
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
      </div>
    </motion.div>
  );
}
