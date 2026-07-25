/**
 * PlayApp — the interactive game at `/jugar`. Wires the AI worker, clock and
 * sound hooks, and switches between the setup, game and stats views (driven by
 * the store). The marketing pages (home, blog) live in separate routes.
 */

import { useEffect, useState } from 'react';
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
import { StatsScreen } from '@/components/screens/StatsScreen';
import { GameOverModal } from '@/components/modals/GameOverModal';

type View = 'app' | 'stats';

/** Every language's game page — the hreflang set shared by all of them. */
const PLAY_ALTERNATES = LOCALES.map((l) => ({ locale: l.code, path: playPath(l.code) }));

export default function PlayApp() {
  const { t, locale } = useI18n();
  const screen = useGameStore((s) => s.screen);
  const [view, setView] = useState<View>('app');

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

  const showStats = view === 'stats' && screen === 'setup';

  return (
    <div className="app-aura min-h-screen">
      <AnimatePresence mode="wait">
        {showStats ? (
          <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <StatsScreen onBack={() => setView('app')} />
          </motion.div>
        ) : screen === 'setup' ? (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <SetupScreen onOpenStats={() => setView('stats')} />
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
