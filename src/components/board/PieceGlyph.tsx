/**
 * PieceGlyph — the visual representation of a chess piece.
 *
 * Two piece sets are bundled and selectable via the "piece style" setting:
 *   - classic → "Cburnett" (Wikipedia/Lichess standard, CC BY-SA 3.0)
 *   - modern  → "Staunty" (Lichess, CC BY-NC-SA 4.0 — non-commercial)
 *
 * Both are loaded as fingerprinted URLs at build time via `import.meta.glob`
 * (small SVGs get inlined as data URIs, so there are no runtime requests).
 * See the LICENSE.txt in each set's asset folder for attribution. Because this
 * component subscribes to the store, switching the style updates every piece
 * instantly, even inside memoized parents.
 */

import { memo } from 'react';
import { Color, PieceType } from '@/engine/types';
import { useGameStore } from '@/store/gameStore';
import type { PieceStyle } from '@/utils/storage';

const classicModules = import.meta.glob('../../assets/pieces/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const modernModules = import.meta.glob('../../assets/pieces-staunty/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

function indexById(modules: Record<string, unknown>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const path in modules) {
    const id = path.slice(path.lastIndexOf('/') + 1).replace('.svg', '');
    map[id] = modules[path] as string;
  }
  return map;
}

const SETS: Record<PieceStyle, Record<string, string>> = {
  classic: indexById(classicModules),
  modern: indexById(modernModules),
};

const NAMES: Record<PieceType, string> = {
  p: 'peón',
  n: 'caballo',
  b: 'alfil',
  r: 'torre',
  q: 'dama',
  k: 'rey',
};

interface PieceGlyphProps {
  type: PieceType;
  color: Color;
  className?: string;
  /** Force a specific style (e.g. in the style-picker previews). */
  styleOverride?: PieceStyle;
}

export const PieceGlyph = memo(function PieceGlyph({
  type,
  color,
  className,
  styleOverride,
}: PieceGlyphProps) {
  const settingStyle = useGameStore((s) => s.settings.pieceStyle);
  const style = styleOverride ?? settingStyle;
  const src = SETS[style][`${color}${type}`];

  return (
    <img
      src={src}
      alt={`${NAMES[type]} ${color === 'w' ? 'blanco' : 'negro'}`}
      draggable={false}
      className={className}
      style={{
        display: 'block',
        objectFit: 'contain',
        filter: 'drop-shadow(0 3px 2px rgba(0, 0, 0, 0.32))',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    />
  );
});
