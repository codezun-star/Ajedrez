/**
 * Captured-material bookkeeping, derived from the board rather than tracked
 * incrementally (simpler and impossible to desync). We compare the current
 * piece counts to the full starting set.
 */

import { PieceType } from '@/engine/types';
import { colorOf, typeOf } from '@/engine/constants';
import { PIECE_VALUE } from '@/ai/evaluation';

const INITIAL_COUNTS: Record<PieceType, number> = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
  k: 1,
};

export interface CapturedSummary {
  /** Black pieces that White has captured, most valuable first. */
  byWhite: PieceType[];
  /** White pieces that Black has captured, most valuable first. */
  byBlack: PieceType[];
  /** Positive = White is ahead in material (centipawns / 100 = pawns). */
  advantage: number;
}

const ORDER: PieceType[] = ['q', 'r', 'b', 'n', 'p'];

export function summarizeCaptured(board: Uint8Array): CapturedSummary {
  const white: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const black: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece === 0) continue;
    const type = typeOf(piece);
    if (colorOf(piece) === 'w') {
      white[type] += 1;
      if (type !== 'k') whiteMaterial += PIECE_VALUE[type];
    } else {
      black[type] += 1;
      if (type !== 'k') blackMaterial += PIECE_VALUE[type];
    }
  }

  const byWhite: PieceType[] = [];
  const byBlack: PieceType[] = [];
  for (const type of ORDER) {
    for (let i = 0; i < INITIAL_COUNTS[type] - black[type]; i++) byWhite.push(type);
    for (let i = 0; i < INITIAL_COUNTS[type] - white[type]; i++) byBlack.push(type);
  }

  return {
    byWhite,
    byBlack,
    advantage: whiteMaterial - blackMaterial,
  };
}
