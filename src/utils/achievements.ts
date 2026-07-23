/**
 * Achievements / badges.
 *
 * Each achievement is a pure predicate over the player's profile, the freshly
 * finished game and the full history. `evaluateAchievements` returns the ids of
 * any newly-satisfied achievements that were not previously unlocked, so the UI
 * can celebrate them.
 */

import { GameRecord, PlayerProfile } from './storage';
import { Difficulty } from '@/ai/difficulty';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AchievementContext {
  profile: PlayerProfile;
  lastGame: GameRecord;
  history: GameRecord[];
}

interface AchievementDef extends Achievement {
  test: (ctx: AchievementContext) => boolean;
}

const wins = (h: GameRecord[]) => h.filter((g) => g.outcome === 'win');
const winsAt = (h: GameRecord[], d: Difficulty) =>
  h.filter((g) => g.outcome === 'win' && g.difficulty === d);

const DEFS: AchievementDef[] = [
  {
    id: 'first-blood',
    name: 'Primera Sangre',
    description: 'Gana tu primera partida.',
    icon: '🎯',
    tier: 'bronze',
    test: ({ history }) => wins(history).length >= 1,
  },
  {
    id: 'checkmate-artist',
    name: 'Artista del Mate',
    description: 'Gana por jaque mate.',
    icon: '♛',
    tier: 'bronze',
    test: ({ lastGame }) => lastGame.outcome === 'win' && lastGame.reason === 'checkmate',
  },
  {
    id: 'streak-3',
    name: 'En Racha',
    description: 'Consigue una racha de 3 victorias.',
    icon: '🔥',
    tier: 'silver',
    test: ({ profile }) => profile.bestStreak >= 3,
  },
  {
    id: 'streak-5',
    name: 'Imparable',
    description: 'Consigue una racha de 5 victorias.',
    icon: '⚡',
    tier: 'gold',
    test: ({ profile }) => profile.bestStreak >= 5,
  },
  {
    id: 'giant-slayer',
    name: 'Mata Gigantes',
    description: 'Vence a la IA en nivel Experto.',
    icon: '🐉',
    tier: 'platinum',
    test: ({ history }) => winsAt(history, 'expert').length >= 1,
  },
  {
    id: 'hard-won',
    name: 'A Pulso',
    description: 'Vence a la IA en nivel Difícil.',
    icon: '💪',
    tier: 'gold',
    test: ({ history }) => winsAt(history, 'hard').length >= 1,
  },
  {
    id: 'veteran',
    name: 'Veterano',
    description: 'Juega 10 partidas.',
    icon: '🎖️',
    tier: 'silver',
    test: ({ history }) => history.length >= 10,
  },
  {
    id: 'centurion',
    name: 'Centurión',
    description: 'Juega 50 partidas.',
    icon: '🏛️',
    tier: 'gold',
    test: ({ history }) => history.length >= 50,
  },
  {
    id: 'elo-1400',
    name: 'Escalando',
    description: 'Alcanza 1400 de ELO.',
    icon: '📈',
    tier: 'silver',
    test: ({ profile }) => profile.elo >= 1400,
  },
  {
    id: 'elo-1800',
    name: 'Sala de Expertos',
    description: 'Alcanza 1800 de ELO.',
    icon: '👑',
    tier: 'platinum',
    test: ({ profile }) => profile.elo >= 1800,
  },
  {
    id: 'quick-mate',
    name: 'Mate Relámpago',
    description: 'Gana en 20 jugadas o menos.',
    icon: '💥',
    tier: 'gold',
    test: ({ lastGame }) => lastGame.outcome === 'win' && lastGame.moves <= 20,
  },
  {
    id: 'comeback',
    name: 'Remontada',
    description: 'Gana como negras.',
    icon: '🖤',
    tier: 'silver',
    test: ({ lastGame }) => lastGame.outcome === 'win' && lastGame.playerColor === 'b',
  },
];

/** All achievements (for rendering the full grid, locked & unlocked). */
export const ALL_ACHIEVEMENTS: Achievement[] = DEFS.map(({ test: _test, ...rest }) => rest);

export function getAchievement(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Given the context, return the ids of achievements that are now satisfied but
 * were not already unlocked.
 */
export function evaluateAchievements(ctx: AchievementContext): string[] {
  const already = new Set(ctx.profile.unlockedAchievements);
  const newly: string[] = [];
  for (const def of DEFS) {
    if (!already.has(def.id) && def.test(ctx)) {
      newly.push(def.id);
    }
  }
  return newly;
}
