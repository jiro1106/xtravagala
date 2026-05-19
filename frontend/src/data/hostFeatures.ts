export interface HostFeature {
  id: string;
  name: string;
  colorVariant: 'teal-deep' | 'slate' | 'cream' | 'teal';
  svgContent: string;
}

export const hostFeatures: HostFeature[] = [
  {
    id: 'scheduling',
    name: 'Scheduling',
    colorVariant: 'teal-deep',
    svgContent: `<g stroke="#2a2e30" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="14" y="22" width="92" height="64" rx="3"/>
      <line x1="14" y1="38" x2="106" y2="38"/>
      <line x1="32" y1="22" x2="32" y2="16"/>
      <line x1="60" y1="22" x2="60" y2="16"/>
      <line x1="88" y1="22" x2="88" y2="16"/>
      <line x1="32" y1="50" x2="44" y2="50"/>
      <line x1="32" y1="58" x2="50" y2="58"/>
      <line x1="58" y1="50" x2="74" y2="50"/>
      <line x1="58" y1="58" x2="68" y2="58"/>
      <line x1="80" y1="50" x2="96" y2="50"/>
      <line x1="32" y1="68" x2="42" y2="68"/>
      <line x1="58" y1="68" x2="80" y2="68"/>
      <rect fill="var(--primary)" stroke="none" x="56" y="44" width="16" height="4" rx="1" opacity="0.85"/>
    </g>`,
  },
  {
    id: 'tracking',
    name: 'Real-time tracking',
    colorVariant: 'slate',
    svgContent: `<g stroke="#2a2e30" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="10" y="22" width="100" height="56" rx="3"/>
      <polyline points="18,66 32,52 44,58 58,40 70,46 84,32 96,38 102,30"/>
      <line x1="18" y1="74" x2="102" y2="74"/>
      <line x1="18" y1="26" x2="18" y2="74"/>
      <circle stroke="var(--primary)" cx="84" cy="32" r="3.5"/>
      <circle fill="var(--primary)" stroke="none" cx="84" cy="32" r="2"/>
    </g>`,
  },
  {
    id: 'rentals',
    name: 'Equipment rentals',
    colorVariant: 'cream',
    svgContent: `<g stroke="#2a2e30" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 70 L22 50 L40 36 L58 50 L58 70 Z"/>
      <rect x="34" y="56" width="12" height="14"/>
      <path d="M62 70 L62 44 L82 30 L102 44 L102 70 Z"/>
      <line x1="72" y1="50" x2="92" y2="50"/>
      <line x1="72" y1="58" x2="92" y2="58"/>
      <line x1="82" y1="44" x2="82" y2="70"/>
      <line x1="10" y1="70" x2="110" y2="70"/>
      <circle fill="var(--primary)" stroke="none" cx="40" cy="46" r="2.5"/>
    </g>`,
  },
  {
    id: 'catering',
    name: 'Catering',
    colorVariant: 'teal',
    svgContent: `<g stroke="#2a2e30" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="60" cy="68" rx="36" ry="6"/>
      <path d="M28 62 L92 62 L88 38 L32 38 Z"/>
      <line x1="40" y1="38" x2="42" y2="62"/>
      <line x1="60" y1="38" x2="60" y2="62"/>
      <line x1="80" y1="38" x2="78" y2="62"/>
      <path d="M44 38 Q48 28 52 38"/>
      <path d="M64 38 Q68 26 72 38"/>
      <circle fill="var(--primary)" stroke="none" cx="60" cy="32" r="2.5"/>
      <line x1="60" y1="20" x2="60" y2="30"/>
    </g>`,
  },
  {
    id: 'consultation',
    name: 'Consultation',
    colorVariant: 'slate',
    svgContent: `<g stroke="#2a2e30" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="44" cy="40" r="10"/>
      <path d="M28 78 Q28 60 44 60 Q60 60 60 78"/>
      <circle cx="78" cy="46" r="8"/>
      <path d="M66 80 Q66 64 78 64 Q90 64 90 80"/>
      <path stroke="var(--primary)" d="M70 30 Q78 22 86 30"/>
      <circle fill="var(--primary)" stroke="none" cx="78" cy="30" r="1.6"/>
    </g>`,
  },
];
