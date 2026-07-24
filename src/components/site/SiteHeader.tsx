/**
 * SiteHeader — top navigation for the marketing pages (home, blog). Brand,
 * nav links, theme toggle and the language selector.
 */

import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';
import { IconButton } from '@/components/ui/IconButton';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function SiteHeader() {
  const { t } = useI18n();
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/blog', label: t('nav.blog') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-display text-xl font-extrabold">
          bot<span className="text-brand-400">Agedrez</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active ? 'text-brand-300' : 'text-slate-300 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <LanguageSelector compact />
          <IconButton label={t('nav.home')} onClick={toggleTheme} aria-label="theme">
            {settings.theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </IconButton>
          <Link to="/jugar" className="btn-primary ml-1 px-4 py-2 text-sm">
            {t('nav.play')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
