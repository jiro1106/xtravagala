import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { events, type Event } from '@/data/events';

const ease = [0.23, 1, 0.32, 1] as const;

const CITY_LABELS: Record<string, string> = {
  manila: 'Manila',
  bgc: 'BGC',
  makati: 'Makati',
  cebu: 'Cebu',
  davao: 'Davao',
  baguio: 'Baguio',
  iloilo: 'Iloilo',
};

function filterEvents(query: string): Event[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return events
    .filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q) ||
        (e.venue?.toLowerCase().includes(q) ?? false),
    )
    .slice(0, 5);
}

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M10.5 10.5L13.5 13.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

function ResultRow({
  event,
  active,
  onSelect,
}: {
  event: Event;
  active: boolean;
  onSelect: () => void;
}) {
  const cityLabel = CITY_LABELS[event.city] ?? event.city;
  const isFree = event.price === 'Free';

  return (
    <div
      role="option"
      aria-selected={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 14px',
        cursor: 'pointer',
        background: active ? 'var(--surface)' : 'transparent',
        transition: 'background 0.12s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = active
          ? 'var(--surface)'
          : 'transparent';
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}
        >
          {event.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-mute)',
            marginTop: 2,
            lineHeight: 1.35,
          }}
        >
          {event.date} · {cityLabel}
        </div>
        <div
          style={{
            fontSize: 11.5,
            marginTop: 1,
            fontWeight: 500,
            color: isFree ? 'var(--primary)' : 'var(--text-mute)',
          }}
        >
          {event.price}
        </div>
      </div>

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          flexShrink: 0,
          overflow: 'hidden',
          background: 'var(--muted)',
        }}
      >
        <img
          src={event.image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();

  const results = filterEvents(query);
  const showDropdown = focused && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const handleSelect = (id: string) => {
    navigate(`/events/${id}`);
    setFocused(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex].id);
        } else {
          navigate(`/events?q=${encodeURIComponent(query)}`);
          setFocused(false);
        }
        break;
      case 'Escape':
        setFocused(false);
        break;
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto' }}>
      <motion.form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            navigate(`/events?q=${encodeURIComponent(query)}`);
            setFocused(false);
          }
        }}
        className="flex items-center bg-[var(--bg)] border rounded-pill px-1.5 py-1"
        style={{
          borderColor: focused ? 'var(--primary)' : 'var(--border)',
          boxShadow: focused
            ? '0 4px 24px -8px oklch(55% 0.09 170 / 0.22), 0 4px 18px -14px rgba(0,0,0,0.16)'
            : '0 4px 18px -14px rgba(0,0,0,0.16)',
          transition:
            'border-color 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s cubic-bezier(0.23,1,0.32,1)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Search field */}
        <label className="flex items-center gap-2.5 px-3.5 py-2 flex-1 min-w-0 cursor-text">
          <span className="text-[var(--text-mute)] flex-shrink-0">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search events, hosts, venues"
            className="border-none outline-none bg-transparent font-medium text-[14px] text-[var(--text)] w-full placeholder:text-[var(--text-mute)] placeholder:font-normal"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          />
        </label>

        {/* Divider */}
        <span
          className="w-px h-5 bg-[var(--border)] flex-shrink-0"
          aria-hidden="true"
        />

        {/* Location field — visible >= 720px */}
        <label className="[@media(max-width:719px)]:hidden flex items-center gap-2.5 px-3.5 py-2 w-[200px] flex-shrink-0 cursor-text">
          <span className="text-[var(--text-mute)] flex-shrink-0">
            <PinIcon />
          </span>
          <input
            type="text"
            defaultValue="Manila, PH"
            placeholder="Location"
            className="border-none outline-none bg-transparent font-medium text-[14px] text-[var(--text)] w-full placeholder:text-[var(--text-mute)] placeholder:font-normal"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </label>

        {/* Submit button */}
        <motion.button
          type="submit"
          className="w-9 h-9 rounded-full bg-[var(--primary)] text-white grid place-items-center flex-shrink-0"
          whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          aria-label="Search"
        >
          <SearchIcon size={15} />
        </motion.button>
      </motion.form>

      {/* Results dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 16,
              boxShadow:
                '0 8px 32px -8px rgba(0,0,0,0.14), 0 2px 8px -4px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {results.length > 0 ? (
              <>
                <div style={{ paddingTop: 6 }}>
                  <div
                    style={{
                      padding: '4px 14px 6px',
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: 'var(--text-mute)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Events
                  </div>
                  {results.map((event, i) => (
                    <ResultRow
                      key={event.id}
                      event={event}
                      active={i === activeIndex}
                      onSelect={() => handleSelect(event.id)}
                    />
                  ))}
                </div>

                <div
                  onClick={() => {
                    navigate(`/events?q=${encodeURIComponent(query)}`);
                    setFocused(false);
                  }}
                  style={{
                    padding: '9px 14px',
                    borderTop: '1px solid var(--border)',
                    fontSize: 13,
                    color: 'var(--primary)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'var(--surface)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'transparent';
                  }}
                >
                  <span>See all results for "{query}"</span>
                  <span>→</span>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: '18px 16px',
                  textAlign: 'center',
                  color: 'var(--text-mute)',
                  fontSize: 13.5,
                }}
              >
                No events found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
