import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Find Events", href: "/#discover" },
  { label: "Cities", href: "/#destinations" },
  { label: "For Hosts", href: "/#experience" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid var(--border)",
        boxShadow: scrolled ? "0 4px 16px -10px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px clamp(20px, 4vw, 48px)",
          width: "100%",
        }}
      >
        {/* Brand mark */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          <img
            src="/icon.png"
            alt="XtravaGala"
            style={{
              height: "32px",
              width: "auto",
              flexShrink: 0,
              objectFit: "contain",
            }}
          />
          <span
            style={{
              fontFamily: "'Paytone One', sans-serif",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              fontSize: "17px",
              textTransform: "uppercase",
              color: "var(--primary)",
            }}
          >
            Xtravagala
          </span>
        </a>

        {/* Primary nav — hidden on mobile */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 16px",
                borderRadius: "100px",
                fontSize: "14.5px",
                fontWeight: 500,
                color: "var(--text)",
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--text)";
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="ghost" size="sm" to="/login">
            Sign in
          </Button>
          <Button variant="primary" size="sm" to="/signup" showArrow>
            Sign up
          </Button>
          <div className="hidden md:block" style={{ marginLeft: "20px" }}>
            <Button variant="ghost" size="sm" to="/host/login">
              Become a host
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
