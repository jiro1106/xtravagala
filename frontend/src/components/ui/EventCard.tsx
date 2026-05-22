import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Event } from '@/data/events';

interface EventCardProps {
  event: Event;
  delay?: number;
}

const AVATAR_COUNT = 3;

const CATEGORY_LABELS: Record<string, string> = {
  hobbies: 'Hobbies',
  workshops: 'Workshop',
  business: 'Business',
  nightlife: 'Nightlife',
  music: 'Music',
  food: 'Food & Drink',
  outdoors: 'Outdoors',
};

function cityLabel(city: string): string {
  if (city === 'bgc') return 'BGC';
  return city.charAt(0).toUpperCase() + city.slice(1);
}

export function EventCard({ event, delay = 0 }: EventCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          border: `1px solid ${hovered ? 'rgba(0,0,0,0.09)' : 'var(--border)'}`,
          boxShadow: hovered
            ? '0 12px 40px -8px rgba(0,0,0,0.13)'
            : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.25s',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        className="rounded-[22px] p-3 cursor-pointer"
      >
        {/* Media */}
        <div className="relative overflow-hidden rounded-[14px]" style={{ aspectRatio: '16/10' }}>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            style={{
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
          {/* Price */}
          <span
            className="absolute top-3 left-3 rounded-pill px-3 py-1 text-[12px] font-semibold"
            style={{
              background: 'rgba(255,255,255,0.90)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: 'var(--text)',
            }}
          >
            {event.price}
          </span>
          {/* Category */}
          <span
            className="absolute bottom-3 right-3 rounded-pill px-2.5 py-[5px] text-[11px] font-medium tracking-[0.02em]"
            style={{
              background: 'rgba(0,0,0,0.46)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: 'rgba(255,255,255,0.93)',
            }}
          >
            {CATEGORY_LABELS[event.category] ?? event.category}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col pt-3 px-1" style={{ flexGrow: 1 }}>
          <h3 className="text-[17px] font-semibold leading-snug -tracking-[0.016em] line-clamp-2 text-[var(--text)]">
            {event.title}
          </h3>

          {/* Date */}
          <div className="flex items-center gap-1.5 mt-4" style={{ color: 'var(--primary)' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2.5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M1 6.5h12" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            <span className="text-[13px] font-medium">{event.date}</span>
          </div>

          {/* Host · City */}
          <p className="text-[13px] text-[var(--text-mute)] mt-1.5 truncate">
            {event.host}
            <span className="mx-1.5" style={{ color: 'var(--border)' }}>·</span>
            {cityLabel(event.city)}
          </p>

          {/* Footer — pushed to bottom via flexGrow on parent */}
          <div
            className="flex items-center gap-2 mt-auto pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
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
        </div>
      </motion.article>
    </Link>
  );
}
