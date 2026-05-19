/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-deep': 'var(--primary-deep)',
        'primary-glow': 'var(--primary-glow)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'nav-bg': 'var(--nav-bg)',
        dark: 'var(--dark)',
        text: 'var(--text)',
        'text-mute': 'var(--text-mute)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        slate: 'var(--slate)',
        'experience-bg': 'var(--experience-bg)',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'serif-accent': ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      borderRadius: {
        pill: '100px',
        card: '24px',
        'card-lg': '28px',
        media: '16px',
        'media-sm': '14px',
      },
      maxWidth: {
        wrap: '1360px',
      },
    },
  },
  plugins: [],
}
