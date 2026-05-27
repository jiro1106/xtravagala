import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

interface EventsCategoryBannerProps {
  count: number;
  showCount?: boolean;
}

export function EventsCategoryBanner({ count, showCount = true }: EventsCategoryBannerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category') ?? '';
  const { data: categories } = useCategories();
  const category = categories.find((c) => c.id === categoryId);

  function clearCategory() {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('category');
        return next;
      },
      { replace: true }
    );
  }

  if (!category) return null;

  return (
    <motion.section
      role="status"
      aria-label="Active category filter"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.36, 1] }}
      style={{
        background: 'oklch(96% 0.018 170)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="wrap"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          paddingTop: 18,
          paddingBottom: 18,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 'clamp(20px, 2vw, 26px)',
            letterSpacing: '-0.022em',
            color: 'var(--text)',
            lineHeight: 1.2,
          }}
        >
          {category.label}
        </h2>
        {showCount && (
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: 'var(--text-mute)',
            }}
          >
            {count.toLocaleString()} {count === 1 ? 'event' : 'events'}
          </span>
        )}

        <motion.button
          onClick={clearCategory}
          aria-label="Clear category filter"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          style={{
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-mute)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.18s, color 0.18s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.06)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-mute)';
          }}
        >
          <X size={16} strokeWidth={1.75} />
        </motion.button>
      </div>
    </motion.section>
  );
}
