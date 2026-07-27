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
 *
 * Everything here is scoped to a *generation* — one mounted worker. Leaving the
 * game route unmounts this hook and terminates its worker, so any reply or
 * pending timer from the old generation must not touch the store: the store is
 * global and outlives the component, and a leaked write from a dead worker is
 * what used to leave `aiThinking` stuck on, freezing the board (the store
 * refuses input while the AI is thinking) until the player started a new game.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DIFFICULTIES } from '@/ai/difficulty';
import type { AiRequest, AiResponse } from '@/ai/protocol';

/**
 * How long to wait before assuming a search will never answer. The slowest
 * level budgets 4.5s of search plus ~1s of cosmetic delay, so this only trips
 * on a genuinely lost reply (terminated worker, crashed thread).
 */
const WATCHDOG_MS = 15000;

export function useAI(onMoved?: () => void) {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const pendingRef = useRef(false);
  /** The in-flight cosmetic-delay timer, so it can be cancelled on unmount. */
  const timerRef = useRef<number | null>(null);
  const onMovedRef = useRef(onMoved);
  onMovedRef.current = onMoved;

  // Create the worker once.
  useEffect(() => {
    // Flipped by this effect's cleanup. The worker's callbacks close over it,
    // so anything still in flight when the hook unmounts recognises that it no
    // longer owns the game and leaves the (global, longer-lived) store alone.
    let retired = false;

    const worker = new Worker(new URL('@/ai/ai.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    // A previous generation may have left this set; this worker has nothing in
    // flight yet. Without the reset, a remount could believe a search was still
    // running and never dispatch a new one.
    pendingRef.current = false;

    worker.onmessage = (event: MessageEvent<AiResponse>) => {
      const res = event.data;
      if (res.type !== 'result') return;
      // Ignore replies from a superseded worker or a superseded request.
      if (retired) return;
      if (res.requestId !== requestIdRef.current) return;

      const store = useGameStore.getState();
      store.setAiInfo({ depth: res.depth, nodes: res.nodes, score: res.score, elapsedMs: res.elapsedMs });

      const finish = () => {
        timerRef.current = null;
        // The hook may have unmounted while we waited out the cosmetic delay.
        if (retired) return;
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
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(finish, remaining);
    };

    return () => {
      // Retire before tearing anything down, so a reply or timer that fires
      // during teardown is recognised as stale.
      retired = true;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      worker.terminate();
      workerRef.current = null;
      pendingRef.current = false;
      // The search dies with the worker, so nothing will ever clear this flag.
      // Leaving it set would block the board on the next visit.
      if (useGameStore.getState().aiThinking) useGameStore.getState().setAiThinking(false);
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
    /** Dispatch a search if it is the AI's move and nothing is in flight. */
    const dispatch = (): boolean => {
      if (screen !== 'game') return false;
      if (isOver || viewPly !== -1 || promotion) return false;
      if (engineState.turn === playerColor) return false;
      if (pendingRef.current) return false;
      const worker = workerRef.current;
      if (!worker) return false;

      const store = useGameStore.getState();
      pendingRef.current = true;
      store.setAiThinking(true);

      const request: AiRequest = {
        type: 'search',
        requestId: ++requestIdRef.current,
        fen: store.game.getFen(),
        difficulty,
      };
      worker.postMessage(request);
      return true;
    };

    dispatch();

    // Self-healing: if a reply is ever lost the position would sit on the AI's
    // move with nothing running and no state change left to re-trigger this
    // effect, so the game would look frozen. Re-arm instead of stalling.
    const watchdog = window.setInterval(() => {
      if (!pendingRef.current) {
        dispatch();
        return;
      }
      const store = useGameStore.getState();
      if (!store.aiThinking) return;
      pendingRef.current = false;
      requestIdRef.current++; // abandon the lost reply
      store.setAiThinking(false);
      dispatch();
    }, WATCHDOG_MS);

    return () => window.clearInterval(watchdog);
  }, [screen, engineState, playerColor, difficulty, isOver, viewPly, promotion]);

  // When leaving the game / on reset, invalidate any in-flight request.
  useEffect(() => {
    if (screen !== 'game') {
      requestIdRef.current++;
      pendingRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (useGameStore.getState().aiThinking) useGameStore.getState().setAiThinking(false);
    }
  }, [screen]);
}
