/// <reference lib="webworker" />
/**
 * AI Web Worker.
 *
 * Runs the (potentially expensive) alpha-beta search off the main thread so the
 * UI never janks while the computer is "thinking". Communication is via the
 * typed protocol in ./protocol. Each request carries a `requestId`; the main
 * thread ignores responses whose id it no longer cares about (e.g. after the
 * user takes back a move).
 */

import { parseFen } from '@/engine/board';
import { DIFFICULTIES } from './difficulty';
import { findBestMove } from './search';
import type { AiRequest, AiResponse } from './protocol';

self.onmessage = (event: MessageEvent<AiRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== 'search') return;

  const started = performance.now();
  const state = parseFen(msg.fen);
  const config = DIFFICULTIES[msg.difficulty];

  const result = findBestMove(state, {
    maxDepth: config.maxDepth,
    timeBudgetMs: config.timeBudgetMs,
    randomness: config.randomness,
  });

  const response: AiResponse = {
    type: 'result',
    requestId: msg.requestId,
    move: result.bestMove,
    score: result.score,
    depth: result.depth,
    nodes: result.nodes,
    elapsedMs: performance.now() - started,
  };

  self.postMessage(response);
};
