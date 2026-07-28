/**
 * SiteFooter — footer for the marketing pages, with brand, tagline and links.
 *
 * The language row doubles as an SEO signal: every language's hub is a real
 * crawlable link, so a crawler landing on any page can reach all ten trees.
 */

import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { LOCALES } from '@/i18n/locales';
import { blogPath, homePath, playPath } from '@/i18n/routes';
import { FlagIcon } from '@/components/ui/FlagIcon';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function SiteFooter() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <BrandLogo className="h-16 sm:h-20" />
          <p className="mt-2 max-w-sm text-sm text-slate-400">{t('home.footerTagline')}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
          <Link to={homePath(locale)} className="hover:text-white">
            {t('nav.home')}
          </Link>
          <Link to={playPath(locale)} className="hover:text-white">
            {t('nav.play')}
          </Link>
          <Link to={blogPath(locale)} className="hover:text-white">
            {t('nav.blog')}
          </Link>
        </nav>
      </div>

      {/* Every language, as crawlable links. */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 pt-5 text-sm text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('lang.label')}
          </span>
          {LOCALES.map((l) => (
            <Link
              key={l.code}
              to={homePath(l.code)}
              hrefLang={l.code}
              className="inline-flex items-center gap-1.5 hover:text-white"
            >
              <FlagIcon code={l.code} className="h-3 w-4" />
              {l.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        © {year} botAgedrez · {t('home.footerRights')}
      </div>
    </footer>
  );
}
