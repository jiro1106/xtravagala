import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const next = searchParams.get('next') ?? '/';

    // Supabase JS client has detectSessionInUrl=true by default — it auto-exchanges
    // the OAuth/PKCE code in the URL into a session on init. We just wait for that
    // to land, then redirect. Polling getSession briefly handles the race where the
    // exchange happens slightly after this component mounts.
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3s
    const interval = setInterval(async () => {
      if (cancelled) return;
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        setError(sessionErr.message);
        clearInterval(interval);
        return;
      }
      if (session) {
        clearInterval(interval);
        navigate(next, { replace: true });
        return;
      }
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setError('Sign-in took too long. Please try again.');
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="mb-4 text-[14px] text-text-mute">{error}</p>
          <a href="/login" className="text-[14px] font-medium text-primary transition-opacity hover:opacity-75">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
