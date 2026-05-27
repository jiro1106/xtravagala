import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/types/db';

type Profile = Tables<'profiles'>;

const NAV_LINKS = [
  { label: 'Find Events', href: '/#discover' },
  { label: 'Cities', href: '/#destinations' },
  { label: 'For Hosts', href: '/#experience' },
];

const EASE = [0.23, 1, 0.32, 1] as const;

const menuVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.22, ease: EASE, when: 'afterChildren', staggerChildren: 0.04, staggerDirection: -1 },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE, when: 'beforeChildren', staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants = {
  closed: { opacity: 0, y: -8 },
  open: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
};

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function UserAvatar({ profile }: { profile: Profile | null }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.full_name}
        style={{ height: '30px', width: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  const initials = profile ? getInitials(profile.full_name) : '?';
  return (
    <div
      style={{
        height: '30px',
        width: '30px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function Header() {
  const { user, profile, loading, requestSignOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const displayName = profile?.full_name ?? user?.email ?? '';

  return (
    <header
      ref={headerRef}
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
        className="flex items-center justify-between md:grid md:[grid-template-columns:1fr_auto_1fr]"
        style={{ padding: '10px clamp(20px, 4vw, 48px)', width: '100%' }}
      >
        <a
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: 'var(--text)' }}
        >
          <img src="/icon.png" alt="XtravaGala" style={{ height: '32px', width: 'auto', flexShrink: 0, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em', fontSize: '17px', textTransform: 'uppercase', color: 'var(--primary)' }}>
            Xtravagala
          </span>
        </a>

        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '2px' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '14.5px', fontWeight: 500, color: 'var(--text)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          {!loading && !user && (
            <>
              <Button variant="ghost" size="sm" to="/login">Sign in</Button>
              <Button variant="primary" size="sm" to="/signup" showArrow>Sign up</Button>
            </>
          )}

          {!loading && user && (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  borderRadius: '100px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                <UserAvatar profile={profile} />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      minWidth: '160px',
                      backgroundColor: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      boxShadow: '0 8px 24px -8px rgba(0,0,0,0.14)',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}
                  >
                    <a
                      href="/profile"
                      style={{ display: 'block', padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)', textDecoration: 'none' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''; }}
                    >
                      My profile
                    </a>
                    <a
                      href={profile?.is_host ? '/host/dashboard' : '/host/upgrade'}
                      style={{ display: 'block', padding: '10px 16px', fontSize: '13.5px', color: 'var(--text)', textDecoration: 'none', borderTop: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''; }}
                    >
                      {profile?.is_host ? 'Host dashboard' : 'Become a host'}
                    </a>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); requestSignOut(); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13.5px',
                        color: 'var(--text)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderTop: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {(!user || !profile?.is_host) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
              <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
              <Button variant="ghost" size="sm" to={user ? '/host/upgrade' : '/host/login'}>
                {user ? 'Become a host' : 'Become a host'}
              </Button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <motion.path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" animate={menuOpen ? { d: 'M5 5L19 19' } : { d: 'M3 7L21 7' }} transition={{ duration: 0.3, ease: EASE }} />
            <motion.line x1="3" x2="21" y1="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.2, ease: EASE }} />
            <motion.path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" animate={menuOpen ? { d: 'M5 19L19 5' } : { d: 'M3 17L21 17' }} transition={{ duration: 0.3, ease: EASE }} />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 'var(--header-h) 0 0 0', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 90 }}
            />
            <motion.nav
              className="md:hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 95,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid var(--border)',
                boxShadow: '0 12px 28px -16px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px clamp(20px, 4vw, 48px) 20px',
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  variants={itemVariants}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{ padding: '12px 4px', fontSize: '16px', fontWeight: 500, color: 'var(--text)', textDecoration: 'none', textAlign: 'center', borderBottom: '1px solid var(--border)' }}
                >
                  {link.label}
                </motion.a>
              ))}

              {!loading && !user && (
                <>
                  <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '16px' }}>
                    <Button variant="ghost" size="default" to="/login" className="w-full justify-center">Sign in</Button>
                  </motion.div>
                  <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '10px' }}>
                    <Button variant="primary" size="default" to="/signup" showArrow className="w-full justify-center">Sign up</Button>
                  </motion.div>
                </>
              )}

              {!loading && user && (
                <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); requestSignOut(); }}
                    style={{
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'var(--text)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '100px',
                      cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </button>
                </motion.div>
              )}

              {(!user || !profile?.is_host) && (
                <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '10px' }}>
                  <Button variant="ghost" size="default" to={user ? '/host/upgrade' : '/host/login'} className="w-full justify-center">Become a host</Button>
                </motion.div>
              )}
              {user && profile?.is_host && (
                <motion.div variants={itemVariants} style={{ display: 'grid', marginTop: '10px' }}>
                  <Button variant="primary" size="default" to="/host/dashboard" className="w-full justify-center">Host dashboard</Button>
                </motion.div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
