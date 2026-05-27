import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export function ProfileTab() {
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const insideHostShell = pathname.startsWith('/host/');
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [hydrated, setHydrated] = useState(!!profile);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync form once profile arrives from AuthContext. Without this, a hard
  // reload (incl. the post-save reload below) lands here with profile=null,
  // so the initial useState snapshots empty values and the form looks wiped.
  useEffect(() => {
    if (profile && !hydrated) {
      setFullName(profile.full_name ?? '');
      setAvatarUrl(profile.avatar_url ?? null);
      setHydrated(true);
    }
  }, [profile, hydrated]);

  async function handleUpload(file: File) {
    if (!user) return;
    setUploading(true);
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError('');
    setSaved(false);
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq('id', user.id);
    if (upErr) {
      setError(upErr.message);
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <section
      className={insideHostShell ? undefined : 'wrap'}
      style={{ padding: insideHostShell ? '0' : '70px 0 100px' }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
          Account
        </span>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-text">My profile</h1>
        <p className="mt-1 text-[14px] text-text-mute">
          Update your display name and photo. Your avatar is required to become a host.
        </p>

        <div className="mt-9 rounded-[22px] border border-border bg-white p-7">
          <div className="flex items-center gap-5">
            <div
              className="flex items-center justify-center overflow-hidden rounded-full bg-muted text-[20px] font-semibold text-text-mute"
              style={{ height: 80, width: 80, flexShrink: 0 }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                fullName?.[0]?.toUpperCase() ?? '?'
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
              </Button>
              <p className="mt-2 text-[12px] text-text-mute">JPG or PNG, up to ~2 MB.</p>
            </div>
          </div>

          <div className="mt-7">
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-[12px] font-medium text-text-mute"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
              className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {error && (
            <p className="mt-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
              {error}
            </p>
          )}
          {saved && (
            <p className="mt-4 rounded-[9px] bg-primary/10 px-3.5 py-2.5 text-[13px] text-primary">
              Saved.
            </p>
          )}

          <div className="mt-7 flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving || uploading || !fullName.trim()}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {insideHostShell ? null : profile?.is_host ? (
              <Link
                to="/host/dashboard"
                className="text-[13.5px] text-text-mute transition-colors hover:text-primary"
              >
                Back to dashboard
              </Link>
            ) : (
              <Link
                to="/host/upgrade"
                className="text-[13.5px] text-text-mute transition-colors hover:text-primary"
              >
                Become a host →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
