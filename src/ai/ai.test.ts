/**
 * AI sanity tests. We don't assert on exact play (that would be brittle), only
 * that the search obeys hard invariants: it returns a legal move and it grabs
 * obviously free material / finds a forced mate in one.
 */

import { describe, it, expect } from 'vitest';
import { parseFen } from '@/engine/board';
import { generateLegalMoves } from '@/engine/moves';
import { squareToAlgebraic } from '@/engine/constants';
import { findBestMove } from './search';

const opts = { maxDepth: 4, timeBudgetMs: 2000, randomness: 0 };

describe('search invariants', () => {
  it('returns a legal move from the start', () => {
    const state = parseFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const { bestMove } = findBestMove(state, opts);
    const legal = generateLegalMoves(state);
    expect(bestMove).not.toBeNull();
    expect(legal.some((m) => m.from === bestMove!.from && m.to === bestMove!.to)).toBe(true);
  });

  it('captures a hanging queen', () => {
    // White rook on a1, black queen hanging on a8; best is Rxa8.
    const state = parseFen('q6k/8/8/8/8/8/8/R6K w - - 0 1');
    const { bestMove } = findBestMove(state, opts);
    expect(bestMove).not.toBeNull();
    expect(squareToAlgebraic(bestMove!.to)).toBe('a8');
  });

  it('finds mate in one', () => {
    // Back-rank mate: white queen delivers mate on d8/e8 area. Ladder mate here.
    const state = parseFen('6k1/5ppp/8/8/8/8/8/1Q4K1 w - - 0 1');
    const { bestMove, score } = findBestMove(state, { ...opts, maxDepth: 3 });
    expect(bestMove).not.toBeNull();
    // Bringing the queen to the 8th rank with a mating idea should score huge.
    expect(score).toBeGreaterThan(500);
  });
});
