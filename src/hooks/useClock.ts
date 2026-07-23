/**
 * useClock — drives the chess clocks.
 *
 * A single interval ticks while a timed game is active, decrementing the clock
 * of whichever side is to move by the real elapsed time (so tab throttling or a
 * slow frame can't distort the count). Timeout handling lives in the store.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const TICK_MS = 200;

export function useClock() {
  const clockActive = useGameStore((s) => s.clockActive);
  const screen = useGameStore((s) => s.screen);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!clockActive || screen !== 'game') return;

    lastTickRef.current = performance.now();
    const id = window.setInterval(() => {
      const store = useGameStore.getState();
      if (!store.clockActive || store.status.isOver) return;
      // The clock only runs once the first move has been made... but standard
      // rules run White's clock immediately, so we tick the side to move.
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      store.decrementClock(store.engineState.turn, delta);
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [clockActive, screen]);
}
