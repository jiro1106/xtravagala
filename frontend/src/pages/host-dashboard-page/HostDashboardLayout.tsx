import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'xg.hostSidebarCollapsed';

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

const SIDEBAR_BG = 'color-mix(in oklch, var(--primary) 9%, white)';
const SIDEBAR_ACTIVE = '#ffffff';

function NavItem({
  to,
  icon,
  label,
  collapsed,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '11px 0' : '11px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 500,
        color: isActive ? 'var(--primary)' : 'var(--text)',
        backgroundColor: isActive ? SIDEBAR_ACTIVE : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: isActive ? '0 4px 14px -8px rgba(0,0,0,0.12)' : 'none',
      })}
    >
      <span style={{ display: 'flex', flexShrink: 0 }} aria-hidden>
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

const IconDashboard = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconCalendar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IconPlus = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IconUser = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IconLogout = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 5h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCollapse = (collapsed: boolean) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSearch = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ height: 32, width: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        height: 32,
        width: 32,
        borderRadius: '50%',
        backgroundColor: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

export function HostDashboardLayout() {
  const { user, profile, requestSignOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  // Keep input in sync with URL on navigation
  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  const isOnDashboard = location.pathname === '/host/dashboard';
  const displayName = profile?.host_name ?? profile?.full_name ?? user?.email ?? 'Host';

  function handleSearchChange(value: string) {
    setSearchValue(value);
    // only meaningful on the dashboard page
    if (!isOnDashboard) return;
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }

  function handleCreate() {
    navigate('/host/events/new');
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${collapsed ? 72 : 256}px 1fr`,
        height: '100vh',
        backgroundColor: '#fff',
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          backgroundColor: SIDEBAR_BG,
          padding: collapsed ? '20px 10px' : '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          borderRight: '1px solid var(--border)',
          transition: 'padding 0.2s, width 0.2s',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '6px 0' : '6px 8px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
            color: 'var(--text)',
          }}
        >
          <img src="/icon.png" alt="XtravaGala" style={{ height: 32, width: 'auto', flexShrink: 0 }} />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span
                style={{
                  fontFamily: "'Paytone One', sans-serif",
                  fontSize: 15,
                  letterSpacing: '-0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--primary)',
                }}
              >
                Xtravagala
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>
                Host workspace
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: collapsed ? '8px 0' : '8px 14px',
            marginTop: 6,
            borderRadius: 14,
            backgroundColor: 'var(--primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          {IconCollapse(collapsed)}
          {!collapsed && <span>Collapse</span>}
        </button>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 14 }}>
          <NavItem to="/host/dashboard" icon={IconDashboard} label="Dashboard" collapsed={collapsed} end />
          <NavItem to="/host/dashboard?view=events" icon={IconCalendar} label="My events" collapsed={collapsed} />
          <NavItem to="/host/events/new" icon={IconPlus} label="New event" collapsed={collapsed} />
          <NavItem to="/host/profile" icon={IconUser} label="My profile" collapsed={collapsed} />
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!collapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.6)',
              }}
            >
              <Avatar url={profile?.avatar_url ?? null} name={displayName} />
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-mute)' }}>Host</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => requestSignOut()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '11px 0' : '11px 14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span aria-hidden>{IconLogout}</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px clamp(20px, 3vw, 36px)',
            borderBottom: '1px solid var(--border)',
            backgroundColor: '#fff',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flex: 1,
              maxWidth: 480,
              padding: '0 14px',
              height: 40,
              borderRadius: 100,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <span style={{ color: 'var(--text-mute)' }} aria-hidden>{IconSearch}</span>
            <input
              type="search"
              placeholder={isOnDashboard ? 'Search your events…' : 'Search'}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: 14,
                color: 'var(--text)',
              }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 40,
                padding: '0 18px',
                borderRadius: 100,
                backgroundColor: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <span aria-hidden>{IconPlus}</span>
              Create event
            </button>
            <Link to="/host/profile" aria-label="Edit profile">
              <Avatar url={profile?.avatar_url ?? null} name={displayName} />
            </Link>
          </div>
        </header>

        {/* PAGE */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(24px, 3.2vw, 40px) clamp(20px, 3vw, 40px) 60px',
            backgroundColor: '#fff',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
