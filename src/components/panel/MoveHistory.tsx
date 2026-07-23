/**
 * MoveHistory — the scrollable, navigable list of SAN moves. Clicking a move
 * jumps the board to that position; the nav buttons step through the game. The
 * currently-viewed ply is highlighted and auto-scrolled into view.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { IconButton } from '@/components/ui/IconButton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from '@/components/ui/Icons';

export function MoveHistory() {
  const moves = useGameStore((s) => s.moves);
  const viewPly = useGameStore((s) => s.viewPly);
  const navigate = useGameStore((s) => s.navigate);
  const navFirst = useGameStore((s) => s.navFirst);
  const navPrev = useGameStore((s) => s.navPrev);
  const navNext = useGameStore((s) => s.navNext);
  const navLast = useGameStore((s) => s.navLast);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activePly = viewPly === -1 ? moves.length - 1 : viewPly;

  // Auto-scroll the active move into view.
  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activePly, moves.length]);

  // Group plies into numbered rows (white, black).
  const rows: { number: number; white?: { ply: number; san: string }; black?: { ply: number; san: string } }[] = [];
  moves.forEach((entry, ply) => {
    const rowIndex = Math.floor(ply / 2);
    if (!rows[rowIndex]) rows[rowIndex] = { number: rowIndex + 1 };
    if (ply % 2 === 0) rows[rowIndex].white = { ply, san: entry.san };
    else rows[rowIndex].black = { ply, san: entry.san };
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Movimientos</h3>
        <div className="flex gap-1">
          <IconButton label="Primero" onClick={navFirst} disabled={moves.length === 0} className="h-8 w-8">
            <ChevronsLeft className="h-4 w-4" />
          </IconButton>
          <IconButton label="Anterior" onClick={navPrev} disabled={moves.length === 0} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton label="Siguiente" onClick={navNext} disabled={viewPly === -1} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </IconButton>
          <IconButton label="Último" onClick={navLast} disabled={viewPly === -1} className="h-8 w-8">
            <ChevronsRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scroll-slim min-h-[8rem] flex-1 overflow-y-auto rounded-xl bg-black/20 p-1 text-sm"
      >
        {moves.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-slate-500">
            Aún no hay movimientos. ¡Haz el primero!
          </p>
        ) : (
          <ol className="font-mono">
            {rows.map((row) => (
              <li key={row.number} className="flex items-stretch">
                <span className="w-8 shrink-0 select-none py-1 pr-1 text-right text-xs text-slate-500">
                  {row.number}.
                </span>
                <MoveCell entry={row.white} active={activePly} onClick={navigate} />
                <MoveCell entry={row.black} active={activePly} onClick={navigate} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function MoveCell({
  entry,
  active,
  onClick,
}: {
  entry?: { ply: number; san: string };
  active: number;
  onClick: (ply: number) => void;
}) {
  if (!entry) return <span className="flex-1" />;
  const isActive = entry.ply === active;
  return (
    <button
      data-active={isActive}
      onClick={() => onClick(entry.ply)}
      className={`flex-1 rounded-md px-2 py-1 text-left transition-colors ${
        isActive ? 'bg-brand-500/30 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      {entry.san}
    </button>
  );
}
