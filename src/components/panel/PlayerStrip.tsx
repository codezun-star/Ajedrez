/**
 * PlayerStrip — the identity bar shown above and below the board for each side.
 * Displays the name/avatar, captured material, a "thinking…" indicator for the
 * AI, and the clock (when the game is timed).
 */

import { motion } from 'framer-motion';
import { Color } from '@/engine/types';
import { useGameStore } from '@/store/gameStore';
import { DIFFICULTIES } from '@/ai/difficulty';
import { eloTitle } from '@/utils/elo';
import { formatClock } from '@/utils/format';
import { CapturedPieces } from './CapturedPieces';

interface PlayerStripProps {
  /** Which side this strip represents. */
  color: Color;
}

export function PlayerStrip({ color }: PlayerStripProps) {
  const config = useGameStore((s) => s.config);
  const profile = useGameStore((s) => s.profile);
  const captured = useGameStore((s) => s.captured);
  const clocks = useGameStore((s) => s.clocks);
  const turn = useGameStore((s) => s.engineState.turn);
  const aiThinking = useGameStore((s) => s.aiThinking);
  const isOver = useGameStore((s) => s.status.isOver);

  const isPlayer = color === config.playerColor;
  const diff = DIFFICULTIES[config.difficulty];

  const name = isPlayer ? 'Tú' : `IA · ${diff.label}`;
  const subtitle = isPlayer ? `${eloTitle(profile.elo)} · ${profile.elo}` : `~${diff.elo} ELO`;

  // Captured tray: pieces THIS side has captured are the opponent's color.
  const myCaptures = color === 'w' ? captured.byWhite : captured.byBlack;
  const advantage = color === 'w' ? captured.advantage : -captured.advantage;

  const clockMs = clocks[color];
  const timed = Number.isFinite(clockMs);
  const isActive = turn === color && !isOver;
  const lowTime = timed && clockMs < 30000;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors ${
        isActive ? 'bg-white/5 ring-1 ring-brand-400/30' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold shadow-inner ${
            color === 'w'
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-surface-950'
              : 'bg-gradient-to-br from-surface-700 to-surface-900 text-white ring-1 ring-white/10'
          }`}
        >
          {isPlayer ? '♟' : '🤖'}
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-2 font-semibold">
            {name}
            {!isPlayer && aiThinking && isActive && (
              <span className="flex items-center gap-1 text-xs font-normal text-brand-300">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                pensando…
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">{subtitle}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CapturedPieces pieces={myCaptures} capturedColor={color === 'w' ? 'b' : 'w'} advantage={advantage} />
        {timed && (
          <div
            className={`min-w-[4.5rem] rounded-lg px-3 py-1.5 text-right font-mono text-lg font-bold tabular-nums transition-colors ${
              isActive
                ? lowTime
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-brand-500/20 text-brand-200'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            {formatClock(clockMs)}
          </div>
        )}
      </div>
    </div>
  );
}
