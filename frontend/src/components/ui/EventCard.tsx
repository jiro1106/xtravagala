import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { EventVM } from '@/types/api';

interface EventCardProps {
  event: EventVM;
  delay?: number;
}

const AVATAR_COUNT = 3;

export function EventCard({ event, delay = 0 }: EventCardProps) {
  const [hovered, setHovered] = useState(false);
  const isFree = event.price === 'Free';

  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay }}
        whileHover={{ y: -4 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: 'var(--bg)',
          border: `1px solid ${hovered ? 'rgba(0,0,0,0.08)' : 'var(--border)'}`,
          boxShadow: hovered
            ? '0 16px 44px -10px rgba(0,0,0,0.14)'
            : '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'border-color 0.2s, box-shadow 0.25s',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
        className="rounded-[22px] cursor-pointer"
      >
        {/* Media — edge-to-edge */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? 'scale(1.045)' : 'scale(1)',
              transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
        </div>

        {/* Body */}
        <div className="flex flex-col px-5 pt-4 pb-5" style={{ flexGrow: 1 }}>
          {/* Title */}
          <h3
            className="text-[17px] font-semibold leading-[1.3] -tracking-[0.016em] line-clamp-2 text-[var(--text)]"
          >
            {event.title}
          </h3>

          {/* Date / time with pipe divider */}
          <div className="flex items-center mt-2.5" style={{ gap: 0 }}>
            {event.date.split(' · ').map((part, i, arr) => (
              <span key={i} className="flex items-center">
                <span className="text-[12.5px] text-[var(--text-mute)] leading-none">{part}</span>
                {i < arr.length - 1 && (
                  <span className="mx-2 leading-none select-none" style={{ color: 'var(--border)', fontSize: 12 }}>|</span>
                )}
              </span>
            ))}
          </div>

          {/* Footer — attendees left, price pill right */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: Math.min(AVATAR_COUNT, event.attendees) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[20px] h-[20px] rounded-full bg-[var(--muted)]"
                    style={{
                      marginLeft: i === 0 ? 0 : -7,
                      border: '1.5px solid var(--bg)',
                    }}
                  />
                ))}
              </div>
              <span className="text-[12px] text-[var(--text-mute)]">
                {event.attendees.toLocaleString()} going
              </span>
            </div>
            <span
              style={{
                backgroundColor: isFree ? 'oklch(15% 0.012 170)' : 'var(--primary)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.01em',
                borderRadius: 6,
                padding: '3px 9px',
                flexShrink: 0,
                lineHeight: 1.5,
              }}
            >
              {event.price}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
