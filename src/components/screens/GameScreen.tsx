/**
 * GameScreen — the in-game layout.
 *
 * The whole screen is pinned to the (dynamic) viewport height and never
 * scrolls; each region scrolls internally instead. The board is sized by
 * {@link SquareFit} to the largest square that fits its area, so it stays as
 * big as possible in every configuration:
 *
 *   - Wide (desktop / tablet landscape): board and panel side by side, the
 *     board limited by height, a player strip above and below it.
 *   - Portrait (phone/tablet upright): board on top at full width, the panel
 *     below in a bounded, internally-scrolling area.
 *   - Short landscape (a phone on its side): the strips move into the panel
 *     column and the header collapses, so the board gets the whole height —
 *     otherwise the chrome leaves it barely a third of the screen.
 *
 * Rotating the device flips between these instantly via {@link useIsWide} /
 * {@link useIsShort}.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { opposite } from '@/engine/constants';
import { useIsWide, useIsShort } from '@/hooks/useIsWide';
import { useI18n } from '@/i18n';
import { homePath } from '@/i18n/routes';
import { Board } from '@/components/board/Board';
import { SquareFit } from '@/components/board/SquareFit';
import { PlayerStrip } from '@/components/panel/PlayerStrip';
import { SidePanel } from '@/components/panel/SidePanel';
import { IconButton } from '@/components/ui/IconButton';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { SunIcon, MoonIcon, VolumeIcon, MuteIcon } from '@/components/ui/Icons';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function GameScreen() {
  const { t, locale } = useI18n();
  const orientation = useGameStore((s) => s.orientation);
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const wide = useIsWide();
  const short = useIsShort();

  // A phone on its side: wide layout, but almost no vertical room to spend.
  const compactLandscape = wide && short;

  // Top strip shows the side opposite the board orientation (opponent up top).
  const topColor = opposite(orientation);
  const bottomColor = orientation;

  const chrome = (
    <>
      <LanguageSelector compact />
      <IconButton label={t('nav.play')} onClick={toggleMute}>
        {settings.muted ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
      </IconButton>
      <IconButton label={t('nav.play')} onClick={toggleTheme}>
        {settings.theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </IconButton>
    </>
  );

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3">
      {/* Header — dropped in short landscape; its controls move into the panel */}
      {!compactLandscape && (
        <header className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <Link
            to={homePath(locale)}
            className="flex min-w-0 shrink items-center"
            aria-label="botAgedrez"
          >
            <BrandLogo className="h-10 sm:h-12" />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{chrome}</div>
        </header>
      )}

      {/* Main region: board + panel, side by side (wide) or stacked (portrait) */}
      <div className={`flex min-h-0 min-w-0 flex-1 gap-2 sm:gap-3 ${wide ? 'flex-row' : 'flex-col'}`}>
        {/* Board column */}
        <motion.div
          key={wide ? 'wide' : 'tall'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`flex min-w-0 flex-col gap-1.5 ${wide ? 'min-h-0 flex-1' : 'shrink-0'}`}
        >
          {/* In short landscape the strips live in the panel column instead. */}
          {!compactLandscape && <PlayerStrip color={topColor} />}

          {wide ? (
            // Landscape/desktop: height is the scarce axis, so fit to it.
            <SquareFit>
              <Board />
            </SquareFit>
          ) : (
            // Portrait: width is the scarce axis. Take the full width and only
            // cap it by what the header, strips and panel need, so the board is
            // as large as the phone allows instead of splitting the screen.
            <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-21rem))]">
              <Board />
            </div>
          )}

          {!compactLandscape && <PlayerStrip color={bottomColor} />}
        </motion.div>

        {/* Side panel — fixed width beside the board, the leftover height below */}
        <div
          className={
            wide
              ? // Narrower on small landscape phones so the board keeps its share.
                'flex min-h-0 w-[15rem] shrink-0 flex-col gap-1.5 md:w-[18rem] lg:w-[20rem] xl:w-[22rem]'
              : 'flex min-h-[9rem] w-full min-w-0 flex-1 flex-col'
          }
        >
          {compactLandscape && (
            <>
              <div className="flex shrink-0 items-center justify-end gap-1.5">{chrome}</div>
              <PlayerStrip color={topColor} />
            </>
          )}

          <div className="min-h-0 flex-1">
            <SidePanel />
          </div>

          {compactLandscape && <PlayerStrip color={bottomColor} />}
        </div>
      </div>
    </div>
  );
}
