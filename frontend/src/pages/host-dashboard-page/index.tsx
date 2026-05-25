import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useMyEvents, type MyEventVM } from '@/hooks/useMyEvents';
import { supabase } from '@/lib/supabase';
import { LoadError } from '@/components/ui/LoadError';

function StatusPill({ status }: { status: 'draft' | 'published' }) {
  const styles = status === 'published'
    ? { bg: 'color-mix(in oklch, var(--primary) 12%, white)', color: 'var(--primary)' }
    : { bg: 'var(--muted)', color: 'var(--text-mute)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 100,
        fontSize: 11.5,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: styles.bg,
        color: styles.color,
      }}
    >
      {status}
    </span>
  );
}

function KpiCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 22,
        backgroundColor: '#fff',
        border: '1px solid var(--border)',
        minHeight: 130,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: 'var(--text-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-mute)' }}>{sublabel ?? '—'}</p>
    </div>
  );
}

function EventRow({
  ev,
  busy,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  ev: MyEventVM;
  busy: boolean;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 120px 90px 110px auto',
        alignItems: 'center',
        gap: 16,
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            height: 44,
            width: 60,
            borderRadius: 10,
            backgroundImage: `url(${ev.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
            backgroundColor: 'var(--muted)',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ev.title || 'Untitled event'}
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 12,
              color: 'var(--text-mute)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ev.cityName} · {ev.categoryLabel}
          </p>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-mute)' }}>{ev.date}</p>

      <StatusPill status={ev.status} />

      <p style={{ margin: 0, fontSize: 13, color: 'var(--text)' }}>
        {ev.attendees}
        {ev.capacity != null && (
          <span style={{ color: 'var(--text-mute)' }}> / {ev.capacity}</span>
        )}
      </p>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          style={{
            padding: '6px 12px',
            borderRadius: 100,
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            fontSize: 12.5,
            fontWeight: 500,
            color: 'var(--text)',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onTogglePublish}
          disabled={busy}
          style={{
            padding: '6px 12px',
            borderRadius: 100,
            border: '1px solid var(--primary)',
            backgroundColor: ev.status === 'published' ? 'transparent' : 'var(--primary)',
            color: ev.status === 'published' ? 'var(--primary)' : '#fff',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {ev.status === 'published' ? 'Unpublish' : 'Publish'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label="Delete event"
          style={{
            padding: '6px 10px',
            borderRadius: 100,
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text-mute)',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export function HostDashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data, loading, error, refetch } = useMyEvents();
  const [searchParams] = useSearchParams();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  const q = (searchParams.get('q') ?? '').toLowerCase();

  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    return data.filter((e) => e.title.toLowerCase().includes(q));
  }, [data, q]);

  const totals = useMemo(() => {
    const published = data.filter((e) => e.status === 'published').length;
    const drafts = data.length - published;
    const rsvps = data.reduce((sum, e) => sum + e.attendees, 0);
    return { total: data.length, published, drafts, rsvps };
  }, [data]);

  async function handleTogglePublish(ev: MyEventVM) {
    setBusyId(ev.id);
    setOpError(null);
    const next: 'draft' | 'published' = ev.status === 'published' ? 'draft' : 'published';
    const patch =
      next === 'published'
        ? { status: next, published_at: new Date().toISOString() }
        : { status: next };
    const { error: err } = await supabase.from('events').update(patch).eq('id', ev.id);
    if (err) setOpError(err.message);
    await refetch();
    setBusyId(null);
  }

  async function handleDelete(ev: MyEventVM) {
    if (!window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    setBusyId(ev.id);
    setOpError(null);
    const { error: err } = await supabase.from('events').delete().eq('id', ev.id);
    if (err) setOpError(err.message);
    await refetch();
    setBusyId(null);
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Host
          </span>
          <h1 style={{ margin: '6px 0 4px', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-mute)' }}>
            Your events at a glance.
          </p>
        </div>
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 14,
            border: '1px solid var(--border)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 160,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Signed in as
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
            {profile?.host_name ?? profile?.full_name}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >
        <KpiCard label="Total events" value={totals.total} sublabel={loading ? 'Loading…' : 'All time'} />
        <KpiCard label="Published" value={totals.published} sublabel={totals.published === 0 ? 'None yet' : 'Live'} />
        <KpiCard label="Drafts" value={totals.drafts} sublabel={totals.drafts === 0 ? 'No drafts' : 'In progress'} />
        <KpiCard label="Total RSVPs" value={totals.rsvps} sublabel={totals.rsvps === 0 ? 'No data' : 'Across events'} />
      </div>

      {/* Main grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.2fr) minmax(280px, 1fr)',
          gap: 20,
          marginTop: 24,
          alignItems: 'start',
        }}
      >
        {/* Events card */}
        <div
          style={{
            borderRadius: 22,
            border: '1px solid var(--border)',
            backgroundColor: '#fff',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px 14px',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                Events
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
                Your events
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/host/events/new')}
              style={{
                padding: '8px 14px',
                borderRadius: 100,
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              + New event
            </button>
          </div>

          {opError && (
            <div style={{ padding: '0 22px 12px' }}>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-mute)' }}>{opError}</p>
            </div>
          )}

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13.5 }}>
              Loading your events…
            </div>
          ) : error ? (
            <div style={{ padding: 22 }}>
              <LoadError message={error} onRetry={() => void refetch()} />
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                margin: '0 22px 22px',
                padding: '36px 22px',
                border: '1.5px dashed var(--border)',
                borderRadius: 18,
                textAlign: 'center',
                color: 'var(--text-mute)',
                fontSize: 13.5,
              }}
            >
              {q ? (
                <>No events match "<strong>{q}</strong>".</>
              ) : (
                <>
                  <p style={{ margin: 0, color: 'var(--text)', fontSize: 15, fontWeight: 500 }}>
                    No events yet
                  </p>
                  <p style={{ margin: '6px 0 14px' }}>Create your first event to get started.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/host/events/new')}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 100,
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Create event
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 120px 90px 110px auto',
                  alignItems: 'center',
                  gap: 16,
                  padding: '10px 18px',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 11,
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                  backgroundColor: 'var(--surface)',
                }}
              >
                <span>Event</span>
                <span>Date</span>
                <span>Status</span>
                <span>RSVPs</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {filtered.map((ev) => (
                <EventRow
                  key={ev.id}
                  ev={ev}
                  busy={busyId === ev.id}
                  onEdit={() => navigate(`/host/events/${ev.id}/edit`)}
                  onTogglePublish={() => void handleTogglePublish(ev)}
                  onDelete={() => void handleDelete(ev)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: 22,
              borderRadius: 22,
              border: '1px solid var(--border)',
              backgroundColor: '#fff',
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
              Quick actions
            </p>
            <p style={{ margin: '4px 0 14px', fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
              What's next
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Create event', to: '/host/events/new' },
                { label: 'Edit profile', to: '/profile' },
                { label: 'View site as attendee', to: '/' },
              ].map((a) => (
                <li key={a.to}>
                  <Link
                    to={a.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      borderRadius: 12,
                      textDecoration: 'none',
                      color: 'var(--text)',
                      fontSize: 13.5,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--surface)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = ''; }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        flexShrink: 0,
                      }}
                    />
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              padding: 22,
              borderRadius: 22,
              border: '1px solid var(--border)',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                Profile
              </p>
              <Link to="/profile" style={{ fontSize: 12.5, color: 'var(--primary)', textDecoration: 'none' }}>
                Edit
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  style={{ height: 44, width: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    height: 44,
                    width: 44,
                    borderRadius: '50%',
                    backgroundColor: 'var(--muted)',
                  }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                  {profile?.host_name ?? profile?.full_name}
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 12.5,
                    color: 'var(--text-mute)',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {profile?.host_bio || 'Add a short bio so attendees know who you are.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
