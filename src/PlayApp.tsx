/**
 * PlayApp — the interactive game at `/:locale/play`. Wires the AI worker, clock
 * and sound hooks, and switches between the setup and game views (driven by the
 * store). Stats live at their own route, `/:locale/profile`, so the phone's tab
 * bar can reach them.
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { LOCALES } from '@/i18n/locales';
import { playPath } from '@/i18n/routes';
import { useSeo } from '@/hooks/useSeo';
import { useAI } from '@/hooks/useAI';
import { useClock } from '@/hooks/useClock';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useSound } from '@/hooks/useSound';
import { SetupScreen } from '@/components/screens/SetupScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { GameOverModal } from '@/components/modals/GameOverModal';
import { AppBar } from '@/components/app/AppBar';

/** Every language's game page — the hreflang set shared by all of them. */
const PLAY_ALTERNATES = LOCALES.map((l) => ({ locale: l.code, path: playPath(l.code) }));

export default function PlayApp() {
  const { t, locale } = useI18n();
  const screen = useGameStore((s) => s.screen);

  useSeo({
    title: t('play.seoTitle'),
    description: t('play.seoDescription'),
    path: playPath(locale),
    locale,
    alternates: PLAY_ALTERNATES,
  });

  const play = useSound();
  useAI();
  useClock();
  useGameSounds();

  useEffect(() => {
    if (screen === 'game') play('start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  return (
    <div className="app-aura min-h-screen">
      {/* The phone's app bar belongs to setup only: the game screen is pinned
          to the viewport and draws its own compact header. */}
      {screen === 'setup' && <AppBar title={t('nav.play')} />}
      <AnimatePresence mode="wait">
        {screen === 'setup' ? (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <SetupScreen />
          </motion.div>
        ) : (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <GameScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <GameOverModal />
    </div>
  );
}
