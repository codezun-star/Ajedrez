/**
 * StatsScreen — the player's profile dashboard: headline ELO & streak, an ELO
 * progression chart, aggregate win/loss numbers, the achievements grid and a
 * list of recent games (each replayable via its stored PGN).
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { computeStats } from '@/utils/stats';
import { eloTitle } from '@/utils/elo';
import { formatDate } from '@/utils/format';
import { DIFFICULTIES } from '@/ai/difficulty';
import { EloChart } from '@/components/stats/EloChart';
import { AchievementsGrid } from '@/components/stats/AchievementsGrid';
import { ChevronLeft } from '@/components/ui/Icons';

const OUTCOME_STYLE = {
  win: { label: 'V', className: 'bg-emerald-500/20 text-emerald-300' },
  loss: { label: 'D', className: 'bg-red-500/20 text-red-300' },
  draw: { label: 'T', className: 'bg-slate-500/20 text-slate-300' },
};

export function StatsScreen({ onBack }: { onBack: () => void }) {
  const profile = useGameStore((s) => s.profile);
  const savedGames = useGameStore((s) => s.savedGames);

  const stats = useMemo(() => computeStats(savedGames), [savedGames]);
  const recent = useMemo(() => [...savedGames].reverse().slice(0, 12), [savedGames]);
  const peakElo = useMemo(
    () => profile.eloHistory.reduce((m, e) => Math.max(m, e.elo), profile.elo),
    [profile],
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="btn-ghost text-sm">
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="font-display text-2xl font-bold">Tu perfil</h1>
        <div className="w-20" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Headline stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col justify-between gap-4 p-5 lg:col-span-1"
        >
          <div>
            <div className="text-sm text-slate-400">ELO actual</div>
            <div className="font-mono text-5xl font-extrabold text-white">{profile.elo}</div>
            <div className="text-sm text-brand-300">{eloTitle(profile.elo)}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Pico" value={peakElo} />
            <MiniStat label="Racha" value={`${profile.currentStreak}🔥`} />
            <MiniStat label="Mejor" value={`${profile.bestStreak}`} />
          </div>
        </motion.div>

        {/* Elo chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 lg:col-span-2"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Progresión de ELO</h2>
          <EloChart data={profile.eloHistory} />
        </motion.div>

        {/* Aggregate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:col-span-3"
        >
          <BigStat label="Partidas" value={stats.played} />
          <BigStat label="Victorias" value={stats.wins} accent="text-emerald-300" />
          <BigStat label="% Victorias" value={`${stats.winRate}%`} accent="text-brand-300" />
          <BigStat label="Jugadas/partida" value={stats.averageMoves} />
        </motion.div>

        {/* Win rate by difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card p-5 lg:col-span-3"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Rendimiento por dificultad</h2>
          <div className="space-y-3">
            {Object.entries(stats.byDifficulty).map(([id, bucket]) => {
              const diff = DIFFICULTIES[id as keyof typeof DIFFICULTIES];
              const rate = bucket.played ? Math.round((bucket.wins / bucket.played) * 100) : 0;
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium" style={{ color: diff.accent }}>
                    {diff.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: diff.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs text-slate-400">
                    {bucket.wins}/{bucket.played} · {rate}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="card p-5 lg:col-span-3"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-300">
            Logros{' '}
            <span className="text-slate-500">
              ({profile.unlockedAchievements.length}/{/* total */ 12})
            </span>
          </h2>
          <AchievementsGrid unlocked={profile.unlockedAchievements} />
        </motion.div>

        {/* Recent games */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card p-5 lg:col-span-3"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Partidas recientes</h2>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Todavía no has jugado ninguna partida.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((g) => {
                const o = OUTCOME_STYLE[g.outcome];
                return (
                  <div key={g.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${o.className}`}>
                      {o.label}
                    </span>
                    <span className="w-20 text-slate-300">{DIFFICULTIES[g.difficulty].label}</span>
                    <span className="text-slate-500">{g.playerColor === 'w' ? '♔ Blancas' : '♚ Negras'}</span>
                    <span className="ml-auto text-xs text-slate-500">{g.moves} jugadas</span>
                    <span
                      className={`w-12 text-right font-mono text-xs ${
                        g.eloAfter >= g.eloBefore ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {g.eloAfter >= g.eloBefore ? '+' : ''}
                      {g.eloAfter - g.eloBefore}
                    </span>
                    <span className="hidden w-24 text-right text-xs text-slate-500 sm:block">
                      {formatDate(g.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <div className="font-mono text-lg font-bold text-white">{value}</div>
      <div className="text-[0.65rem] text-slate-400">{label}</div>
    </div>
  );
}

function BigStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="text-center">
      <div className={`font-mono text-3xl font-extrabold ${accent ?? 'text-white'}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}
