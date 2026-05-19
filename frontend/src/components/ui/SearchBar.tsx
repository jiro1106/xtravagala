import { useState } from 'react';
import { motion } from 'framer-motion';

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      cx="7"
      cy="7"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
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

export function SearchBar() {
  const [focused, setFocused] = useState(false);

  return (
    <motion.form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center bg-[var(--bg)] border rounded-pill px-1.5 py-1 max-w-[620px] mx-auto"
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
          placeholder="Search events, hosts, venues"
          className="border-none outline-none bg-transparent font-medium text-[14px] text-[var(--text)] w-full placeholder:text-[var(--text-mute)] placeholder:font-normal"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </label>

      {/* Divider */}
      <span
        className="w-px h-5 bg-[var(--border)] flex-shrink-0"
        aria-hidden="true"
      />

      {/* Location field — hidden below 720px */}
      <label
        className="hidden items-center gap-2.5 px-3.5 py-2 w-[200px] flex-shrink-0 cursor-text"
        style={{ display: 'none' }}
        id="location-label"
      >
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

      {/* Location field visible >= 720px */}
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
  );
}
