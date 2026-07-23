/**
 * Move generation and application.
 *
 * Generation happens in two stages:
 *   1. `generatePseudoLegalMoves` — every geometrically valid move, ignoring
 *      whether it leaves the mover's own king in check.
 *   2. `generateLegalMoves` — filters the above by actually applying each move
 *      and discarding any that leave the king in check.
 *
 * `applyMove` is pure: it returns a brand-new {@link GameState} and never
 * mutates its input, which keeps undo/redo and the UI store simple.
 */

import { Castling, Color, GameState, Move, MoveFlag, PieceCode, PieceType } from './types';
import {
  BISHOP_DIRS,
  KING_DELTAS,
  KNIGHT_DELTAS,
  QUEEN_DIRS,
  ROOK_DIRS,
  SQ,
  colorOf,
  fileOf,
  makePiece,
  onBoard,
  opposite,
  rankOf,
  squareIndex,
  typeOf,
} from './constants';
import { isSquareAttacked } from './attacks';
import { cloneState, findKing } from './board';

const PROMOTION_TYPES: PieceType[] = ['q', 'r', 'b', 'n'];

/** Add a pawn move, expanding into four promotion moves when reaching the back rank. */
function pushPawnMove(
  moves: Move[],
  from: number,
  to: number,
  piece: PieceCode,
  captured: PieceCode,
  color: Color,
  flags: MoveFlag,
): void {
  const promoRank = color === 'w' ? 7 : 0;
  if (rankOf(to) === promoRank) {
    for (const promotion of PROMOTION_TYPES) {
      moves.push({ from, to, piece, captured, promotion, flags: flags | MoveFlag.Promotion });
    }
  } else {
    moves.push({ from, to, piece, captured, flags });
  }
}

/** Generate all pseudo-legal moves (king-safety not yet enforced). */
export function generatePseudoLegalMoves(state: GameState): Move[] {
  const { board, turn } = state;
  const moves: Move[] = [];
  const forward = turn === 'w' ? 1 : -1;
  const startRank = turn === 'w' ? 1 : 6;

  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece === PieceCode.Empty || colorOf(piece) !== turn) continue;

    const f = fileOf(sq);
    const r = rankOf(sq);
    const type = typeOf(piece);

    switch (type) {
      case 'p': {
        // Single push
        const oneRank = r + forward;
        if (oneRank >= 0 && oneRank < 8) {
          const oneSq = squareIndex(f, oneRank);
          if (board[oneSq] === PieceCode.Empty) {
            pushPawnMove(moves, sq, oneSq, piece, PieceCode.Empty, turn, MoveFlag.Normal);
            // Double push from the starting rank
            if (r === startRank) {
              const twoSq = squareIndex(f, r + forward * 2);
              if (board[twoSq] === PieceCode.Empty) {
                moves.push({
                  from: sq,
                  to: twoSq,
                  piece,
                  captured: PieceCode.Empty,
                  flags: MoveFlag.DoublePush,
                });
              }
            }
          }
          // Diagonal captures (incl. en passant)
          for (const df of [-1, 1]) {
            const cf = f + df;
            if (cf < 0 || cf > 7) continue;
            const capSq = squareIndex(cf, oneRank);
            const target = board[capSq];
            if (target !== PieceCode.Empty && colorOf(target) !== turn) {
              pushPawnMove(moves, sq, capSq, piece, target, turn, MoveFlag.Capture);
            } else if (capSq === state.epSquare) {
              // En passant: the captured pawn sits on the mover's rank, not the target.
              const capturedPawnSq = squareIndex(cf, r);
              moves.push({
                from: sq,
                to: capSq,
                piece,
                captured: board[capturedPawnSq],
                flags: MoveFlag.Capture | MoveFlag.EnPassant,
              });
            }
          }
        }
        break;
      }

      case 'n': {
        for (const [df, dr] of KNIGHT_DELTAS) {
          const nf = f + df;
          const nr = r + dr;
          if (!onBoard(nf, nr)) continue;
          const to = squareIndex(nf, nr);
          const target = board[to];
          if (target === PieceCode.Empty) {
            moves.push({ from: sq, to, piece, captured: PieceCode.Empty, flags: MoveFlag.Normal });
          } else if (colorOf(target) !== turn) {
            moves.push({ from: sq, to, piece, captured: target, flags: MoveFlag.Capture });
          }
        }
        break;
      }

      case 'k': {
        for (const [df, dr] of KING_DELTAS) {
          const nf = f + df;
          const nr = r + dr;
          if (!onBoard(nf, nr)) continue;
          const to = squareIndex(nf, nr);
          const target = board[to];
          if (target === PieceCode.Empty) {
            moves.push({ from: sq, to, piece, captured: PieceCode.Empty, flags: MoveFlag.Normal });
          } else if (colorOf(target) !== turn) {
            moves.push({ from: sq, to, piece, captured: target, flags: MoveFlag.Capture });
          }
        }
        generateCastlingMoves(state, sq, moves);
        break;
      }

      default: {
        // Sliding pieces: bishop, rook, queen
        const dirs = type === 'b' ? BISHOP_DIRS : type === 'r' ? ROOK_DIRS : QUEEN_DIRS;
        for (const [df, dr] of dirs) {
          let nf = f + df;
          let nr = r + dr;
          while (onBoard(nf, nr)) {
            const to = squareIndex(nf, nr);
            const target = board[to];
            if (target === PieceCode.Empty) {
              moves.push({
                from: sq,
                to,
                piece,
                captured: PieceCode.Empty,
                flags: MoveFlag.Normal,
              });
            } else {
              if (colorOf(target) !== turn) {
                moves.push({ from: sq, to, piece, captured: target, flags: MoveFlag.Capture });
              }
              break; // blocked either way
            }
            nf += df;
            nr += dr;
          }
        }
        break;
      }
    }
  }

  return moves;
}

