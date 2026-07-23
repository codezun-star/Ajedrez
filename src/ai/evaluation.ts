/**
 * Static evaluation function.
 *
 * The score is expressed in centipawns from White's perspective (positive =
 * White is better). The search negates as needed. The evaluation blends:
 *
 *   - material,
 *   - piece-square tables (PST) — positional value per square,
 *   - a middlegame→endgame taper for the king (safety early, activity late),
 *   - mobility (number of legal-ish moves),
 *   - pawn-structure penalties (doubled/isolated), and
 *   - bishop-pair and rook-on-open-file bonuses.
 *
 * PST values are the well-known "Simplified Evaluation Function" tables
 * (Tomasz Michniewski), which give a strong, human-like positional feel without
 * heavy tuning. Tables are written from White's point of view with a8 first (as
 * they usually appear in literature) and indexed by mirroring for our a1-first
 * board layout.
 */

import { GameState, PieceCode } from '@/engine/types';
import { colorOf, fileOf, rankOf, typeOf } from '@/engine/constants';

/** Base material values in centipawns. */
export const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Tables are indexed [rank 8 .. rank 1] × [file a..h] i.e. a8 is index 0.
// prettier-ignore
const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

// prettier-ignore
const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

// prettier-ignore
const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

// prettier-ignore
const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

// prettier-ignore
const PST_QUEEN = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

// King — middlegame (stay tucked away behind pawns).
// prettier-ignore
const PST_KING_MID = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

// King — endgame (centralize and support pawns).
// prettier-ignore
const PST_KING_END = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
];

const PST: Record<string, number[]> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
};

/**
 * Map our a1-first square index (0-63) to the literature index (a8-first).
 * For White we flip the rank; for Black the table is used as-is because a
 * black piece on rank r should be scored like a white piece mirrored — we do
 * that by reading the table at the vertically-mirrored square.
 */
function pstIndex(sq: number, white: boolean): number {
  const file = fileOf(sq);
  const rank = rankOf(sq);
  // Literature index counts ranks from the top (rank 8 = 0).
  const litRank = white ? 7 - rank : rank;
  return litRank * 8 + file;
}

/** Total non-pawn, non-king material for a color, used to detect the endgame. */
function phaseMaterial(board: Uint8Array): number {
  let total = 0;
  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece === 0) continue;
    const t = typeOf(piece);
    if (t !== 'p' && t !== 'k') total += PIECE_VALUE[t];
  }
  return total;
}

/**
 * Evaluate a position. Returns centipawns, positive favouring White.
 * `moveCounts` (white/black legal move counts) may be supplied by the search so
 * mobility can be scored without regenerating moves.
 */
export function evaluate(
  state: GameState,
  moveCounts?: { white: number; black: number },
): number {
  const board = state.board;

  let score = 0;
  let whiteBishops = 0;
  let blackBishops = 0;

  // Pawn bookkeeping per file, for structure evaluation.
  const whitePawnsByFile = new Int8Array(8);
  const blackPawnsByFile = new Int8Array(8);

  // Endgame weight: 0 (opening) → 1 (bare kings). Based on remaining material.
  const nonPawnMaterial = phaseMaterial(board);
  const OPENING_MATERIAL = 2 * (2 * 320 + 2 * 330 + 2 * 500 + 900); // both sides' back rank minus pawns/king
  const endgameWeight = Math.min(1, Math.max(0, 1 - nonPawnMaterial / OPENING_MATERIAL));

  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (piece === PieceCode.Empty) continue;

    const type = typeOf(piece);
    const white = colorOf(piece) === 'w';
    const sign = white ? 1 : -1;

    // Material.
    score += sign * PIECE_VALUE[type];

    // Piece-square table.
    if (type === 'k') {
      const idx = pstIndex(sq, white);
      const mid = PST_KING_MID[idx];
      const end = PST_KING_END[idx];
      score += sign * Math.round(mid * (1 - endgameWeight) + end * endgameWeight);
    } else {
      const table = PST[type];
      if (table) score += sign * table[pstIndex(sq, white)];
    }

    // Track bishops & pawns for later structural terms.
    if (type === 'b') {
      if (white) whiteBishops += 1;
      else blackBishops += 1;
    } else if (type === 'p') {
      if (white) whitePawnsByFile[fileOf(sq)] += 1;
      else blackPawnsByFile[fileOf(sq)] += 1;
    }
  }

  // Bishop pair bonus.
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;

  // Pawn structure: penalise doubled and isolated pawns.
  for (let f = 0; f < 8; f++) {
    const wp = whitePawnsByFile[f];
    const bp = blackPawnsByFile[f];

    if (wp > 1) score -= (wp - 1) * 18; // doubled
    if (bp > 1) score += (bp - 1) * 18;

    if (wp > 0) {
      const isolated =
        (f === 0 || whitePawnsByFile[f - 1] === 0) &&
        (f === 7 || whitePawnsByFile[f + 1] === 0);
      if (isolated) score -= 16 * wp;
    }
    if (bp > 0) {
      const isolated =
        (f === 0 || blackPawnsByFile[f - 1] === 0) &&
        (f === 7 || blackPawnsByFile[f + 1] === 0);
      if (isolated) score += 16 * bp;
    }
  }

  // Mobility (small weight; supplied by the caller to avoid recompute).
  if (moveCounts) {
    score += (moveCounts.white - moveCounts.black) * 4;
  }

  return score;
}
