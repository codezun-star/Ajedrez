/**
 * Negamax search with alpha-beta pruning, move ordering, quiescence and
 * iterative deepening.
 *
 * Negamax is the compact form of minimax that exploits the symmetry
 * `max(a, b) = -min(-a, -b)`: we always score from the side-to-move's point of
 * view and negate on recursion, so a single code path handles both colors.
 *
 * Optimizations layered in, each strictly correct (they only change speed, not
 * the chosen move at a fixed depth):
 *   - Alpha-beta pruning.
 *   - MVV-LVA capture ordering + killer/history-free promotion ordering.
 *   - Quiescence search: at the leaf, keep resolving captures so the engine
 *     doesn't stop evaluating in the middle of a trade (the "horizon effect").
 *   - Iterative deepening with a soft time budget, so we can stop anytime and
 *     still return the best move found so far.
 */

import { GameState, Move, MoveFlag } from '@/engine/types';
import { typeOf, opposite } from '@/engine/constants';
import { generateLegalMoves, generatePseudoLegalMoves, applyMove } from '@/engine/moves';
import { isSquareAttacked } from '@/engine/attacks';
import { findKing } from '@/engine/board';
import { evaluate, PIECE_VALUE } from './evaluation';

const MATE_SCORE = 1_000_000;
const INFINITY = 2_000_000;

export interface SearchOptions {
  /** Maximum search depth in plies. */
  maxDepth: number;
  /** Soft time budget in milliseconds; the search returns once exceeded. */
  timeBudgetMs: number;
  /**
   * Randomness in centipawns. Moves within this margin of the best score are
   * considered equivalent and one is chosen at random — this makes the easier
   * levels feel less robotic and avoids identical games.
   */
  randomness: number;
}

export interface SearchResult {
  bestMove: Move | null;
  score: number;
  depth: number;
  nodes: number;
}

/** Value used to order captures: victim value minus attacker value (MVV-LVA). */
function captureScore(move: Move): number {
  const victim = PIECE_VALUE[typeOf(move.captured)] ?? 0;
  const attacker = PIECE_VALUE[typeOf(move.piece)] ?? 0;
  return victim * 10 - attacker;
}

