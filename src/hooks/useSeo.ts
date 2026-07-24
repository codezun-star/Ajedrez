/**
 * useSeo — updates the document title and SEO meta tags for the current route.
 *
 * Because this is a client-rendered SPA, we patch `<title>`, the description,
 * canonical link and Open Graph / Twitter tags on navigation. The static
 * index.html carries sensible defaults for crawlers that don't run JS.
 */

import { useEffect } from 'react';

export const SITE_URL = 'https://botagedrez.codezun.com';

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

interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function useSeo({ title, description, path = '/', image, type = 'website' }: SeoOptions): void {
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
    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }
  }, [title, description, path, image, type]);
}
