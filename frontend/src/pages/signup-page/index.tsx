// frontend/src/pages/signup-page/index.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthIllustration } from '@/components/ui/AuthIllustration';
import { EyeIcon, GoogleIcon } from '@/components/ui/AuthIcons';
import { Button } from '@/components/ui/Button';

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <AuthIllustration />

      {/* Right: Form panel */}
      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto bg-white px-8 py-9 md:px-11">

        {/* Logo / back to home */}
        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
        >
          <span
            className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] bg-primary text-[13px] font-bold text-white"
            style={{ boxShadow: '0 2px 8px -2px oklch(55% 0.09 170 / 0.5)' }}
          >
            X
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-text">
            XtravaGala
          </span>
        </Link>

        {/* Form */}
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="mb-1 text-[24px] font-semibold tracking-tight text-text">
            Create your account
          </h1>
          <p className="mb-7 text-[13.5px] text-text-mute">
            Join XtravaGala today
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

            {/* Full name */}
            <div className="mb-3">
              <label htmlFor="name" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                           placeholder:text-text-mute/50 transition-colors duration-200
                           focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-[42px] w-full rounded-[9px] border border-border bg-surface px-3.5 text-sm text-text
                           placeholder:text-text-mute/50 transition-colors duration-200
                           focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="mb-1">
              <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-text-mute">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
            <p className="mb-5 text-[11px] text-text-mute">
              Use 8 or more characters
            </p>

            {/* Submit */}
            <Button type="submit" variant="primary" className="w-full justify-center">
              Create account
            </Button>
          </form>

          {/* Sign-in link */}
          <p className="mt-5 text-center text-[13px] text-text-mute">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary transition-opacity hover:opacity-75"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
