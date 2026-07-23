/**
 * PieceGlyph — the visual representation of a chess piece.
 *
 * Renders the classic "Cburnett" chess pieces (the Wikipedia / Lichess standard
 * set), bundled locally as individual SVGs under `src/assets/pieces`. They are
 * loaded as fingerprinted URLs at build time via `import.meta.glob`, so there
 * are no runtime network requests and caching is optimal.
 *
 * Pieces are licensed CC BY-SA 3.0 (Cburnett / Rfc1394) — see
 * `src/assets/pieces/LICENSE.txt`. The white pieces are white with a black
 * outline and the black pieces black with a white outline, so both read
 * clearly on either board color and in light or dark UI.
 */

import { memo } from 'react';
import { Color, PieceType } from '@/engine/types';

// Eagerly resolve every piece SVG to its final URL. Keys look like
// "../../assets/pieces/wn.svg"; we index them by the "wn" id.
const modules = import.meta.glob('../../assets/pieces/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const PIECE_URL: Record<string, string> = {};
for (const path in modules) {
  const id = path.slice(path.lastIndexOf('/') + 1).replace('.svg', '');
  PIECE_URL[id] = modules[path] as string;
}

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
}

export const PieceGlyph = memo(function PieceGlyph({ type, color, className }: PieceGlyphProps) {
  const src = PIECE_URL[`${color}${type}`];
  return (
    <img
      src={src}
      alt={`${NAMES[type]} ${color === 'w' ? 'blanco' : 'negro'}`}
      draggable={false}
      className={className}
      style={{
        display: 'block',
        objectFit: 'contain',
        // A soft grounded shadow so pieces sit on the board.
        filter: 'drop-shadow(0 3px 2px rgba(0, 0, 0, 0.32))',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    />
  );
});
