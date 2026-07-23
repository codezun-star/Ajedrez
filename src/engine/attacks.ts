/**
 * Square-attack detection.
 *
 * `isSquareAttacked` is the workhorse behind check detection and castling
 * legality. It answers: "is square `sq` attacked by any piece of color `by`?"
 * We test each attacker type explicitly rather than generating all moves, which
 * is both faster and avoids infinite recursion (move legality itself depends on
 * attack detection).
 */

import { PieceCode, Color } from './types';
import {
  BISHOP_DIRS,
  KING_DELTAS,
  KNIGHT_DELTAS,
  ROOK_DIRS,
  fileOf,
  onBoard,
  rankOf,
  squareIndex,
} from './constants';

/**
 * Returns true if `sq` is attacked by any piece of color `by`.
 */
export function isSquareAttacked(board: Uint8Array, sq: number, by: Color): boolean {
  const f = fileOf(sq);
  const r = rankOf(sq);
  const enemyIsBlack = by === 'b';

  // ── Pawn attacks ──────────────────────────────────────────────────────────
  // A pawn of color `by` attacks `sq` if it sits one square diagonally "behind"
  // sq from its own advancing direction. White pawns attack upward (+rank), so
  // a white attacker would be on rank r-1; black on rank r+1.
  const pawnRank = enemyIsBlack ? r + 1 : r - 1;
  const pawnCode = enemyIsBlack ? PieceCode.BPawn : PieceCode.WPawn;
  if (pawnRank >= 0 && pawnRank < 8) {
    if (f - 1 >= 0 && board[squareIndex(f - 1, pawnRank)] === pawnCode) return true;
    if (f + 1 < 8 && board[squareIndex(f + 1, pawnRank)] === pawnCode) return true;
  }

  // ── Knight attacks ────────────────────────────────────────────────────────
  const knightCode = enemyIsBlack ? PieceCode.BKnight : PieceCode.WKnight;
  for (const [df, dr] of KNIGHT_DELTAS) {
    const nf = f + df;
    const nr = r + dr;
    if (onBoard(nf, nr) && board[squareIndex(nf, nr)] === knightCode) return true;
  }

  // ── King attacks (adjacent squares) ───────────────────────────────────────
  const kingCode = enemyIsBlack ? PieceCode.BKing : PieceCode.WKing;
  for (const [df, dr] of KING_DELTAS) {
    const nf = f + df;
    const nr = r + dr;
    if (onBoard(nf, nr) && board[squareIndex(nf, nr)] === kingCode) return true;
  }

  // ── Sliding attacks: bishops/queens on diagonals ──────────────────────────
  const bishopCode = enemyIsBlack ? PieceCode.BBishop : PieceCode.WBishop;
  const queenCode = enemyIsBlack ? PieceCode.BQueen : PieceCode.WQueen;
  for (const [df, dr] of BISHOP_DIRS) {
    let nf = f + df;
    let nr = r + dr;
    while (onBoard(nf, nr)) {
      const piece = board[squareIndex(nf, nr)];
      if (piece !== PieceCode.Empty) {
        if (piece === bishopCode || piece === queenCode) return true;
        break; // blocked
      }
      nf += df;
      nr += dr;
    }
  }

  // ── Sliding attacks: rooks/queens on ranks & files ────────────────────────
  const rookCode = enemyIsBlack ? PieceCode.BRook : PieceCode.WRook;
  for (const [df, dr] of ROOK_DIRS) {
    let nf = f + df;
    let nr = r + dr;
    while (onBoard(nf, nr)) {
      const piece = board[squareIndex(nf, nr)];
      if (piece !== PieceCode.Empty) {
        if (piece === rookCode || piece === queenCode) return true;
        break; // blocked
      }
      nf += df;
      nr += dr;
    }
  }

  return false;
}

/** Convenience wrapper: is the given color's king currently in check? */
export function isKingInCheck(board: Uint8Array, color: Color, kingSquare: number): boolean {
  if (kingSquare < 0) return false;
  return isSquareAttacked(board, kingSquare, color === 'w' ? 'b' : 'w');
}
