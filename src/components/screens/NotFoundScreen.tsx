/**
 * NotFoundScreen — what a URL that resolves to nothing renders.
 *
 * Two things it fixes. For the reader, an unknown path used to bounce straight
 * to the home page and a dead article slug flashed a bare "404" for a second
 * and a half before doing the same — in both cases you were moved somewhere you
 * didn't ask for, with no way to tell what had happened. Here the page says so
 * and offers the three places worth going.
 *
 * For Search, the host serves the SPA shell with a 200 for every path, so every
 * mistyped or stale URL looked like a real page with the home page's content —
 * a soft 404, which Google reports and which dilutes what it has indexed. The
 * `noindex` below is what keeps those URLs out; `follow` so the links on this
 * page are still crawled.
 */

import { Link, useLocation } from 'react-router-dom';
import { ArrowRightIcon, CompassIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { blogPath, homePath, playPath } from '@/i18n/routes';
import { useSeo } from '@/hooks/useSeo';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';

export function NotFoundScreen() {
  const { t, locale } = useI18n();
  const { pathname } = useLocation();

  useSeo({
    title: t('notFound.seoTitle'),
    description: t('notFound.subtitle'),
    // Self-referencing. The default (`/`) made every dead URL declare the home
    // page as its canonical, which is how a 404 gets folded into a real page
    // instead of dropped.
    path: pathname,
    locale,
    noindex: true,
  });

  const links = [
    { to: homePath(locale), label: t('nav.home') },
    { to: playPath(locale), label: t('nav.play') },
    { to: blogPath(locale), label: t('nav.blog') },
  ];

  return (
    <div className="app-aura flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
          <CompassIcon className="h-7 w-7" />
        </div>
        <p className="mt-6 font-display text-5xl font-extrabold text-brand-300">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{t('notFound.title')}</h1>
        <p className="mt-3 max-w-lg text-slate-400">{t('notFound.subtitle')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              className={`${i === 0 ? 'btn-primary' : 'btn-ghost'} px-5 py-3 text-base`}
            >
              <span className="truncate">{l.label}</span>
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
