import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion(Link);

interface CategoryItemProps {
  label: string;
  svgContent: string;
  to?: string;
}

// svgContent is sourced exclusively from static data files in @/data/ and is never user-supplied.
// It contains only safe SVG path/shape elements (no scripts, no event handlers, no external refs).
export function CategoryItem({ label, svgContent, to = '/events' }: CategoryItemProps) {
  return (
    <MotionLink
      to={to}
      className="group flex flex-col items-center gap-2.5 px-2 py-3.5 rounded-[22px] cursor-pointer no-underline text-[var(--text)]"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Ring */}
      <motion.span
        className="w-16 h-16 rounded-full bg-[var(--bg)] border border-[var(--border)] grid place-items-center group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] transition-colors duration-250"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          aria-hidden="true"
        />
      </motion.span>

      {/* Label */}
      <span
        className="font-medium text-[14.5px] -tracking-[0.005em] text-center"
        style={{ minHeight: '3.1em', lineHeight: 1.55 }}
      >
        {label}
      </span>
    </MotionLink>
  );
}
