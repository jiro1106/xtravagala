const FOOTER_COLOR = 'oklch(94% 0.012 170)';
const FOOTER_LABEL_COLOR = 'oklch(70% 0.018 170)';
const FOOTER_LINK_COLOR = 'oklch(88% 0.015 170)';
const FOOTER_MUTE_COLOR = 'oklch(72% 0.018 170)';
const FOOTER_BORDER_COLOR = 'oklch(45% 0.018 170 / 0.4)';
const FOOTER_GLOW = 'var(--primary-glow)';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      <a
        href={href}
        style={{
          color: FOOTER_LINK_COLOR,
          fontSize: '14.5px',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = FOOTER_GLOW;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = FOOTER_LINK_COLOR;
        }}
      >
        {children}
      </a>
    </li>
  );
}

interface FooterColumnProps {
  heading: string;
  links: Array<{ label: string; href: string }>;
}

function FooterColumn({ heading, links }: FooterColumnProps) {
  return (
    <div>
      <h4
        style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: FOOTER_LABEL_COLOR,
          fontWeight: 500,
          marginBottom: '20px',
          marginTop: 0,
        }}
      >
        {heading}
      </h4>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {links.map((link) => (
          <FooterLink key={link.label} href={link.href}>
            {link.label}
          </FooterLink>
        ))}
      </ul>
    </div>
  );
}

function LegalLink({ href, children }: FooterLinkProps) {
  return (
    <a
      href={href}
      style={{
        color: FOOTER_LABEL_COLOR,
        fontSize: '13px',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = FOOTER_GLOW;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = FOOTER_LABEL_COLOR;
      }}
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--slate)',
        color: FOOTER_COLOR,
        padding: '70px 0 32px',
      }}
    >
      <div className="wrap">
        {/* Main grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '60px',
            paddingBottom: '56px',
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                textDecoration: 'none',
                color: FOOTER_COLOR,
                marginBottom: '0',
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  boxShadow: '0 2px 8px -2px oklch(55% 0.09 170 / 0.5)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                X
              </span>
              <span
                style={{
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  fontSize: '19px',
                  color: FOOTER_COLOR,
                }}
              >
                XtravaGala
              </span>
            </a>
            <p
              style={{
                color: FOOTER_MUTE_COLOR,
                fontSize: '14.5px',
                maxWidth: '36ch',
                marginTop: '14px',
                marginBottom: 0,
                lineHeight: 1.6,
              }}
            >
              An event platform for people who actually go to events — and the
              hosts who run them quietly well.
            </p>
          </div>

          {/* Discover */}
          <FooterColumn
            heading="Discover"
            links={[
              { label: 'Tonight', href: '#' },
              { label: 'This weekend', href: '#' },
              { label: 'By city', href: '#' },
              { label: 'By mood', href: '#' },
            ]}
          />

          {/* For hosts */}
          <FooterColumn
            heading="For hosts"
            links={[
              { label: 'Scheduling', href: '#' },
              { label: 'Rentals', href: '#' },
              { label: 'Catering', href: '#' },
              { label: 'Consultation', href: '#' },
            ]}
          />

          {/* Company */}
          <FooterColumn
            heading="Company"
            links={[
              { label: 'About', href: '#' },
              { label: 'Careers', href: '#' },
              { label: 'Press', href: '#' },
              { label: 'Contact', href: '#' },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div
          className="footer-bottom"
          style={{
            borderTop: `1px solid ${FOOTER_BORDER_COLOR}`,
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              color: FOOTER_LABEL_COLOR,
              fontSize: '13px',
            }}
          >
            © 2026 XtravaGala. Made for the people who show up.
          </span>
          <div style={{ display: 'flex', gap: '22px' }}>
            <LegalLink href="#">Privacy</LegalLink>
            <LegalLink href="#">Terms</LegalLink>
            <LegalLink href="#">Cookies</LegalLink>
          </div>
        </div>
      </div>

      {/* Responsive styles via a style tag */}
      <style>{`
        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 36px !important;
          }
        }
        @media (max-width: 720px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  );
}
