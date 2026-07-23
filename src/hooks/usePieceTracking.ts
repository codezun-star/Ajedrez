/**
 * usePieceTracking — assigns a stable identity to each piece on the board so
 * Framer Motion can animate a piece *gliding* from its old square to its new
 * one, instead of one piece vanishing and another appearing.
 *
 * The trick: when a move happens we transfer the moving piece's id from its
 * origin square to its destination square (and the rook's id too, when
 * castling). Every other piece keeps the id it already had. Newly-appeared
 * pieces (initial render, promotions, history jumps) get fresh ids.
 *
 * The computation is derived synchronously from the board so the very first
 * render already has correct positions; we memoize on the board reference to
 * stay idempotent under React's double-invoked renders.
 */

import { useRef } from 'react';
import { Color, Move, MoveFlag, PieceType } from '@/engine/types';
import { colorOf, typeOf, fileOf, rankOf, SQ } from '@/engine/constants';

export interface VisualPiece {
  id: number;
  type: PieceType;
  color: Color;
  square: number;
}

interface TrackerState {
  idBySquare: Int32Array;
  nextId: number;
  lastBoard: Uint8Array | null;
  lastMoveKey: string;
}

export function usePieceTracking(
  board: Uint8Array,
  lastMove: Move | null,
  animate: boolean,
): VisualPiece[] {
  const ref = useRef<TrackerState>({
    idBySquare: new Int32Array(64).fill(-1),
    nextId: 1,
    lastBoard: null,
    lastMoveKey: '',
  });

  const st = ref.current;
  const moveKey = lastMove ? `${lastMove.from}-${lastMove.to}-${lastMove.promotion ?? ''}` : '';

  // Recompute only when the board or the last move actually changed.
  if (st.lastBoard !== board || st.lastMoveKey !== moveKey) {
    const prev = st.idBySquare;
    const next = new Int32Array(64).fill(-1);

    // 1. Carry the moving piece's id from origin → destination.
    if (animate && lastMove && prev[lastMove.from] !== -1 && board[lastMove.to] !== 0) {
      next[lastMove.to] = prev[lastMove.from];

      // Castling: the rook glides too.
      if (lastMove.flags & MoveFlag.KingCastle) {
        const rookFrom = lastMove.to === SQ.g1 ? SQ.h1 : SQ.h8;
        const rookTo = lastMove.to === SQ.g1 ? SQ.f1 : SQ.f8;
        if (prev[rookFrom] !== -1) next[rookTo] = prev[rookFrom];
      } else if (lastMove.flags & MoveFlag.QueenCastle) {
        const rookFrom = lastMove.to === SQ.c1 ? SQ.a1 : SQ.a8;
        const rookTo = lastMove.to === SQ.c1 ? SQ.d1 : SQ.d8;
        if (prev[rookFrom] !== -1) next[rookTo] = prev[rookFrom];
      }
    }

    // 2. Preserve ids for all other stationary pieces.
    for (let sq = 0; sq < 64; sq++) {
      if (board[sq] === 0) continue;
      if (next[sq] !== -1) continue; // already assigned (the mover / rook)
      if (prev[sq] !== -1) {
        next[sq] = prev[sq];
      }
    }

    // 3. Assign fresh ids to any occupied square still missing one.
    for (let sq = 0; sq < 64; sq++) {
      if (board[sq] !== 0 && next[sq] === -1) {
        next[sq] = st.nextId++;
      }
    }

    st.idBySquare = next;
    st.lastBoard = board;
    st.lastMoveKey = moveKey;
  }

  // Build the visual list from the current mapping.
  const pieces: VisualPiece[] = [];
  const map = st.idBySquare;
  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece === 0) continue;
    pieces.push({ id: map[sq], type: typeOf(piece), color: colorOf(piece), square: sq });
  }
  return pieces;
}

/** Convert a square to board-relative percentage coords given orientation. */
export function squareToPercent(square: number, orientation: Color): { left: number; top: number } {
  const file = fileOf(square);
  const rank = rankOf(square);
  const col = orientation === 'w' ? file : 7 - file;
  const row = orientation === 'w' ? 7 - rank : rank;
  return { left: col * 12.5, top: row * 12.5 };
}
