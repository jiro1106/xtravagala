import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '@/data/events';

interface EventCardProps {
  event: Event;
  delay?: number;
}

const AVATAR_COUNT = 3;

export function EventCard({ event, delay = 0 }: EventCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'var(--bg)' : 'transparent',
        borderColor: hovered ? 'var(--border)' : 'transparent',
        boxShadow: hovered
          ? '0 8px 32px -8px rgba(0,0,0,0.12)'
          : '0 0 0 transparent',
        borderWidth: 1,
        borderStyle: 'solid',
        transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
      }}
      className="rounded-[22px] p-3 cursor-pointer"
    >
      {/* Media */}
      <div
        className="relative overflow-hidden rounded-[14px]"
        style={{ aspectRatio: '16/10' }}
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
        <span className="absolute top-3 left-3 bg-white text-xs font-semibold rounded-pill px-3 py-1 text-[var(--text)]">
          {event.price}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1 pt-3 px-1">
        <h3
          className="text-[18px] font-semibold leading-tight -tracking-[0.014em] line-clamp-2 text-[var(--text)]"
        >
          {event.title}
        </h3>

        <div className="text-[14px] text-[var(--primary)] font-medium mt-1.5">
          {event.date}
        </div>

        <div className="text-[14px] text-[var(--text-mute)]">
          {event.host}
        </div>

        {/* Footer: avatars + count */}
        <div className="flex items-center gap-2.5 mt-2">
          <div className="flex">
            {Array.from({ length: Math.min(AVATAR_COUNT, event.attendees) }).map(
              (_, i) => (
                <div
                  key={i}
                  className="w-[22px] h-[22px] rounded-full border-2 border-[var(--bg)] bg-[var(--muted)]"
                  style={{ marginLeft: i === 0 ? 0 : -8 }}
                />
              )
            )}
          </div>
          <span className="text-[12.5px] text-[var(--text-mute)]">
            {event.attendees} going
          </span>
        </div>
      </div>
    </motion.article>
  );
}
