/**
 * SidePanel — the secondary column beside (desktop/landscape) or below
 * (portrait) the board. It hosts a tabbed area — the move history and a
 * beginner's piece guide — plus the always-visible game controls and a
 * shortcut back to setup. It fills its container's height and scrolls its
 * content internally, so it never grows the page.
 */

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { RefreshIcon } from '@/components/ui/Icons';
import { MoveHistory } from './MoveHistory';
import { PieceGuide } from './PieceGuide';
import { Controls } from './Controls';

type Tab = 'moves' | 'guide';

export function SidePanel() {
  const { t } = useI18n();
  const goToSetup = useGameStore((s) => s.goToSetup);
  const [tab, setTab] = useState<Tab>('moves');

  return (
    // `overflow-hidden` is a guarantee, not decoration: when the panel is very
    // short the tab region collapses to zero and its content would otherwise
    // spill out over the controls below.
    <aside className="card flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden p-2.5 sm:gap-3 sm:p-4">
      {/* Tabs */}
      <div className="flex shrink-0 gap-1 rounded-xl bg-black/20 p-1">
        <TabButton active={tab === 'moves'} onClick={() => setTab('moves')}>
          {t('game.tabMoves')}
        </TabButton>
        <TabButton active={tab === 'guide'} onClick={() => setTab('guide')}>
          {t('game.tabGuide')}
        </TabButton>
      </div>

      {/* Tab content */}
      {/* Flex can squeeze this region to zero on a short screen. Without the
          clip its content would paint straight over the controls below. */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {tab === 'moves' ? <MoveHistory /> : <PieceGuide />}
      </div>

      <Controls />

      <button onClick={goToSetup} className="btn-ghost w-full shrink-0 py-2 text-sm">
        <RefreshIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{t('game.newGame')}</span>
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
      className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors sm:px-3 ${
        active ? 'bg-brand-500/30 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
