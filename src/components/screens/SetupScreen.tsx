/**
 * SetupScreen — the pre-game configuration: choose your color, the AI's
 * difficulty and a time control, then start. Also the entry point to the stats
 * screen. Everything animates in with a gentle stagger.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Color } from '@/engine/types';
import { useGameStore, GameConfig } from '@/store/gameStore';
import { DIFFICULTY_LIST, Difficulty } from '@/ai/difficulty';
import { TIME_CONTROL_LIST, TimeControlId } from '@/constants/timeControls';
import { PieceGlyph } from '@/components/board/PieceGlyph';
import { eloTitle } from '@/utils/elo';
import { ChartIcon } from '@/components/ui/Icons';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
};

export function SetupScreen({ onOpenStats }: { onOpenStats: () => void }) {
  const startGame = useGameStore((s) => s.startGame);
  const profile = useGameStore((s) => s.profile);
  const savedConfig = useGameStore((s) => s.config);

  const [color, setColor] = useState<Color | 'random'>(savedConfig.playerColor);
  const [difficulty, setDifficulty] = useState<Difficulty>(savedConfig.difficulty);
  const [timeControl, setTimeControl] = useState<TimeControlId>(savedConfig.timeControl);

  const handleStart = () => {
    const resolvedColor: Color = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    const config: GameConfig = { playerColor: resolvedColor, difficulty, timeControl };
    startGame(config);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-4 py-10">
      {/* Hero */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-3 flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-14 w-14"
          >
            <PieceGlyph type="n" color="w" className="h-full w-full" />
          </motion.div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight">
            Gam<span className="text-brand-400">bito</span>
          </h1>
        </div>
        <p className="max-w-md text-slate-400">
          Ajedrez premium con motor propio e inteligencia artificial. Reta a la máquina y escala tu ELO.
        </p>
      </motion.div>

      {/* Config card */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="card w-full space-y-6 p-6 sm:p-8"
      >
        {/* Color */}
        <Section title="Elige tu color">
          <div className="grid grid-cols-3 gap-3">
            <ColorOption label="Blancas" value="w" active={color === 'w'} onClick={() => setColor('w')} />
            <ColorOption label="Aleatorio" value="random" active={color === 'random'} onClick={() => setColor('random')} />
            <ColorOption label="Negras" value="b" active={color === 'b'} onClick={() => setColor('b')} />
          </div>
        </Section>

        {/* Difficulty */}
        <Section title="Dificultad de la IA">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DIFFICULTY_LIST.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`group relative overflow-hidden rounded-xl p-3 text-left transition-all duration-200 ${
                  difficulty === d.id
                    ? 'bg-white/10 ring-2'
                    : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
                }`}
                style={difficulty === d.id ? ({ '--tw-ring-color': d.accent } as React.CSSProperties) : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: d.accent }}>
                    {d.label}
                  </span>
                </div>
                <div className="mt-1 text-[0.7rem] leading-tight text-slate-400">{d.description}</div>
                <div className="mt-2 text-[0.65rem] font-medium text-slate-500">~{d.elo} ELO</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Time control */}
        <Section title="Ritmo de juego">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TIME_CONTROL_LIST.map((tc) => (
              <button
                key={tc.id}
                onClick={() => setTimeControl(tc.id)}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-200 ${
                  timeControl === tc.id
                    ? 'bg-brand-500/20 ring-2 ring-brand-400/60'
                    : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{tc.icon}</span>
                <span className="text-sm font-semibold">{tc.label}</span>
                <span className="text-[0.65rem] text-slate-400">{tc.detail}</span>
              </button>
            ))}
          </div>
        </Section>

        <button onClick={handleStart} className="btn-primary w-full py-3.5 text-lg">
          Jugar
        </button>
      </motion.div>

      {/* Footer: profile + stats */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={2}
        className="flex w-full items-center justify-between rounded-xl px-2 text-sm"
      >
        <div className="text-slate-400">
          Tu ELO:{' '}
          <span className="font-mono font-bold text-white">{profile.elo}</span>{' '}
          <span className="text-slate-500">· {eloTitle(profile.elo)}</span>
        </div>
        <button onClick={onOpenStats} className="btn-ghost text-sm">
          <ChartIcon className="h-4 w-4" />
          Estadísticas y logros
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
      className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 ${
        active ? 'bg-brand-500/20 ring-2 ring-brand-400/60' : 'bg-white/5 ring-1 ring-white/5 hover:bg-white/10'
      }`}
    >
      <div className="h-9 w-9">
        {value === 'random' ? (
          <div className="flex h-full w-full items-center justify-center text-2xl">🎲</div>
        ) : (
          <PieceGlyph type="k" color={value} className="h-full w-full" />
        )}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
