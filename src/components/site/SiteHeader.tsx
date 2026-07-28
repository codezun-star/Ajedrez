/**
 * SiteHeader — top navigation for the marketing pages (home, blog). Brand,
 * nav links, theme toggle and the language selector.
 *
 * The full row (brand + links + language + theme + CTA) needs ~460px, which no
 * phone has. Below `sm` it collapses to brand + the primary CTA + a menu
 * toggle, and everything else moves into a dropdown panel — so the header
 * never forces the page to scroll sideways.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { blogPath, homePath, playPath } from '@/i18n/routes';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { IconButton } from '@/components/ui/IconButton';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function SiteHeader() {
  const { t, locale } = useI18n();
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const home = homePath(locale);
  const links = [
    { to: home, label: t('nav.home') },
    { to: blogPath(locale), label: t('nav.blog') },
  ];

  const isActive = (to: string) => (to === home ? pathname === home : pathname.startsWith(to));

  // Navigating away closes the panel; so does Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const themeIcon =
    settings.theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />;

  return (
    <header className="site-header">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:h-24 sm:px-6">
        <Link to={home} className="flex min-w-0 shrink items-center" aria-label="botAgedrez">
          <BrandLogo className="h-16 sm:h-[4.5rem]" />
        </Link>

        {/* Full navigation — tablet and up */}
        <nav className="hidden shrink-0 items-center gap-1 sm:flex sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(l.to) ? 'text-brand-300' : 'text-slate-300 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <LanguageSelector compact />
          <IconButton label={t('nav.home')} onClick={toggleTheme} aria-label="theme">
            {themeIcon}
          </IconButton>
          <Link to={playPath(locale)} className="btn-primary ml-1 px-4 py-2 text-sm">
            {t('nav.play')}
          </Link>
        </nav>

        {/* Phone — the CTA stays reachable, the rest folds into the panel */}
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          <Link to={playPath(locale)} className="btn-primary px-3 py-2 text-sm">
            {t('nav.play')}
          </Link>
          <IconButton
            label={t('nav.menu')}
            onClick={() => setMenuOpen((o) => !o)}
            active={menuOpen}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </IconButton>
        </div>
      </div>

      {menuOpen && (
        <div
          id="site-mobile-menu"
          className="border-t border-white/5 px-4 pb-4 pt-3 sm:hidden"
        >
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive(l.to) ? 'bg-brand-500/15 text-brand-300' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
            <LanguageSelector align="start" />
            <IconButton label={t('nav.home')} onClick={toggleTheme} aria-label="theme">
              {themeIcon}
            </IconButton>
          </div>
        </div>
      )}
    </header>
  );
}
