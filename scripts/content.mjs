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
import { marked } from 'marked';

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

  const { LOCALES, DEFAULT_LOCALE } = await importTs('src/i18n/locales.ts');
  const { translations } = await importTs('src/i18n/translations.ts');

  const dir = join(ROOT, 'src/content/blog');
  const posts = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf8');
      const fm = frontmatter(raw);
      const post = {
        slug: fm.slug || file.replace(/\.md$/, ''),
        title: fm.title || '',
        description: fm.description || '',
        date: fm.date || '',
        lang: fm.lang,
        cluster: fm.cluster,
        body: raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ''),
      };
      if (!LOCALES.some((l) => l.code === post.lang)) {
        throw new Error(`${file}: unknown lang "${post.lang}"`);
      }
      if (!post.cluster) throw new Error(`${file}: missing cluster`);
      if (!post.title || !post.description) throw new Error(`${file}: missing title/description`);
      return post;
    });

  cached = { locales: LOCALES, defaultLocale: DEFAULT_LOCALE, translations, posts };
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
 * The article body, rendered the same way the app renders it.
 *
 * These rules mirror `src/content/blog.ts` — the `<!-- faq -->` marker, the
 * `### question` pairs, the scroll wrapper around tables. They are repeated
 * here rather than imported because that module reaches for `import.meta.glob`,
 * which only exists inside Vite; esbuild can't bundle it for Node. The
 * frontmatter parser above is duplicated for the same reason. **If the marker
 * or the FAQ shape changes there, change it here too**, or the prerendered
 * page and the hydrated page will stop agreeing.
 */
const FAQ_MARKER = '<!-- faq -->';

marked.setOptions({ gfm: true, breaks: false });

function parseFaq(body) {
  const idx = body.indexOf(FAQ_MARKER);
  if (idx === -1) return [];
  const faq = [];
  for (const part of body.slice(idx).split(/\n### +/).slice(1)) {
    const [question, ...rest] = part.split('\n');
    const answer = rest.join(' ').replace(/\s+/g, ' ').trim();
    if (question && answer) faq.push({ q: question.trim(), a: answer });
  }
  return faq;
}

function renderBody(body) {
  return marked
    .parse(body)
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

/** The home page's four questions, from the same strings the screen renders. */
function homeFaq(t) {
  return [1, 2, 3, 4].map((n) => ({ q: t.faq[`q${n}`], a: t.faq[`a${n}`] }));
}

/**
 * Questions and answers, already paired.
 *
 * This is the schema an answer engine extracts a reply from: it gets the
 * question and its answer together, instead of having to work out which
 * paragraph of the page answers what. The app already emitted it — but from a
 * React component, so it only existed after JavaScript ran, and the crawlers
 * that most want it are exactly the ones that don't run any.
 */
function faqNode(pairs, lang) {
  if (!pairs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: pairs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * The static copy of a page's content, written inside `#root`.
 *
 * The app is client-rendered, so what this build has been shipping for every
 * one of the ~730 URLs is a `<head>` full of metadata over a body containing
 * exactly `<div id="root"></div>`. A search engine that runs JavaScript
 * eventually sees the real page; the crawlers behind the answer engines
 * largely don't run any, so for them seventy articles had a title, a
 * description and no text at all — nothing to quote, nothing to answer with.
 *
 * `createRoot().render()` empties the container before it mounts, so React
 * wipes this the moment it boots: there is no hydration to mismatch, and no
 * duplicate content in the DOM. It isn't cloaking either — it's the same text
 * the app renders, from the same source. And the visitor gains too: the window
 * that used to show a blank page while the bundle downloaded now shows the
 * article.
 *
 * Only the parts that are content are emitted — the article, the questions,
 * the intro. Not the header, the footer or the board: they are chrome, and
 * copying their markup here would be two definitions of the same thing waiting
 * to drift.
 */
function faqMarkup(pairs, title) {
  if (!pairs.length) return '';
  return [
    '<section>',
    `<h2>${escapeHtml(title)}</h2>`,
    ...pairs.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`),
    '</section>',
  ].join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function bodyFor({ section, page, t, post }) {
  if (section === 'home') {
    return [
      `<h1>${escapeHtml(t.home.h1)}</h1>`,
      `<p>${escapeHtml(t.home.subtitle)}</p>`,
      faqMarkup(homeFaq(t), t.home.faqTitle),
    ].join('');
  }

  if (section === 'post') {
    return [
      `<article lang="${post.lang}">`,
      `<h1>${escapeHtml(post.title)}</h1>`,
      `<p>${escapeHtml(post.description)}</p>`,
      renderBody(post.body),
      '</article>',
    ].join('');
  }

  if (section === 'blog') {
    return `<h1>${escapeHtml(t.blog.title)}</h1><p>${escapeHtml(t.blog.subtitle)}</p>`;
  }

  return `<h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p>`;
}

/** Stable @id anchors, so every page refers to one site and one publisher. */
const ID_SITE = `${SITE}/#website`;
const ID_ORG = `${SITE}/#organization`;
const ID_APP = `${SITE}/#webapp`;

const ORG_REF = { '@id': ID_ORG };

/**
 * The publisher. Goes on **every** page, because the `author` and `publisher`
 * of an article are written as `@id` references: a reference only resolves
 * against a node in the same document, and an article whose author resolves to
 * nothing is an article with no author as far as Search is concerned.
 */
function organizationNode() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ID_ORG,
    name: 'botAgedrez',
    url: `${SITE}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE}/icon-512.png`,
      width: 512,
      height: 512,
    },
  };
}

/**
 * The site-level nodes, repeated on the home pages.
 *
 * `WebSite` is the one Google reads to label a result. Without it Search falls
 * back to the registrable domain and every subdomain shows up as
 * "codezun.com"; with it, this subdomain is its own named site. `url` is the
 * subdomain root on purpose — a site name applies to the site it points at.
 */
function siteNodes(description, codes) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': ID_SITE,
      name: 'botAgedrez',
      alternateName: 'botAgedrez Ajedrez Online',
      url: `${SITE}/`,
      description,
      inLanguage: codes,
      publisher: ORG_REF,
    },
    organizationNode(),
  ];
}

