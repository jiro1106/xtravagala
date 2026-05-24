import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useCities } from '@/hooks/useCities';
import type { EventVM } from '@/types/api';

const ease = [0.23, 1, 0.32, 1] as const;

function filterEvents(events: EventVM[], query: string): EventVM[] {
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
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const PinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const GpsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function ResultRow({
  event,
  active,
  onSelect,
}: {
  event: EventVM;
  active: boolean;
  onSelect: () => void;
}) {
  const cityLabel = event.cityName || event.city;
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
        (e.currentTarget as HTMLDivElement).style.background = active ? 'var(--surface)' : 'transparent';
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          {event.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 2, lineHeight: 1.35 }}>
          {event.date} · {cityLabel}
        </div>
        <div style={{ fontSize: 11.5, marginTop: 1, fontWeight: 500, color: isFree ? 'var(--primary)' : 'var(--text-mute)' }}>
          {event.price}
        </div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: 'var(--muted)' }}>
        <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
    </div>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);

  const [locationQuery, setLocationQuery] = useState('Manila, PH');
  const [selectedCityId, setSelectedCityId] = useState<string | null>('manila');
  const [isNearby, setIsNearby] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const [geoLoading, setGeoLoading] = useState(false);

  const navigate = useNavigate();
  const { data: allEvents } = useEvents();
  const { data: cities } = useCities();

  const searchResults = filterEvents(allEvents, query);
  const showSearchDropdown = searchFocused && query.trim().length > 0;

  // Only filter when the user is actively typing (selectedCityId cleared by onChange).
  // When a city is already selected or input is a special value, show all cities.
  const isTypingFilter = locationQuery.trim().length > 0 && !selectedCityId && !isNearby;
  const filteredCities = isTypingFilter
    ? cities.filter((c) => c.name.toLowerCase().includes(locationQuery.toLowerCase()))
    : cities;
  const showLocationDropdown = locationFocused && !showSearchDropdown;

  // activeIndex: 0 = GPS option, 1..n = filteredCities[n-1]
  const locationTotalItems = 1 + filteredCities.length;

  const anyFocused = searchFocused || locationFocused;

  useEffect(() => { setSearchActiveIndex(-1); }, [query]);
  useEffect(() => { setLocationActiveIndex(-1); }, [locationQuery]);

  const handleEventSelect = (id: string) => {
    navigate(`/events/${id}`);
    setSearchFocused(false);
    setQuery('');
  };

  const handleCitySelect = (city: { id: string; name: string }) => {
    setLocationQuery(city.name);
    setSelectedCityId(city.id);
    setIsNearby(false);
    setLocationFocused(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationQuery('Near you');
      setSelectedCityId(null);
      setIsNearby(true);
      setLocationFocused(false);
      return;
    }
    setGeoLoading(true);
    setLocationQuery('Detecting...');
    setLocationFocused(false);
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoLoading(false);
        setLocationQuery('Near you');
        setSelectedCityId(null);
        setIsNearby(true);
      },
      () => {
        setGeoLoading(false);
        setLocationQuery('Manila, PH');
        setSelectedCityId('manila');
        setIsNearby(false);
      },
      { timeout: 8000 },
    );
  };

  const buildSearchUrl = (q: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (isNearby) params.set('nearby', 'true');
    else if (selectedCityId) params.set('city', selectedCityId);
    return `/events${params.size > 0 ? `?${params.toString()}` : ''}`;
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSearchActiveIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSearchActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchActiveIndex >= 0 && searchResults[searchActiveIndex]) {
          handleEventSelect(searchResults[searchActiveIndex].id);
        } else {
          navigate(buildSearchUrl(query));
          setSearchFocused(false);
        }
        break;
      case 'Escape':
        setSearchFocused(false);
        break;
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showLocationDropdown) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setLocationActiveIndex((prev) => Math.min(prev + 1, locationTotalItems - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setLocationActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (locationActiveIndex === 0) {
          handleUseCurrentLocation();
        } else if (locationActiveIndex >= 1 && filteredCities[locationActiveIndex - 1]) {
          handleCitySelect(filteredCities[locationActiveIndex - 1]);
        }
        break;
      case 'Escape':
        setLocationFocused(false);
        break;
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto' }}>
      <motion.form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const url = buildSearchUrl(query);
          if (url !== '/events' || query.trim() || selectedCityId || isNearby) {
            navigate(url);
          }
          setSearchFocused(false);
          setLocationFocused(false);
        }}
        className="flex items-center bg-[var(--bg)] border rounded-pill px-1.5 py-1"
        style={{
          borderColor: anyFocused ? 'var(--primary)' : 'var(--border)',
          boxShadow: anyFocused
            ? '0 4px 24px -8px oklch(55% 0.09 170 / 0.22), 0 4px 18px -14px rgba(0,0,0,0.16)'
            : '0 4px 18px -14px rgba(0,0,0,0.16)',
          transition: 'border-color 0.25s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s cubic-bezier(0.23,1,0.32,1)',
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
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search events, hosts, venues"
            className="border-none outline-none bg-transparent font-medium text-[14px] text-[var(--text)] w-full placeholder:text-[var(--text-mute)] placeholder:font-normal"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showSearchDropdown}
            aria-haspopup="listbox"
          />
        </label>

        {/* Divider */}
        <span className="w-px h-5 bg-[var(--border)] flex-shrink-0" aria-hidden="true" />

        {/* Location field — visible >= 720px */}
        <label className="[@media(max-width:719px)]:hidden flex items-center gap-2.5 px-3.5 py-2 w-[200px] flex-shrink-0 cursor-text">
          <span
            className="flex-shrink-0 transition-colors duration-200"
            style={{ color: geoLoading ? 'var(--primary)' : 'var(--text-mute)' }}
          >
            <PinIcon />
          </span>
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => { setLocationQuery(e.target.value); setSelectedCityId(null); setIsNearby(false); }}
            onFocus={() => setLocationFocused(true)}
            onClick={() => setLocationFocused(true)}
            onBlur={() => setLocationFocused(false)}
            onKeyDown={handleLocationKeyDown}
            placeholder="Location"
            className="border-none outline-none bg-transparent font-medium text-[14px] text-[var(--text)] w-full placeholder:text-[var(--text-mute)] placeholder:font-normal truncate"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showLocationDropdown}
            aria-haspopup="listbox"
          />
        </label>

        {/* Submit button */}
        <motion.button
          type="submit"
          className="w-11 h-11 rounded-full bg-[var(--primary)] text-white grid place-items-center flex-shrink-0"
          whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          aria-label="Search"
        >
          <SearchIcon size={15} />
        </motion.button>
      </motion.form>

      {/* Search results dropdown */}
      <AnimatePresence>
        {showSearchDropdown && (
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
              boxShadow: '0 8px 32px -8px rgba(0,0,0,0.14), 0 2px 8px -4px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {searchResults.length > 0 ? (
              <>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ padding: '4px 14px 6px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Events
                  </div>
                  {searchResults.map((event, i) => (
                    <ResultRow
                      key={event.id}
                      event={event}
                      active={i === searchActiveIndex}
                      onSelect={() => handleEventSelect(event.id)}
                    />
                  ))}
                </div>
                <div
                  onClick={() => { navigate(`/events?q=${encodeURIComponent(query)}`); setSearchFocused(false); }}
                  style={{ padding: '9px 14px', borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <span>See all results for "{query}"</span>
                  <span>→</span>
                </div>
              </>
            ) : (
              <div style={{ padding: '18px 16px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13.5 }}>
                No events found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location dropdown */}
      <AnimatePresence>
        {showLocationDropdown && (
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
              boxShadow: '0 8px 32px -8px rgba(0,0,0,0.14), 0 2px 8px -4px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {/* Use current location */}
            <div
              role="option"
              aria-selected={locationActiveIndex === 0}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUseCurrentLocation}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                cursor: 'pointer',
                background: locationActiveIndex === 0 ? 'var(--surface)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = locationActiveIndex === 0 ? 'var(--surface)' : 'transparent'; }}
            >
              <span style={{ color: 'var(--primary)', flexShrink: 0 }}>
                <GpsIcon />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--primary)' }}>
                Use current location
              </span>
            </div>

            {/* City list */}
            <div style={{ maxHeight: 272, overflowY: 'auto' }}>
              {filteredCities.length > 0 ? (
                <>
                  <div style={{ padding: '8px 14px 4px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Cities
                  </div>
                  {filteredCities.map((city, i) => (
                    <div
                      key={city.id}
                      role="option"
                      aria-selected={locationActiveIndex === i + 1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleCitySelect(city)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        background: locationActiveIndex === i + 1 ? 'var(--surface)' : 'transparent',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = locationActiveIndex === i + 1 ? 'var(--surface)' : 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--text-mute)', flexShrink: 0 }}>
                          <PinIcon size={14} />
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>
                          {city.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                        {city.eventCount.toLocaleString()} events
              </span>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '14px', fontSize: 13, color: 'var(--text-mute)' }}>
                  No cities match "{locationQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
