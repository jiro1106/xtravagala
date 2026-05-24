import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRsvp } from '@/hooks/useRsvp';

interface Props {
  eventId: string;
  initialCount: number;
  isFull: boolean;
}

export function RsvpButton({ eventId, initialCount, isFull }: Props) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { rsvped, count, loading, toggle, error } = useRsvp(eventId, initialCount);

  const handleClick = () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (loading || (isFull && !rsvped)) return;
    void toggle();
  };

  const disabled = authLoading || loading || (isFull && !rsvped && !!user);

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
    </>
  );
}
