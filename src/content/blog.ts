/**
 * Blog content loader.
 *
 * Markdown articles live in `./blog/*.md` with a small YAML-ish frontmatter
 * block. They are imported raw at build time, the frontmatter is parsed, and the
 * body is rendered to HTML with `marked`. Posts are exposed sorted newest-first.
 *
 * Every article declares a `cluster` — the topic it covers ("rules",
 * "openings", …). Articles sharing a cluster are translations of one another,
 * which is what lets each one advertise its siblings via hreflang and lets the
 * language switcher move you to the same article rather than dumping you on the
 * index.
 */

import { marked } from 'marked';
import { Locale, LOCALES, isLocale } from '@/i18n/locales';
import { postPath } from '@/i18n/routes';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  lang: Locale;
  /** Topic id shared with this article's translations. */
  cluster: string;
  tags: string[];
  html: string;
  readingMinutes: number;
  /** Optional Q&A rendered as an FAQ block and as FAQPage structured data. */
  faq: { q: string; a: string }[];
}

marked.setOptions({ gfm: true, breaks: false });

const files = import.meta.glob('./blog/*.md', { eager: true, query: '?raw', import: 'default' });

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { data, body: match[2] };
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

/**
 * Pull the trailing FAQ out of the body.
 *
 * Articles mark it with an `<!-- faq -->` comment before the closing heading;
 * each entry is a `### question` followed by its answer. Keying off an explicit
 * marker rather than the heading text keeps this working across all ten
 * languages. The pairs become FAQPage structured data (eligible for an FAQ rich
 * result) while the prose still renders normally in the article.
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
 * Estimated reading time.
 *
 * Chinese and Japanese don't separate words with spaces, so counting
 * whitespace-delimited tokens reports a 2,000-character article as ~200 words
 * and labels it a one-minute read. For those scripts we count characters
 * instead, at roughly 400 per minute.
 */
function readingMinutes(body: string): number {
  const cjk = body.match(/[぀-ヿ㐀-䶿一-鿿]/g)?.length ?? 0;
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk > 200 ? cjk / 400 : words / 200));
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

/**
 * `html` and `faq` are computed on first access rather than up front.
 *
 * Only the article page needs them, but this module is also pulled in by the
 * hub and the language switcher — so eager parsing meant every visitor, on
 * every page, paid to render twenty articles to HTML before anything painted.
 * Metadata (title, date, …) stays eager because listings need it.
 */
function build(): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const path in files) {
    const raw = files[path] as string;
    const { data, body } = parseFrontmatter(raw);
    let html: string | undefined;
    let faq: { q: string; a: string }[] | undefined;
    posts.push({
      slug: data.slug || path.split('/').pop()!.replace('.md', ''),
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || '',
      lang: (isLocale(data.lang) ? data.lang : 'en') as Locale,
      cluster: data.cluster || 'general',
      tags: parseTags(data.tags),
      readingMinutes: readingMinutes(body),
      get html() {
        if (html === undefined) html = wrapTables(marked.parse(body) as string);
        return html;
      },
      get faq() {
        if (faq === undefined) faq = parseFaq(body);
        return faq;
      },
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const BLOG_POSTS: BlogPost[] = build();

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
