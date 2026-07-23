/**
 * Difficulty presets.
 *
 * Each level tunes three knobs of the search:
 *   - `maxDepth`   — how many plies deep the engine looks.
 *   - `timeBudgetMs` — a safety cap so deep levels never hang the UI.
 *   - `randomness` — centipawn window for picking a random near-best move,
 *     which both weakens play and adds variety at the easy end.
 *
 * `thinkingDelayMs` is a purely cosmetic minimum "thinking" time so the AI feels
 * deliberate even when it finds a move instantly (see useAI).
 */

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  /** Approximate playing strength, shown in the UI and used for ELO math. */
  elo: number;
  maxDepth: number;
  timeBudgetMs: number;
  randomness: number;
  thinkingDelayMs: number;
  description: string;
  accent: string;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Fácil',
    elo: 800,
    maxDepth: 2,
    timeBudgetMs: 500,
    randomness: 90,
    thinkingDelayMs: 350,
    description: 'Relajado y perdonador. Ideal para aprender.',
    accent: '#34d399',
  },
  medium: {
    id: 'medium',
    label: 'Medio',
    elo: 1300,
    maxDepth: 3,
    timeBudgetMs: 1200,
    randomness: 40,
    thinkingDelayMs: 550,
    description: 'Juego sólido con tácticas básicas.',
    accent: '#60a5fa',
  },
  hard: {
    id: 'hard',
    label: 'Difícil',
    elo: 1800,
    maxDepth: 4,
    timeBudgetMs: 2500,
    randomness: 12,
    thinkingDelayMs: 750,
    description: 'Calcula combinaciones y castiga errores.',
    accent: '#f5a623',
  },
  expert: {
    id: 'expert',
    label: 'Experto',
    elo: 2200,
    maxDepth: 5,
    timeBudgetMs: 4500,
    randomness: 0,
    thinkingDelayMs: 900,
    description: 'Búsqueda profunda, casi sin piedad.',
    accent: '#f87171',
  },
};

export const DIFFICULTY_LIST: DifficultyConfig[] = [
  DIFFICULTIES.easy,
  DIFFICULTIES.medium,
  DIFFICULTIES.hard,
  DIFFICULTIES.expert,
];
