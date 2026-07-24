/**
 * A simplified Elo rating system.
 *
 * We treat each AI difficulty as an opponent with a fixed rating and apply the
 * standard Elo update after every decisive/drawn game:
 *
 *     expected = 1 / (1 + 10^((opponent - player) / 400))
 *     newRating = player + K * (score - expected)
 *
 * `score` is 1 for a win, 0.5 for a draw, 0 for a loss. K is the volatility
 * factor: higher for provisional players so ratings settle quickly, lower once
 * established.
 */

import { Difficulty, DIFFICULTIES } from '@/ai/difficulty';

export const STARTING_ELO = 1200;

/** K-factor: larger while the player has few games (faster convergence). */
function kFactor(gamesPlayed: number): number {
  if (gamesPlayed < 10) return 40;
  if (gamesPlayed < 30) return 24;
  return 16;
}

/** Expected score for `player` against `opponent`. */
export function expectedScore(player: number, opponent: number): number {
  return 1 / (1 + Math.pow(10, (opponent - player) / 400));
}

export interface EloUpdate {
  before: number;
  after: number;
  delta: number;
  expected: number;
}

/**
 * Compute the new rating after a game.
 * @param outcome 1 = win, 0.5 = draw, 0 = loss (from the player's perspective).
 */
export function updateElo(
  playerElo: number,
  difficulty: Difficulty,
  outcome: 0 | 0.5 | 1,
  gamesPlayed: number,
): EloUpdate {
  const opponent = DIFFICULTIES[difficulty].elo;
  const expected = expectedScore(playerElo, opponent);
  const k = kFactor(gamesPlayed);
  const after = Math.round(playerElo + k * (outcome - expected));
  return {
    before: playerElo,
    after: Math.max(100, after),
    delta: Math.max(100, after) - playerElo,
    expected,
  };
}

/** Translation key (under `ranks.*`) for the rank of a given rating. */
export type RankKey =
  | 'learner'
  | 'novice'
  | 'amateur'
  | 'club'
  | 'advanced'
  | 'expert'
  | 'candidate'
  | 'master'
  | 'grandmaster';

export function eloRankKey(elo: number): RankKey {
  if (elo < 800) return 'learner';
  if (elo < 1000) return 'novice';
  if (elo < 1200) return 'amateur';
  if (elo < 1400) return 'club';
  if (elo < 1600) return 'advanced';
  if (elo < 1800) return 'expert';
  if (elo < 2000) return 'candidate';
  if (elo < 2200) return 'master';
  return 'grandmaster';
}
