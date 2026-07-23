/**
 * Piece — one animated piece on the board.
 *
 * Placement uses a transform (`x`/`y` as a percentage of the piece's own size,
 * which equals one square) so movement is GPU-composited and buttery. Framer
 * Motion springs the transform between squares, giving the "gliding" feel.
 *
 * The glyph is wrapped in an `absolute inset-[6%]` box rather than using
 * padding + `height:100%`: the outer square's height comes from `aspect-ratio`,
 * and a percentage height won't resolve against that in some engines, but an
 * absolutely-positioned inset box gets a definite size and always fills.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Color } from '@/engine/types';
import { VisualPiece, squareToPercent } from '@/hooks/usePieceTracking';
import { PieceGlyph } from './PieceGlyph';

interface PieceProps {
  piece: VisualPiece;
  orientation: Color;
  dragging: boolean;
  animate: boolean;
}

export const Piece = memo(function Piece({ piece, orientation, dragging, animate }: PieceProps) {
  const { left, top } = squareToPercent(piece.square, orientation);
  // x/y are percentages of the element size (one square), so `left*8`% of self.
  const x = `${(left / 12.5) * 100}%`;
  const y = `${(top / 12.5) * 100}%`;

  return (
    <motion.div
      className="absolute left-0 top-0 aspect-square w-[12.5%] will-change-transform"
      style={{ x, y, zIndex: dragging ? 30 : 10, opacity: dragging ? 0.28 : 1 }}
      initial={false}
      animate={{ x, y }}
      transition={
        animate ? { type: 'spring', stiffness: 500, damping: 34, mass: 0.7 } : { duration: 0 }
      }
    >
      <div className="absolute inset-[6%]">
        <PieceGlyph type={piece.type} color={piece.color} className="h-full w-full" />
      </div>
    </motion.div>
  );
});
