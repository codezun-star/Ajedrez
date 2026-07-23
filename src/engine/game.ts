/**
 * `ChessGame` — a thin, stateful controller around the pure engine functions.
 *
 * It owns the sequence of positions (for undo and repetition detection) and the
 * annotated move history (SAN), but delegates every rule to the pure modules.
 * The class is intentionally free of any UI concern so it can be unit-tested in
 * isolation and driven identically from the store or a Web Worker.
 */

import { Color, GameState, GameStatus, Move, PieceType } from './types';
import { createInitialState, parseFen, positionKey, toFen } from './board';
import {
  generateLegalMoves,
  legalMovesFrom as legalMovesFromState,
  applyMove,
} from './moves';
import { moveToSan } from './san';
import { countRepetitions, getGameStatus } from './status';
import { squareToAlgebraic } from './constants';

/** A move enriched with its SAN and the resulting FEN, for the history panel. */
export interface HistoryEntry {
  move: Move;
  san: string;
  fenBefore: string;
  fenAfter: string;
  /** Full-move number this move belongs to. */
  moveNumber: number;
  /** Color that made the move. */
  color: Color;
}

export class ChessGame {
  private state: GameState;
  private history: HistoryEntry[] = [];
  /** Position keys after each ply (index 0 = the initial position). */
  private positionHistory: string[] = [];

  constructor(fen?: string) {
    this.state = fen ? parseFen(fen) : createInitialState();
    this.positionHistory.push(positionKey(this.state));
  }

  // ── Read accessors ──────────────────────────────────────────────────────

  getState(): GameState {
    return this.state;
  }

  getFen(): string {
    return toFen(this.state);
  }

  get turn(): Color {
    return this.state.turn;
  }

  getHistory(): ReadonlyArray<HistoryEntry> {
    return this.history;
  }

  getLegalMoves(): Move[] {
    return generateLegalMoves(this.state);
  }

  legalMovesFrom(square: number): Move[] {
    return legalMovesFromState(this.state, square);
  }

  /** How many times the current position has now occurred. */
  private currentRepetitionCount(): number {
    const key = positionKey(this.state);
    return countRepetitions(this.positionHistory, key);
  }

  getStatus(): GameStatus {
    return getGameStatus(this.state, this.currentRepetitionCount() >= 3);
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Attempt to make a move from `from` to `to`. Returns the played move (with
   * SAN) or `null` if illegal. `promotion` is required when a pawn reaches the
   * back rank; it defaults to a queen if omitted.
   */
  move(from: number, to: number, promotion: PieceType = 'q'): HistoryEntry | null {
    const legal = this.legalMovesFrom(from);
    const match = legal.find(
      (m) => m.to === to && (!m.promotion || m.promotion === promotion),
    );
    if (!match) return null;
    return this.applyAndRecord(match);
  }

  /** Play an already-validated legal {@link Move}. */
  playMove(move: Move): HistoryEntry {
    return this.applyAndRecord(move);
  }

  private applyAndRecord(move: Move): HistoryEntry {
    const legalMoves = generateLegalMoves(this.state);
    const san = moveToSan(this.state, move, legalMoves);
    const fenBefore = toFen(this.state);
    const entry: HistoryEntry = {
      move,
      san,
      fenBefore,
      fenAfter: '',
      moveNumber: this.state.fullmoveNumber,
      color: this.state.turn,
    };

    this.state = applyMove(this.state, move);
    entry.fenAfter = toFen(this.state);
    this.history.push(entry);
    this.positionHistory.push(positionKey(this.state));
    return entry;
  }

  /** Undo the last ply. Returns the undone entry, or null if none. */
  undo(): HistoryEntry | null {
    const entry = this.history.pop();
    if (!entry) return null;
    this.positionHistory.pop();
    this.state = parseFen(entry.fenBefore);
    return entry;
  }

  /** Reset to the initial position (or a provided FEN). */
  reset(fen?: string): void {
    this.state = fen ? parseFen(fen) : createInitialState();
    this.history = [];
    this.positionHistory = [positionKey(this.state)];
  }

  // ── Convenience ────────────────────────────────────────────────────────────

  /** Algebraic string for a square (e.g. 28 → "e4"). */
  static square(sq: number): string {
    return squareToAlgebraic(sq);
  }
}
