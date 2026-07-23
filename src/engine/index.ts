/**
 * Public surface of the chess engine.
 *
 * Everything a consumer (store, hooks, AI, tests) needs is re-exported here so
 * imports stay stable even if internal files are reorganized.
 */

export * from './types';
export * from './constants';
export {
  parseFen,
  toFen,
  createInitialState,
  cloneState,
  findKing,
  positionKey,
} from './board';
export { isSquareAttacked, isKingInCheck } from './attacks';
export {
  generatePseudoLegalMoves,
  generateLegalMoves,
  legalMovesFrom,
  applyMove,
  inCheck,
} from './moves';
export {
  getGameStatus,
  isInsufficientMaterial,
  isFiftyMoveRule,
  countRepetitions,
} from './status';
export { moveToSan } from './san';
export { ChessGame } from './game';
export type { HistoryEntry } from './game';
export { exportPgn, importPgn } from './pgn';
export type { PgnTags } from './pgn';
