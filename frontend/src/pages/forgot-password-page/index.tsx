import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSubmitted(true);
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
          {submitted ? (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Check your email</h1>
              <p className="text-[13.5px] text-text-mute">
                If that email is registered, you'll receive a reset link shortly.
              </p>
              <Link
                to="/login"
                className="mt-6 text-[13px] font-medium text-primary transition-opacity hover:opacity-75"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">Forgot password?</h1>
              <p className="mb-7 text-[13.5px] text-text-mute">
                Enter your email and we'll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col">
                {error && (
                  <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">{error}</p>
                )}

                <div className="mb-5">
                  <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-text-mute">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <p className="mt-5 text-center text-[13px] text-text-mute">
                <Link to="/login" className="font-medium text-primary transition-opacity hover:opacity-75">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
