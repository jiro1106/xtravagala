import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { EyeIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [exchanging, setExchanging] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Invalid or expired reset link.');
      setExchanging(false);
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError(error.message);
      setExchanging(false);
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span className="text-[17px] uppercase text-primary" style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: '-0.04em' }}>
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {exchanging ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : error && !password ? (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Link expired</h1>
              <p className="mb-5 text-[13.5px] text-text-mute">{error}</p>
              <Link to="/forgot-password" className="text-[13px] font-medium text-primary transition-opacity hover:opacity-75">
                Request a new reset link
              </Link>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Set new password</h1>
              <p className="mb-7 text-[13.5px] text-text-mute">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} className="flex flex-col">
                {error && (
                  <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
                )}

                <div className="mb-5">
                  <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-text-mute">New password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute transition-colors hover:text-text"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-text-mute">Use 6 or more characters</p>
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
                  {loading ? 'Saving…' : 'Set new password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
