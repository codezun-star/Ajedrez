/**
 * Board — the interactive chessboard.
 *
 * Combines four visual layers plus a drag overlay:
 *   1. squares      — the static walnut/ivory grid with coordinate labels.
 *   2. highlights    — selection, legal targets, last move, king-in-check.
 *   3. pieces        — animated, identity-tracked pieces.
 *   4. drag overlay  — a piece that follows the pointer while dragging.
 *
 * Interaction is unified: a single pointer-down on the board handles both
 * click-to-move and the start of a drag, and we tell them apart on pointer-up
 * by how far the pointer travelled. All rules routing goes through the store's
 * `selectSquare`, so the board stays a pure view.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Color, MoveFlag } from '@/engine/types';
import { FILES, RANKS } from '@/engine/constants';
import { parseFen } from '@/engine/board';
import { useGameStore } from '@/store/gameStore';
import { usePieceTracking, squareToPercent, VisualPiece } from '@/hooks/usePieceTracking';
import { Piece } from './Piece';
import { PieceGlyph } from './PieceGlyph';
import { PromotionModal } from './PromotionModal';

interface DragState {
  fromSquare: number;
  piece: VisualPiece;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
}

export function Board() {
  const orientation = useGameStore((s) => s.orientation);
  const liveState = useGameStore((s) => s.engineState);
  const liveLastMove = useGameStore((s) => s.lastMove);
  const selectedSquare = useGameStore((s) => s.selectedSquare);
  const legalTargets = useGameStore((s) => s.legalTargets);
  const checkSquare = useGameStore((s) => s.checkSquare);
  const viewPly = useGameStore((s) => s.viewPly);
  const moves = useGameStore((s) => s.moves);
  const promotion = useGameStore((s) => s.promotion);
  const selectSquare = useGameStore((s) => s.selectSquare);
  const clearSelection = useGameStore((s) => s.clearSelection);

  const boardRef = useRef<HTMLDivElement>(null);
  const [squarePx, setSquarePx] = useState(64);
  const [drag, setDrag] = useState<DragState | null>(null);

  // ── Which position are we showing? Live, or a scrubbed history ply ─────────
  const viewingHistory = viewPly !== -1;
  const { board, lastMove } = useMemo(() => {
    if (!viewingHistory) return { board: liveState.board, lastMove: liveLastMove };
    const entry = moves[viewPly];
    const histState = parseFen(entry.fenAfter);
    return { board: histState.board, lastMove: entry.move };
  }, [viewingHistory, liveState, liveLastMove, moves, viewPly]);

  const pieces = usePieceTracking(board, lastMove, !viewingHistory);

  // Keep the square pixel size in sync for the drag overlay maths.
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => setSquarePx(el.getBoundingClientRect().width / 8);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Translate a client point to a board square index (respecting orientation). */
  const squareFromPoint = useCallback(
    (clientX: number, clientY: number): number | null => {
      const el = boardRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      if (px < 0 || px > 1 || py < 0 || py > 1) return null;
      const col = Math.floor(px * 8);
      const row = Math.floor(py * 8);
      const file = orientation === 'w' ? col : 7 - col;
      const rank = orientation === 'w' ? 7 - row : row;
      return rank * 8 + file;
    },
    [orientation],
  );

  // ── Pointer interaction ─────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (viewingHistory) return;
      const sq = squareFromPoint(e.clientX, e.clientY);
      if (sq === null) return;

      selectSquare(sq);

      // If the click landed on (and kept) a selection, arm a drag for that piece.
      const state = useGameStore.getState();
      if (state.selectedSquare === sq) {
        const piece = pieces.find((p) => p.square === sq);
        if (piece) {
          setDrag({
            fromSquare: sq,
            piece,
            startX: e.clientX,
            startY: e.clientY,
            x: e.clientX,
            y: e.clientY,
            moved: false,
          });
        }
      }
    },
    [squareFromPoint, selectSquare, pieces, viewingHistory],
  );

  // Global move/up listeners while dragging.
  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      setDrag((d) => {
        if (!d) return d;
        const moved = d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6;
        return { ...d, x: e.clientX, y: e.clientY, moved };
      });
    };

    const onUp = (e: PointerEvent) => {
      const target = squareFromPoint(e.clientX, e.clientY);
      const state = useGameStore.getState();
      const wasMove =
        target !== null && state.legalTargets.some((m) => m.to === target);

      if (wasMove) {
        selectSquare(target!); // completes the move (or opens promotion)
      } else if (drag.moved) {
        clearSelection(); // dropped on nothing → cancel selection
      }
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, squareFromPoint, selectSquare, clearSelection]);

  // ── Derived highlight sets ───────────────────────────────────────────────────
  const targetSquares = useMemo(() => new Set(legalTargets.map((m) => m.to)), [legalTargets]);
  const captureTargets = useMemo(
    () => new Set(legalTargets.filter((m) => m.flags & MoveFlag.Capture).map((m) => m.to)),
    [legalTargets],
  );

  const showSelection = !viewingHistory && selectedSquare !== null;

  return (
    <div className="relative w-full">
      <div
        ref={boardRef}
        className="board-surface relative aspect-square w-full select-none overflow-hidden
                   rounded-2xl shadow-board ring-1 ring-black/40"
        onPointerDown={onPointerDown}
      >
        {/* Layer 1 — squares + coordinates */}
        <BoardSquares orientation={orientation} />

        {/* Layer 2 — highlights */}
        {lastMove && (
          <>
            <SquareOverlay square={lastMove.from} orientation={orientation} className="bg-amber-400/25" />
            <SquareOverlay square={lastMove.to} orientation={orientation} className="bg-amber-400/30" />
          </>
        )}
        {showSelection && selectedSquare !== null && (
          <SquareOverlay
            square={selectedSquare}
            orientation={orientation}
            className="bg-brand-400/40 ring-2 ring-inset ring-brand-300/70"
          />
        )}
        {checkSquare !== null && (
          <SquareOverlay
            square={checkSquare}
            orientation={orientation}
            className="animate-check-pulse rounded-sm"
          />
        )}

        {/* Layer 2b — legal move indicators */}
        {showSelection &&
          [...targetSquares].map((sq) => (
            <MoveIndicator
              key={sq}
              square={sq}
              orientation={orientation}
              capture={captureTargets.has(sq)}
            />
          ))}

        {/* Layer 3 — pieces */}
        {pieces.map((piece) => (
          <Piece
            key={piece.id}
            piece={piece}
            orientation={orientation}
            dragging={drag?.fromSquare === piece.square && drag.moved}
            animate={!viewingHistory}
          />
        ))}

        {/* Layer 4 — promotion picker */}
        <AnimatePresence>{promotion && <PromotionModal />}</AnimatePresence>
      </div>

      {/* Drag overlay — a piece following the pointer, outside overflow clip */}
      {drag && drag.moved && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            width: squarePx,
            height: squarePx,
            left: drag.x - squarePx / 2,
            top: drag.y - squarePx / 2,
            padding: '6%',
          }}
        >
          <PieceGlyph
            type={drag.piece.type}
            color={drag.piece.color}
            className="h-full w-full scale-110 drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

