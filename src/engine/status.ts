/**
 * Terminal-state detection: checkmate, stalemate and the draw rules
 * (insufficient material, threefold repetition, fifty-move rule).
 */

import { Color, GameState, GameStatus } from './types';
import { colorOf, fileOf, opposite, rankOf, typeOf } from './constants';
import { generateLegalMoves, inCheck } from './moves';

/**
 * Detect insufficient mating material. Draws when neither side can force mate:
 *   - K vs K
 *   - K+minor vs K
 *   - K+B vs K+B with both bishops on the same color complex
 *   - (K+N+N vs K is technically a draw but not forced; most implementations
 *     and FIDE's "dead position" rule do not auto-draw it, so we don't either.)
 */
export function isInsufficientMaterial(state: GameState): boolean {
  const bishops: number[] = []; // square indices of bishops
  let knights = 0;
  let others = 0; // pawns, rooks, queens → material is sufficient

  for (let sq = 0; sq < 64; sq++) {
    const piece = state.board[sq];
    if (piece === 0) continue;
    const type = typeOf(piece);
    switch (type) {
      case 'k':
        break;
      case 'b':
        bishops.push(sq);
        break;
      case 'n':
        knights += 1;
        break;
      default:
        others += 1;
        break;
    }
  }

  if (others > 0) return false;

  const minorCount = bishops.length + knights;
  if (minorCount === 0) return true; // K vs K
  if (minorCount === 1) return true; // K + single minor vs K

  // Two bishops, no knights: draw only if all bishops share a square color.
  if (knights === 0 && bishops.length === minorCount) {
    const firstColor = (fileOf(bishops[0]) + rankOf(bishops[0])) & 1;
    return bishops.every((sq) => ((fileOf(sq) + rankOf(sq)) & 1) === firstColor);
  }

  return false;
}

/** Fifty-move rule: 100 half-moves without a pawn move or capture. */
export function isFiftyMoveRule(state: GameState): boolean {
  return state.halfmoveClock >= 100;
}

/**
 * Compute the full status of a position. Repetition is handled separately by
 * the caller (it requires the game's position history), so `repetition` is
 * passed in.
 */
export function getGameStatus(state: GameState, repetition = false): GameStatus {
  const check = inCheck(state);
  const legal = generateLegalMoves(state);
  const mover: Color = state.turn;

  if (legal.length === 0) {
    if (check) {
      // Checkmate — the side NOT to move delivered mate.
      const winner = opposite(mover);
      return {
        isOver: true,
        reason: 'checkmate',
        result: winner === 'w' ? '1-0' : '0-1',
        winner,
        inCheck: true,
      };
    }
    // Stalemate.
    return { isOver: true, reason: 'stalemate', result: '1/2-1/2', winner: null, inCheck: false };
  }

  if (isInsufficientMaterial(state)) {
    return {
      isOver: true,
      reason: 'insufficient-material',
      result: '1/2-1/2',
      winner: null,
      inCheck: check,
    };
  }

  if (repetition) {
    return {
      isOver: true,
      reason: 'threefold-repetition',
      result: '1/2-1/2',
      winner: null,
      inCheck: check,
    };
  }

  if (isFiftyMoveRule(state)) {
    return {
      isOver: true,
      reason: 'fifty-move-rule',
      result: '1/2-1/2',
      winner: null,
      inCheck: check,
    };
  }

  return { isOver: false, reason: null, result: '*', winner: null, inCheck: check };
}

/** Count how many times `key` appears in the position-key history. */
export function countRepetitions(history: string[], key: string): number {
  let count = 0;
  for (const k of history) if (k === key) count += 1;
  return count;
}

export { colorOf };