/**
 * Castling generation. All conditions are checked:
 *   - the right still exists,
 *   - the squares between king and rook are empty,
 *   - the king is not in check, and does not pass through / land on an
 *     attacked square.
 */
function generateCastlingMoves(state: GameState, kingSq: number, moves: Move[]): void {
  const { board, turn, castling } = state;
  const enemy = opposite(turn);
  const piece = board[kingSq];

  if (turn === 'w' && kingSq === SQ.e1) {
    // King-side (e1-g1): f1,g1 empty; e1,f1,g1 not attacked.
    if (
      castling & Castling.WK &&
      board[SQ.f1] === PieceCode.Empty &&
      board[SQ.g1] === PieceCode.Empty &&
      board[SQ.h1] === PieceCode.WRook &&
      !isSquareAttacked(board, SQ.e1, enemy) &&
      !isSquareAttacked(board, SQ.f1, enemy) &&
      !isSquareAttacked(board, SQ.g1, enemy)
    ) {
      moves.push({ from: SQ.e1, to: SQ.g1, piece, captured: PieceCode.Empty, flags: MoveFlag.KingCastle });
    }
    // Queen-side (e1-c1): b1,c1,d1 empty; e1,d1,c1 not attacked.
    if (
      castling & Castling.WQ &&
      board[SQ.d1] === PieceCode.Empty &&
      board[SQ.c1] === PieceCode.Empty &&
      board[SQ.b1] === PieceCode.Empty &&
      board[SQ.a1] === PieceCode.WRook &&
      !isSquareAttacked(board, SQ.e1, enemy) &&
      !isSquareAttacked(board, SQ.d1, enemy) &&
      !isSquareAttacked(board, SQ.c1, enemy)
    ) {
      moves.push({ from: SQ.e1, to: SQ.c1, piece, captured: PieceCode.Empty, flags: MoveFlag.QueenCastle });
    }
  } else if (turn === 'b' && kingSq === SQ.e8) {
    if (
      castling & Castling.BK &&
      board[SQ.f8] === PieceCode.Empty &&
      board[SQ.g8] === PieceCode.Empty &&
      board[SQ.h8] === PieceCode.BRook &&
      !isSquareAttacked(board, SQ.e8, enemy) &&
      !isSquareAttacked(board, SQ.f8, enemy) &&
      !isSquareAttacked(board, SQ.g8, enemy)
    ) {
      moves.push({ from: SQ.e8, to: SQ.g8, piece, captured: PieceCode.Empty, flags: MoveFlag.KingCastle });
    }
    if (
      castling & Castling.BQ &&
      board[SQ.d8] === PieceCode.Empty &&
      board[SQ.c8] === PieceCode.Empty &&
      board[SQ.b8] === PieceCode.Empty &&
      board[SQ.a8] === PieceCode.BRook &&
      !isSquareAttacked(board, SQ.e8, enemy) &&
      !isSquareAttacked(board, SQ.d8, enemy) &&
      !isSquareAttacked(board, SQ.c8, enemy)
    ) {
      moves.push({ from: SQ.e8, to: SQ.c8, piece, captured: PieceCode.Empty, flags: MoveFlag.QueenCastle });
    }
  }
}

