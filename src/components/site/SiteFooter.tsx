/**
 * SiteFooter — footer for the marketing pages, with brand, tagline and links.
 */

import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="font-display text-lg font-extrabold">
            bot<span className="text-brand-400">Agedrez</span>
          </div>
          <p className="mt-1 max-w-sm text-sm text-slate-400">{t('home.footerTagline')}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-white">
            {t('nav.home')}
          </Link>
          <Link to="/jugar" className="hover:text-white">
            {t('nav.play')}
          </Link>
          <Link to="/blog" className="hover:text-white">
            {t('nav.blog')}
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        © {year} botAgedrez · {t('home.footerRights')}
      </div>
    </footer>
  );
}
