/**
 * StatsScreen — the player's profile dashboard: headline ELO & streak, an ELO
 * progression chart, aggregate win/loss numbers, the achievements grid and a
 * list of recent games (each replayable via its stored PGN).
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FlameIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { computeStats } from '@/utils/stats';
import { eloRankKey } from '@/utils/elo';
import { formatDate } from '@/utils/format';
import { DIFFICULTIES } from '@/ai/difficulty';
import { useI18n } from '@/i18n';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { EloChart } from '@/components/stats/EloChart';
import { AchievementsGrid } from '@/components/stats/AchievementsGrid';
import { ChevronLeft } from '@/components/ui/Icons';

const OUTCOME_STYLE = {
  win: { label: 'V', className: 'bg-emerald-500/20 text-emerald-300' },
  loss: { label: 'D', className: 'bg-red-500/20 text-red-300' },
  draw: { label: 'T', className: 'bg-slate-500/20 text-slate-300' },
};

export function StatsScreen({ onBack }: { onBack: () => void }) {
  const { t, locale } = useI18n();
  const profile = useGameStore((s) => s.profile);
  const savedGames = useGameStore((s) => s.savedGames);

  const stats = useMemo(() => computeStats(savedGames), [savedGames]);
  const recent = useMemo(() => [...savedGames].reverse().slice(0, 12), [savedGames]);
  const peakElo = useMemo(
    () => profile.eloHistory.reduce((m, e) => Math.max(m, e.elo), profile.elo),
    [profile],
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={onBack} className="btn-ghost shrink-0 text-sm">
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{t('stats.back')}</span>
        </button>
        <h1 className="min-w-0 truncate font-display text-xl font-bold sm:text-2xl">{t('stats.title')}</h1>
        {/* Balances the back button so the title stays centred on wide screens. */}
        <div className="hidden w-20 shrink-0 sm:block" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Headline stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col justify-between gap-4 p-4 sm:p-5 lg:col-span-1"
        >
          <div className="min-w-0">
            <div className="text-sm text-slate-400">{t('stats.eloNow')}</div>
            <div className="font-mono text-4xl font-extrabold text-white sm:text-5xl">{profile.elo}</div>
            <div className="truncate text-sm text-brand-300">{t(`ranks.${eloRankKey(profile.elo)}`)}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label={t('stats.peak')} value={peakElo} />
            <MiniStat
              label={t('stats.streak')}
              value={
                <span className="inline-flex items-center gap-1">
                  {profile.currentStreak}
                  <FlameIcon className="h-4 w-4 text-orange-400" />
                </span>
              }
            />
            <MiniStat label={t('stats.best')} value={profile.bestStreak} />
          </div>
        </motion.div>

        {/* Elo chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-4 sm:p-5 lg:col-span-2"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">{t('stats.progression')}</h2>
          <EloChart data={profile.eloHistory} emptyMessage={t('stats.needGames')} />
        </motion.div>

        {/* Aggregate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 sm:p-5 lg:col-span-3"
        >
          <BigStat label={t('stats.played')} value={stats.played} />
          <BigStat label={t('stats.wins')} value={stats.wins} accent="text-emerald-300" />
          <BigStat label={t('stats.winRate')} value={`${stats.winRate}%`} accent="text-brand-300" />
          <BigStat label={t('stats.avgMoves')} value={stats.averageMoves} />
        </motion.div>

        {/* Win rate by difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card p-4 sm:p-5 lg:col-span-3"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">{t('stats.byDifficulty')}</h2>
          <div className="space-y-3">
            {Object.entries(stats.byDifficulty).map(([id, bucket]) => {
              const diff = DIFFICULTIES[id as keyof typeof DIFFICULTIES];
              const rate = bucket.played ? Math.round((bucket.wins / bucket.played) * 100) : 0;
              return (
                <div key={id} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-14 shrink-0 truncate text-xs font-medium sm:w-16 sm:text-sm" style={{ color: diff.accent }}>
                    {t(`difficulty.${id}`)}
                  </span>
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: diff.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-[0.7rem] text-slate-400 sm:w-24 sm:text-xs">
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
          className="card p-4 sm:p-5 lg:col-span-3"
        >
          <h2 className="mb-4 text-sm font-semibold text-slate-300">
            {t('stats.achievements')}{' '}
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
          className="card p-4 sm:p-5 lg:col-span-3"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-300">{t('stats.recent')}</h2>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">{t('stats.noGames')}</p>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((g) => {
                const o = OUTCOME_STYLE[g.outcome];
                return (
                  <div key={g.id} className="flex items-center gap-2 py-2.5 text-sm sm:gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${o.className}`}>
                      {o.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-slate-300">{t(`difficulty.${g.difficulty}`)}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-slate-500">
                      <span className="inline-flex h-4 w-4">
                        <PieceGlyph type="k" color={g.playerColor} className="h-full w-full" />
                      </span>
                      <span className="hidden xs:inline">
                        {g.playerColor === 'w' ? t('stats.whiteShort') : t('stats.blackShort')}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {g.moves} {t('stats.movesShort')}
                    </span>
                    <span
                      className={`w-10 shrink-0 text-right font-mono text-xs sm:w-12 ${
                        g.eloAfter >= g.eloBefore ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {g.eloAfter >= g.eloBefore ? '+' : ''}
                      {g.eloAfter - g.eloBefore}
                    </span>
                    <span className="hidden w-24 shrink-0 text-right text-xs text-slate-500 sm:block">
                      {formatDate(g.date, locale)}
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

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/5 px-1 py-2">
      <div className="font-mono text-lg font-bold text-white">{value}</div>
      <div className="truncate text-[0.65rem] text-slate-400">{label}</div>
    </div>
  );
}

function BigStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="min-w-0 text-center">
      <div className={`font-mono text-2xl font-extrabold sm:text-3xl ${accent ?? 'text-white'}`}>{value}</div>
      <div className="mt-1 text-[0.7rem] text-slate-400 sm:text-xs">{label}</div>
    </div>
  );
}
