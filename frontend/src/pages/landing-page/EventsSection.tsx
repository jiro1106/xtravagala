import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EventCard } from "@/components/ui/EventCard";
import { events } from "@/data/events";

export function EventsSection() {
  return (
    <section
      id="discover"
      style={{ background: "white" }}
      className="section-py"
    >
      <div className="wrap">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "clamp(28px, 3vw, 40px)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                lineHeight: 1.15,
              }}
            >
              Events near you
            </h2>
            <p
              style={{
                color: "var(--text-mute)",
                fontSize: 16,
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              Things happening in Manila this weekend
            </p>
          </div>

          <Link
            to="/events"
            style={{
              fontSize: 14.5,
              color: "var(--primary)",
              fontWeight: 500,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            See all events →
          </Link>
        </motion.div>

        {/* Events grid */}
        <>
          <style>{`
            .events-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 56px 36px;
            }
            @media (max-width: 1100px) {
              .events-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 44px 28px;
              }
            }
            @media (max-width: 720px) {
              .events-grid {
                grid-template-columns: 1fr;
                gap: 36px;
              }
            }
          `}</style>
          <div className="events-grid">
            {events.slice(0, 12).map((event, index) => (
              <EventCard key={event.id} event={event} delay={index * 0.08} />
            ))}
          </div>
        </>

        {/* Browse more link */}
        <div style={{ display: "flex" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
            whileHover={{ x: 4 }}
            style={{ marginTop: 44 }}
          >
            <Link
              to="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 500,
                color: "var(--primary)",
                fontSize: 14.5,
                textDecoration: "none",
              }}
            >
              Browse 1,840 more events this weekend →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
