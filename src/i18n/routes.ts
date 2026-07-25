/**
 * Locale-aware URL helpers.
 *
 * Every indexable page lives under a language subdirectory — `/es`, `/en/blog`,
 * `/de/blog/schachregeln-fuer-anfaenger` — so each language is its own set of
 * URLs that Google can crawl, rank and link with hreflang. (Before this, all
 * ten languages shared one URL and only the default one was ever indexable.)
 *
 * We target by LANGUAGE, not by country: one Spanish tree serves Spain, Mexico,
 * Argentina and every other Spanish-speaking market. Publishing a near-identical
 * page per country would be duplicate content, which competes against itself.
 */

import { Locale } from './locales';

/** The language hub — the landing page for a market. */
export function homePath(locale: Locale): string {
  return `/${locale}`;
}

/** The game itself. */
export function playPath(locale: Locale): string {
  return `/${locale}/play`;
}

/** The article index for one language. */
export function blogPath(locale: Locale): string {
  return `/${locale}/blog`;
}

/** A single article. */
export function postPath(locale: Locale, slug: string): string {
  return `/${locale}/blog/${slug}`;
}
