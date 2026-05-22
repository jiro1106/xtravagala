import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '@/data/testimonials';
import { logos } from '@/data/logos';
import type { LogoStyle } from '@/data/logos';

function getLogoStyle(style: LogoStyle): React.CSSProperties {
  switch (style) {
    case 'l1':
      return {
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontStyle: 'italic',
        fontSize: 24,
        opacity: 0.7,
      };
    case 'l2':
      return {
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        fontSize: 13.5,
        fontWeight: 600,
        opacity: 0.7,
      };
    case 'l3':
      return {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: 19,
        opacity: 0.7,
      };
    case 'l4':
      return {
        fontWeight: 300,
        fontSize: 19,
        opacity: 0.7,
      };
  }
}

export function TrustSection() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 3600);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, [startInterval, stopInterval]);

  const handleDotClick = (idx: number) => {
    setActive(idx);
    stopInterval();
    startInterval();
  };

  const doubledLogos = logos.concat(logos);

  return (
    <section
      className="section-py"
      style={{
        background: 'white',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div className="wrap">
        {/* Testimonial card */}
        <>
          <style>{`
            .testimonial-card {
              padding: 40px 48px 12px;
            }
            .testimonial-quote {
              font-size: 22px;
            }
            @media (max-width: 600px) {
              .testimonial-card {
                padding: 32px 28px 8px;
              }
              .testimonial-quote {
                font-size: 18px;
              }
            }
          `}</style>
        </>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          onMouseEnter={stopInterval}
          onMouseLeave={() => {
            startInterval();
          }}
          className="testimonial-card"
          style={{
            maxWidth: 720,
            margin: '0 auto 56px',
            background: '#f4f4f1',
            border: '1px solid var(--border)',
            borderRadius: 22,
            position: 'relative',
            textAlign: 'center',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p
                className="testimonial-quote"
                style={{
                  lineHeight: 1.4,
                  letterSpacing: '-0.018em',
                  fontWeight: 400,
                  marginBottom: 16,
                  color: 'var(--text)',
                }}
              >
                "{testimonials[active].quote}"
              </p>
              <cite
                style={{
                  display: 'block',
                  fontSize: 13,
                  color: 'var(--text-mute)',
                  fontStyle: 'normal',
                }}
              >
                — {testimonials[active].author}, {testimonials[active].org}
              </cite>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 0,
              marginTop: 16,
            }}
          >
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'transparent',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: idx === active ? 'var(--primary)' : 'var(--muted)',
                    transition: 'background 0.25s',
                  }}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Logo marquee — full width, no .wrap */}
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          maskImage:
            'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        }}
      >
        <div
          className="marquee-track"
          style={{
            display: 'flex',
            gap: 96,
            alignItems: 'center',
            whiteSpace: 'nowrap',
            width: 'max-content',
          }}
        >
          {doubledLogos.map((logo, i) => (
            <span
              key={`${logo.id}-${i}`}
              style={{
                color: 'var(--text)',
                lineHeight: 1,
                ...getLogoStyle(logo.style),
              }}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
