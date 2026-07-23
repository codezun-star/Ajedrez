/**
 * SidePanel — the right-hand column during a game: move history, controls, and
 * a shortcut back to the setup screen for a brand-new game.
 */

import { useGameStore } from '@/store/gameStore';
import { RefreshIcon } from '@/components/ui/Icons';
import { MoveHistory } from './MoveHistory';
import { Controls } from './Controls';

export function SidePanel() {
  const goToSetup = useGameStore((s) => s.goToSetup);

  return (
    <aside className="card flex h-full min-h-0 flex-col gap-4 p-4">
      <MoveHistory />
      <Controls />
      <button onClick={goToSetup} className="btn-ghost w-full text-sm">
        <RefreshIcon className="h-4 w-4" />
        Nueva partida
      </button>
    </aside>
  );
}
