// frontend/src/components/ui/AuthIllustration.tsx
export function AuthIllustration() {
  return (
    <div
      className="relative flex w-full shrink-0 flex-col items-center justify-center overflow-hidden py-12 px-8
                 h-48 md:h-auto md:w-[55%] bg-primary"
    >
      {/* Blob decorations */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/[0.06]" />
      <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/[0.05]" />
      <div className="absolute top-[40%] -left-10 h-32 w-32 rounded-full bg-white/[0.04]" />

      {/* Dot grid — top right, desktop only */}
      <div
        className="absolute top-6 right-6 hidden grid-cols-5 gap-2 opacity-20 md:grid"
        aria-hidden="true"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="block h-1.5 w-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* SVG Illustration — desktop only */}
      <div className="relative z-10 mb-6 hidden w-full justify-center md:flex">
        <svg width="300" height="280" viewBox="0 0 300 280" fill="none">
          {/* Event calendar card */}
          <rect
            x="70"
            y="60"
            width="100"
            height="112"
            rx="14"
            fill="white"
            fillOpacity="0.18"
          />
          <rect
            x="70"
            y="60"
            width="100"
            height="30"
            rx="14"
            fill="white"
            fillOpacity="0.28"
          />
          <rect
            x="70"
            y="74"
            width="100"
            height="16"
            fill="white"
            fillOpacity="0.28"
          />
          <rect
            x="82"
            y="68"
            width="30"
            height="6"
            rx="3"
            fill="white"
            fillOpacity="0.5"
          />
          <rect
            x="118"
            y="68"
            width="20"
            height="6"
            rx="3"
            fill="white"
            fillOpacity="0.3"
          />
          {/* Calendar date cells */}
          <rect
            x="83"
            y="104"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.45"
          />
          <rect
            x="103"
            y="104"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.3"
          />
          <rect
            x="123"
            y="104"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.45"
          />
          <rect
            x="143"
            y="104"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.2"
          />
          <rect
            x="83"
            y="124"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.3"
          />
          {/* Highlighted date */}
          <rect
            x="103"
            y="124"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.7"
          />
          <rect
            x="123"
            y="124"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.3"
          />
          <rect
            x="143"
            y="124"
            width="14"
            height="14"
            rx="4"
            fill="white"
            fillOpacity="0.45"
          />

          {/* Ticket stub — rotated */}
          <g transform="rotate(-10 200 80)">
            <rect
              x="172"
              y="52"
              width="76"
              height="40"
              rx="9"
              fill="white"
              fillOpacity="0.2"
            />
            <circle cx="179" cy="72" r="6" fill="white" fillOpacity="0.4" />
            <rect
              x="190"
              y="65"
              width="46"
              height="6"
              rx="3"
              fill="white"
              fillOpacity="0.4"
            />
            <rect
              x="190"
              y="75"
              width="32"
              height="4"
              rx="2"
              fill="white"
              fillOpacity="0.25"
            />
            <line
              x1="246"
              y1="52"
              x2="246"
              y2="92"
              stroke="white"
              strokeOpacity="0.15"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          </g>

          {/* Person A — left figure */}
          <circle cx="94" cy="196" r="14" fill="white" fillOpacity="0.28" />
          <path
            d="M72 238 Q94 218 116 238"
            stroke="white"
            strokeOpacity="0.28"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arm reaching right */}
          <path
            d="M110 220 Q126 214 138 218"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Person B — right figure */}
          <circle cx="196" cy="192" r="14" fill="white" fillOpacity="0.28" />
          <path
            d="M174 234 Q196 214 218 234"
            stroke="white"
            strokeOpacity="0.28"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arm reaching left */}
          <path
            d="M180 214 Q162 210 152 216"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Connection point between people */}
          <circle cx="145" cy="216" r="10" fill="white" fillOpacity="0.22" />
          <path
            d="M139 216 L151 216 M145 210 L145 222"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Map pin accent */}
          <g transform="translate(224, 136)">
            <circle cx="0" cy="-4" r="9" fill="white" fillOpacity="0.22" />
            <circle cx="0" cy="-4" r="4" fill="white" fillOpacity="0.4" />
            <path
              d="M0 5 L0 14"
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Sparkle / dot accents */}
          <circle cx="58" cy="148" r="4" fill="white" fillOpacity="0.25" />
          <circle cx="248" cy="162" r="3" fill="white" fillOpacity="0.2" />
          <circle cx="42" cy="88" r="5" fill="white" fillOpacity="0.15" />
          <circle cx="262" cy="108" r="6" fill="white" fillOpacity="0.12" />
          <path
            d="M230 52 L230 60 M226 56 L234 56"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M55 170 L55 176 M52 173 L58 173"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Tagline */}
      <div className="relative z-10 text-center">
        <h2 className="text-3xl font-semibold leading-snug tracking-tight text-white">
          Find events worth
          <br />
          showing up for
        </h2>
      </div>
    </div>
  );
}
