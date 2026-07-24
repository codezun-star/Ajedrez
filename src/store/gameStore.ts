/**
 * Global game store (Zustand).
 *
 * Design notes:
 *  - The pure {@link ChessGame} controller is held as a non-reactive field and
 *    mutated in place; after every mutation we publish fresh, immutable derived
 *    snapshots (board, status, captured, …) via `set`, which is what React
 *    subscribes to. This keeps rules in the engine and rendering data in the
 *    store, cleanly separated.
 *  - AI orchestration (running the worker, thinking delay) lives in the `useAI`
 *    hook; the store only exposes the primitives it needs (`aiThinking`,
 *    `applyEngineMove`). The clock lives in `useClock`. This keeps side effects
 *    out of the store and in React's lifecycle where they belong.
 */

import { create } from 'zustand';
import { ChessGame, HistoryEntry } from '@/engine/game';
import { GameState, GameStatus, Move, PieceType, Color } from '@/engine/types';
import { opposite } from '@/engine/constants';
import { findKing } from '@/engine/board';
import { exportPgn } from '@/engine/pgn';
import { Difficulty, DIFFICULTIES } from '@/ai/difficulty';
import { TimeControlId, TIME_CONTROLS } from '@/constants/timeControls';
import { summarizeCaptured, CapturedSummary } from '@/utils/material';
import { updateElo, EloUpdate } from '@/utils/elo';
import { evaluateAchievements } from '@/utils/achievements';
import {
  AppSettings,
  GameRecord,
  PieceStyle,
  PlayerProfile,
  appendGame,
  loadHistory,
  loadProfile,
  loadSettings,
  saveProfile,
  saveSettings,
} from '@/utils/storage';

export type Screen = 'setup' | 'game';

export interface GameConfig {
  playerColor: Color;
  difficulty: Difficulty;
  timeControl: TimeControlId;
}

export interface AiInfo {
  depth: number;
  nodes: number;
  score: number;
  elapsedMs: number;
}

/** Everything shown when a game ends, surfaced in the modal. */
export interface GameOverInfo {
  status: GameStatus;
  outcome: 'win' | 'loss' | 'draw';
  elo: EloUpdate;
  newAchievements: string[];
  pgn: string;
}

const DEFAULT_CONFIG: GameConfig = {
  playerColor: 'w',
  difficulty: 'medium',
  timeControl: 'unlimited',
};

interface StoreState {
  // ── Meta / persistence ────────────────────────────────────────────────────
  screen: Screen;
  profile: PlayerProfile;
  savedGames: GameRecord[];
  settings: AppSettings;

  // ── Live game ───────────────────────────────────────────────────────────────
  config: GameConfig;
  game: ChessGame;
  engineState: GameState;
  moves: HistoryEntry[];
  status: GameStatus;
  captured: CapturedSummary;
  orientation: Color;

  // Interaction
  selectedSquare: number | null;
  legalTargets: Move[];
  lastMove: Move | null;
  checkSquare: number | null;
  promotion: { from: number; to: number; color: Color } | null;

  // AI
  aiThinking: boolean;
  aiInfo: AiInfo | null;

  // History navigation (viewPly = -1 means the live position)
  viewPly: number;

  // Clock (ms remaining; 0/Infinity when untimed)
  clocks: { w: number; b: number };
  clockActive: boolean;

  // End of game
  gameOver: GameOverInfo | null;
  showGameOver: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────────
  startGame: (config: GameConfig) => void;
  goToSetup: () => void;
  selectSquare: (sq: number) => void;
  clearSelection: () => void;
  choosePromotion: (type: PieceType) => void;
  cancelPromotion: () => void;
  applyEngineMove: (move: Move) => void;
  setAiThinking: (thinking: boolean) => void;
  setAiInfo: (info: AiInfo | null) => void;
  undo: () => void;
  resign: () => void;
  flipBoard: () => void;
  navigate: (ply: number) => void;
  navFirst: () => void;
  navPrev: () => void;
  navNext: () => void;
  navLast: () => void;
  decrementClock: (color: Color, deltaMs: number) => void;
  handleTimeout: (color: Color) => void;
  rematch: () => void;
  dismissGameOver: () => void;
  toggleTheme: () => void;
  toggleMute: () => void;
  setPieceStyle: (style: PieceStyle) => void;
}

/** Build the reactive snapshot fields from a game controller. */
function snapshot(game: ChessGame) {
  const engineState = game.getState();
  const status = game.getStatus();
  const checkSquare = status.inCheck ? findKing(engineState.board, engineState.turn) : null;
  return {
    engineState,
    moves: [...game.getHistory()],
    status,
    captured: summarizeCaptured(engineState.board),
    checkSquare,
  };
}

