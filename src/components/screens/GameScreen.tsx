/**
 * GameScreen — the in-game layout.
 *
 * The whole screen is pinned to the (dynamic) viewport height and never
 * scrolls; each region scrolls internally instead. The board is sized by
 * {@link SquareFit} to the largest square that fits its area, so it stays as
 * big as possible in every configuration:
 *
 *   - Wide (desktop, or a phone in landscape): board and panel side by side,
 *     the board limited by height.
 *   - Portrait (phone/tablet upright): board on top at full width, the panel
 *     below in a bounded, internally-scrolling area.
 *
 * Rotating the device flips between these instantly via {@link useIsWide}.
 */

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { opposite } from '@/engine/constants';
import { useIsWide } from '@/hooks/useIsWide';
import { Board } from '@/components/board/Board';
import { SquareFit } from '@/components/board/SquareFit';
import { PlayerStrip } from '@/components/panel/PlayerStrip';
import { SidePanel } from '@/components/panel/SidePanel';
import { IconButton } from '@/components/ui/IconButton';
import { SunIcon, MoonIcon, VolumeIcon, MuteIcon } from '@/components/ui/Icons';

export function GameScreen() {
  const orientation = useGameStore((s) => s.orientation);
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const wide = useIsWide();

  // Top strip shows the side opposite the board orientation (opponent up top).
  const topColor = opposite(orientation);
  const bottomColor = orientation;

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
      {/* Header */}
      <header className="mb-2 flex shrink-0 items-center justify-between">
        <span className="font-display text-lg font-extrabold sm:text-xl">
          bot<span className="text-brand-400">Agedrez</span>
        </span>
        <div className="flex gap-2">
          <IconButton label={settings.muted ? 'Activar sonido' : 'Silenciar'} onClick={toggleMute}>
            {settings.muted ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
          </IconButton>
          <IconButton label="Cambiar tema" onClick={toggleTheme}>
            {settings.theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </IconButton>
        </div>
      </header>

      {/* Main region: board + panel, side by side (wide) or stacked (portrait) */}
      <div className={`flex min-h-0 flex-1 gap-3 ${wide ? 'flex-row' : 'flex-col'}`}>
        {/* Board column */}
        <motion.div
          key={wide ? 'wide' : 'tall'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5"
        >
          <PlayerStrip color={topColor} />
          <SquareFit>
            <Board />
          </SquareFit>
          <PlayerStrip color={bottomColor} />
        </motion.div>

        {/* Side panel — fixed width beside the board, bounded height below it */}
        <div
          className={
            wide
              ? 'min-h-0 w-[20rem] shrink-0 xl:w-[22rem]'
              : 'h-[40dvh] min-h-[16rem] shrink-0'
          }
        >
          <SidePanel />
        </div>
      </div>
    </div>
  );
}