/** Rights that are revoked when the piece on a given square moves or is captured. */
function castlingRightsMask(sq: number): Castling {
  switch (sq) {
    case SQ.a1:
      return Castling.WQ;
    case SQ.h1:
      return Castling.WK;
    case SQ.e1:
      return Castling.WK | Castling.WQ;
    case SQ.a8:
      return Castling.BQ;
    case SQ.h8:
      return Castling.BK;
    case SQ.e8:
      return Castling.BK | Castling.BQ;
    default:
      return Castling.None;
  }
}

/**
 * Apply a move and return the resulting position. Pure — the input state is not
 * modified. Assumes `move` is legal (or at least pseudo-legal); use
 * {@link generateLegalMoves} to obtain legal moves.
 */
export function applyMove(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const { board } = next;
  const color = state.turn;

  const movingPiece = move.piece;
  board[move.from] = PieceCode.Empty;

  // Remove the en-passant captured pawn (it is not on `move.to`).
  if (move.flags & MoveFlag.EnPassant) {
    const capturedRank = rankOf(move.from);
    const capturedFile = fileOf(move.to);
    board[squareIndex(capturedFile, capturedRank)] = PieceCode.Empty;
  }

  // Place the moving piece (promoting if needed).
  if (move.flags & MoveFlag.Promotion && move.promotion) {
    board[move.to] = makePiece(move.promotion, color);
  } else {
    board[move.to] = movingPiece;
  }

  // Move the rook when castling.
  if (move.flags & MoveFlag.KingCastle) {
    if (color === 'w') {
      board[SQ.h1] = PieceCode.Empty;
      board[SQ.f1] = PieceCode.WRook;
    } else {
      board[SQ.h8] = PieceCode.Empty;
      board[SQ.f8] = PieceCode.BRook;
    }
  } else if (move.flags & MoveFlag.QueenCastle) {
    if (color === 'w') {
      board[SQ.a1] = PieceCode.Empty;
      board[SQ.d1] = PieceCode.WRook;
    } else {
      board[SQ.a8] = PieceCode.Empty;
      board[SQ.d8] = PieceCode.BRook;
    }
  }

  // Update castling rights: moving from or capturing on key squares revokes them.
  next.castling &= ~castlingRightsMask(move.from);
  next.castling &= ~castlingRightsMask(move.to);

  // Set en-passant target on a double pawn push, otherwise clear it.
  if (move.flags & MoveFlag.DoublePush) {
    next.epSquare = squareIndex(fileOf(move.from), (rankOf(move.from) + rankOf(move.to)) / 2);
  } else {
    next.epSquare = -1;
  }

  // Half-move clock: reset on pawn move or capture, else increment.
  const isCapture = (move.flags & MoveFlag.Capture) !== 0;
  if (typeOf(movingPiece) === 'p' || isCapture) {
    next.halfmoveClock = 0;
  } else {
    next.halfmoveClock = state.halfmoveClock + 1;
  }

  if (color === 'b') next.fullmoveNumber = state.fullmoveNumber + 1;
  next.turn = opposite(color);

  return next;
}

/**
 * Return only fully legal moves for the side to move — pseudo-legal moves that
 * do not leave the mover's own king in check.
 */
export function generateLegalMoves(state: GameState): Move[] {
  const pseudo = generatePseudoLegalMoves(state);
  const legal: Move[] = [];
  const mover = state.turn;

  for (const move of pseudo) {
    const next = applyMove(state, move);
    const kingSq = findKing(next.board, mover);
    if (!isSquareAttacked(next.board, kingSq, opposite(mover))) {
      legal.push(move);
    }
  }

  return legal;
}

/** Legal moves for the piece on a specific square (used by the UI). */
export function legalMovesFrom(state: GameState, from: number): Move[] {
  return generateLegalMoves(state).filter((m) => m.from === from);
}

/** True if the side to move is currently in check. */
export function inCheck(state: GameState): boolean {
  const kingSq = findKing(state.board, state.turn);
  return isSquareAttacked(state.board, kingSq, opposite(state.turn));
}
