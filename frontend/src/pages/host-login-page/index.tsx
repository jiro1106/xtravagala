import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HostIllustration } from '@/components/ui/HostIllustration';
import { EyeIcon, GoogleIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';

export function HostLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <HostIllustration />

      {/* Right: Form panel */}
      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">

        {/* Logo / back to home */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/icon.png" alt="XtravaGala" className="h-8 w-auto shrink-0 object-contain" />
          <span
            className="text-[17px] uppercase text-primary"
            style={{ fontFamily: "'Paytone One', sans-serif", fontWeight: 400, letterSpacing: "-0.04em" }}
          >
            Xtravagala
          </span>
        </Link>

        {/* Form */}
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {/* Host portal badge */}
          <span className="mb-3 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Host portal
          </span>

          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
            Welcome back, host
          </h1>
          <p className="mb-7 text-[13.5px] text-text-mute">
            Sign in to your host account
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
            {/* Google OAuth button */}
            <motion.button
              type="button"
              className="mb-5 flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-white text-[14px] font-medium text-text transition-colors duration-200 hover:border-primary"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.36, 1] }}
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            {/* Divider */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-[12px] text-text-mute">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="host-email" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Email
              </label>
              <input
                id="host-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                           placeholder:text-text-mute/50 transition-colors duration-200
                           focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label htmlFor="host-password" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Password
              </label>
              <div className="relative">
                <input
                  id="host-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 pr-10 text-sm text-text
                             placeholder:text-text-mute/50 transition-colors duration-200
                             focus:border-primary focus:bg-white focus:outline-none"
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
            </div>

            {/* Forgot password */}
            <div className="mb-5 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[12.5px] text-primary transition-opacity hover:opacity-75"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" className="w-full justify-center">
              Sign in to host portal
            </Button>
          </form>

        </div>

        {/* Attendee cross-link — bottom of panel */}
        <p className="mt-auto pt-6 text-center text-[12.5px] text-text-mute">
          Not a host?{' '}
          <Link
            to="/login"
            className="font-medium text-primary transition-opacity hover:opacity-75"
          >
            Sign in as attendee
          </Link>
        </p>
      </div>
    </div>
  );
}
