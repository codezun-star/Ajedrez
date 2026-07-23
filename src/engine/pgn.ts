/**
 * PGN (Portable Game Notation) export and import.
 *
 * Export builds a standard PGN with a seven-tag roster plus the SAN move text.
 * Import is a pragmatic parser: it reads the tag pairs and replays the SAN move
 * list against the engine to reconstruct the game. It handles the common corpus
 * of PGN (comments, NAGs, variations are stripped) which is enough for the
 * "save & load your own games" use-case here.
 */

import { GameResult } from './types';
import { ChessGame, HistoryEntry } from './game';
import { generateLegalMoves } from './moves';
import { moveToSan } from './san';

export interface PgnTags {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: GameResult;
  [key: string]: string | undefined;
}

/** Serialize a finished/ongoing game to PGN text. */
export function exportPgn(
  history: ReadonlyArray<HistoryEntry>,
  result: GameResult = '*',
  tags: PgnTags = {},
): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
    today.getDate(),
  ).padStart(2, '0')}`;

  const roster: PgnTags = {
    Event: 'botAgedrez Partida',
    Site: 'botagedrez.codezun.com',
    Date: dateStr,
    Round: '1',
    White: 'Blancas',
    Black: 'Negras',
    Result: result,
    ...tags,
  };

  const tagOrder = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
  const header = tagOrder
    .map((k) => `[${k} "${roster[k] ?? '?'}"]`)
    .join('\n');

  // Build the movetext, wrapping lines at ~80 columns for readability.
  const tokens: string[] = [];
  history.forEach((entry, i) => {
    if (i % 2 === 0) tokens.push(`${Math.floor(i / 2) + 1}.`);
    tokens.push(entry.san);
  });
  tokens.push(result);

  let line = '';
  const lines: string[] = [];
  for (const token of tokens) {
    if (line.length + token.length + 1 > 80) {
      lines.push(line.trimEnd());
      line = '';
    }
    line += token + ' ';
  }
  if (line.trim()) lines.push(line.trimEnd());

  return `${header}\n\n${lines.join('\n')}\n`;
}

/** Extract the tag pairs from PGN header text. */
function parseTags(pgn: string): PgnTags {
  const tags: PgnTags = {};
  const tagRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(pgn)) !== null) {
    tags[match[1]] = match[2];
  }
  return tags;
}

/**
 * Parse PGN text and replay it into a fresh {@link ChessGame}.
 * Returns the game plus the parsed tags. Throws if a SAN token cannot be
 * matched to a legal move.
 */
export function importPgn(pgn: string): { game: ChessGame; tags: PgnTags; result: GameResult } {
  const tags = parseTags(pgn);

  // Strip the header, then everything down to bare SAN tokens.
  const movetext = pgn
    .replace(/\[[^\]]*\]/g, '') // tag pairs
    .replace(/\{[^}]*\}/g, '') // comments
    .replace(/;[^\n]*/g, '') // line comments
    .replace(/\$\d+/g, '') // NAGs
    .replace(/\([^)]*\)/g, '') // variations (single level; repeated below)
    .replace(/\d+\.(\.\.)?/g, '') // move numbers
    .trim();

  const resultTokens = new Set(['1-0', '0-1', '1/2-1/2', '*']);
  const tokens = movetext.split(/\s+/).filter(Boolean);

  const game = new ChessGame();
  let result: GameResult = '*';

  for (const raw of tokens) {
    const token = raw.replace(/[+#!?]+$/, ''); // strip check/annotation glyphs
    if (resultTokens.has(raw)) {
      result = raw as GameResult;
      continue;
    }
    if (!token) continue;

    const state = game.getState();
    const legal = generateLegalMoves(state);
    const found = legal.find((m) => {
      const san = moveToSan(state, m, legal).replace(/[+#]/g, '');
      return san === token;
    });

    if (!found) {
      throw new Error(`No se pudo interpretar el movimiento PGN: "${raw}"`);
    }
    game.playMove(found);
  }

  return { game, tags, result: (tags.Result as GameResult) ?? result };
}
