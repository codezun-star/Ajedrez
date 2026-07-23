/**
 * Standard Algebraic Notation (SAN) generation.
 *
 * SAN needs full context — it must know the other legal moves to decide whether
 * a piece move needs disambiguation (e.g. "Nbd2" vs "Nfd2"), and whether the
 * move gives check ("+") or checkmate ("#"). We therefore compute it against the
 * position the move is made from.
 */

import { GameState, Move, MoveFlag } from './types';
import { FILES, RANKS, colorOf, fileOf, rankOf, squareToAlgebraic, typeOf } from './constants';
import { applyMove, generateLegalMoves } from './moves';
import { getGameStatus } from './status';

const PIECE_LETTER: Record<string, string> = {
  n: 'N',
  b: 'B',
  r: 'R',
  q: 'Q',
  k: 'K',
};

/**
 * Convert a legal move (in position `state`) to SAN.
 *
 * @param legalMoves optional pre-computed legal moves, to avoid recomputation
 *                   when annotating a whole move list.
 */
export function moveToSan(state: GameState, move: Move, legalMoves?: Move[]): string {
  // Castling has fixed notation.
  if (move.flags & MoveFlag.KingCastle) return decorate(state, move, 'O-O');
  if (move.flags & MoveFlag.QueenCastle) return decorate(state, move, 'O-O-O');

  const type = typeOf(move.piece);
  const isCapture = (move.flags & MoveFlag.Capture) !== 0;
  const dest = squareToAlgebraic(move.to);

  let san = '';

  if (type === 'p') {
    if (isCapture) {
      // Pawn captures include the origin file: "exd5".
      san += FILES[fileOf(move.from)] + 'x';
    }
    san += dest;
    if (move.flags & MoveFlag.Promotion && move.promotion) {
      san += '=' + PIECE_LETTER[move.promotion === 'n' ? 'n' : move.promotion];
    }
  } else {
    san += PIECE_LETTER[type];
    san += disambiguation(state, move, legalMoves);
    if (isCapture) san += 'x';
    san += dest;
  }

  return decorate(state, move, san);
}

/**
 * Work out the minimal disambiguation string for a non-pawn move: when another
 * identical piece could also move to the same square, add file, rank, or both.
 */
function disambiguation(state: GameState, move: Move, legalMoves?: Move[]): string {
  const moves = legalMoves ?? generateLegalMoves(state);
  const type = typeOf(move.piece);

  const rivals = moves.filter(
    (m) =>
      m.to === move.to &&
      m.from !== move.from &&
      typeOf(m.piece) === type &&
      colorOf(m.piece) === colorOf(move.piece),
  );

  if (rivals.length === 0) return '';

  const sameFile = rivals.some((m) => fileOf(m.from) === fileOf(move.from));
  const sameRank = rivals.some((m) => rankOf(m.from) === rankOf(move.from));

  if (!sameFile) return FILES[fileOf(move.from)];
  if (!sameRank) return RANKS[rankOf(move.from)];
  return FILES[fileOf(move.from)] + RANKS[rankOf(move.from)];
}

/** Append "+" for check or "#" for checkmate. */
function decorate(state: GameState, move: Move, san: string): string {
  const next = applyMove(state, move);
  const status = getGameStatus(next);
  if (status.reason === 'checkmate') return san + '#';
  if (status.inCheck) return san + '+';
  return san;
}
