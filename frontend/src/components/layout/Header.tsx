import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
  { label: 'Find Events', href: '#discover' },
  { label: 'For Hosts', href: '#experience' },
  { label: 'Cities', href: '#destinations' },
  { label: 'Pricing', href: '#' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? '0 4px 16px -10px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px clamp(20px, 4vw, 48px)',
          width: '100%',
        }}
      >
        {/* Brand mark */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            textDecoration: 'none',
            color: 'var(--text)',
          }}
        >
          <span
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              boxShadow: '0 2px 8px -2px oklch(55% 0.09 170 / 0.5)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '15px',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            X
          </span>
          <span
            style={{
              fontWeight: 600,
              letterSpacing: '-0.02em',
              fontSize: '17px',
              color: 'var(--text)',
            }}
          >
            XtravaGala
          </span>
        </a>

        {/* Primary nav — hidden on mobile */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                fontSize: '14.5px',
                fontWeight: 500,
                color: 'var(--text)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link
            to="/login"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              padding: '8px 4px',
              color: 'var(--text)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
            }}
          >
            Sign in
          </Link>
          <div style={{ marginLeft: '8px' }}>
            <Button variant="primary" size="sm" href="#" showArrow>
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
