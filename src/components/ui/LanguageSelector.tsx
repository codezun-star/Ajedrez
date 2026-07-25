/**
 * LanguageSelector — a compact dropdown to switch the UI language. Shows the
 * current language's flag; opens a menu of all supported locales.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GlobeIcon, CheckIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { LOCALES, Locale } from '@/i18n/locales';
import { blogPath, homePath, playPath, postPath } from '@/i18n/routes';
import { getPost, translatedSlug } from '@/content/blog';
import { FlagIcon } from './FlagIcon';

interface LanguageSelectorProps {
  /** Icon-only trigger (no language name) — for tight toolbars. */
  compact?: boolean;
  /**
   * Which edge the dropdown is anchored to. Default `end` (right) suits a
   * button sitting at the right of a bar; use `start` when the trigger is on
   * the left, so the panel opens inward instead of off-screen.
   */
  align?: 'start' | 'end';
}

export function LanguageSelector({ compact = false, align = 'end' }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  /**
   * The current page's address in another language. Switching language is a
   * navigation now that the locale lives in the URL — and from an article it
   * lands on that article's translation rather than dropping you on the index.
   */
  const pathIn = (next: Locale): string => {
    const [, section, slug] = pathname.split('/').filter(Boolean);
    if (section === 'play') return playPath(next);
    if (section !== 'blog') return homePath(next);
    if (!slug) return blogPath(next);
    const post = getPost(locale, slug);
    const translated = post && translatedSlug(post, next);
    return translated ? postPath(next, translated) : blogPath(next);
  };

  const choose = (next: Locale) => {
    setLocale(next);
    navigate(pathIn(next));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('lang.label')}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white/5 px-2.5 text-sm font-medium
                   text-slate-300 transition-colors hover:bg-white/10 hover:text-white
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
      >
        <GlobeIcon className="h-4 w-4 shrink-0" />
        <FlagIcon code={current.code} />
        {/* The name always shows in the roomy mobile panel; in the compact
            toolbar trigger it only appears once the header has space for it. */}
        <span className={compact ? 'hidden truncate lg:inline' : 'truncate'}>{current.name}</span>
      </button>

      {open && (
        <div
          className={`menu-panel absolute z-50 mt-2 max-h-[70vh] w-48 max-w-[calc(100vw-2rem)]
                      overflow-y-auto p-1 ${align === 'start' ? 'left-0' : 'right-0'}`}
          role="listbox"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === locale}
              onClick={() => choose(l.code)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                l.code === locale ? 'bg-brand-500/25 text-white' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <FlagIcon code={l.code} />
              <span className="flex-1 text-left">{l.name}</span>
              {l.code === locale && <CheckIcon className="h-4 w-4 text-brand-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