/** The home page's full set: the site nodes plus the app itself. */
export function rootNodes(description, codes) {
  return [
    ...siteNodes(description, codes),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': ID_APP,
      name: 'botAgedrez',
      url: `${SITE}/`,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Requiere JavaScript',
      description,
      inLanguage: codes,
      publisher: ORG_REF,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ];
}

/** Inicio → … , with the localised labels the header itself uses. */
function breadcrumb(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: `${SITE}${step.path}`,
    })),
  };
}

/**
 * Structured data for one page.
 *
 * Every prerendered page used to inherit the home page's block verbatim, so
 * all ~730 URLs declared themselves to be the same `WebApplication` sitting at
 * the site root, and not one of the 70 articles said it was an article.
 */
function jsonLdFor({ section, page, t, codes, post }) {
  const url = SITE + page.path;
  const home = { name: t.nav.home, path: `/${page.lang}` };

  if (section === 'home') {
    return [...rootNodes(page.description, codes), faqNode(homeFaq(t), page.lang)].filter(Boolean);
  }

  if (section === 'play') {
    return [
      organizationNode(),
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': ID_APP,
        name: 'botAgedrez',
        url,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requiere JavaScript',
        description: page.description,
        inLanguage: page.lang,
        publisher: ORG_REF,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      breadcrumb([home, { name: t.nav.play, path: page.path }]),
    ];
  }

  if (section === 'blog') {
    return [
      organizationNode(),
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${url}#blog`,
        name: t.blog.title,
        url,
        description: page.description,
        inLanguage: page.lang,
        publisher: ORG_REF,
      },
      breadcrumb([home, { name: t.nav.blog, path: page.path }]),
    ];
  }

  return [
    organizationNode(),
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: post.lang,
      image: `${SITE}/og.png`,
      author: ORG_REF,
      publisher: ORG_REF,
      // Spelled out rather than referenced: the `WebSite` node itself only
      // ships on the home pages, where Search reads the site name from it.
      isPartOf: { '@type': 'WebSite', '@id': ID_SITE, name: 'botAgedrez', url: `${SITE}/` },
    },
    breadcrumb([
      home,
      { name: t.nav.blog, path: `/${post.lang}/blog` },
      { name: post.title, path: page.path },
    ]),
    faqNode(parseFaq(post.body), post.lang),
  ].filter(Boolean);
}

/**
 * Every indexable URL, each with its title, description and the full set of
 * translations it should point at via hreflang.
 *
 * Titles mirror what `useSeo` sets at runtime, so the prerendered head and the
 * hydrated head agree.
 */
export async function buildPages() {
  const { locales, defaultLocale, translations, posts } = await loadContent();
  const codes = locales.map((l) => l.code);
  const pages = [];

  const fixed = [
    {
      section: 'home',
      suffix: '',
      title: (t) => t.home.seoTitle,
      description: (t) => t.home.seoDescription,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      section: 'play',
      suffix: '/play',
      title: (t) => t.play.seoTitle,
      description: (t) => t.play.seoDescription,
      changefreq: 'monthly',
      priority: '0.9',
    },
    {
      section: 'blog',
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
      const page = {
        path: `/${code}${spec.suffix}`,
        lang: code,
        title: spec.title(t),
        description: spec.description(t),
        alternates,
        changefreq: spec.changefreq,
        priority: spec.priority,
      };
      page.jsonLd = jsonLdFor({ section: spec.section, page, t, codes });
      page.body = bodyFor({ section: spec.section, page, t });
      pages.push(page);
    }
  }

  for (const post of posts) {
    const alternates = posts
      .filter((p) => p.cluster === post.cluster)
      .sort((a, b) => codes.indexOf(a.lang) - codes.indexOf(b.lang))
      .map((p) => ({ lang: p.lang, path: `/${p.lang}/blog/${p.slug}` }));
    const page = {
      path: `/${post.lang}/blog/${post.slug}`,
      lang: post.lang,
      title: `${post.title} · botAgedrez`,
      description: post.description,
      alternates,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7',
      article: true,
    };
    page.jsonLd = jsonLdFor({
      section: 'post',
      page,
      t: translations[post.lang],
      codes,
      post,
    });
    page.body = bodyFor({ section: 'post', page, t: translations[post.lang], post });
    pages.push(page);
  }

  return {
    pages,
    locales,
    codes,
    // The language-neutral root advertises the site, not any one language.
    rootJsonLd: rootNodes(translations[defaultLocale].home.seoDescription, codes),
  };
}
