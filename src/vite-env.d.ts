/// <reference types="vite/client" />

/**
 * The article index, generated from `src/content/blog/*.md` at build time by
 * `scripts/blog-index-plugin.mjs`. Metadata only — the bodies are fetched one
 * chunk at a time by `loadPostContent`, so they never reach the entry bundle.
 */
declare module 'virtual:blog-index' {
  export interface BlogIndexEntry {
    /** Path of the source Markdown, as `import.meta.glob` keys it. */
    file: string;
    slug: string;
    title: string;
    description: string;
    date: string;
    lang: string;
    cluster: string;
    tags: string[];
    readingMinutes: number;
  }

  export const BLOG_INDEX: BlogIndexEntry[];
}
