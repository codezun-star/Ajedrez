/**
 * Message protocol shared between the main thread and the AI Web Worker.
 * Keeping it in its own module lets both sides import the exact same types.
 */

import { Move } from '@/engine/types';
import { Difficulty } from './difficulty';

/** Request: "find the best move for this position at this difficulty". */
export interface AiRequest {
  type: 'search';
  /** Monotonic id so stale results (after undo/reset) can be discarded. */
  requestId: number;
  fen: string;
  difficulty: Difficulty;
}

/** Response with the chosen move and some search telemetry. */
export interface AiResponse {
  type: 'result';
  requestId: number;
  move: Move | null;
  score: number;
  depth: number;
  nodes: number;
  elapsedMs: number;
}

export type AiWorkerIn = AiRequest;
export type AiWorkerOut = AiResponse;
