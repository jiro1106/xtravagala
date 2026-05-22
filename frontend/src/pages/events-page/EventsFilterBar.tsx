import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories } from '@/data/categories';
import { cities } from '@/data/cities';

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0, color: 'var(--text-mute)' }}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  padding: '9px 32px 9px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: `var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a6f72' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center`,
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--text)',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color 0.18s',
  whiteSpace: 'nowrap',
};

export function EventsFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const cityParam = searchParams.get('city') ?? '';
  const categoryParam = searchParams.get('category') ?? '';
  const sortParam = searchParams.get('sort') ?? '';

  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hasFilters = !!(q || cityParam || categoryParam || sortParam);

  function setParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  }

  function toggleCategory(id: string) {
    setParam('category', categoryParam === id ? '' : id);
  }

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParam('q', inputValue);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [inputValue]);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  return (
    <div
      style={{
        position: 'sticky',
        top: 'var(--header-h, 61px)',
        zIndex: 50,
        background: '#fff',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="wrap"
        style={{ paddingTop: 12, paddingBottom: 12 }}
      >
        {/* Row 1: Search + dropdowns + clear */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Search input */}
          <div
            style={{
              flex: 1,
              minWidth: 200,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '9px 12px',
              transition: 'border-color 0.18s',
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
            }}
          >
            <SearchIcon />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search events or hosts..."
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: 14,
                color: 'var(--text)',
                minWidth: 0,
              }}
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue('');
                  setParam('q', '');
                }}
                aria-label="Clear search"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-mute)',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* City */}
          <select
            value={cityParam}
            onChange={(e) => setParam('city', e.target.value)}
            style={selectStyle}
            aria-label="Filter by city"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortParam}
            onChange={(e) => setParam('sort', e.target.value)}
            style={selectStyle}
            aria-label="Sort events"
          >
            <option value="">Date: soonest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="popularity">Most popular</option>
          </select>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearchParams({}, { replace: true });
                setInputValue('');
              }}
              style={{
                border: '1px solid var(--border)',
                background: 'none',
                borderRadius: 10,
                padding: '9px 14px',
                fontSize: 13.5,
                fontWeight: 500,
                color: 'var(--text-mute)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.18s, border-color 0.18s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-mute)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              }}
            >
              Clear all ×
            </button>
          )}
        </div>

        {/* Row 2: Category chips */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            marginTop: 10,
            paddingBottom: 2,
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((cat) => {
            const active = categoryParam === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  flexShrink: 0,
                  padding: '5px 14px',
                  borderRadius: 100,
                  fontSize: 13.5,
                  fontWeight: 500,
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'background-color 0.18s, border-color 0.18s, color 0.18s',
                  letterSpacing: '-0.005em',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
