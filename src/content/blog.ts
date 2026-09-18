/**
 * Blog content loader.
 *
 * Articles live in `./blog/*.md` with a small YAML-ish frontmatter block, and
 * are read in two halves:
 *
 *  - **Metadata** (title, description, date, reading time, …) comes from
 *    `virtual:blog-index`, built from the same files at build time by
 *    `scripts/blog-index-plugin.mjs`. It is synchronous because the hub, the
 *    index and the language switcher all need it on first render.
 *  - **The body** is fetched on demand by {@link loadPostContent}, one chunk
 *    per article.
 *
 * The split is the point. Importing the bodies eagerly — which is what an
 * `import.meta.glob(…, { eager: true })` does — put 650 KB of Markdown and the
 * Markdown parser in the entry chunk, so every visitor downloaded all 75
 * articles in ten languages before the home page or the board could paint.
 * Now the hub costs its own metadata and a reader who opens one article
 * downloads that one article.
 *
 * Every article declares a `cluster` — the topic it covers ("rules",
 * "openings", …). Articles sharing a cluster are translations of one another,
 * which is what lets each one advertise its siblings via hreflang and lets the
 * language switcher move you to the same article rather than dumping you on the
 * index.
 */

import { BLOG_INDEX } from 'virtual:blog-index';
import { Locale, LOCALES, isLocale } from '@/i18n/locales';
import { postPath } from '@/i18n/routes';

/** An article's metadata — everything except the text itself. */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  lang: Locale;
  /** Topic id shared with this article's translations. */
  cluster: string;
  tags: string[];
  readingMinutes: number;
}

/** An article's body, rendered, plus the Q&A pulled out of it. */
export interface BlogPostContent {
  html: string;
  faq: { q: string; a: string }[];
}

/**
 * The raw Markdown, one dynamic import per file.
 *
 * Deliberately NOT `eager` — that is the whole reason this module is split in
 * two. Vite turns each entry into its own chunk, so opening an article fetches
 * only that article.
 */
const bodies = import.meta.glob('./blog/*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>;

export const BLOG_POSTS: BlogPost[] = BLOG_INDEX.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  description: entry.description,
  date: entry.date,
  lang: (isLocale(entry.lang) ? entry.lang : 'en') as Locale,
  cluster: entry.cluster,
  tags: entry.tags,
  readingMinutes: entry.readingMinutes,
}));

/** Where each post's Markdown lives, keyed the way `bodies` is keyed. */
const FILE_BY_KEY = new Map(BLOG_INDEX.map((e) => [`${e.lang}/${e.slug}`, e.file]));

/**
 * Pull the trailing FAQ out of the body.
 *
 * Articles mark it with an `<!-- faq -->` comment before the closing heading;
 * each entry is a `### question` followed by its answer. Keying off an explicit
 * marker rather than the heading text keeps this working across all ten
 * languages. The pairs become FAQPage structured data (eligible for an FAQ rich
 * result) while the prose still renders normally in the article.
 *
 * `scripts/content.mjs` repeats this for the prerendered copy — if the marker
 * or the shape changes here, change it there too.
 */
const FAQ_MARKER = '<!-- faq -->';

function parseFaq(body: string): { q: string; a: string }[] {
  const idx = body.indexOf(FAQ_MARKER);
  if (idx === -1) return [];
  const faq: { q: string; a: string }[] = [];
  for (const part of body.slice(idx).split(/\n### +/).slice(1)) {
    const [question, ...rest] = part.split('\n');
    const answer = rest.join(' ').replace(/\s+/g, ' ').trim();
    if (question && answer) faq.push({ q: question.trim(), a: answer });
  }
  return faq;
}

/**
 * Wrap tables so they scroll inside their own box.
 *
 * A three-column table doesn't fit a 320px phone, and without this the table
 * widens the article instead — putting the horizontal scrollbar back on the
 * whole page.
 */
function wrapTables(html: string): string {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

/** Rendered bodies, kept so going back to an article doesn't re-parse it. */
const contentCache = new Map<string, BlogPostContent>();

/**
 * Fetch and render one article's body.
 *
 * `marked` is imported here rather than at the top of the module so the parser
 * travels with the article chunk instead of the entry chunk — a page that never
 * opens an article never downloads it.
 */
export async function loadPostContent(post: BlogPost): Promise<BlogPostContent> {
  const key = `${post.lang}/${post.slug}`;
  const cached = contentCache.get(key);
  if (cached) return cached;

  const file = FILE_BY_KEY.get(key);
  const loader = file ? bodies[file] : undefined;
  if (!loader) return { html: '', faq: [] };

  const [raw, { marked }] = await Promise.all([loader(), import('marked')]);
  const body = stripFrontmatter(raw);
  const content: BlogPostContent = {
    html: wrapTables(marked.parse(body, { gfm: true, breaks: false }) as string),
    faq: parseFaq(body),
  };
  contentCache.set(key, content);
  return content;
}

/** Articles written in one language, newest first. */
export function postsFor(locale: Locale): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.lang === locale);
}

/** Look up an article within a language. */
export function getPost(locale: Locale, slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.lang === locale && p.slug === slug);
}

/**
 * The same article in every language that has it, ordered by the locale list so
 * the hreflang block is stable between renders.
 */
export function translationsOf(post: BlogPost): { locale: Locale; path: string }[] {
  return LOCALES.map((l) => BLOG_POSTS.find((p) => p.cluster === post.cluster && p.lang === l.code))
    .filter((p): p is BlogPost => !!p)
    .map((p) => ({ locale: p.lang, path: postPath(p.lang, p.slug) }));
}

/** The slug this article's translation uses in `locale`, if it exists. */
export function translatedSlug(post: BlogPost, locale: Locale): string | undefined {
  return BLOG_POSTS.find((p) => p.cluster === post.cluster && p.lang === locale)?.slug;
}
