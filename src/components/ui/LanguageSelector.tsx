/**
 * LanguageSelector — a compact dropdown to switch the UI language. Shows the
 * current language's flag; opens a menu of all supported locales.
 */

import { useEffect, useRef, useState } from 'react';
import { GlobeIcon, CheckIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { LOCALES } from '@/i18n/locales';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

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
        <GlobeIcon className="h-4 w-4" />
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && <span className="hidden sm:inline">{current.name}</span>}
      </button>

      {open && (
        <div
          className="glass absolute right-0 z-50 mt-2 max-h-[70vh] w-48 overflow-y-auto rounded-xl p-1 shadow-xl"
          role="listbox"
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === locale}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                l.code === locale ? 'bg-brand-500/25 text-white' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span className="flex-1 text-left">{l.name}</span>
              {l.code === locale && <CheckIcon className="h-4 w-4 text-brand-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
