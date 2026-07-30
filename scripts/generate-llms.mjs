/**
 * Generates public/llms.txt — the site map written for a model, not a crawler.
 *
 * sitemap.xml lists ~730 URLs and says nothing about any of them. A model that
 * reads it knows the pages exist but not which one answers the question it was
 * just asked, so it either downloads everything or guesses. This file gives the
 * other half: what the site is, what it costs, and one annotated line per page.
 *
 * The ten languages are the reason it matters more here than elsewhere. Every
 * article exists in ten translations, and from a list of URLs alone they look
 * like ten competing pages about chess openings. Grouped by language, with the
 * language named, an assistant can pick the one that matches the person asking.
 *
 * It is written in English on purpose: the file has no `hreflang`, so it gets
 * one language, and English is the one an assistant is most likely to be
 * reasoning in when it reaches a ten-language site.
 *
 * Generated rather than hand-written, for the same reason as the sitemap: a
 * static copy goes stale the moment an article is published, and a map that
 * lies is worse than no map. Runs before `vite build`, so the file is picked up
 * from public/.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadContent, ROOT, SITE } from './content.mjs';

const { locales, translations, posts } = await loadContent();

const en = translations.en;

const section = (title, lines) => (lines.length ? `\n## ${title}\n\n${lines.join('\n')}\n` : '');

const languageNames = locales.map((l) => `${l.name ?? l.code} (${l.code})`);

const faq = [1, 2, 3, 4].map((n) => `- **${en.faq[`q${n}`]}** ${en.faq[`a${n}`]}`);

const byLanguage = locales.map((l) => {
  const own = posts
    .filter((p) => p.lang === l.code)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!own.length) return '';
  const rows = own.map(
    (p) => `- [${p.title}](${SITE}/${p.lang}/blog/${p.slug}): ${p.description}`,
  );
  return [`### ${l.name ?? l.code} (${l.code})`, '', ...rows, ''].join('\n');
});

const body = [
  '# botAgedrez',
  '',
  '> Free online chess against a from-scratch engine and AI, playable in the',
  '> browser in ten languages, with an Elo rating and a beginner blog.',
  '',
  '## What it is',
  '',
  '- Name: botAgedrez',
  `- Site: ${SITE}`,
  '- Type: browser chess game, playable against the computer',
  '- Cost: free. No sign-up, no account, no download, no payment of any kind.',
  '- Opponent: a chess engine written for this project — minimax with',
  '  alpha-beta pruning, running in a Web Worker — at 4 difficulty levels.',
  '  It is not Stockfish and not a third-party chess library.',
  '- Rules: complete, including castling, en passant, promotion, check,',
  '  checkmate, stalemate and every draw condition.',
  '- Progress: Elo rating, streaks, achievements and full match history, all',
  '  kept in the browser. Nothing is sent to a server and there is no tracking.',
  `- Languages: ${languageNames.join(', ')}.`,
  '',
  '## How the URLs work',
  '',
  'Every page sits under a language prefix, and the ten versions of a page are',
  'translations of one another rather than separate pages:',
  '',
  '- `/{lang}` — that language\'s landing page',
  '- `/{lang}/play` — the game itself',
  '- `/{lang}/blog` — the article index for that language',
  '- `/{lang}/blog/{slug}` — one article',
  '',
  'The bare root `/` detects the visitor\'s language and redirects; it is not a',
  'page in its own right.',
  '',
  section('Frequently asked questions', faq),
  section('Articles', byLanguage.filter(Boolean)),
].join('\n');

mkdirSync(join(ROOT, 'public'), { recursive: true });
writeFileSync(join(ROOT, 'public/llms.txt'), body);
console.log(`llms.txt — ${posts.length} articulos en ${locales.length} idiomas`);
