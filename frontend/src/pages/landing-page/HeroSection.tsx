import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { CategoryItem } from '@/components/ui/CategoryItem';
import { categories } from '@/data/categories';

export function HeroSection() {
  const [hovered, setHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  return (
    <section style={{ background: 'white', padding: '36px 0 28px' }}>
      <div className="wrap">
        {/* Search bar — centered */}
        <div style={{ marginBottom: 24 }}>
          <SearchBar />
        </div>

        {/* Hero card */}
        <motion.article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            minHeight: 380,
            isolation: 'isolate',
            boxShadow: '0 24px 60px -32px rgba(0,0,0,0.35)',
          }}
        >
          {/* Background image */}
          <div
            ref={imageRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -2,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=2400&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center 50%',
              filter: 'saturate(1) brightness(0.62)',
              transform: hovered ? 'scale(1.05)' : 'scale(1.02)',
              transition: 'transform 1.6s cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />

          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              background: `
                radial-gradient(ellipse 80% 70% at 12% 70%, oklch(35% 0.06 170 / 0.55), transparent 60%),
                radial-gradient(ellipse 60% 70% at 90% 10%, oklch(45% 0.08 170 / 0.35), transparent 65%),
                linear-gradient(180deg, oklch(20% 0.02 170 / 0.2) 0%, oklch(15% 0.02 170 / 0.5) 60%, oklch(12% 0.02 170 / 0.8) 100%)
              `,
            }}
          />

          {/* Inner content */}
          <div
            style={{
              position: 'relative',
              minHeight: 380,
              padding: '38px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ maxWidth: 720 }}>
              <h1
                style={{
                  fontSize: 'clamp(32px, 3.8vw, 46px)',
                  fontWeight: 600,
                  letterSpacing: '-0.028em',
                  color: 'white',
                  marginBottom: 12,
                  lineHeight: 1.15,
                }}
              >
                Find events near you.
              </h1>

              <p
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.7)',
                  maxWidth: '48ch',
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                Discover what's happening this weekend in your city.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button variant="primary" href="#discover" showArrow>
                  Explore events
                </Button>
                <Button variant="on-dark" href="#">
                  Create an event
                </Button>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Hero categories */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          style={{
            marginTop: 24,
            background: '#f4f4f1',
            border: '1px solid var(--border)',
            borderRadius: 22,
            padding: '24px 32px 18px',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 24,
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>
              <strong>Browse by category</strong>
            </span>
            <a
              href="#"
              style={{
                fontSize: 13.5,
                color: 'var(--primary)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              See all →
            </a>
          </div>

          {/* Category grid */}
          <>
            <style>{`
              .hero-cats-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 8px;
              }
              @media (max-width: 1100px) {
                .hero-cats-grid {
                  grid-template-columns: repeat(4, 1fr);
                }
              }
              @media (max-width: 600px) {
                .hero-cats-grid {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
            `}</style>
            <div className="hero-cats-grid">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.55,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.15 + index * 0.05,
                  }}
                >
                  <CategoryItem label={cat.label} svgContent={cat.svgContent} />
                </motion.div>
              ))}
            </div>
          </>
        </motion.div>
      </div>
    </section>
  );
}
