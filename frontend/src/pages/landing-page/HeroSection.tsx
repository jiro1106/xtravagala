import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { CategoryItem } from "@/components/ui/CategoryItem";
import { RotatingWord } from "@/components/ui/RotatingWord";
import { useCategories } from "@/hooks/useCategories";

const ease = [0.23, 1, 0.32, 1] as const;

const ROTATING_WORDS = [
  "night.",
  "weekend.",
  "concert.",
  "pop-up.",
  "workshop.",
  "seminar.",
];

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1400&q=80";

export function HeroSection() {
  const { data: categories } = useCategories();

  return (
    <section
      style={{
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ---- Hero split (full-bleed, warm cream) ---- */}
      <div className="hero-split">
        {/* Left column — copy + CTAs */}
        <div className="hero-split-left">
          <motion.h1
            className="hero-split-h1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            Find your
            <br />
            <RotatingWord words={ROTATING_WORDS} ariaLabel="experience" />
          </motion.h1>

          <motion.p
            className="hero-split-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
          >
            Discover events happening near you across the Philippines, or host
            one of your own — from intimate pop-ups to packed-out shows.
          </motion.p>

          <motion.div
            className="hero-split-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
          >
            <Button variant="primary" to="/events" showArrow>
              Explore events
            </Button>
            <Button variant="ghost" to="/host/upgrade">
              Create an event
            </Button>
          </motion.div>
        </div>

        {/* Right column — full-bleed photo dissolving into the cream */}
        <div className="hero-split-media" aria-hidden="true">
          <div
            className="hero-split-photo"
            style={{ backgroundImage: `url('${HERO_PHOTO}')` }}
          />
          <div className="hero-split-grad" />
          <div className="hero-split-cap">
            <h4>Rooftop Jazz at the Pier</h4>
            <div className="hero-split-meta">Sat · 8 PM · Manila</div>
          </div>
        </div>

        <style>{`
          .hero-split {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: stretch;
            min-height: calc(100vh - var(--header-h, 64px));
            overflow: hidden;
            background:
              radial-gradient(ellipse 70% 55% at 100% 0%, oklch(95% 0.022 170), transparent 62%),
              radial-gradient(ellipse 60% 60% at 0% 100%, oklch(96% 0.015 95), transparent 58%),
              #f9f7f1;
          }
          .hero-split-left {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 40px 60px clamp(160px, 5vw, 190px);
          }
          .hero-split-h1 {
            margin: 0;
            font-size: clamp(64px, 7.4vw, 102px);
            line-height: 0.92;
            font-weight: 700;
            letter-spacing: -0.04em;
            color: var(--text);
          }
          .hero-split-sub {
            color: var(--text-mute);
            font-size: 16px;
            line-height: 1.55;
            max-width: 38ch;
            margin: 24px 0 28px;
          }
          .hero-split-ctas {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          .hero-split-media {
            position: relative;
            width: 100%;
            height: 100%;
            -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 14%, #000 40%);
            mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 14%, #000 40%);
          }
          .hero-split-photo {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
          }
          .hero-split-grad {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(180deg, rgba(15,18,20,0) 45%, rgba(15,18,20,0.55) 100%);
          }
          .hero-split-cap {
            position: absolute;
            bottom: 26px;
            right: 28px;
            z-index: 1;
            color: #fff;
            text-align: right;
          }
          .hero-split-cap h4 {
            margin: 0;
            font-size: 23px;
            font-weight: 600;
            letter-spacing: -0.018em;
            line-height: 1.15;
          }
          .hero-split-meta {
            margin-top: 7px;
            font-size: 13px;
            color: oklch(86% 0.02 170);
            letter-spacing: 0.01em;
          }
          @media (max-width: 860px) {
            .hero-split {
              grid-template-columns: 1fr;
              min-height: 0;
            }
            .hero-split-left {
              padding: 48px 28px;
            }
            .hero-split-media {
              height: 360px;
              -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent 100%);
              mask-image: linear-gradient(180deg, #000 60%, transparent 100%);
            }
          }
          @media (max-width: 600px) {
            .hero-split-left {
              padding: 40px 22px;
            }
          }
        `}</style>
      </div>

      {/* ---- Browse by category + Search (contained) ---- */}
      <div
        className="wrap"
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: 32,
          paddingBottom: 32,
        }}
      >
        {/* Hero categories */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          style={{
            background: "#f4f4f1",
            border: "1px solid var(--border)",
            borderRadius: 22,
            padding: "24px 32px 18px",
          }}
        >
          <div
            className="hero-cats-header"
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
                .hero-cats-header {
                  flex-direction: column !important;
                  align-items: center !important;
                  gap: 6px !important;
                  text-align: center;
                }
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
