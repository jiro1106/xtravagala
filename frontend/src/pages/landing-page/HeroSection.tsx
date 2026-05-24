import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SearchBar } from "@/components/ui/SearchBar";
import { Button } from "@/components/ui/Button";
import { CategoryItem } from "@/components/ui/CategoryItem";
import { useCategories } from "@/hooks/useCategories";

const ease = [0.23, 1, 0.32, 1] as const;

export function HeroSection() {
  const [hovered, setHovered] = useState(false);
  const { data: categories } = useCategories();

  return (
    <section
      style={{
        background: "var(--bg)",
        padding: "36px 0 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric teal bloom top-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -180,
          right: -160,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(68% 0.11 170 / 0.08) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* Search bar */}
        <div style={{ marginBottom: 24 }}>
          <SearchBar />
        </div>

        {/* Hero card */}
        <motion.article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease }}
          style={{
            position: "relative",
            borderRadius: 28,
            overflow: "hidden",
            minHeight: 520,
            isolation: "isolate",
            boxShadow:
              "0 32px 72px -24px rgba(0,0,0,0.38), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {/* Background image */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: -2,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=2400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center 44%",
              filter: "saturate(1.1) brightness(0.58)",
              transform: hovered ? "scale(1.06)" : "scale(1.02)",
              transition: "transform 1.8s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />

          {/* Gradient overlays */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: -1,
              background: `
                radial-gradient(ellipse 65% 60% at 6% 85%, oklch(28% 0.08 170 / 0.60), transparent 55%),
                radial-gradient(ellipse 50% 55% at 92% 8%, oklch(42% 0.08 170 / 0.28), transparent 60%),
                linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.48) 100%)
              `,
            }}
          />

          {/* Inner content — vertically centered */}
          <div
            style={{
              position: "relative",
              minHeight: 520,
              padding: "clamp(28px, 4vw, 48px) clamp(22px, 7vw, 100px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Copy + CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              style={{ maxWidth: 680 }}
            >
              <h1
                style={{
                  margin: "0 0 14px",
                  padding: 0,
                  lineHeight: 1.1,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "clamp(34px, 3.8vw, 50px)",
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.08,
                  }}
                >
                  Find events
                </span>
                <span
                  className="font-serif-accent italic"
                  style={{
                    display: "block",
                    fontSize: "clamp(38px, 4.4vw, 56px)",
                    color: "oklch(72% 0.12 170)",
                    letterSpacing: "-0.018em",
                    lineHeight: 1.15,
                    marginTop: 2,
                  }}
                >
                  worth showing up for
                </span>
              </h1>

              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.65)",
                  maxWidth: "50ch",
                  marginBottom: 22,
                  lineHeight: 1.65,
                }}
              >
                From Manila's rooftop concerts to Cebu's weekend markets.
                Discover what's happening near you.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button variant="primary" to="/events" showArrow>
                  Explore events
                </Button>
                <Button variant="on-dark" href="#">
                  Create an event
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.article>

        {/* Hero categories */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          style={{
            marginTop: 24,
            background: "#f4f4f1",
            border: "1px solid var(--border)",
            borderRadius: 22,
            padding: "24px 32px 18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 24,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-mute)",
              }}
            >
              Browse by category
            </span>
            <Link
              to="/events"
              style={{
                fontSize: 13.5,
                color: "var(--primary)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              See all →
            </Link>
          </div>

          <>
            <style>{`
              .hero-cats-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 8px;
              }
              @media (max-width: 1100px) {
                .hero-cats-grid { grid-template-columns: repeat(4, 1fr); }
              }
              @media (max-width: 600px) {
                .hero-cats-grid { grid-template-columns: repeat(3, 1fr); }
              }
            `}</style>
            <div className="hero-cats-grid">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.55,
                    ease,
                    delay: 0.15 + index * 0.05,
                  }}
                >
                  <CategoryItem
                    label={cat.label}
                    svgContent={cat.svgContent}
                    to={`/events?category=${cat.id}`}
                  />
                </motion.div>
              ))}
            </div>
          </>
        </motion.div>
      </div>
    </section>
  );
}
