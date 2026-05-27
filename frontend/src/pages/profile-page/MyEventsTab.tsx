import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyRsvps } from '@/hooks/useMyRsvps';
import { RsvpCard } from './RsvpCard';
import type { EventVM } from '@/types/api';

type SubTab = 'upcoming' | 'past';

export function MyEventsTab() {
  const { upcoming, past, loading, error, cancelRsvp } = useMyRsvps();
  const [subTab, setSubTab] = useState<SubTab>('upcoming');

  return (
    <div>
      <div
        role="tablist"
        aria-label="RSVP timeline"
        style={{ display: 'flex', gap: 8, marginBottom: 24 }}
      >
        <SubTabButton
          label={`Upcoming${loading ? '' : ` (${upcoming.length})`}`}
          active={subTab === 'upcoming'}
          onClick={() => setSubTab('upcoming')}
        />
        <SubTabButton
          label={`Past${loading ? '' : ` (${past.length})`}`}
          active={subTab === 'past'}
          onClick={() => setSubTab('past')}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{ padding: 12, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 13.5 }}
        >
          Couldn't load your RSVPs: {error}
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : subTab === 'upcoming' ? (
        <UpcomingList events={upcoming} onCancel={cancelRsvp} />
      ) : (
        <PastList events={past} />
      )}
    </div>
  );
}

function SubTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: active ? 'var(--text)' : 'transparent',
        color: active ? '#fff' : 'var(--text)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function UpcomingList({ events, onCancel }: { events: EventVM[]; onCancel: (id: string) => void }) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="You haven't RSVP'd to anything yet"
        body="Find something worth showing up for."
        ctaLabel="Browse events"
        ctaTo="/events"
      />
    );
  }
  return (
    <div style={gridStyle}>
      {events.map((e, i) => (
        <RsvpCard
          key={e.id}
          event={e}
          status="going"
          delay={i * 0.04}
          onCancel={() => onCancel(e.id)}
        />
      ))}
    </div>
  );
}

function PastList({ events }: { events: EventVM[] }) {
  if (events.length === 0) {
    return <EmptyState title="No past events yet" body="Events you've attended will show up here." />;
  }
  return (
    <div style={gridStyle}>
      {events.map((e, i) => (
        <RsvpCard key={e.id} event={e} status="done" delay={i * 0.04} />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  ctaLabel,
  ctaTo,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 22,
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: ctaLabel ? 18 : 0 }}>{body}</div>
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            borderRadius: 999,
            background: 'var(--primary)',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
      Loading your RSVPs…
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 20,
};
