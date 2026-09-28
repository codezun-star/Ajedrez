/**
 * AppBar — the phone's top bar, in place of the website header.
 *
 * 56px, translucent, pinned under the status bar. A section root (Home, Blog,
 * Play, Profile) shows the brand mark; a page inside a section (an article)
 * shows a back button instead, as navigation stacks do in native apps. The
 * hairline under it only appears once content is scrolling beneath.
 *
 * `revealTitle` holds the title back until the page's own heading has scrolled
 * away, so the same words are never on screen twice.
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { homePath } from '@/i18n/routes';
import { useScrolled } from '@/hooks/useScrolled';
import { useSheet } from '@/hooks/useSheet';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { FlagIcon } from '@/components/ui/FlagIcon';

interface AppBarProps {
  title?: string;
  /** Where the back button goes. Without one the brand mark links home. */
  back?: string;
  revealTitle?: boolean;
  /** Trailing buttons. Defaults to the language shortcut. */
  actions?: ReactNode;
}

export function AppBar({ title, back, revealTitle = false, actions }: AppBarProps) {
  const { t, locale } = useI18n();
  const scrolled = useScrolled(4);
  const pastHeading = useScrolled(88);
  const showTitle = !!title && (!revealTitle || pastHeading);

  return (
    <header className="app-bar md:hidden" data-scrolled={scrolled || undefined}>
      <div className="flex h-14 items-center gap-1 px-2">
        {back ? (
          <Link to={back} aria-label={t('app.back')} className="app-bar-btn -ms-0.5">
            <ChevronLeftIcon className="h-7 w-7 rtl:-scale-x-100" strokeWidth={2.2} />
          </Link>
        ) : (
          <Link
            to={homePath(locale)}
            aria-label="botAgedrez"
            className="flex shrink-0 items-center ps-1"
          >
            <BrandLogo className="h-10" />
          </Link>
        )}

        <div
          className={`min-w-0 flex-1 truncate px-1.5 font-display text-[1.05rem] font-bold text-white transition-all duration-200 ${
            showTitle ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          }`}
          aria-hidden={!showTitle}
        >
          {title}
        </div>

        <div className="flex shrink-0 items-center gap-1">{actions ?? <LanguageShortcut />}</div>
      </div>
    </header>
  );
}

/** The current language's flag; opens the settings sheet, languages included. */
export function LanguageShortcut() {
  const { t, locale } = useI18n();
  const settings = useSheet('settings');
  return (
    <button
      type="button"
      onClick={settings.show}
      aria-label={t('lang.label')}
      aria-haspopup="dialog"
      className="app-bar-btn"
    >
      <FlagIcon code={locale} className="h-4 w-6 rounded-[3px]" />
    </button>
  );
}
