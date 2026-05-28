import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export function HostUpgradePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [hostName, setHostName] = useState(profile?.host_name ?? profile?.full_name ?? '');
  const [hostBio, setHostBio] = useState(profile?.host_bio ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.is_host) navigate('/host/dashboard', { replace: true });
  }, [profile?.is_host, navigate]);

  const missingAvatar = !profile?.avatar_url;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || missingAvatar) return;
    setSaving(true);
    setError('');
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ is_host: true, host_name: hostName.trim(), host_bio: hostBio.trim() || null })
      .eq('id', user.id);
    if (upErr) {
      setError(upErr.message);
      setSaving(false);
      return;
    }
    window.location.assign('/host/dashboard');
  }

  return (
    <section
      className="wrap"
      style={{
        padding: '70px 0 100px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
          Host portal
        </span>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-text">
          Become a host
        </h1>
        <p className="mt-1 text-[14px] text-text-mute">
          A few details and you can start publishing events.
        </p>

        <div className="mt-9 rounded-[22px] border border-border bg-white p-7">
          {missingAvatar ? (
            <div className="rounded-[14px] border border-border bg-surface p-5">
              <p className="text-[14px] font-medium text-text">
                Set up your profile first
              </p>
              <p className="mt-1 text-[13.5px] text-text-mute">
                Hosts need a profile photo before they can publish events.
              </p>
              <div className="mt-4">
                <Button variant="primary" size="sm" to="/profile">
                  Add a profile photo
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="host_name"
                  className="mb-1.5 block text-[12px] font-medium text-text-mute"
                >
                  Host name (shown on your events)
                </label>
                <input
                  id="host_name"
                  type="text"
                  required
                  maxLength={80}
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="host_bio"
                  className="mb-1.5 block text-[12px] font-medium text-text-mute"
                >
                  Short bio (optional)
                </label>
                <textarea
                  id="host_bio"
                  rows={4}
                  maxLength={280}
                  value={hostBio}
                  onChange={(e) => setHostBio(e.target.value)}
                  placeholder="Tell attendees what you organize…"
                  className="w-full rounded-[9px] border border-border bg-surface px-3.5 py-2.5 text-sm text-text transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-text-mute">
                  {hostBio.length}/280
                </p>
              </div>

              {error && (
                <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="default"
                  type="submit"
                  disabled={saving || !hostName.trim()}
                  showArrow
                >
                  {saving ? 'Setting up…' : 'Become a host'}
                </Button>
                <Link
                  to="/"
                  className="text-[13.5px] text-text-mute transition-colors hover:text-primary"
                >
                  Not now
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
