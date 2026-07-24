/**
 * Blog content loader.
 *
 * Markdown articles live in `./blog/*.md` with a small YAML-ish frontmatter
 * block. They are imported raw at build time, the frontmatter is parsed, and the
 * body is rendered to HTML with `marked`. Posts are exposed sorted newest-first.
 */

import { marked } from 'marked';
import { Locale, isLocale } from '@/i18n/locales';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  lang: Locale;
  tags: string[];
  html: string;
  readingMinutes: number;
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

function build(): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const path in files) {
    const raw = files[path] as string;
    const { data, body } = parseFrontmatter(raw);
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      slug: data.slug || path.split('/').pop()!.replace('.md', ''),
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || '',
      lang: (isLocale(data.lang) ? data.lang : 'en') as Locale,
      tags: parseTags(data.tags),
      html: marked.parse(body) as string,
      readingMinutes: Math.max(1, Math.round(words / 200)),
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const BLOG_POSTS: BlogPost[] = build();

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
