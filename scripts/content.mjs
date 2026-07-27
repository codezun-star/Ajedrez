/**
 * Shared build-time view of the site's content.
 *
 * Both the sitemap and the prerenderer need the same list of URLs and the same
 * per-page metadata; deriving them here means the two can't drift apart and
 * start advertising different sets of pages.
 *
 * Locale metadata and UI strings are read from the real TypeScript sources via
 * esbuild, so titles and descriptions are never duplicated between the app and
 * the build scripts.
 */

import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = 'https://botagedrez.codezun.com';

/** Open Graph wants a full locale, not a bare language code. */
export const OG_LOCALE = {
  es: 'es_ES',
  en: 'en_US',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
  ru: 'ru_RU',
  hi: 'hi_IN',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ar: 'ar_SA',
};

/** Bundle a TS module to ESM in a temp dir and import it. */
async function importTs(entry) {
  const dir = mkdtempSync(join(tmpdir(), 'botagedrez-'));
  const outfile = join(dir, 'mod.mjs');
  try {
    await build({
      entryPoints: [join(ROOT, entry)],
      outfile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      logLevel: 'silent',
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

let cached;

/** Locales, UI strings and articles, loaded once per process. */
export async function loadContent() {
  if (cached) return cached;

  const { LOCALES } = await importTs('src/i18n/locales.ts');
  const { translations } = await importTs('src/i18n/translations.ts');

  const dir = join(ROOT, 'src/content/blog');
  const posts = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const fm = frontmatter(readFileSync(join(dir, file), 'utf8'));
      const post = {
        slug: fm.slug || file.replace(/\.md$/, ''),
        title: fm.title || '',
        description: fm.description || '',
        date: fm.date || '',
        lang: fm.lang,
        cluster: fm.cluster,
      };
      if (!LOCALES.some((l) => l.code === post.lang)) {
        throw new Error(`${file}: unknown lang "${post.lang}"`);
      }
      if (!post.cluster) throw new Error(`${file}: missing cluster`);
      if (!post.title || !post.description) throw new Error(`${file}: missing title/description`);
      return post;
    });

  cached = { locales: LOCALES, translations, posts };
  return cached;
}

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

/**
 * Every indexable URL, each with its title, description and the full set of
 * translations it should point at via hreflang.
 *
 * Titles mirror what `useSeo` sets at runtime, so the prerendered head and the
 * hydrated head agree.
 */
export async function buildPages() {
  const { locales, translations, posts } = await loadContent();
  const codes = locales.map((l) => l.code);
  const pages = [];

  const fixed = [
    {
      suffix: '',
      title: (t) => t.home.seoTitle,
      description: (t) => t.home.seoDescription,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      suffix: '/play',
      title: (t) => t.play.seoTitle,
      description: (t) => t.play.seoDescription,
      changefreq: 'monthly',
      priority: '0.9',
    },
    {
      suffix: '/blog',
      title: (t) => `${t.blog.title} · botAgedrez`,
      description: (t) => t.blog.subtitle,
      changefreq: 'weekly',
      priority: '0.8',
    },
  ];

  for (const spec of fixed) {
    const alternates = codes.map((c) => ({ lang: c, path: `/${c}${spec.suffix}` }));
    for (const code of codes) {
      const t = translations[code];
      pages.push({
        path: `/${code}${spec.suffix}`,
        lang: code,
        title: spec.title(t),
        description: spec.description(t),
        alternates,
        changefreq: spec.changefreq,
        priority: spec.priority,
      });
    }
  }

  for (const post of posts) {
    const alternates = posts
      .filter((p) => p.cluster === post.cluster)
      .sort((a, b) => codes.indexOf(a.lang) - codes.indexOf(b.lang))
      .map((p) => ({ lang: p.lang, path: `/${p.lang}/blog/${p.slug}` }));
    pages.push({
      path: `/${post.lang}/blog/${post.slug}`,
      lang: post.lang,
      title: `${post.title} · botAgedrez`,
      description: post.description,
      alternates,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7',
      article: true,
    });
  }

  return { pages, locales, codes };
}
