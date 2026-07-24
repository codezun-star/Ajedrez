/**
 * AchievementsGrid — every badge, shown locked or unlocked, with a subtle
 * tier-colored glow on the ones the player has earned.
 */

import { motion } from 'framer-motion';
import { ALL_ACHIEVEMENTS, Achievement } from '@/utils/achievements';

const TIER_RING: Record<Achievement['tier'], string> = {
  bronze: 'ring-amber-700/50 shadow-[0_0_20px_-6px_rgba(180,120,60,0.6)]',
  silver: 'ring-slate-300/50 shadow-[0_0_20px_-6px_rgba(200,210,230,0.6)]',
  gold: 'ring-amber-400/60 shadow-[0_0_22px_-6px_rgba(245,166,35,0.7)]',
  platinum: 'ring-brand-300/60 shadow-[0_0_24px_-6px_rgba(120,150,255,0.8)]',
};

const TIER_TEXT: Record<Achievement['tier'], string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold: 'text-amber-400',
  platinum: 'text-brand-300',
};

export function AchievementsGrid({ unlocked }: { unlocked: string[] }) {
  const unlockedSet = new Set(unlocked);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ALL_ACHIEVEMENTS.map((a, i) => {
        const isUnlocked = unlockedSet.has(a.id);
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              isUnlocked
                ? `bg-white/10 ring-1 ${TIER_RING[a.tier]}`
                : 'bg-white/[0.03] ring-1 ring-white/5 grayscale'
            }`}
          >
            <a.icon
              className={`h-6 w-6 shrink-0 ${isUnlocked ? TIER_TEXT[a.tier] : 'text-slate-500 opacity-40'}`}
              strokeWidth={2}
            />
            <div className="min-w-0">
              <div className={`truncate text-sm font-semibold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                {a.name}
              </div>
              <div className="truncate text-[0.7rem] text-slate-400">{a.description}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