// ── Sub-layers ────────────────────────────────────────────────────────────────

/** The static 8×8 grid with edge coordinate labels. Memoized on orientation. */
function BoardSquares({ orientation }: { orientation: Color }) {
  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = orientation === 'w' ? col : 7 - col;
      const rank = orientation === 'w' ? 7 - row : row;
      const dark = (file + rank) % 2 === 0;
      const showFile = row === 7;
      const showRank = col === 0;
      cells.push(
        <div
          key={`${row}-${col}`}
          className={dark ? 'bg-board-dark' : 'bg-board-light'}
          style={{ position: 'relative' }}
        >
          {showRank && (
            <span
              className={`absolute left-0.5 top-0.5 text-[0.6rem] font-bold ${
                dark ? 'text-board-light/80' : 'text-board-dark/70'
              }`}
            >
              {RANKS[rank]}
            </span>
          )}
          {showFile && (
            <span
              className={`absolute bottom-0 right-0.5 text-[0.6rem] font-bold ${
                dark ? 'text-board-light/80' : 'text-board-dark/70'
              }`}
            >
              {FILES[file]}
            </span>
          )}
        </div>,
      );
    }
  }
  return <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">{cells}</div>;
}

/** A colored overlay covering a single square. */
function SquareOverlay({
  square,
  orientation,
  className,
}: {
  square: number;
  orientation: Color;
  className?: string;
}) {
  const { left, top } = squareToPercent(square, orientation);
  return (
    <div
      className={`pointer-events-none absolute aspect-square w-[12.5%] ${className ?? ''}`}
      style={{ left: `${left}%`, top: `${top}%` }}
    />
  );
}

/** The dot / ring shown on a legal destination square. */
function MoveIndicator({
  square,
  orientation,
  capture,
}: {
  square: number;
  orientation: Color;
  capture: boolean;
}) {
  const { left, top } = squareToPercent(square, orientation);
  return (
    <div
      className="pointer-events-none absolute flex aspect-square w-[12.5%] items-center justify-center"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      {capture ? (
        <span className="h-[86%] w-[86%] rounded-full ring-[0.35rem] ring-inset ring-brand-400/60" />
      ) : (
        <span className="h-1/3 w-1/3 rounded-full bg-brand-400/60" />
      )}
    </div>
  );
}
