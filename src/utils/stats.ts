/**
 * Derived statistics computed from the persisted game history. Kept pure so the
 * stats screen can memoize them and they can be unit-tested easily.
 */

import { GameRecord } from './storage';
import { Difficulty } from '@/ai/difficulty';

export interface AggregateStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // 0-100
  byDifficulty: Record<Difficulty, { played: number; wins: number }>;
  averageMoves: number;
}

const EMPTY_BY_DIFF = (): AggregateStats['byDifficulty'] => ({
  easy: { played: 0, wins: 0 },
  medium: { played: 0, wins: 0 },
  hard: { played: 0, wins: 0 },
  expert: { played: 0, wins: 0 },
});

export function computeStats(history: GameRecord[]): AggregateStats {
  const byDifficulty = EMPTY_BY_DIFF();
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalMoves = 0;

  for (const g of history) {
    if (g.outcome === 'win') wins += 1;
    else if (g.outcome === 'loss') losses += 1;
    else draws += 1;

    totalMoves += g.moves;
    const bucket = byDifficulty[g.difficulty];
    if (bucket) {
      bucket.played += 1;
      if (g.outcome === 'win') bucket.wins += 1;
    }
  }

  const played = history.length;
  return {
    played,
    wins,
    losses,
    draws,
    winRate: played ? Math.round((wins / played) * 100) : 0,
    byDifficulty,
    averageMoves: played ? Math.round(totalMoves / played) : 0,
  };
}
