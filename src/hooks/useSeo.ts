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

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
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
}

export function useSeo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  locale,
  alternates,
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
    upsertCanonical(url);
    if (locale) upsertMeta('property', 'og:locale', locale);
    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }
    setAlternates(altKey ? altKey.split('|').map((s) => {
      const [loc, ...rest] = s.split(':');
      return { locale: loc as Locale, path: rest.join(':') };
    }) : []);
  }, [title, description, path, image, type, locale, altKey]);
}
