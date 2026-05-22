// frontend/src/components/ui/HostIllustration.tsx
export function HostIllustration() {
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-center justify-center overflow-hidden py-12 px-8
                 h-48 md:h-auto md:w-[55%] bg-[oklch(26%_0.07_170)]"
    >
      {/* Blob decorations */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/[0.05]" />

      {/* Dot grid — top right, desktop only */}
      <div className="absolute top-6 right-6 hidden grid-cols-5 gap-2 opacity-20 md:grid" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="block h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* SVG Illustration — desktop only */}
      <div className="relative z-10 mb-6 hidden w-full justify-center md:flex">
        <svg width="300" height="280" viewBox="0 0 300 280" fill="none">
          {/* Dashboard card */}
          <rect x="30" y="28" width="240" height="162" rx="16" fill="white" fillOpacity="0.10" />
          {/* Top bar */}
          <rect x="30" y="28" width="240" height="36" rx="16" fill="white" fillOpacity="0.14" />
          <rect x="30" y="50" width="240" height="14" fill="white" fillOpacity="0.14" />
          <rect x="48" y="40" width="52" height="8" rx="4" fill="white" fillOpacity="0.50" />
          {/* Live indicator */}
          <circle cx="244" cy="44" r="5" fill="white" fillOpacity="0.22" />
          <circle cx="244" cy="44" r="2.5" fill="white" fillOpacity="0.75" />
          <rect x="212" y="40" width="26" height="8" rx="4" fill="white" fillOpacity="0.30" />

          {/* Stat chips row */}
          <rect x="46" y="76" width="58" height="30" rx="8" fill="white" fillOpacity="0.13" />
          <rect x="50" y="81" width="22" height="6" rx="3" fill="white" fillOpacity="0.38" />
          <rect x="50" y="91" width="32" height="9" rx="4.5" fill="white" fillOpacity="0.55" />

          <rect x="116" y="76" width="58" height="30" rx="8" fill="white" fillOpacity="0.13" />
          <rect x="120" y="81" width="28" height="6" rx="3" fill="white" fillOpacity="0.38" />
          <rect x="120" y="91" width="22" height="9" rx="4.5" fill="white" fillOpacity="0.55" />

          <rect x="186" y="76" width="68" height="30" rx="8" fill="white" fillOpacity="0.13" />
          <rect x="190" y="81" width="30" height="6" rx="3" fill="white" fillOpacity="0.38" />
          <rect x="190" y="91" width="38" height="9" rx="4.5" fill="white" fillOpacity="0.55" />

          {/* Bar chart */}
          <rect x="48" y="158" width="16" height="18" rx="4" fill="white" fillOpacity="0.22" />
          <rect x="70" y="146" width="16" height="30" rx="4" fill="white" fillOpacity="0.30" />
          <rect x="92" y="134" width="16" height="42" rx="4" fill="white" fillOpacity="0.42" />
          <rect x="114" y="140" width="16" height="36" rx="4" fill="white" fillOpacity="0.35" />
          <rect x="136" y="124" width="16" height="52" rx="4" fill="white" fillOpacity="0.58" />
          <rect x="158" y="134" width="16" height="42" rx="4" fill="white" fillOpacity="0.42" />
          <rect x="180" y="128" width="16" height="48" rx="4" fill="white" fillOpacity="0.50" />
          {/* Chart baseline */}
          <line x1="40" y1="178" x2="260" y2="178" stroke="white" strokeOpacity="0.12" strokeWidth="1" />

          {/* Attendee avatar cluster — right of bar chart */}
          <circle cx="214" cy="150" r="11" fill="white" fillOpacity="0.20" />
          <circle cx="230" cy="150" r="11" fill="white" fillOpacity="0.17" />
          <circle cx="246" cy="150" r="11" fill="white" fillOpacity="0.22" />
          <rect x="208" y="164" width="46" height="6" rx="3" fill="white" fillOpacity="0.28" />

          {/* Floating ticket stub — top left, rotated */}
          <g transform="rotate(-8 80 20)">
            <rect x="46" y="6" width="68" height="34" rx="9" fill="white" fillOpacity="0.14" />
            <circle cx="54" cy="23" r="6" fill="white" fillOpacity="0.35" />
            <rect x="64" y="17" width="40" height="6" rx="3" fill="white" fillOpacity="0.38" />
            <rect x="64" y="27" width="28" height="4" rx="2" fill="white" fillOpacity="0.22" />
            <line x1="106" y1="6" x2="106" y2="40" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>

          {/* Sparkle accents */}
          <circle cx="22" cy="110" r="4" fill="white" fillOpacity="0.20" />
          <circle cx="278" cy="130" r="3" fill="white" fillOpacity="0.17" />
          <path d="M268 50 L268 58 M264 54 L272 54" stroke="white" strokeOpacity="0.28" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 160 L22 166 M19 163 L25 163" stroke="white" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="268" cy="200" r="5" fill="white" fillOpacity="0.14" />
        </svg>
      </div>

      {/* Tagline */}
      <div className="relative z-10 text-center">
        <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-white">
          Every event, fully<br />in control.
        </h2>
        <p className="mt-1.5 text-[13px] text-white/60">The host platform for the Philippines</p>
      </div>
    </div>
  );
}
