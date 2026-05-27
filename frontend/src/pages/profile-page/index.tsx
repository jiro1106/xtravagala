import { useLocation, useSearchParams } from 'react-router-dom';
import { ProfileTab } from './ProfileTab';
import { MyEventsTab } from './MyEventsTab';

type TabKey = 'profile' | 'events';

function parseTab(value: string | null): TabKey {
  return value === 'events' ? 'events' : 'profile';
}

export function ProfilePage() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const insideHostShell = pathname.startsWith('/host/');

  // Host shell variant: no tabs, original form only.
  if (insideHostShell) {
    return <ProfileTab />;
  }

  const activeTab = parseTab(searchParams.get('tab'));

  const selectTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'profile') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px clamp(22px, 4vw, 48px) 80px' }}>
      <div
        role="tablist"
        aria-label="Profile sections"
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--border)',
          marginBottom: 32,
        }}
      >
        <TabButton label="Profile" active={activeTab === 'profile'} onClick={() => selectTab('profile')} />
        <TabButton label="My events" active={activeTab === 'events'} onClick={() => selectTab('events')} />
      </div>

      {activeTab === 'profile' ? <ProfileTab /> : <MyEventsTab />}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '12px 16px',
        marginBottom: -1,
        fontSize: 14,
        fontWeight: 500,
        color: active ? 'var(--text)' : 'var(--text-mute)',
        borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
