/**
 * Writes a real HTML file for every indexable URL, with that page's own head.
 *
 * The app is client-rendered, so without this every URL — all ten languages,
 * every article — served the *same* markup: `<html lang="es">`, a Spanish
 * title, and `<link rel="canonical" href="…/">`. A canonical pointing at a
 * different URL tells Google "index that one instead of this one", which is the
 * opposite of what a ten-language site needs. Social crawlers never run JS at
 * all, so every shared link previewed as the generic Spanish homepage.
 *
 * Each generated file is the built index.html with its head rewritten:
 * self-referencing canonical, correct lang/dir, real title and description,
 * Open Graph, and the full hreflang set. The SPA boots on top as before.
 *
 * Runs after `vite build`.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildPages, OG_LOCALE, ROOT, SITE } from './content.mjs';

const DIST = join(ROOT, 'dist');

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Replace a whole tag matched by `re`, or append to <head> when absent. */
function swap(html, re, replacement) {
  return re.test(html) ? html.replace(re, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
}

function render(template, page, dirOf) {
  const url = SITE + page.path;
  let html = template;

  html = html.replace(
    /<html[^>]*>/,
    `<html lang="${page.lang}"${dirOf(page.lang) === 'rtl' ? ' dir="rtl"' : ''}>`,
  );
  html = swap(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = swap(
    html,
    /<meta\s+name="description"[\s\S]*?\/?>/,
    `<meta name="description" content="${esc(page.description)}" />`,
  );
  html = swap(
    html,
    /<link\s+rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = swap(html, /<meta\s+property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = swap(
    html,
    /<meta\s+property="og:title"[^>]*>/,
    `<meta property="og:title" content="${esc(page.title)}" />`,
  );
  html = swap(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/?>/,
    `<meta property="og:description" content="${esc(page.description)}" />`,
  );
  html = swap(
    html,
    /<meta\s+property="og:locale"[^>]*>/,
    `<meta property="og:locale" content="${OG_LOCALE[page.lang] ?? page.lang}" />`,
  );
  html = swap(
    html,
    /<meta\s+property="og:type"[^>]*>/,
    `<meta property="og:type" content="${page.article ? 'article' : 'website'}" />`,
  );
  html = swap(
    html,
    /<meta\s+name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
  );
  html = swap(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/?>/,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
  );
  html = swap(html, /<meta\s+name="twitter:url"[^>]*>/, `<meta name="twitter:url" content="${url}" />`);

  // hreflang. `data-seo-alternate` is the same marker useSeo uses, so when the
  // app hydrates it replaces this set instead of appending a duplicate one.
  const alternates = page.alternates
    .map(
      (a) =>
        `    <link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}" data-seo-alternate />`,
    )
    .concat(`    <link rel="alternate" hreflang="x-default" href="${SITE}/" data-seo-alternate />`)
    .join('\n');
  html = html.replace('</head>', `${alternates}\n  </head>`);

  return html;
}

const { pages, locales } = await buildPages();
const dirOf = (code) => locales.find((l) => l.code === code)?.dir ?? 'ltr';

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

for (const page of pages) {
  const file = join(DIST, page.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(template, page, dirOf));
}

// The root stays language-neutral (it redirects to the visitor's language), but
// it still needs to advertise every language so a crawler can discover them.
{
  const alternates = locales
    .map(
      (l) =>
        `    <link rel="alternate" hreflang="${l.code}" href="${SITE}/${l.code}" data-seo-alternate />`,
    )
    .concat(`    <link rel="alternate" hreflang="x-default" href="${SITE}/" data-seo-alternate />`)
    .join('\n');
  writeFileSync(join(DIST, 'index.html'), template.replace('</head>', `${alternates}\n  </head>`));
}

console.log(`prerender — ${pages.length} paginas con head propio`);
