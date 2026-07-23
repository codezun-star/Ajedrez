/**
 * GameOverModal — the end-of-game summary: outcome, the reason it ended, the
 * Elo change with an animated counter, any freshly-unlocked achievements, and
 * rematch / new-game actions. A confetti burst celebrates a win.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getAchievement } from '@/utils/achievements';
import { eloTitle } from '@/utils/elo';
import { Confetti } from './Confetti';
import { CrownIcon, RefreshIcon } from '@/components/ui/Icons';

const REASON_LABEL: Record<string, string> = {
  checkmate: 'Jaque mate',
  stalemate: 'Rey ahogado',
  'insufficient-material': 'Material insuficiente',
  'threefold-repetition': 'Triple repetición',
  'fifty-move-rule': 'Regla de 50 movimientos',
  resignation: 'Rendición',
  timeout: 'Tiempo agotado',
};

const OUTCOME_TITLE = {
  win: '¡Victoria!',
  loss: 'Derrota',
  draw: 'Tablas',
};

export function GameOverModal() {
  const showGameOver = useGameStore((s) => s.showGameOver);
  const gameOver = useGameStore((s) => s.gameOver);
  const rematch = useGameStore((s) => s.rematch);
  const goToSetup = useGameStore((s) => s.goToSetup);
  const dismiss = useGameStore((s) => s.dismissGameOver);
  const profile = useGameStore((s) => s.profile);

  if (!showGameOver || !gameOver) return null;

  const { outcome, elo, status, newAchievements } = gameOver;
  const accent =
    outcome === 'win' ? 'text-emerald-300' : outcome === 'loss' ? 'text-red-300' : 'text-slate-300';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onPointerDown={(e) => e.target === e.currentTarget && dismiss()}
      >
        {outcome === 'win' && <Confetti />}

        <motion.div
          className="card w-full max-w-md overflow-hidden p-0"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {/* Banner */}
          <div
            className={`relative flex flex-col items-center gap-1 px-6 py-8 ${
              outcome === 'win'
                ? 'bg-gradient-to-b from-emerald-500/20 to-transparent'
                : outcome === 'loss'
                  ? 'bg-gradient-to-b from-red-500/20 to-transparent'
                  : 'bg-gradient-to-b from-brand-500/20 to-transparent'
            }`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
              className={`mb-1 ${accent}`}
            >
              {outcome === 'win' ? (
                <CrownIcon className="h-14 w-14" />
              ) : (
                <span className="text-5xl">{outcome === 'draw' ? '🤝' : '💔'}</span>
              )}
            </motion.div>
            <h2 className={`font-display text-3xl font-extrabold ${accent}`}>{OUTCOME_TITLE[outcome]}</h2>
            <p className="text-sm text-slate-400">
              {status.winner
                ? `Ganan las ${status.winner === 'w' ? 'blancas' : 'negras'}`
                : 'Empate'}{' '}
              · {REASON_LABEL[status.reason ?? ''] ?? 'Fin de la partida'}
            </p>
          </div>

          {/* Elo change */}
          <div className="px-6 pb-2">
            <EloDelta before={elo.before} after={elo.after} delta={elo.delta} />
            <p className="mt-1 text-center text-xs text-slate-500">
              {eloTitle(profile.elo)} · racha actual {profile.currentStreak} 🔥
            </p>
          </div>

          {/* Achievements */}
          {newAchievements.length > 0 && (
            <div className="px-6 py-3">
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-300">
                ¡Logros desbloqueados!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {newAchievements.map((id, i) => {
                  const a = getAchievement(id);
                  if (!a) return null;
                  return (
                    <motion.div
                      key={id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 300 }}
                      className="flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm ring-1 ring-amber-400/30"
                    >
                      <span className="text-lg">{a.icon}</span>
                      <span className="font-medium text-amber-100">{a.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-4">
            <button onClick={goToSetup} className="btn-ghost flex-1">
              Menú
            </button>
            <button onClick={rematch} className="btn-primary flex-1">
              <RefreshIcon className="h-4 w-4" />
              Revancha
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Animated Elo counter that ticks from `before` to `after`. */
function EloDelta({ before, after, delta }: { before: number; after: number; delta: number }) {
  const [display, setDisplay] = useState(before);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(before + (after - before) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [before, after]);

  const positive = delta > 0;
  const neutral = delta === 0;

  return (
    <div className="flex items-center justify-center gap-3 rounded-xl bg-black/20 py-4">
      <span className="text-sm text-slate-400">ELO</span>
      <span className="font-mono text-3xl font-bold tabular-nums text-white">{display}</span>
      <span
        className={`rounded-md px-2 py-0.5 text-sm font-semibold ${
          neutral
            ? 'bg-slate-500/20 text-slate-300'
            : positive
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
        }`}
      >
        {positive ? '+' : ''}
        {delta}
      </span>
    </div>
  );
}
