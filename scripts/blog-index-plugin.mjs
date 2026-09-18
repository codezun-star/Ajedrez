/**
 * Vite plugin: `virtual:blog-index` — every article's metadata, without its body.
 *
 * The problem it exists to solve. `src/content/blog.ts` used to read the
 * articles with `import.meta.glob('./blog/*.md', { eager: true })`, because the
 * title, description and date of all 75 articles are needed synchronously: the
 * hub lists that language's guides, the language switcher has to know which
 * slug is this article's translation, and `/blog/:slug` has to map a legacy
 * slug to its language. Eager is the only way to have that data on first
 * render.
 *
 * But an eager `?raw` glob inlines the **whole file**, and the bodies are
 * 650 KB of Markdown. Rollup put all of it in the entry chunk — so every
 * visitor downloaded all 75 articles, in all ten languages, plus the Markdown
 * parser, before the home page or the board could paint. The entry chunk was
 * 1.2 MB (400 KB gzipped) and roughly two thirds of it was text nobody on that
 * page was going to read.
 *
 * Splitting the two halves is what fixes it: the metadata is small and stays
 * eager (this module), the bodies become one lazily-imported chunk each. A
 * reader who opens one article downloads that one article.
 *
 * The frontmatter is parsed here rather than in the app so the parser itself
 * doesn't ship either. It mirrors the one in `scripts/content.mjs`, which reads
 * the same files from Node for the sitemap and the prerenderer — keep the two
 * in step.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const VIRTUAL_ID = 'virtual:blog-index';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    data[line.slice(0, idx).trim()] = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return { data, body: match[2] };
}

function parseTags(raw) {
  if (!raw) return [];
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

/**
 * Estimated reading time.
 *
 * Chinese and Japanese don't separate words with spaces, so counting
 * whitespace-delimited tokens reports a 2,000-character article as ~200 words
 * and labels it a one-minute read. For those scripts we count characters
 * instead, at roughly 400 per minute.
 */
function readingMinutes(body) {
  const cjk = body.match(/[぀-ヿ㐀-䶿一-鿿]/g)?.length ?? 0;
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk > 200 ? cjk / 400 : words / 200));
}

function buildIndex(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      return {
        // `file` is what the lazy body glob is keyed by, so the entry carries
        // it: the app never has to guess a path from a slug.
        file: `./blog/${file}`,
        slug: data.slug || file.replace(/\.md$/, ''),
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || '',
        lang: data.lang || 'en',
        cluster: data.cluster || 'general',
        tags: parseTags(data.tags),
        readingMinutes: readingMinutes(body),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** @returns {import('vite').Plugin} */
export function blogIndexPlugin() {
  let dir;
  return {
    name: 'botagedrez:blog-index',

    configResolved(config) {
      dir = join(config.root, 'src/content/blog');
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export const BLOG_INDEX = ${JSON.stringify(buildIndex(dir))};\n`;
    },

    /**
     * Editing an article's frontmatter in dev has to rebuild the index, which
     * is a different module from the file that changed — so invalidate it by
     * hand and reload, the same as any other config-shaped dependency.
     */
    configureServer(server) {
      const invalidate = (file) => {
        if (!file.endsWith('.md') || !file.startsWith(dir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (!mod) return;
        server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', invalidate);
      server.watcher.on('change', invalidate);
      server.watcher.on('unlink', invalidate);
    },
  };
}
