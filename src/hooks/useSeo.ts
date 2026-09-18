/**
 * useSeo — updates the document title and SEO meta tags for the current route.
 *
 * Because this is a client-rendered SPA, we patch `<title>`, the description,
 * canonical link, Open Graph / Twitter tags and the hreflang alternates on
 * navigation. The static index.html carries sensible defaults for crawlers that
 * don't run JS.
 *
 * hreflang matters here: the same page exists in ten languages, and without
 * these links Google treats them as unrelated duplicates instead of a set of
 * translations, and picks one to show everybody.
 */

import { useEffect } from 'react';
import { Locale } from '@/i18n/locales';

export const SITE_URL = 'https://botagedrez.codezun.com';

/** Marks the <link> elements we own, so stale ones can be cleared on nav. */
const ALT_ATTR = 'data-seo-alternate';

/**
 * Open Graph wants a full locale (`es_ES`), not a bare language code.
 *
 * The prerenderer writes the full form; this hook used to overwrite it with the
 * bare code on hydration, so every page ended up advertising an `og:locale`
 * that isn't one. Mirrors `OG_LOCALE` in `scripts/content.mjs`.
 */
const OG_LOCALE: Record<Locale, string> = {
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

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * `<meta name="robots">`.
 *
 * A URL that doesn't resolve still returns 200 — the host serves the SPA shell
 * for every path — so without this a mistyped or dead link becomes a soft 404
 * in Search Console instead of a page Google drops. Every route sets it, back
 * to the template's `index, follow` when it is a real page, or the flag would
 * stick to whatever the reader navigated to next.
 */
function setRobots(noindex: boolean): void {
  const el = document.head.querySelector('meta[name="robots"]');
  if (noindex) {
    if (el) el.setAttribute('content', 'noindex, follow');
    else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', 'noindex, follow');
      document.head.appendChild(meta);
    }
    return;
  }
  if (el) el.setAttribute('content', 'index, follow');
}

function upsertCanonical(url: string): void {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/**
 * Replace the hreflang set. Every alternate points at the same content in
 * another language; `x-default` points at `/`, which redirects visitors to
 * whichever language their browser asks for.
 */
function setAlternates(alternates: SeoAlternate[]): void {
  document.head.querySelectorAll(`link[${ALT_ATTR}]`).forEach((el) => el.remove());
  if (alternates.length === 0) return;

  const add = (hreflang: string, path: string) => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    el.setAttribute('href', SITE_URL + path);
    el.setAttribute(ALT_ATTR, '');
    document.head.appendChild(el);
  };

  for (const alt of alternates) add(alt.locale, alt.path);
  add('x-default', '/');
}

export interface SeoAlternate {
  locale: Locale;
  path: string;
}

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  /** The language this page is written in — emitted as `og:locale`. */
  locale?: Locale;
  /** Every translation of this page, including the current one. */
  alternates?: SeoAlternate[];
  /** Keep this URL out of the index — for routes that resolve to nothing. */
  noindex?: boolean;
}

export function useSeo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  locale,
  alternates,
  noindex = false,
}: SeoOptions): void {
  // Alternates are rebuilt on every render by the caller, so compare by value
  // rather than identity to avoid re-running the effect on every keystroke.
  const altKey = alternates ? alternates.map((a) => `${a.locale}:${a.path}`).join('|') : '';

  useEffect(() => {
    const url = SITE_URL + path;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', type);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:url', url);
    upsertCanonical(url);
    setRobots(noindex);
    if (locale) upsertMeta('property', 'og:locale', OG_LOCALE[locale] ?? locale);
    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }
    setAlternates(altKey ? altKey.split('|').map((s) => {
      const [loc, ...rest] = s.split(':');
      return { locale: loc as Locale, path: rest.join(':') };
    }) : []);
  }, [title, description, path, image, type, locale, altKey, noindex]);
}
