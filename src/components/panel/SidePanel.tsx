/**
 * SidePanel — the secondary column beside (desktop/landscape) or below
 * (portrait) the board. It hosts a tabbed area — the move history and a
 * beginner's piece guide — plus the always-visible game controls and a
 * shortcut back to setup. It fills its container's height and scrolls its
 * content internally, so it never grows the page.
 */

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { RefreshIcon } from '@/components/ui/Icons';
import { MoveHistory } from './MoveHistory';
import { PieceGuide } from './PieceGuide';
import { Controls } from './Controls';

type Tab = 'moves' | 'guide';

export function SidePanel() {
  const goToSetup = useGameStore((s) => s.goToSetup);
  const [tab, setTab] = useState<Tab>('moves');

  return (
    <aside className="card flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
      {/* Tabs */}
      <div className="flex shrink-0 gap-1 rounded-xl bg-black/20 p-1">
        <TabButton active={tab === 'moves'} onClick={() => setTab('moves')}>
          Jugadas
        </TabButton>
        <TabButton active={tab === 'guide'} onClick={() => setTab('guide')}>
          Guía de piezas
        </TabButton>
      </div>

      {/* Tab content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === 'moves' ? <MoveHistory /> : <PieceGuide />}
      </div>

      <Controls />

      <button onClick={goToSetup} className="btn-ghost w-full shrink-0 text-sm">
        <RefreshIcon className="h-4 w-4" />
        Nueva partida
      </button>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? 'bg-brand-500/30 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
