import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useEvents } from '@/hooks/useEvents';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { RsvpButton } from '@/components/ui/RsvpButton';

const ease = [0.23, 1, 0.36, 1] as const;

const iconBadgeStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'oklch(95% 0.025 170)',
  color: 'var(--primary)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: '13.5px',
        fontWeight: 500,
        color: 'var(--primary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      ← Back to Events
    </button>
  );
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, loading } = useEventDetail(id);
  const { data: categoryEvents } = useEvents(
    event ? { category: event.category } : {},
  );

  useDocumentTitle(event?.title);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '120px auto',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 12,
          }}
        >
          Event not found
        </h1>
        <p style={{ color: 'var(--text-mute)', marginBottom: 24 }}>
          This event may have been removed or the link is incorrect.
        </p>
        <Link
          to="/events"
          style={{
            color: 'var(--primary)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Browse all events →
        </Link>
      </div>
    );
  }

  const similarEvents = categoryEvents
    .filter((e) => e.id !== event.id)
    .slice(0, 3);

  const showBadge = event.attendees < 20;
  const schedule = event.schedule ?? [];

  return (
    <div>
      <div style={{ padding: '20px clamp(20px, 4vw, 48px) 0' }}>
        <BackButton />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        style={{
          width: '100%',
          aspectRatio: '21/8',
          overflow: 'hidden',
          marginTop: 16,
        }}
      >
        <img
          src={event.image}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </motion.div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '36px clamp(20px, 4vw, 48px) 72px',
          alignItems: 'start',
        }}
        className="event-detail-grid"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          {showBadge && (
            <span
              style={{
                display: 'inline-block',
                background: 'oklch(92% 0.06 60)',
                color: 'oklch(42% 0.12 50)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 4,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Few spots left
            </span>
          )}

          <h1
            style={{
              fontSize: 'clamp(24px, 2.8vw, 32px)',
              fontWeight: 700,
              letterSpacing: '-0.022em',
              color: 'var(--text)',
              margin: '0 0 20px',
              lineHeight: 1.2,
            }}
          >
            {event.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>
                by <strong style={{ color: 'var(--text)' }}>{event.host}</strong>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                {event.attendees} attending · {event.category}
              </div>
            </div>
            <button
              style={{
                border: '1px solid var(--border)',
                background: '#fff',
                borderRadius: 100,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Follow
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: '1px solid var(--border)',
            }}
          >
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={iconBadgeStyle} aria-hidden="true">
                  <MapPin size={16} strokeWidth={2} />
                </span>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {event.venue}
                  </div>
                  {event.address && (
                    <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 2 }}>
                      {event.address}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={iconBadgeStyle} aria-hidden="true">
                <Calendar size={16} strokeWidth={2} />
              </span>
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{event.date}</span>
            </div>
          </div>

          {event.description && (
            <div style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: '0 0 10px',
                  letterSpacing: '-0.015em',
                }}
              >
                Overview
              </h2>
              <p
                style={{
                  fontSize: 14.5,
                  color: 'var(--text-mute)',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {event.description}
              </p>
            </div>
          )}

          {schedule.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: '0 0 12px',
                  letterSpacing: '-0.015em',
                }}
              >
                Schedule
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {schedule.map((item, i) => (
                  <div
                    key={item.time}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '10px 0',
                      borderBottom:
                        i < schedule.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--primary)',
                        width: 76,
                        flexShrink: 0,
                      }}
                    >
                      {item.time}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.18 }}
        >
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 24,
              position: 'sticky',
              top: 64,
              background: 'var(--bg)',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              {event.price}
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: 'var(--text-mute)',
                marginBottom: 20,
              }}
            >
              {event.date}
            </div>
            <RsvpButton
              eventId={event.id}
              initialCount={event.attendees}
              isFull={event.isFull}
            />
          </div>
        </motion.div>
      </div>

      {similarEvents.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '40px clamp(20px, 4vw, 48px) 72px',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 6px',
                letterSpacing: '-0.018em',
              }}
            >
              You might also like...
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-mute)',
                margin: '0 0 24px',
              }}
            >
              More events in the same category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {similarEvents.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, ease, delay: i * 0.07 }}
                >
                  <Link
                    to={`/events/${e.id}`}
                    style={{
                      display: 'flex',
                      gap: 20,
                      padding: '20px 0',
                      borderBottom:
                        i < similarEvents.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                      textDecoration: 'none',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'var(--text)',
                          marginBottom: 5,
                          lineHeight: 1.3,
                        }}
                      >
                        {e.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--text-mute)',
                          marginBottom: 2,
                        }}
                      >
                        {e.date}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--text-mute)',
                          marginBottom: 4,
                          textTransform: 'capitalize',
                        }}
                      >
                        {e.city}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text)',
                        }}
                      >
                        {e.price}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 100,
                        height: 70,
                        borderRadius: 10,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={e.image}
                        alt={e.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
