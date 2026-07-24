/**
 * localStorage-backed persistence for the player's profile, game history and
 * settings. All access goes through this module so serialization, versioning
 * and error handling live in exactly one place — the rest of the app just calls
 * typed load/save helpers.
 */

import { Difficulty } from '@/ai/difficulty';
import { GameResult } from '@/engine/types';
import { STARTING_ELO } from './elo';

const STORAGE_PREFIX = 'botagedrez.v1.';
const PROFILE_KEY = `${STORAGE_PREFIX}profile`;
const HISTORY_KEY = `${STORAGE_PREFIX}history`;
const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;

/** A single finished game, as persisted for the stats & history views. */
export interface GameRecord {
  id: string;
  date: number; // epoch ms
  playerColor: 'w' | 'b';
  difficulty: Difficulty;
  result: GameResult;
  /** 'win' | 'loss' | 'draw' from the player's perspective. */
  outcome: 'win' | 'loss' | 'draw';
  eloBefore: number;
  eloAfter: number;
  moves: number;
  pgn: string;
  reason: string;
}

/** Persistent player profile: rating, streaks and unlocked achievements. */
export interface PlayerProfile {
  elo: number;
  eloHistory: { date: number; elo: number }[];
  currentStreak: number;
  bestStreak: number;
  unlockedAchievements: string[];
}

/** Available visual styles for the pieces. */
export type PieceStyle = 'classic' | 'modern';

/** User settings persisted across sessions. */
export interface AppSettings {
  theme: 'dark' | 'light';
  muted: boolean;
  boardOrientationLock: boolean;
  pieceStyle: PieceStyle;
}

const DEFAULT_PROFILE: PlayerProfile = {
  elo: STARTING_ELO,
  eloHistory: [{ date: Date.now(), elo: STARTING_ELO }],
  currentStreak: 0,
  bestStreak: 0,
  unlockedAchievements: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  muted: false,
  boardOrientationLock: false,
  pieceStyle: 'classic',
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or privacy mode — fail silently; the app still works.
  }
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function loadProfile(): PlayerProfile {
  return safeParse(localStorage.getItem(PROFILE_KEY), DEFAULT_PROFILE);
}

export function saveProfile(profile: PlayerProfile): void {
  write(PROFILE_KEY, profile);
}

// ── History ──────────────────────────────────────────────────────────────────

export function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as GameRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: GameRecord[]): void {
  // Cap stored games to keep localStorage small (keeps most recent 200).
  write(HISTORY_KEY, records.slice(-200));
}

export function appendGame(record: GameRecord): GameRecord[] {
  const history = loadHistory();
  history.push(record);
  saveHistory(history);
  return history;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function loadSettings(): AppSettings {
  return safeParse(localStorage.getItem(SETTINGS_KEY), DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  write(SETTINGS_KEY, settings);
}

export function clearAll(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* ignore */
  }
}

export { DEFAULT_PROFILE, DEFAULT_SETTINGS };
