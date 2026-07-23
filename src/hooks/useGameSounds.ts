/**
 * useGameSounds — bridges game events to sound effects.
 *
 * It watches the move list and game status and plays the appropriate cue when
 * a new move is made or the game ends. Kept separate from `useSound` (which is
 * the generic player) so the mapping logic has one clear home.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { MoveFlag } from '@/engine/types';
import { useSound } from './useSound';

export function useGameSounds() {
  const play = useSound();
  const moves = useGameStore((s) => s.moves);
  const status = useGameStore((s) => s.status);
  const gameOver = useGameStore((s) => s.gameOver);
  const screen = useGameStore((s) => s.screen);

  const prevCount = useRef(moves.length);
  const announcedOver = useRef(false);

  // Per-move sounds.
  useEffect(() => {
    if (screen !== 'game') {
      prevCount.current = moves.length;
      return;
    }
    if (moves.length > prevCount.current) {
      const last = moves[moves.length - 1];
      const flags = last.move.flags;
      if (status.inCheck) {
        play('check');
      } else if (flags & (MoveFlag.KingCastle | MoveFlag.QueenCastle)) {
        play('castle');
      } else if (flags & MoveFlag.Promotion) {
        play('promote');
      } else if (flags & MoveFlag.Capture) {
        play('capture');
      } else {
        play('move');
      }
    }
    prevCount.current = moves.length;
  }, [moves, status.inCheck, play, screen]);

  // Game-over jingle.
  useEffect(() => {
    if (gameOver && !announcedOver.current) {
      announcedOver.current = true;
      const sound = gameOver.outcome === 'win' ? 'win' : gameOver.outcome === 'loss' ? 'lose' : 'draw';
      // Small delay so it lands after the final move sound.
      const id = window.setTimeout(() => play(sound), 250);
      return () => window.clearTimeout(id);
    }
    if (!gameOver) announcedOver.current = false;
  }, [gameOver, play]);
}
