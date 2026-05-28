import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRsvp } from '@/hooks/useRsvp';

interface Props {
  eventId: string;
  initialCount: number;
  isFull: boolean;
}

export function RsvpButton({ eventId, initialCount, isFull }: Props) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const { rsvped, count, loading, toggle, error } = useRsvp(eventId, initialCount);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (loading || (isFull && !rsvped)) return;
    void toggle();
  };

  // Close modal on Escape, lock background scroll while open.
  useEffect(() => {
    if (!showAuthModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showAuthModal]);

  const disabled = authLoading || loading || (isFull && !rsvped && !!user);
  const nextParam = encodeURIComponent(location.pathname);

  let label: string;
  if (!user && !authLoading) label = 'Sign in to RSVP';
  else if (loading || authLoading) label = '…';
  else if (rsvped) label = "You're going ✓";
  else if (isFull) label = 'Event full';
  else label = "I'm going";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          background: rsvped ? 'var(--primary-deep)' : 'var(--primary)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          padding: '13px 20px',
          borderRadius: 100,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          marginBottom: 12,
          transition: 'background-color 0.2s, opacity 0.2s',
        }}
      >
        {label}
      </button>
      <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center' }}>
        {count} {count === 1 ? 'person' : 'people'} going
      </div>
      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'oklch(45% 0.18 25)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowAuthModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(20, 22, 24, 0.55)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 100,
              padding: 24,
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="rsvp-auth-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg)',
                borderRadius: 20,
                maxWidth: 380,
                width: '100%',
                padding: '30px 28px 24px',
                position: 'relative',
                boxShadow: '0 24px 64px -16px rgba(0,0,0,0.32)',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-mute)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
              <h2
                id="rsvp-auth-modal-title"
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  letterSpacing: '-0.015em',
                  marginBottom: 8,
                  color: 'var(--text)',
                }}
              >
                Sign in to RSVP
              </h2>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-mute)',
                  marginBottom: 22,
                }}
              >
                You'll need an account to reserve a spot. It only takes a moment.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  to={`/login?next=${nextParam}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: 14.5,
                    fontWeight: 600,
                    padding: '12px 18px',
                    borderRadius: 100,
                    textDecoration: 'none',
                  }}
                >
                  Sign in
                </Link>
                <Link
                  to={`/signup?next=${nextParam}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: 14.5,
                    fontWeight: 600,
                    padding: '11px 18px',
                    borderRadius: 100,
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                  }}
                >
                  Create an account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
