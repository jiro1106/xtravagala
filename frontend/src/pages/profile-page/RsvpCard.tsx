import { EventCard } from '@/components/ui/EventCard';
import type { EventVM } from '@/types/api';

type Status = 'going' | 'done';

interface RsvpCardProps {
  event: EventVM;
  status: Status;
  onCancel?: () => void; // only used when status === 'going'
  delay?: number;
}

export function RsvpCard({ event, status, onCancel, delay }: RsvpCardProps) {
  const pillStyle =
    status === 'going'
      ? { background: 'var(--primary)', color: '#fff' }
      : { background: 'var(--muted)', color: 'var(--text-mute)' };
  const pillLabel = status === 'going' ? 'Going' : 'Done';

  return (
    <div style={{ position: 'relative' }}>
      <EventCard event={event} delay={delay} />

      <span
        aria-label={`Status: ${pillLabel}`}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          zIndex: 2,
          pointerEvents: 'none',
          ...pillStyle,
        }}
      >
        {pillLabel}
      </span>

      {status === 'going' && onCancel && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text)',
            cursor: 'pointer',
            zIndex: 3,
          }}
        >
          Cancel RSVP
        </button>
      )}
    </div>
  );
}
