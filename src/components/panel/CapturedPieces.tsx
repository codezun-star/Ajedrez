/**
 * CapturedPieces — the little tray of pieces a player has captured, with the
 * running material advantage. Pieces are drawn as small overlapping glyphs.
 */

import { PieceType } from '@/engine/types';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { formatAdvantage } from '@/utils/format';

interface CapturedPiecesProps {
  /** Pieces captured by this player (their opponent's color). */
  pieces: PieceType[];
  /** Color of the captured pieces (opponent's color). */
  capturedColor: 'w' | 'b';
  /** Material advantage in centipawns for THIS player (>0 shown). */
  advantage: number;
}

export function CapturedPieces({ pieces, capturedColor, advantage }: CapturedPiecesProps) {
  const adv = formatAdvantage(advantage);
  return (
    <div className="flex min-h-[1.25rem] items-center gap-1">
      <div className="flex items-center">
        {pieces.map((type, i) => (
          <span
            key={`${type}-${i}`}
            className="-ml-1.5 first:ml-0"
            style={{ width: '1.1rem', height: '1.1rem' }}
          >
            <PieceGlyph type={type} color={capturedColor} className="h-full w-full opacity-90" />
          </span>
        ))}
      </div>
      {adv && <span className="text-xs font-semibold text-slate-400">{adv}</span>}
    </div>
  );
}
