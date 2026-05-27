import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthIllustration } from "@/components/ui/AuthIllustration";
import { EyeIcon, GoogleIcon } from "@/components/ui/AuthIcons";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { friendlyAuthError } from "@/lib/auth-errors";

export function SignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, navigate, next]);

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setError(friendlyAuthError(error));
      setLoading(false);
    } else if (data.session) {
      navigate(next, { replace: true });
    } else {
      setCheckEmail(true);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  if (checkEmail) {
    return (
      <div className="flex h-screen overflow-hidden flex-col md:flex-row">
        <AuthIllustration />
        <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img
              src="/icon.png"
              alt="XtravaGala"
              className="h-8 w-auto shrink-0 object-contain"
            />
            <span
              className="text-[17px] uppercase text-primary"
              style={{
                fontFamily: "'Paytone One', sans-serif",
                fontWeight: 400,
                letterSpacing: "-0.04em",
              }}
            >
              Xtravagala
            </span>
          </Link>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
            <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
              Check your email
            </h1>
            <p className="text-[13.5px] text-text-mute">
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account.
            </p>
            <Link
              to="/login"
              className="mt-6 text-[13px] font-medium text-primary transition-opacity hover:opacity-75"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img
            src="/icon.png"
            alt="XtravaGala"
            className="h-8 w-auto shrink-0 object-contain"
          />
          <span
            className="text-[17px] uppercase text-primary"
            style={{
              fontFamily: "'Paytone One', sans-serif",
              fontWeight: 400,
              letterSpacing: "-0.04em",
            }}
          >
            Xtravagala
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
            Create your account
          </h1>
          <p className="mb-7 text-[13.5px] text-text-mute">
            Sign up to your account
          </p>

          <form onSubmit={handleEmailSignUp} className="flex flex-col">
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleGoogle}
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={loading ? {} : { y: -1 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.36, 1] }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-text-mute">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="mb-3">
              <label
                htmlFor="name"
                className="mb-1.5 block text-[12px] font-medium text-text-mute"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="email"
                className="mb-1.5 block text-[12px] font-medium text-text-mute"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="mb-1">
              <label
                htmlFor="password"
                className="mb-1.5 block text-[12px] font-medium text-text-mute"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text placeholder:text-text-mute/50 transition-colors duration-200 focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute transition-colors hover:text-text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <p className="mb-5 text-[11px] text-text-mute">
              Use 6 or more characters
            </p>

            {error && (
              <p className="mb-4 rounded-[9px] bg-red-50 px-3.5 py-2.5 text-[13px] text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-text-mute">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary transition-opacity hover:opacity-75"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-auto pt-6 text-center text-[12.5px] text-text-mute">
          Are you a host?{" "}
          <Link
            to="/host/login"
            className="font-medium text-primary transition-opacity hover:opacity-75"
          >
            Sign in to host portal
          </Link>
        </p>
      </div>
    </div>
  );
}
