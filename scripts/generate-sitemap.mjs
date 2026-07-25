/**
 * Generates public/sitemap.xml from the article sources.
 *
 * Every URL is emitted with its full set of `xhtml:link` alternates, which is
 * how a multilingual sitemap tells Google that ten URLs are one page in ten
 * languages rather than ten competing pages. Articles are grouped by their
 * frontmatter `cluster`, so a translation set is linked even when each
 * language uses its own keyword-bearing slug.
 *
 * Runs before `vite build`, so the generated file is picked up from public/.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://botagedrez.codezun.com';

/** Keep in sync with src/i18n/locales.ts. */
const LOCALES = ['es', 'en', 'pt', 'fr', 'de', 'ru', 'hi', 'zh', 'ja', 'ar'];

function frontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return data;
}

const dir = join(ROOT, 'src/content/blog');
const posts = readdirSync(dir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = frontmatter(readFileSync(join(dir, f), 'utf8'));
    return { slug: fm.slug || f.replace(/\.md$/, ''), lang: fm.lang, cluster: fm.cluster, date: fm.date };
  });

for (const p of posts) {
  if (!LOCALES.includes(p.lang)) throw new Error(`Post ${p.slug} has unknown lang "${p.lang}"`);
  if (!p.cluster) throw new Error(`Post ${p.slug} is missing a cluster`);
}

/** One <url> entry: the address plus every language it also exists in. */
function url(loc, alternates, { lastmod, changefreq, priority }) {
  const links = alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`)
    .join('\n');
  return [
    '  <url>',
    `    <loc>${SITE}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    links,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

const entries = [];

// The three fixed pages, in every language.
for (const [suffix, changefreq, priority] of [
  ['', 'weekly', '1.0'],
  ['/play', 'monthly', '0.9'],
  ['/blog', 'weekly', '0.8'],
]) {
  const alternates = LOCALES.map((l) => ({ lang: l, path: `/${l}${suffix}` }));
  for (const l of LOCALES) {
    entries.push(url(`/${l}${suffix}`, alternates, { changefreq, priority }));
  }
}

// Articles, grouped so each one advertises its translations.
for (const post of posts) {
  const alternates = posts
    .filter((p) => p.cluster === post.cluster)
    .sort((a, b) => LOCALES.indexOf(a.lang) - LOCALES.indexOf(b.lang))
    .map((p) => ({ lang: p.lang, path: `/${p.lang}/blog/${p.slug}` }));
  entries.push(
    url(`/${post.lang}/blog/${post.slug}`, alternates, {
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7',
    }),
  );
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

mkdirSync(join(ROOT, 'public'), { recursive: true });
writeFileSync(join(ROOT, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml — ${entries.length} URLs (${posts.length} articles)`);