export const useGameStore = create<StoreState>((set, get) => {
  const initialGame = new ChessGame();

  /**
   * When a game reaches a terminal state we compute the outcome, update the
   * rating & streak, persist the record and stage the game-over modal. Runs
   * exactly once per game (guarded by `gameOver === null`).
   */
  function finalize(status: GameStatus): void {
    const state = get();
    if (state.gameOver) return; // already finalized

    const { config, profile, game } = state;
    const player = config.playerColor;

    let outcome: 'win' | 'loss' | 'draw';
    if (!status.winner) outcome = 'draw';
    else outcome = status.winner === player ? 'win' : 'loss';

    const numeric = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
    const elo = updateElo(profile.elo, config.difficulty, numeric, state.savedGames.length);

    // Streak: wins extend it; anything else resets it.
    const currentStreak = outcome === 'win' ? profile.currentStreak + 1 : 0;
    const bestStreak = Math.max(profile.bestStreak, currentStreak);

    const pgn = exportPgn(game.getHistory(), status.result, {
      White: player === 'w' ? 'Tú' : DIFFICULTIES[config.difficulty].label,
      Black: player === 'b' ? 'Tú' : DIFFICULTIES[config.difficulty].label,
      Result: status.result,
    });

    const record: GameRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: Date.now(),
      playerColor: player,
      difficulty: config.difficulty,
      result: status.result,
      outcome,
      eloBefore: elo.before,
      eloAfter: elo.after,
      moves: Math.ceil(game.getHistory().length / 2),
      pgn,
      reason: status.reason ?? 'unknown',
    };

    const savedGames = appendGame(record);

    // Update profile (rating history sampled once per game).
    const updatedProfile: PlayerProfile = {
      ...profile,
      elo: elo.after,
      eloHistory: [...profile.eloHistory, { date: record.date, elo: elo.after }].slice(-100),
      currentStreak,
      bestStreak,
    };

    const newAchievements = evaluateAchievements({
      profile: updatedProfile,
      lastGame: record,
      history: savedGames,
    });
    updatedProfile.unlockedAchievements = [
      ...updatedProfile.unlockedAchievements,
      ...newAchievements,
    ];

    saveProfile(updatedProfile);

    set({
      profile: updatedProfile,
      savedGames,
      clockActive: false,
      gameOver: { status, outcome, elo, newAchievements, pgn },
      showGameOver: true,
    });
  }

  /** Publish the current game snapshot and finalize if the game just ended. */
  function publish(extra: Partial<StoreState> = {}): void {
    const game = get().game;
    const snap = snapshot(game);
    set({ ...snap, ...extra });
    if (snap.status.isOver) finalize(snap.status);
  }

  return {
    screen: 'setup',
    profile: loadProfile(),
    savedGames: loadHistory(),
    settings: loadSettings(),

    config: DEFAULT_CONFIG,
    game: initialGame,
    ...snapshot(initialGame),
    orientation: 'w',

    selectedSquare: null,
    legalTargets: [],
    lastMove: null,
    promotion: null,

    aiThinking: false,
    aiInfo: null,

    viewPly: -1,

    clocks: { w: 0, b: 0 },
    clockActive: false,

    gameOver: null,
    showGameOver: false,

    // ── Actions ────────────────────────────────────────────────────────────────

    startGame: (config) => {
      const game = new ChessGame();
      const tc = TIME_CONTROLS[config.timeControl];
      const initial = tc.initialMs === 0 ? Infinity : tc.initialMs;
      set({
        screen: 'game',
        config,
        game,
        ...snapshot(game),
        orientation: config.playerColor,
        selectedSquare: null,
        legalTargets: [],
        lastMove: null,
        promotion: null,
        aiThinking: false,
        aiInfo: null,
        viewPly: -1,
        clocks: { w: initial, b: initial },
        clockActive: tc.initialMs > 0,
        gameOver: null,
        showGameOver: false,
      });
    },

    goToSetup: () => set({ screen: 'setup', showGameOver: false, clockActive: false }),

    selectSquare: (sq) => {
      const state = get();
      if (state.status.isOver || state.aiThinking || state.viewPly !== -1) return;
      if (state.engineState.turn !== state.config.playerColor) return;

      const { selectedSquare, engineState } = state;
      const piece = engineState.board[sq];

      // If a source is already selected, a click on a legal target plays it.
      if (selectedSquare !== null) {
        const move = state.legalTargets.find((m) => m.to === sq);
        if (move) {
          // Promotion needs a follow-up choice.
          if (move.promotion) {
            set({ promotion: { from: selectedSquare, to: sq, color: engineState.turn } });
            return;
          }
          get().applyEngineMove(move);
          return;
        }
      }

      // Otherwise (re)select if the square holds one of the player's pieces.
      if (piece !== 0 && (piece & 8 ? 'b' : 'w') === state.config.playerColor) {
        set({ selectedSquare: sq, legalTargets: state.game.legalMovesFrom(sq) });
      } else {
        set({ selectedSquare: null, legalTargets: [] });
      }
    },

    clearSelection: () => set({ selectedSquare: null, legalTargets: [] }),

    choosePromotion: (type) => {
      const { promotion, legalTargets } = get();
      if (!promotion) return;
      const move = legalTargets.find((m) => m.to === promotion.to && m.promotion === type);
      set({ promotion: null });
      if (move) get().applyEngineMove(move);
    },

    cancelPromotion: () => set({ promotion: null, selectedSquare: null, legalTargets: [] }),

    applyEngineMove: (move) => {
      const state = get();
      const entry = state.game.playMove(move);

      // Add the increment to the mover's clock (Fischer timing).
      const tc = TIME_CONTROLS[state.config.timeControl];
      const clocks = { ...state.clocks };
      if (tc.initialMs > 0 && Number.isFinite(clocks[entry.color])) {
        clocks[entry.color] += tc.incrementMs;
      }

      publish({
        selectedSquare: null,
        legalTargets: [],
        lastMove: move,
        viewPly: -1,
        clocks,
      });
    },

    setAiThinking: (thinking) => set({ aiThinking: thinking }),
    setAiInfo: (info) => set({ aiInfo: info }),

    undo: () => {
      const state = get();
      if (state.aiThinking || state.status.isOver) return;
      // Undo the player's move and the AI's reply, so control returns to the
      // player. If only the player has moved (AI to move), a single undo.
      const historyLen = state.game.getHistory().length;
      if (historyLen === 0) return;

      const lastEntry = state.game.getHistory()[historyLen - 1];
      state.game.undo();
      // If the last move was the AI's, also undo the player's previous move.
      if (lastEntry.color === opposite(state.config.playerColor) && state.game.getHistory().length > 0) {
        state.game.undo();
      }

      const last = state.game.getHistory();
      publish({
        selectedSquare: null,
        legalTargets: [],
        lastMove: last.length ? last[last.length - 1].move : null,
        viewPly: -1,
        aiInfo: null,
      });
    },

    resign: () => {
      const state = get();
      if (state.status.isOver) return;
      const winner = opposite(state.config.playerColor);
      const status: GameStatus = {
        isOver: true,
        reason: 'resignation',
        result: winner === 'w' ? '1-0' : '0-1',
        winner,
        inCheck: false,
      };
      set({ clockActive: false });
      finalize(status);
    },

    flipBoard: () => set((s) => ({ orientation: opposite(s.orientation) })),

    navigate: (ply) => {
      const state = get();
      const total = state.game.getHistory().length;
      const clamped = Math.max(-1, Math.min(ply, total - 1));
      set({
        viewPly: clamped === total - 1 ? -1 : clamped,
        selectedSquare: null,
        legalTargets: [],
      });
    },

    navFirst: () => get().navigate(0),
    navPrev: () => {
      const s = get();
      const current = s.viewPly === -1 ? s.game.getHistory().length - 1 : s.viewPly;
      get().navigate(current - 1);
    },
    navNext: () => {
      const s = get();
      if (s.viewPly === -1) return;
      get().navigate(s.viewPly + 1);
    },
    navLast: () => set({ viewPly: -1, selectedSquare: null, legalTargets: [] }),

    decrementClock: (color, deltaMs) => {
      const state = get();
      if (!state.clockActive || !Number.isFinite(state.clocks[color])) return;
      const remaining = Math.max(0, state.clocks[color] - deltaMs);
      set({ clocks: { ...state.clocks, [color]: remaining } });
      if (remaining <= 0) get().handleTimeout(color);
    },

    handleTimeout: (color) => {
      const state = get();
      if (state.status.isOver) return;
      const winner = opposite(color);
      const status: GameStatus = {
        isOver: true,
        reason: 'timeout',
        result: winner === 'w' ? '1-0' : '0-1',
        winner,
        inCheck: false,
      };
      set({ clockActive: false });
      finalize(status);
    },

    rematch: () => {
      const { config } = get();
      // Swap nothing — a rematch keeps the same colors and settings.
      get().startGame(config);
    },

    dismissGameOver: () => set({ showGameOver: false }),

    toggleTheme: () => {
      const settings = { ...get().settings, theme: get().settings.theme === 'dark' ? 'light' : 'dark' } as AppSettings;
      saveSettings(settings);
      set({ settings });
    },

    toggleMute: () => {
      const settings = { ...get().settings, muted: !get().settings.muted };
      saveSettings(settings);
      set({ settings });
    },

    setPieceStyle: (style) => {
      const settings = { ...get().settings, pieceStyle: style };
      saveSettings(settings);
      set({ settings });
    },
  };
});
