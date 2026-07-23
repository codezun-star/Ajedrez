/**
 * Board & position (FEN) utilities.
 *
 * FEN is the canonical serialization the engine uses to describe a position.
 * Ranks in FEN are listed from rank 8 down to rank 1, which is the reverse of
 * our internal indexing, so parsing/serializing carefully flips the rank order.
 */

import { Castling, Color, GameState, PieceCode } from './types';
import {
  BOARD_SIZE,
  FILES,
  START_FEN,
  colorOf,
  squareIndex,
  typeOf,
  algebraicToSquare,
  squareToAlgebraic,
} from './constants';

const FEN_TO_PIECE: Record<string, PieceCode> = {
  P: PieceCode.WPawn,
  N: PieceCode.WKnight,
  B: PieceCode.WBishop,
  R: PieceCode.WRook,
  Q: PieceCode.WQueen,
  K: PieceCode.WKing,
  p: PieceCode.BPawn,
  n: PieceCode.BKnight,
  b: PieceCode.BBishop,
  r: PieceCode.BRook,
  q: PieceCode.BQueen,
  k: PieceCode.BKing,
};

const PIECE_TO_FEN: Record<PieceType | 'x', string> = {
  p: 'p',
  n: 'n',
  b: 'b',
  r: 'r',
  q: 'q',
  k: 'k',
  x: '',
};

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

/** Parse a FEN string into an immutable {@link GameState}. Throws on malformed input. */
export function parseFen(fen: string): GameState {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) {
    throw new Error(`Invalid FEN (need at least 4 fields): "${fen}"`);
  }

  const [placement, activeColor, castlingField, epField, halfmoveField, fullmoveField] = parts;

  const board = new Uint8Array(BOARD_SIZE);
  const rows = placement.split('/');
  if (rows.length !== 8) {
    throw new Error(`Invalid FEN board (need 8 ranks): "${placement}"`);
  }

  // FEN lists rank 8 first; our rank index 7 is rank 8.
  for (let r = 0; r < 8; r++) {
    const row = rows[r];
    const rank = 7 - r;
    let file = 0;
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        file += Number(ch);
      } else {
        const piece = FEN_TO_PIECE[ch];
        if (piece === undefined) throw new Error(`Invalid FEN piece char "${ch}"`);
        board[squareIndex(file, rank)] = piece;
        file += 1;
      }
    }
    if (file !== 8) throw new Error(`Invalid FEN rank length in "${row}"`);
  }

  let castling = Castling.None;
  if (castlingField.includes('K')) castling |= Castling.WK;
  if (castlingField.includes('Q')) castling |= Castling.WQ;
  if (castlingField.includes('k')) castling |= Castling.BK;
  if (castlingField.includes('q')) castling |= Castling.BQ;

  return {
    board,
    turn: (activeColor === 'b' ? 'b' : 'w') as Color,
    castling,
    epSquare: epField && epField !== '-' ? algebraicToSquare(epField) : -1,
    halfmoveClock: halfmoveField ? Number(halfmoveField) : 0,
    fullmoveNumber: fullmoveField ? Number(fullmoveField) : 1,
  };
}

/** Serialize a {@link GameState} back into a FEN string. */
export function toFen(state: GameState): string {
  const rows: string[] = [];
  for (let rank = 7; rank >= 0; rank--) {
    let row = '';
    let empty = 0;
    for (let file = 0; file < 8; file++) {
      const piece = state.board[squareIndex(file, rank)];
      if (piece === PieceCode.Empty) {
        empty += 1;
      } else {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        const letter = PIECE_TO_FEN[typeOf(piece) as PieceType];
        row += colorOf(piece) === 'w' ? letter.toUpperCase() : letter;
      }
    }
    if (empty > 0) row += empty;
    rows.push(row);
  }

  let castling = '';
  if (state.castling & Castling.WK) castling += 'K';
  if (state.castling & Castling.WQ) castling += 'Q';
  if (state.castling & Castling.BK) castling += 'k';
  if (state.castling & Castling.BQ) castling += 'q';
  if (castling === '') castling = '-';

  const ep = state.epSquare >= 0 ? squareToAlgebraic(state.epSquare) : '-';

  return `${rows.join('/')} ${state.turn} ${castling} ${ep} ${state.halfmoveClock} ${state.fullmoveNumber}`;
}

/** Create the standard initial position. */
export function createInitialState(): GameState {
  return parseFen(START_FEN);
}

/** Deep-clone a {@link GameState}. Only the board array needs copying. */
export function cloneState(state: GameState): GameState {
  return {
    board: state.board.slice(),
    turn: state.turn,
    castling: state.castling,
    epSquare: state.epSquare,
    halfmoveClock: state.halfmoveClock,
    fullmoveNumber: state.fullmoveNumber,
  };
}

/** Locate the king square for a given color, or -1 if (illegally) absent. */
export function findKing(board: Uint8Array, color: Color): number {
  const kingCode = color === 'w' ? PieceCode.WKing : PieceCode.BKing;
  for (let sq = 0; sq < BOARD_SIZE; sq++) {
    if (board[sq] === kingCode) return sq;
  }
  return -1;
}

/**
 * A "position key" used for threefold-repetition detection. Two positions are
 * the same for repetition purposes when piece placement, side to move, castling
 * rights and en-passant availability all match — the move clocks are ignored.
 */
export function positionKey(state: GameState): string {
  // The board bytes + the small state fields uniquely identify the position.
  let key = '';
  for (let i = 0; i < BOARD_SIZE; i++) key += String.fromCharCode(state.board[i] + 33);
  return `${key}|${state.turn}|${state.castling}|${state.epSquare}`;
}

export { FILES };
