import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function FinalCTASection() {
  return (
    <section style={{ background: "white", padding: "40px 0 100px" }}>
      <div className="wrap">
        <>
          <style>{`
            .cta-panel {
              position: relative;
              overflow: hidden;
              border-radius: 28px;
              padding: 100px 80px;
              background: #34393c;
            }
            @media (max-width: 720px) {
              .cta-panel {
                padding: 60px 28px;
              }
            }
          `}</style>
          <div className="cta-panel">
            {/* Pseudo-overlay gradient */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `
                  radial-gradient(ellipse 60% 70% at 10% 100%, oklch(55% 0.09 170 / 0.32), transparent 60%),
                  radial-gradient(ellipse 50% 60% at 90% 0%, oklch(45% 0.09 170 / 0.22), transparent 65%)
                `,
              }}
            />

            {/* Inner content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: "relative",
                maxWidth: 800,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 48px)",
                  fontWeight: 600,
                  letterSpacing: "-0.028em",
                  color: "rgba(255,255,255,0.98)",
                  marginBottom: 16,
                  lineHeight: 1.15,
                }}
              >
                Ready to get started?
              </h2>

              <p
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  maxWidth: "48ch",
                  marginBottom: 32,
                  lineHeight: 1.6,
                  margin: "0 auto 32px",
                }}
              >
                Browse events near you or bring your own to life — it only takes a few minutes to get started.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <Button variant="primary" to="/host/login" showArrow>
                  Create an event
                </Button>
                <Button variant="on-dark" to="/events">
                  Browse events
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      </div>
    </section>
  );
}
