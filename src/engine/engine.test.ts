/**
 * Engine correctness tests.
 *
 * The centerpiece is `perft` (performance test): it counts the number of leaf
 * nodes reachable in exactly N plies from a position. These counts are famous,
 * exhaustively verified reference numbers — matching them proves the move
 * generator handles castling, en passant, promotion, pins and check evasions
 * correctly. If a single edge case were wrong, the totals would diverge.
 */

import { describe, it, expect } from 'vitest';
import { parseFen, createInitialState, toFen } from './board';
import { generateLegalMoves, applyMove } from './moves';
import { getGameStatus } from './status';
import { ChessGame } from './game';
import { GameState } from './types';

function perft(state: GameState, depth: number): number {
  if (depth === 0) return 1;
  const moves = generateLegalMoves(state);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const move of moves) {
    nodes += perft(applyMove(state, move), depth - 1);
  }
  return nodes;
}

describe('perft — starting position', () => {
  const start = createInitialState();
  it('depth 1 = 20', () => expect(perft(start, 1)).toBe(20));
  it('depth 2 = 400', () => expect(perft(start, 2)).toBe(400));
  it('depth 3 = 8902', () => expect(perft(start, 3)).toBe(8902));
  it('depth 4 = 197281', () => expect(perft(start, 4)).toBe(197281));
});

describe('perft — Kiwipete (castling, pins, checks)', () => {
  const kiwipete = parseFen(
    'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
  );
  it('depth 1 = 48', () => expect(perft(kiwipete, 1)).toBe(48));
  it('depth 2 = 2039', () => expect(perft(kiwipete, 2)).toBe(2039));
  it('depth 3 = 97862', () => expect(perft(kiwipete, 3)).toBe(97862));
});

describe('perft — en passant & promotion edge cases (position 3)', () => {
  const pos3 = parseFen('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1');
  it('depth 1 = 14', () => expect(perft(pos3, 1)).toBe(14));
  it('depth 2 = 191', () => expect(perft(pos3, 2)).toBe(191));
  it('depth 3 = 2812', () => expect(perft(pos3, 3)).toBe(2812));
  it('depth 4 = 43238', () => expect(perft(pos3, 4)).toBe(43238));
});

describe('perft — promotion-heavy (position 5)', () => {
  const pos5 = parseFen('rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8');
  it('depth 1 = 44', () => expect(perft(pos5, 1)).toBe(44));
  it('depth 2 = 1486', () => expect(perft(pos5, 2)).toBe(1486));
  it('depth 3 = 62379', () => expect(perft(pos5, 3)).toBe(62379));
});

describe('checkmate & stalemate detection', () => {
  it('detects Fool’s mate', () => {
    const game = new ChessGame();
    game.move(alg.from('f2'), alg.to('f3'));
    game.move(alg.from('e7'), alg.to('e5'));
    game.move(alg.from('g2'), alg.to('g4'));
    game.move(alg.from('d8'), alg.to('h4'));
    const status = game.getStatus();
    expect(status.isOver).toBe(true);
    expect(status.reason).toBe('checkmate');
    expect(status.winner).toBe('b');
  });

  it('detects a classic stalemate', () => {
    const state = parseFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
    const status = getGameStatus(state);
    expect(status.isOver).toBe(true);
    expect(status.reason).toBe('stalemate');
  });
});

describe('FEN round-trip', () => {
  it('parses and re-serializes without loss', () => {
    const fens = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
      '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    ];
    for (const fen of fens) {
      expect(toFen(parseFen(fen))).toBe(fen);
    }
  });
});

// Tiny helper so the tests read like real games.
const algMap = (s: string) => (s.charCodeAt(0) - 97) + (s.charCodeAt(1) - 49) * 8;
const alg = { from: algMap, to: algMap };
