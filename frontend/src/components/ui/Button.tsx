import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'on-dark';
  size?: 'default' | 'sm' | 'xs';
  href?: string;
  to?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Button({
  variant = 'primary',
  size = 'default',
  href,
  to,
  showArrow = false,
  children,
  className = '',
  onClick,
  type,
  disabled = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-2.5 rounded-pill font-medium whitespace-nowrap transition-all duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] select-none cursor-pointer';

  const variants: Record<string, string> = {
    primary:
      'bg-[var(--primary)] text-white',
    ghost:
      'border border-[var(--border)] text-[var(--text)] bg-transparent hover:border-[var(--primary)] hover:text-[var(--primary)]',
    'on-dark':
      'border border-white/25 text-white/90 bg-white/10 hover:bg-white/15 hover:border-white/40',
  };

  const sizes: Record<string, string> = {
    default: 'px-6 py-3.5 text-[15px]',
    sm: 'px-4 py-2.5 text-[13.5px]',
    xs: 'px-3 py-1.5 text-[12.5px]',
  };

  const hoverAnimation = disabled
    ? {}
    : variant === 'primary'
    ? { y: -1, filter: 'brightness(1.1)' }
    : variant === 'ghost'
    ? { y: -1 }
    : {};

  const combinedClass = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {children}
      {showArrow && <ArrowIcon />}
    </>
  );

  if (to) {
    return (
      <motion.div
        style={{ display: 'inline-flex' }}
        whileHover={hoverAnimation}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <Link to={to} className={combinedClass} style={{ textDecoration: 'none' }}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={combinedClass}
        whileHover={hoverAnimation}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type ?? 'button'}
      className={`${combinedClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      whileHover={hoverAnimation}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </motion.button>
  );
}
