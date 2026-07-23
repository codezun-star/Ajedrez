/**
 * Board geometry helpers and lookup tables shared across the engine.
 *
 * Squares are indexed 0-63 as `rank * 8 + file`:
 *   file 0-7 → 'a'-'h'
 *   rank 0-7 → '1'-'8'   (rank 0 is White's home rank)
 * So a1 = 0, h1 = 7, a8 = 56, h8 = 63.
 */

import { PieceCode, PieceType, Color, COLOR_BIT, TYPE_MASK } from './types';

export const BOARD_SIZE = 64;
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

/** Standard starting position in FEN. */
export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Extract file (0-7) from a square index. */
export const fileOf = (sq: number): number => sq & 7;

/** Extract rank (0-7) from a square index. */
export const rankOf = (sq: number): number => sq >> 3;

/** Build a square index from file & rank. */
export const squareIndex = (file: number, rank: number): number => rank * 8 + file;

/** True if file & rank are both on the board. */
export const onBoard = (file: number, rank: number): boolean =>
  file >= 0 && file < 8 && rank >= 0 && rank < 8;

/** Convert a square index to algebraic coordinates, e.g. 0 → "a1". */
export const squareToAlgebraic = (sq: number): string => FILES[fileOf(sq)] + RANKS[rankOf(sq)];

/** Convert algebraic coordinates to a square index, e.g. "e4" → 28. */
export const algebraicToSquare = (alg: string): number => {
  const file = alg.charCodeAt(0) - 97; // 'a'
  const rank = alg.charCodeAt(1) - 49; // '1'
  return squareIndex(file, rank);
};

/** Color of a piece code. */
export const colorOf = (piece: PieceCode): Color => ((piece & COLOR_BIT) ? 'b' : 'w');

/** Type letter of a piece code. */
export const typeOf = (piece: PieceCode): PieceType => {
  switch (piece & TYPE_MASK) {
    case 1:
      return 'p';
    case 2:
      return 'n';
    case 3:
      return 'b';
    case 4:
      return 'r';
    case 5:
      return 'q';
    default:
      return 'k';
  }
};

/** Build a piece code from a type letter and color. */
export const makePiece = (type: PieceType, color: Color): PieceCode => {
  const base =
    type === 'p' ? 1 : type === 'n' ? 2 : type === 'b' ? 3 : type === 'r' ? 4 : type === 'q' ? 5 : 6;
  return (color === 'b' ? base | COLOR_BIT : base) as PieceCode;
};

export const isWhite = (piece: PieceCode): boolean => piece !== 0 && (piece & COLOR_BIT) === 0;
export const isBlack = (piece: PieceCode): boolean => (piece & COLOR_BIT) !== 0;
export const opposite = (color: Color): Color => (color === 'w' ? 'b' : 'w');

// ── Direction offsets (as [file, rank] deltas) ───────────────────────────────

export const KNIGHT_DELTAS: ReadonlyArray<[number, number]> = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

export const KING_DELTAS: ReadonlyArray<[number, number]> = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
];

export const BISHOP_DIRS: ReadonlyArray<[number, number]> = [
  [1, 1],
  [1, -1],
  [-1, -1],
  [-1, 1],
];

export const ROOK_DIRS: ReadonlyArray<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const QUEEN_DIRS: ReadonlyArray<[number, number]> = [...BISHOP_DIRS, ...ROOK_DIRS];

// ── Key squares for castling ─────────────────────────────────────────────────

export const SQ = {
  a1: 0,
  b1: 1,
  c1: 2,
  d1: 3,
  e1: 4,
  f1: 5,
  g1: 6,
  h1: 7,
  a8: 56,
  b8: 57,
  c8: 58,
  d8: 59,
  e8: 60,
  f8: 61,
  g8: 62,
  h8: 63,
} as const;
