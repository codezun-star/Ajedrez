/**
 * GameScreen — the in-game layout. On desktop the board sits beside the side
 * panel; on mobile everything stacks. Opponent and player strips frame the
 * board top and bottom, following the current orientation.
 */

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { opposite } from '@/engine/constants';
import { Board } from '@/components/board/Board';
import { PlayerStrip } from '@/components/panel/PlayerStrip';
import { SidePanel } from '@/components/panel/SidePanel';
import { IconButton } from '@/components/ui/IconButton';
import { SunIcon, MoonIcon, VolumeIcon, MuteIcon } from '@/components/ui/Icons';

export function GameScreen() {
  const orientation = useGameStore((s) => s.orientation);
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const toggleMute = useGameStore((s) => s.toggleMute);

  // Top strip shows the side *opposite* the board orientation (the opponent's
  // back rank is at the top); bottom shows the oriented side.
  const topColor = opposite(orientation);
  const bottomColor = orientation;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-4 sm:px-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-extrabold">
            bot<span className="text-brand-400">Agedrez</span>
          </span>
        </div>
        <div className="flex gap-2">
          <IconButton label={settings.muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute}>
            {settings.muted ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
          </IconButton>
          <IconButton label="Cambiar tema" onClick={toggleTheme}>
            {settings.theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </IconButton>
        </div>
      </header>

      {/* Main grid */}
      <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Board column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-2"
        >
          <PlayerStrip color={topColor} />
          <div className="mx-auto w-full max-w-[min(78vh,100%)]">
            <Board />
          </div>
          <PlayerStrip color={bottomColor} />
        </motion.div>

        {/* Side panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="min-h-0"
        >
          <SidePanel />
        </motion.div>
      </div>
    </div>
  );
}
