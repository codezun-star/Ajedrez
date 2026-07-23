/**
 * PieceGlyph — the visual representation of a chess piece.
 *
 * A bespoke, geometric SVG set drawn in a 45×45 viewBox (the chess-SVG
 * standard). Rather than importing a generic Wikipedia set, these are custom
 * shapes so the app has its own identity: ivory pieces with a warm walnut
 * outline, charcoal pieces with a cool highlight, both with a soft base shadow.
 */

import { memo } from 'react';
import { Color, PieceType } from '@/engine/types';

interface Palette {
  fill: string;
  stroke: string;
  accent: string;
}

const WHITE: Palette = { fill: '#f7f1e6', stroke: '#4a3b28', accent: '#d8c7a8' };
const BLACK: Palette = { fill: '#2a2b34', stroke: '#0b0b12', accent: '#565a72' };

/** The inner shapes for each piece type, parameterised by palette. */
function PieceShapes({ type, p }: { type: PieceType; p: Palette }) {
  const common = {
    stroke: p.stroke,
    strokeWidth: 1.4,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };

  switch (type) {
    case 'p':
      return (
        <>
          <ellipse cx="22.5" cy="38" rx="9.5" ry="2.8" fill={p.stroke} opacity="0.25" />
          <path
            {...common}
            fill={p.fill}
            d="M22.5 10a5 5 0 0 0-3.1 8.94c-2.2 1.2-3.7 3.53-3.7 6.06 0 1.9.85 3.6 2.17 4.77C15.57 31.06 13 34 13 39h19c0-5-2.57-7.94-4.87-9.23a6.35 6.35 0 0 0 2.17-4.77c0-2.53-1.5-4.86-3.7-6.06A5 5 0 0 0 22.5 10z"
          />
        </>
      );

    case 'r':
      return (
        <>
          <ellipse cx="22.5" cy="39" rx="11" ry="2.8" fill={p.stroke} opacity="0.25" />
          <path
            {...common}
            fill={p.fill}
            d="M12 40v-3h21v3zM14 37l.6-4h15.8l.6 4zM15 33V19h15v14z"
          />
          <path
            {...common}
            fill={p.fill}
            d="M12 19v-4.5h4V17h3.2v-2.5h6.6V17H29v-2.5h4V19z"
          />
          <path stroke={p.accent} strokeWidth="1" d="M17 22h11M17 25h11M17 28h11" opacity="0.5" />
        </>
      );

    case 'n':
      return (
        <>
          <ellipse cx="22.5" cy="39" rx="11" ry="2.8" fill={p.stroke} opacity="0.25" />
          <path {...common} fill={p.fill} d="M11 40v-3h23v3z" />
          <path
            {...common}
            fill={p.fill}
            d="M24 9c3 0 5.6 1.8 6.7 5 1.8 5.2 2.3 12.6 2.3 22.5H13c0-6 3-9 7-11 2-1 2-1.8 1-3l-2 2c-2 2-5 2-5.5-1-.5-3 1.5-7 5.5-10 1-.8 2-1.8 2-2.8L23 9.4c.4.4.7.9 1 .9z"
          />
          <circle cx="19.5" cy="17.5" r="1.5" fill={p.stroke} />
          <path stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" d="M27 16c2 3 3 8 3 14" opacity="0.5" />
        </>
      );

    case 'b':
      return (
        <>
          <ellipse cx="22.5" cy="39" rx="10.5" ry="2.8" fill={p.stroke} opacity="0.25" />
          <path {...common} fill={p.fill} d="M12 40v-3h21v3zM13.5 37l1.2-3.5h15.6L31.5 37z" />
          <path
            {...common}
            fill={p.fill}
            d="M22.5 12.5c-3.4 2.2-6 6-6 10.2 0 3.4 1.6 6.3 4 8.3h4c2.4-2 4-4.9 4-8.3 0-4.2-2.6-8-6-10.2z"
          />
          <circle cx="22.5" cy="10.5" r="2.1" fill={p.fill} {...common} />
          <path stroke={p.stroke} strokeWidth="1.2" strokeLinecap="round" d="M22.5 18v8" opacity="0.65" />
        </>
      );

    case 'q':
      return (
        <>
          <ellipse cx="22.5" cy="39" rx="12" ry="2.8" fill={p.stroke} opacity="0.25" />
          <path {...common} fill={p.fill} d="M11 40v-3h23v3zM13 37l-.8-4h20.6l-.8 4z" />
          <path
            {...common}
            fill={p.fill}
            d="M12.5 33 9 16l6.5 6 3-11 4 11 4-11 3 11 6.5-6-3.5 17z"
          />
          <circle cx="9" cy="15" r="2.1" fill={p.fill} {...common} />
          <circle cx="18.4" cy="10.5" r="2.1" fill={p.fill} {...common} />
          <circle cx="22.5" cy="9" r="2.2" fill={p.fill} {...common} />
          <circle cx="26.6" cy="10.5" r="2.1" fill={p.fill} {...common} />
          <circle cx="36" cy="15" r="2.1" fill={p.fill} {...common} />
        </>
      );

    case 'k':
      return (
        <>
          <ellipse cx="22.5" cy="39" rx="12" ry="2.8" fill={p.stroke} opacity="0.25" />
          <path {...common} fill={p.fill} d="M11 40v-3h23v3zM13 37l-.6-4h20.2l-.6 4z" />
          <path
            {...common}
            fill={p.fill}
            d="M12.5 33c-1-7 2-11 6-11 1.6 0 3 .7 4 1.9 1-1.2 2.4-1.9 4-1.9 4 0 7 4 6 11z"
          />
          <path
            {...common}
            fill={p.fill}
            d="M22.5 8v8M18.5 11.5h8"
            strokeWidth="2.2"
          />
        </>
      );
  }
}

interface PieceGlyphProps {
  type: PieceType;
  color: Color;
  className?: string;
}

export const PieceGlyph = memo(function PieceGlyph({ type, color, className }: PieceGlyphProps) {
  const palette = color === 'w' ? WHITE : BLACK;
  return (
    <svg
      viewBox="0 0 45 45"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={`${color === 'w' ? 'blanca' : 'negra'} ${type}`}
      style={{ display: 'block', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.35))' }}
    >
      <PieceShapes type={type} p={palette} />
    </svg>
  );
});
