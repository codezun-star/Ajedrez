/**
 * SiteHeader — top navigation for the marketing pages (home, blog, 404).
 *
 * Two headers, one per form factor. From tablet width up it is the website
 * bar: brand, nav links, language, theme and the Play CTA in one row. On a
 * phone that row doesn't fit and a hamburger dropdown felt like a website, so
 * the phone gets the app shell instead: a compact {@link AppBar} on top, with
 * navigation in the bottom tab bar and the rest in the settings sheet.
 */

import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { blogPath, homePath, playPath } from '@/i18n/routes';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { IconButton } from '@/components/ui/IconButton';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { AppBar } from '@/components/app/AppBar';

interface SiteHeaderProps {
  /** Phone app bar title. */
  title?: string;
  /** Phone app bar back target, for pages below a section root. */
  back?: string;
  /** Hold the phone title until the page's own heading has scrolled away. */
  revealTitle?: boolean;
}

export function SiteHeader({ title, back, revealTitle }: SiteHeaderProps) {
  const { t, locale } = useI18n();
  const settings = useGameStore((s) => s.settings);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const { pathname } = useLocation();

  const home = homePath(locale);
  const links = [
    { to: home, label: t('nav.home') },
    { to: blogPath(locale), label: t('nav.blog') },
  ];

  const isActive = (to: string) => (to === home ? pathname === home : pathname.startsWith(to));

  return (
    <>
      <AppBar title={title} back={back} revealTitle={revealTitle} />

      <header className="site-header hidden md:block">
        <div className="mx-auto flex h-24 w-full max-w-6xl items-center justify-between gap-2 px-6">
          <Link to={home} className="flex min-w-0 shrink items-center" aria-label="botAgedrez">
            <BrandLogo className="h-[4.5rem]" />
          </Link>

          <nav className="flex shrink-0 items-center gap-2">
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
            <IconButton label={t('app.theme')} onClick={toggleTheme}>
              {settings.theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </IconButton>
            <Link to={playPath(locale)} className="btn-primary ml-1 px-4 py-2 text-sm">
              {t('nav.play')}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
