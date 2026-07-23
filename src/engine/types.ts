/**
 * Core type definitions for the chess engine.
 *
 * The engine is deliberately UI-agnostic: it knows nothing about React, the DOM
 * or any rendering concern. Everything here is plain data so the same logic can
 * run in the main thread, in a Web Worker, or in a test runner.
 */

/** Piece colors. */
export type Color = 'w' | 'b';

/** Piece kinds, using standard single-letter notation. */
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

/**
 * Pieces are encoded as small integers for a compact, allocation-free board.
 *
 *   bits 0-2 → type (1 = pawn … 6 = king)
 *   bit  3   → color (0 = white, 1 = black)
 *
 * `0` means "empty square". This keeps the board a flat `Uint8Array(64)`, which
 * is fast to clone (`.slice()`) inside the search tree.
 */
export const enum PieceCode {
  Empty = 0,

  WPawn = 1,
  WKnight = 2,
  WBishop = 3,
  WRook = 4,
  WQueen = 5,
  WKing = 6,

  BPawn = 9,
  BKnight = 10,
  BBishop = 11,
  BRook = 12,
  BQueen = 13,
  BKing = 14,
}

/** Bit that marks a piece as black. */
export const COLOR_BIT = 8;

/** Bitmask that isolates the piece type from its code. */
export const TYPE_MASK = 7;

/** Flags describing the special nature of a move (bitmask). */
export const enum MoveFlag {
  Normal = 0,
  Capture = 1 << 0,
  DoublePush = 1 << 1,
  EnPassant = 1 << 2,
  KingCastle = 1 << 3,
  QueenCastle = 1 << 4,
  Promotion = 1 << 5,
}

/** Castling availability, encoded as a bitmask. */
export const enum Castling {
  None = 0,
  WK = 1 << 0, // White  king-side  (e1-g1)
  WQ = 1 << 1, // White  queen-side (e1-c1)
  BK = 1 << 2, // Black  king-side  (e8-g8)
  BQ = 1 << 3, // Black  queen-side (e8-c8)
  All = 0b1111,
}

/** A single move. `from`/`to` are 0-63 square indices. */
export interface Move {
  from: number;
  to: number;
  /** The moving piece code (before promotion). */
  piece: PieceCode;
  /** Captured piece code, if any (the actual pawn for en passant). */
  captured: PieceCode;
  /** Promotion target type, when the move is a promotion. */
  promotion?: PieceType;
  flags: MoveFlag;
}

/**
 * A full, immutable snapshot of a chess position. Applying a move returns a new
 * `GameState`; the previous one is never mutated. This makes undo/redo and the
 * React store trivial and predictable.
 */
export interface GameState {
  /** 64-length board, indexed `rank * 8 + file` (a1 = 0, h8 = 63). */
  board: Uint8Array;
  /** Side to move. */
  turn: Color;
  /** Castling rights bitmask. */
  castling: Castling;
  /** En-passant target square index, or -1 if none. */
  epSquare: number;
  /** Half-move clock for the 50-move rule (reset on capture/pawn move). */
  halfmoveClock: number;
  /** Full-move number, starts at 1 and increments after Black moves. */
  fullmoveNumber: number;
}

/** Result of a finished game, from White's point of view where relevant. */
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

/** How a terminal position was reached. */
export type GameOverReason =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient-material'
  | 'threefold-repetition'
  | 'fifty-move-rule'
  | 'resignation'
  | 'timeout'
  | null;

/** Status describing whether/how the game has ended. */
export interface GameStatus {
  isOver: boolean;
  reason: GameOverReason;
  result: GameResult;
  winner: Color | null;
  inCheck: boolean;
}
