import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="min-h-[70vh] grid place-items-center px-6 py-24">
      <div className="text-center max-w-md">
        <p className="text-[14px] font-medium text-[var(--text-mute)] tracking-wide uppercase">
          404
        </p>
        <h1
          className="mt-3 text-[clamp(32px,3.8vw,46px)] leading-[1.05] -tracking-[0.02em]"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic' }}
        >
          This page wandered off.
        </h1>
        <p className="mt-4 text-[16px] text-[var(--text-mute)] leading-[1.55]">
          The link may be broken, or the page may have been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-[var(--primary)] text-white font-medium text-[15px] transition-opacity hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