/** Order moves to maximise alpha-beta cutoffs: captures & promotions first. */
function orderMoves(moves: Move[], pvMove: Move | null): Move[] {
  return moves
    .map((move) => {
      let score = 0;
      if (pvMove && move.from === pvMove.from && move.to === pvMove.to && move.promotion === pvMove.promotion) {
        score += 1_000_000; // search the previous best move first
      }
      if (move.flags & MoveFlag.Capture) score += 10_000 + captureScore(move);
      if (move.flags & MoveFlag.Promotion) score += 9_000 + (PIECE_VALUE[move.promotion ?? 'q'] ?? 0);
      return { move, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((m) => m.move);
}

/** Is the side to move currently in check? */
function inCheck(state: GameState): boolean {
  const kingSq = findKing(state.board, state.turn);
  return isSquareAttacked(state.board, kingSq, opposite(state.turn));
}

export class Searcher {
  private nodes = 0;
  private deadline = 0;
  private aborted = false;

  /**
   * Iterative deepening entry point. Searches to depth 1, then 2, … up to
   * `maxDepth`, using the best move from the previous iteration to improve
   * ordering. Stops early when the time budget is exhausted.
   */
  search(state: GameState, options: SearchOptions): SearchResult {
    this.nodes = 0;
    this.aborted = false;
    this.deadline = Date.now() + options.timeBudgetMs;

    const rootMoves = generateLegalMoves(state);
    if (rootMoves.length === 0) {
      return { bestMove: null, score: 0, depth: 0, nodes: 0 };
    }

    let best: SearchResult = { bestMove: rootMoves[0], score: -INFINITY, depth: 0, nodes: 0 };

    for (let depth = 1; depth <= options.maxDepth; depth++) {
      const result = this.searchRoot(state, depth, rootMoves, best.bestMove, options.randomness);
      if (this.aborted) break; // discard partial iteration; keep last complete one
      best = { ...result, nodes: this.nodes };
      // A forced mate was found — no point searching deeper.
      if (Math.abs(result.score) > MATE_SCORE - 1000) break;
    }

    return best;
  }

  /** Search the root, collecting candidate moves for randomness at easy levels. */
  private searchRoot(
    state: GameState,
    depth: number,
    rootMoves: Move[],
    pvMove: Move | null,
    randomness: number,
  ): SearchResult {
    let alpha = -INFINITY;
    const beta = INFINITY;
    const ordered = orderMoves(rootMoves, pvMove);

    const scored: { move: Move; score: number }[] = [];
    let bestMove = ordered[0];

    for (const move of ordered) {
      const next = applyMove(state, move);
      const score = -this.negamax(next, depth - 1, -beta, -alpha, 1);
      if (this.aborted) break;

      scored.push({ move, score });
      if (score > alpha) {
        alpha = score;
        bestMove = move;
      }
    }

    // Apply randomness: pick uniformly among moves within `randomness` of best.
    if (randomness > 0 && scored.length > 1 && !this.aborted) {
      const bestScore = Math.max(...scored.map((s) => s.score));
      const pool = scored.filter((s) => s.score >= bestScore - randomness);
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      return { bestMove: chosen.move, score: chosen.score, depth, nodes: this.nodes };
    }

    return { bestMove, score: alpha, depth, nodes: this.nodes };
  }

  /**
   * Core negamax. `ply` is distance from the root, used to prefer faster mates.
   */
  private negamax(state: GameState, depth: number, alpha: number, beta: number, ply: number): number {
    this.nodes++;

    // Periodically check the clock (cheap: every 2048 nodes).
    if ((this.nodes & 2047) === 0 && Date.now() > this.deadline) {
      this.aborted = true;
      return 0;
    }

    if (depth <= 0) {
      return this.quiescence(state, alpha, beta, ply);
    }

    const moves = generateLegalMoves(state);

    // Terminal: checkmate or stalemate.
    if (moves.length === 0) {
      if (inCheck(state)) return -MATE_SCORE + ply; // getting mated — prefer later
      return 0; // stalemate
    }

    // Draw by 50-move rule inside the search.
    if (state.halfmoveClock >= 100) return 0;

    const ordered = orderMoves(moves, null);
    let bestScore = -INFINITY;

    for (const move of ordered) {
      const next = applyMove(state, move);
      const score = -this.negamax(next, depth - 1, -beta, -alpha, ply + 1);
      if (this.aborted) return bestScore;

      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break; // beta cutoff
    }

    return bestScore;
  }

  /**
   * Quiescence search: only explores "loud" moves (captures & promotions) to
   * reach a quiet position before evaluating, avoiding the horizon effect. Uses
   * a "stand-pat" lower bound: the side to move can always decline to capture.
   */
  private quiescence(state: GameState, alpha: number, beta: number, ply: number): number {
    this.nodes++;

    const standPat = state.turn === 'w' ? evaluate(state) : -evaluate(state);
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    // Generate captures only. We use pseudo-legal + legality filter inline.
    const captures = generatePseudoLegalMoves(state)
      .filter((m) => m.flags & (MoveFlag.Capture | MoveFlag.Promotion))
      .sort((a, b) => captureScore(b) - captureScore(a));

    const mover = state.turn;
    for (const move of captures) {
      const next = applyMove(state, move);
      // Skip moves that leave our own king in check (illegal).
      const kingSq = findKing(next.board, mover);
      if (isSquareAttacked(next.board, kingSq, opposite(mover))) continue;

      const score = -this.quiescence(next, -beta, -alpha, ply + 1);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }
}

/** Convenience: run a one-shot search. */
export function findBestMove(state: GameState, options: SearchOptions): SearchResult {
  return new Searcher().search(state, options);
}

export { MATE_SCORE };
