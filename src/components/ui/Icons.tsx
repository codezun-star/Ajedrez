/**
 * A small set of inline stroke icons (no icon-font dependency). Each takes the
 * usual SVG props so size/color come from the caller via className.
 */

import { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const VolumeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
  </svg>
);

export const MuteIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="m23 9-6 6M17 9l6 6" />
  </svg>
);

export const UndoIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

export const FlipIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M17 2.1 21 6l-4 3.9" />
    <path d="M21 6H8a5 5 0 0 0-5 5v1" />
    <path d="M7 21.9 3 18l4-3.9" />
    <path d="M3 18h13a5 5 0 0 0 5-5v-1" />
  </svg>
);

export const FlagIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <path d="M4 22v-7" />
  </svg>
);

export const RefreshIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

export const ChartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 3v18h18" />
    <path d="m7 15 3-4 3 2 4-6" />
  </svg>
);

export const TrophyIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 0 0 12 0V3H6z" />
    <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 21h6M12 15v6" />
  </svg>
);

export const ChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronsLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
  </svg>
);

export const ChevronsRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
  </svg>
);

export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const CopyIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CrownIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 8l4.5 3.5L12 4l5.5 7.5L22 8l-2 11H4z" />
  </svg>
);
