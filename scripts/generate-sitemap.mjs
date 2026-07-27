/**
 * Generates public/sitemap.xml from the article sources.
 *
 * Every URL is emitted with its full set of `xhtml:link` alternates, which is
 * how a multilingual sitemap tells Google that ten URLs are one page in ten
 * languages rather than ten competing pages. The URL list comes from the same
 * module the prerenderer uses, so the sitemap can never advertise a page that
 * wasn't generated.
 *
 * Runs before `vite build`, so the file is picked up from public/.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildPages, ROOT, SITE } from './content.mjs';

const { pages } = await buildPages();

const entry = (page) => {
  const links = page.alternates
    .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${SITE}${a.path}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`)
    .join('\n');
  return [
    '  <url>',
    `    <loc>${SITE}${page.path}</loc>`,
    page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : null,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    links,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
};

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(entry).join('\n')}
</urlset>
`;

mkdirSync(join(ROOT, 'public'), { recursive: true });
writeFileSync(join(ROOT, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml — ${pages.length} URLs`);
