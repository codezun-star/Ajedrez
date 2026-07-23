/**
 * useAI — orchestrates the AI opponent.
 *
 * Responsibilities:
 *  - Own the Web Worker lifecycle (create once, terminate on unmount).
 *  - Detect when it's the computer's turn and dispatch a search request.
 *  - Enforce a minimum "thinking" time so the move feels deliberate, even if
 *    the search returns instantly (easy levels on simple positions).
 *  - Discard stale results using a monotonically increasing request id, so a
 *    reply that arrives after an undo/reset/new-game is ignored.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DIFFICULTIES } from '@/ai/difficulty';
import type { AiRequest, AiResponse } from '@/ai/protocol';

export function useAI(onMoved?: () => void) {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(false);
  const onMovedRef = useRef(onMoved);
  onMovedRef.current = onMoved;

  // Create the worker once.
  useEffect(() => {
    const worker = new Worker(new URL('@/ai/ai.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<AiResponse>) => {
      const res = event.data;
      if (res.type !== 'result') return;
      // Ignore stale replies (a newer request superseded this one).
      if (res.requestId !== requestIdRef.current) return;

      const store = useGameStore.getState();
      store.setAiInfo({ depth: res.depth, nodes: res.nodes, score: res.score, elapsedMs: res.elapsedMs });

      const finish = () => {
        // Re-check the store: the situation may have changed while we waited.
        const s = useGameStore.getState();
        pendingRef.current = false;
        s.setAiThinking(false);
        if (res.move && !s.status.isOver && s.engineState.turn !== s.config.playerColor) {
          s.applyEngineMove(res.move);
          onMovedRef.current?.();
        }
      };

      // Guarantee a minimum on-screen thinking time.
      const config = DIFFICULTIES[store.config.difficulty];
      const remaining = Math.max(0, config.thinkingDelayMs - res.elapsedMs);
      window.setTimeout(finish, remaining);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Watch for the AI's turn and dispatch a search.
  const screen = useGameStore((s) => s.screen);
  const engineState = useGameStore((s) => s.engineState);
  const playerColor = useGameStore((s) => s.config.playerColor);
  const difficulty = useGameStore((s) => s.config.difficulty);
  const isOver = useGameStore((s) => s.status.isOver);
  const viewPly = useGameStore((s) => s.viewPly);
  const promotion = useGameStore((s) => s.promotion);

  useEffect(() => {
    if (screen !== 'game') return;
    if (isOver || viewPly !== -1 || promotion) return;
    if (engineState.turn === playerColor) return;
    if (pendingRef.current) return;
    const worker = workerRef.current;
    if (!worker) return;

    const store = useGameStore.getState();
    pendingRef.current = true;
    store.setAiThinking(true);

    const requestId = ++requestIdRef.current;
    const request: AiRequest = {
      type: 'search',
      requestId,
      fen: store.game.getFen(),
      difficulty,
    };
    worker.postMessage(request);
  }, [screen, engineState, playerColor, difficulty, isOver, viewPly, promotion]);

  // When leaving the game / on reset, invalidate any in-flight request.
  useEffect(() => {
    if (screen !== 'game') {
      requestIdRef.current++;
      pendingRef.current = false;
    }
  }, [screen]);
}
