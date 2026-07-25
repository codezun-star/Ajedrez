/**
 * SetupScreen — the pre-game configuration: choose your color, the AI's
 * difficulty and a time control, then start. Also the entry point to the stats
 * screen. Everything animates in with a gentle stagger and is fully translated.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DicesIcon, HomeIcon } from 'lucide-react';
import { Color } from '@/engine/types';
import { useGameStore, GameConfig } from '@/store/gameStore';
import { DIFFICULTY_LIST, Difficulty } from '@/ai/difficulty';
import { TIME_CONTROL_LIST, TimeControlId } from '@/constants/timeControls';
import { useI18n } from '@/i18n';
import { homePath } from '@/i18n/routes';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { eloRankKey } from '@/utils/elo';
import { ChartIcon } from '@/components/ui/Icons';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export function SetupScreen({ onOpenStats }: { onOpenStats: () => void }) {
  const { t, locale } = useI18n();
  const startGame = useGameStore((s) => s.startGame);
  const profile = useGameStore((s) => s.profile);
  const savedConfig = useGameStore((s) => s.config);

  const pieceStyle = useGameStore((s) => s.settings.pieceStyle);
  const setPieceStyle = useGameStore((s) => s.setPieceStyle);

  const [color, setColor] = useState<Color | 'random'>(savedConfig.playerColor);
  const [difficulty, setDifficulty] = useState<Difficulty>(savedConfig.difficulty);
  const [timeControl, setTimeControl] = useState<TimeControlId>(savedConfig.timeControl);

  const handleStart = () => {
    const resolvedColor: Color = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    const config: GameConfig = { playerColor: resolvedColor, difficulty, timeControl };
    startGame(config);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:gap-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <Link to={homePath(locale)} className="btn-ghost text-sm">
          <HomeIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{t('nav.home')}</span>
        </Link>
        <LanguageSelector compact />
      </div>

      {/* Hero */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="flex flex-col items-center text-center">
        <div className="mb-3 flex max-w-full items-center gap-2 sm:gap-3">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-10 w-10 shrink-0 sm:h-14 sm:w-14"
          >
            <PieceGlyph type="n" color="w" className="h-full w-full" />
          </motion.div>
          <h1 className="min-w-0 truncate font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            bot<span className="text-brand-400">Agedrez</span>
          </h1>
        </div>
        <p className="max-w-md text-sm text-slate-400 sm:text-base">{t('home.subtitle')}</p>
      </motion.div>

      {/* Config card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="card w-full space-y-6 p-4 sm:p-6 md:p-8">
        {/* Color */}
        <Section title={t('setup.chooseColor')}>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <ColorOption label={t('setup.white')} value="w" active={color === 'w'} onClick={() => setColor('w')} />
            <ColorOption label={t('setup.random')} value="random" active={color === 'random'} onClick={() => setColor('random')} />
            <ColorOption label={t('setup.black')} value="b" active={color === 'b'} onClick={() => setColor('b')} />
          </div>
        </Section>

        {/* Difficulty */}
        <Section title={t('setup.difficulty')}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {DIFFICULTY_LIST.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`group relative min-w-0 overflow-hidden rounded-xl p-2.5 text-left transition-all duration-200 sm:p-3 ${
                  difficulty === d.id ? 'bg-white/10 ring-2' : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
                }`}
                style={difficulty === d.id ? ({ '--tw-ring-color': d.accent } as React.CSSProperties) : undefined}
              >
                <span className="block truncate text-sm font-semibold sm:text-base" style={{ color: d.accent }}>
                  {t(`difficulty.${d.id}`)}
                </span>
                <div className="mt-1 text-[0.7rem] leading-tight text-slate-400">{t(`difficulty.${d.id}Desc`)}</div>
                <div className="mt-2 text-[0.65rem] font-medium text-slate-500">~{d.elo} ELO</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Time control */}
        <Section title={t('setup.tempo')}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {TIME_CONTROL_LIST.map((tc) => {
              const Icon = tc.icon;
              return (
                <button
                  key={tc.id}
                  onClick={() => setTimeControl(tc.id)}
                  className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition-all duration-200 sm:p-3 ${
                    timeControl === tc.id ? 'bg-brand-500/20 ring-2 ring-brand-400/60' : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-brand-300" strokeWidth={2} />
                  <span className="w-full truncate text-sm font-semibold">{t(`tempo.${tc.id}`)}</span>
                  <span className="w-full truncate text-[0.65rem] text-slate-400">{t(`tempo.${tc.id}Detail`)}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Piece style */}
        <Section title={t('setup.pieceStyle')}>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {(['classic', 'modern'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setPieceStyle(style)}
                className={`flex min-w-0 items-center gap-2 rounded-xl p-2.5 text-left transition-all duration-200 sm:gap-3 sm:p-3 ${
                  pieceStyle === style ? 'bg-brand-500/20 ring-2 ring-brand-400/60' : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex shrink-0 gap-0.5">
                  <span className="h-7 w-7 sm:h-9 sm:w-9">
                    <PieceGlyph type="n" color="w" className="h-full w-full" styleOverride={style} />
                  </span>
                  <span className="h-7 w-7 sm:h-9 sm:w-9">
                    <PieceGlyph type="n" color="b" className="h-full w-full" styleOverride={style} />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{t(`setup.${style}`)}</div>
                  <div className="truncate text-[0.65rem] text-slate-400">{style === 'classic' ? 'Cburnett' : 'Staunty'}</div>
                </div>
              </button>
            ))}
          </div>
        </Section>

        <button onClick={handleStart} className="btn-primary w-full py-3.5 text-lg">
          {t('setup.play')}
        </button>
      </motion.div>

      {/* Footer: profile + stats */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={2}
        className="flex w-full flex-col items-stretch gap-3 rounded-xl px-2 text-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 text-slate-400">
          {t('setup.yourElo')}: <span className="font-mono font-bold text-white">{profile.elo}</span>{' '}
          <span className="text-slate-500">· {t(`ranks.${eloRankKey(profile.elo)}`)}</span>
        </div>
        <button onClick={onOpenStats} className="btn-ghost shrink-0 text-sm">
          <ChartIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{t('setup.statsBtn')}</span>
        </button>
      </motion.div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      {children}
    </div>
  );
}

function ColorOption({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: Color | 'random';
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 flex-col items-center gap-2 rounded-xl p-2.5 transition-all duration-200 sm:p-3 ${
        active ? 'bg-brand-500/20 ring-2 ring-brand-400/60' : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
        {value === 'random' ? (
          <DicesIcon className="h-6 w-6 text-brand-300 sm:h-7 sm:w-7" strokeWidth={2} />
        ) : (
          <PieceGlyph type="k" color={value} className="h-full w-full" />
        )}
      </div>
      <span className="w-full truncate text-center text-xs font-semibold sm:text-sm">{label}</span>
    </button>
  );
}
