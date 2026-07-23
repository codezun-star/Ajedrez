/**
 * App — the root: applies the theme, wires the global hooks (AI worker, clock,
 * sounds) and switches between the setup, game and stats screens with animated
 * transitions.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useAI } from '@/hooks/useAI';
import { useClock } from '@/hooks/useClock';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useSound } from '@/hooks/useSound';
import { SetupScreen } from '@/components/screens/SetupScreen';
import { GameScreen } from '@/components/screens/GameScreen';
import { StatsScreen } from '@/components/screens/StatsScreen';
import { GameOverModal } from '@/components/modals/GameOverModal';

type View = 'app' | 'stats';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const theme = useGameStore((s) => s.settings.theme);
  const [view, setView] = useState<View>('app');

  // Drive the AI, the clock and the sound cues from the top level so they run
  // for the whole session regardless of which screen is mounted.
  const play = useSound();
  useAI();
  useClock();
  useGameSounds();

  // Apply the theme class to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Play the "start" cue when a new game begins.
  useEffect(() => {
    if (screen === 'game') play('start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const showStats = view === 'stats' && screen === 'setup';

  return (
    <div className="app-aura min-h-screen">
      <AnimatePresence mode="wait">
        {showStats ? (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <StatsScreen onBack={() => setView('app')} />
          </motion.div>
        ) : screen === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SetupScreen onOpenStats={() => setView('stats')} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GameScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <GameOverModal />
    </div>
  );
}
