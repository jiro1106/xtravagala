import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCities } from '@/hooks/useCities';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/lib/supabase';
import { slugifyTitle } from '@/lib/slug';

interface EventFormState {
  title: string;
  description: string;
  city_id: string;
  category_id: string;
  venue: string;
  address: string;
  start_local: string;
  end_local: string;
  price_php: string;
  capacity: string;
  cover_image_url: string | null;
  slug: string;
  status: 'draft' | 'published';
}

const EMPTY: EventFormState = {
  title: '',
  description: '',
  city_id: '',
  category_id: '',
  venue: '',
  address: '',
  start_local: '',
  end_local: '',
  price_php: '',
  capacity: '',
  cover_image_url: null,
  slug: '',
  status: 'draft',
};

// "2026-06-21T19:00" (datetime-local, Asia/Manila) → "2026-06-21T19:00:00+08:00"
function localToIso(local: string): string | null {
  if (!local) return null;
  const padded = local.length === 16 ? local + ':00' : local;
  return `${padded}+08:00`;
}

// ISO → "2026-06-21T19:00" assuming Asia/Manila
function isoToLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  // shift to UTC+8
  const pht = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return pht.toISOString().slice(0, 16);
}

export function HostEventEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cities } = useCities();
  const { data: categories } = useCategories();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<EventFormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (err || !data) {
        setError(err?.message ?? 'Event not found.');
        setLoading(false);
        return;
      }
      setForm({
        title: data.title,
        description: data.description ?? '',
        city_id: data.city_id,
        category_id: data.category_id,
        venue: data.venue ?? '',
        address: data.address ?? '',
        start_local: isoToLocal(data.start_at),
        end_local: isoToLocal(data.end_at),
        price_php: data.price_php != null ? String(data.price_php) : '',
        capacity: data.capacity != null ? String(data.capacity) : '',
        cover_image_url: data.cover_image_url,
        slug: data.slug,
        status: (data.status as 'draft' | 'published') ?? 'draft',
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function set<K extends keyof EventFormState>(key: K, value: EventFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadCover(eventId: string, file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${eventId}/cover-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('event-covers')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return null;
    }
    const { data } = supabase.storage.from('event-covers').getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
  }

  async function handlePickFile(file: File) {
    if (!user) return;
    setError('');
    if (isEdit && id) {
      const url = await uploadCover(id, file);
      if (url) {
        set('cover_image_url', url);
        await supabase.from('events').update({ cover_image_url: url }).eq('id', id);
      }
      return;
    }
    // new mode: stash the file, upload after first save
    pendingFileRef.current = file;
    // show local preview
    const reader = new FileReader();
    reader.onload = (e) => set('cover_image_url', (e.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }

  const pendingFileRef = useRef<File | null>(null);

  async function handleSave(targetStatus: 'draft' | 'published') {
    if (!user) return;
    setSaving(true);
    setError('');

    const startIso = localToIso(form.start_local);
    if (!startIso) {
      setError('Start date is required.');
      setSaving(false);
      return;
    }
    if (!form.title.trim() || !form.city_id || !form.category_id) {
      setError('Title, city, and category are required.');
      setSaving(false);
      return;
    }

    const slug = form.slug || slugifyTitle(form.title);

    const payload = {
      host_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      slug,
      city_id: form.city_id,
      category_id: form.category_id,
      venue: form.venue.trim() || null,
      address: form.address.trim() || null,
      start_at: startIso,
      end_at: localToIso(form.end_local),
      price_php: form.price_php ? Number(form.price_php) : null,
      capacity: form.capacity ? Number(form.capacity) : null,
      status: targetStatus,
      published_at:
        targetStatus === 'published' ? new Date().toISOString() : null,
      cover_image_url: form.cover_image_url,
    };

    if (isEdit && id) {
      const { error: err } = await supabase.from('events').update(payload).eq('id', id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      navigate('/host/dashboard');
      return;
    }

    // new mode: insert, then upload cover if pending
    const { data: inserted, error: insErr } = await supabase
      .from('events')
      .insert(payload)
      .select('id')
      .single();
    if (insErr || !inserted) {
      setError(insErr?.message ?? 'Could not create event.');
      setSaving(false);
      return;
    }

    if (pendingFileRef.current) {
      const url = await uploadCover(inserted.id, pendingFileRef.current);
      if (url) {
        await supabase.from('events').update({ cover_image_url: url }).eq('id', inserted.id);
      }
    }

    navigate('/host/dashboard');
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setDeleting(true);
    const { error: err } = await supabase.from('events').delete().eq('id', id);
    if (err) {
      setError(err.message);
      setDeleting(false);
      return;
    }
    navigate('/host/dashboard');
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: 'var(--text-mute)' }}>Loading event…</div>
    );
  }

  const inputStyle: React.CSSProperties = {
    height: 42,
    width: '100%',
    borderRadius: 9,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    padding: '0 14px',
    fontSize: 14,
    color: 'var(--text)',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    color: 'var(--text-mute)',
    fontWeight: 500,
    marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link
            to="/host/dashboard"
            style={{ fontSize: 12.5, color: 'var(--text-mute)', textDecoration: 'none' }}
          >
            ← Back to dashboard
          </Link>
          <h1 style={{ margin: '8px 0 4px', fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {isEdit ? 'Edit event' : 'Create event'}
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-mute)' }}>
            {isEdit ? 'Update the details, then save.' : 'Fill in the basics. You can come back and refine later.'}
          </p>
        </div>
      </div>

      {/* Cover */}
      <div
        style={{
          marginTop: 24,
          borderRadius: 22,
          border: '1.5px dashed var(--border)',
          backgroundColor: 'var(--surface)',
          height: 220,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => fileRef.current?.click()}
      >
        {form.cover_image_url ? (
          <img
            src={form.cover_image_url}
            alt="Cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-mute)',
              gap: 6,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 17l5-4 4 3 3-2 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500 }}>
              {uploading ? 'Uploading…' : 'Click to add a cover image'}
            </p>
            <p style={{ margin: 0, fontSize: 12 }}>JPG, PNG, or WebP. Landscape works best.</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handlePickFile(f);
          }}
        />
      </div>

      {/* Form */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label htmlFor="title" style={labelStyle}>Title</label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Sunset Beats at La Union"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What's the vibe? Who's playing? What should attendees bring?"
            style={{ ...inputStyle, height: 'auto', padding: '12px 14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label htmlFor="city" style={labelStyle}>City</label>
            <select
              id="city"
              value={form.city_id}
              onChange={(e) => set('city_id', e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a city…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" style={labelStyle}>Category</label>
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label htmlFor="venue" style={labelStyle}>Venue</label>
            <input
              id="venue"
              type="text"
              value={form.venue}
              onChange={(e) => set('venue', e.target.value)}
              placeholder="e.g. The Palace Pool Club"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="address" style={labelStyle}>Address</label>
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Street, city"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label htmlFor="start_local" style={labelStyle}>Starts (Asia/Manila)</label>
            <input
              id="start_local"
              type="datetime-local"
              value={form.start_local}
              onChange={(e) => set('start_local', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="end_local" style={labelStyle}>Ends (optional)</label>
            <input
              id="end_local"
              type="datetime-local"
              value={form.end_local}
              onChange={(e) => set('end_local', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label htmlFor="price" style={labelStyle}>Price (PHP)</label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              value={form.price_php}
              onChange={(e) => set('price_php', e.target.value)}
              placeholder="0 for free"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="capacity" style={labelStyle}>Capacity (optional)</label>
            <input
              id="capacity"
              type="number"
              min="1"
              step="1"
              value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)}
              placeholder="No limit"
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p style={{
            margin: 0,
            padding: '10px 14px',
            borderRadius: 9,
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: 13,
          }}>
            {error}
          </p>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
          marginTop: 6,
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              disabled={saving || uploading}
              onClick={() => void handleSave('draft')}
              style={{
                padding: '11px 18px',
                borderRadius: 100,
                border: '1px solid var(--border)',
                backgroundColor: '#fff',
                color: 'var(--text)',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              type="button"
              disabled={saving || uploading}
              onClick={() => void handleSave('published')}
              style={{
                padding: '11px 22px',
                borderRadius: 100,
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving…' : isEdit && form.status === 'published' ? 'Save & keep live' : 'Publish'}
            </button>
          </div>

          {isEdit && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting}
              style={{
                padding: '10px 16px',
                borderRadius: 100,
                border: '1px solid #fecaca',
                backgroundColor: '#fff',
                color: '#b91c1c',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? 'Deleting…' : 'Delete event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
