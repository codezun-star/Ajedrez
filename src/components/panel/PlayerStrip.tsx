/**
 * PlayerStrip — the identity bar shown above and below the board for each side.
 * Displays the name/avatar, captured material, a "thinking…" indicator for the
 * AI, and the clock (when the game is timed).
 */

import { motion } from 'framer-motion';
import { BotIcon, UserRoundIcon } from 'lucide-react';
import { Color } from '@/engine/types';
import { useGameStore } from '@/store/gameStore';
import { DIFFICULTIES } from '@/ai/difficulty';
import { eloRankKey } from '@/utils/elo';
import { formatClock } from '@/utils/format';
import { useI18n } from '@/i18n';
import { CapturedPieces } from './CapturedPieces';

interface PlayerStripProps {
  /** Which side this strip represents. */
  color: Color;
}

export function PlayerStrip({ color }: PlayerStripProps) {
  const { t } = useI18n();
  const config = useGameStore((s) => s.config);
  const profile = useGameStore((s) => s.profile);
  const captured = useGameStore((s) => s.captured);
  const clocks = useGameStore((s) => s.clocks);
  const turn = useGameStore((s) => s.engineState.turn);
  const aiThinking = useGameStore((s) => s.aiThinking);
  const isOver = useGameStore((s) => s.status.isOver);

  const isPlayer = color === config.playerColor;
  const diff = DIFFICULTIES[config.difficulty];

  const name = isPlayer ? t('game.you') : `${t('game.ai')} · ${t(`difficulty.${config.difficulty}`)}`;
  const subtitle = isPlayer
    ? `${t(`ranks.${eloRankKey(profile.elo)}`)} · ${profile.elo}`
    : `~${diff.elo} ELO`;

  // Captured tray: pieces THIS side has captured are the opponent's color.
  const myCaptures = color === 'w' ? captured.byWhite : captured.byBlack;
  const advantage = color === 'w' ? captured.advantage : -captured.advantage;

  const clockMs = clocks[color];
  const timed = Number.isFinite(clockMs);
  const isActive = turn === color && !isOver;
  const lowTime = timed && clockMs < 30000;

  return (
    <div
      className={`flex min-w-0 shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition-colors sm:gap-3 sm:px-3 sm:py-2 ${
        isActive ? 'bg-white/5 ring-1 ring-brand-400/30' : 'bg-transparent'
      }`}
    >
      {/* Identity — shrinks and truncates before anything can overflow. */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-inner sm:h-10 sm:w-10 ${
            color === 'w'
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-surface-950'
              : 'bg-gradient-to-br from-surface-700 to-surface-900 text-white ring-1 ring-white/10'
          }`}
        >
          {isPlayer ? (
            <UserRoundIcon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
          ) : (
            <BotIcon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
          )}
        </div>
        <div className="min-w-0 leading-tight">
          <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold sm:gap-2 sm:text-base">
            <span className="truncate">{name}</span>
            {!isPlayer && aiThinking && isActive && (
              <span className="flex shrink-0 items-center gap-1 text-[0.7rem] font-normal text-brand-300 sm:text-xs">
                <motion.span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-brand-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="hidden xs:inline">{t('game.thinking')}</span>
              </span>
            )}
          </div>
          {/* Dropped on a landscape phone — those pixels belong to the board. */}
          <div className="truncate text-[0.7rem] text-slate-400 short:hidden sm:text-xs">{subtitle}</div>
        </div>
      </div>

      {/* Captured tray takes whatever room is left and clips instead of pushing. */}
      <div className="flex min-w-0 flex-1 justify-end overflow-hidden">
        <CapturedPieces pieces={myCaptures} capturedColor={color === 'w' ? 'b' : 'w'} advantage={advantage} />
      </div>

      {timed && (
        <div
          className={`shrink-0 rounded-lg px-2 py-1 text-right font-mono text-base font-bold tabular-nums transition-colors sm:px-3 sm:py-1.5 sm:text-lg ${
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
  );
}
