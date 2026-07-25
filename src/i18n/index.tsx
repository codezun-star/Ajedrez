/**
 * i18n context — a small, dependency-free translation layer.
 *
 * `useI18n().t('some.key', { n: 3 })` looks up a dot-path in the active locale's
 * message tree, falls back to English if missing, and interpolates `{n}`-style
 * placeholders. The chosen locale is persisted and drives `<html lang>`/`dir`
 * (so Arabic renders right-to-left).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { DEFAULT_LOCALE, LOCALES, Locale, detectLocale, isLocale } from './locales';
import { translations } from './translations';

const STORAGE_KEY = 'botagedrez.v1.locale';

function getNested(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj;
  for (const key of path.split('.')) {
    if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

type Vars = Record<string, string | number>;

interface I18nValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* ignore */
  }
  return detectLocale();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const dir = LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Vars): string => {
      let str = getNested(translations[locale], key) ?? getNested(translations[DEFAULT_LOCALE], key) ?? key;
      if (vars) {
        for (const k in vars) str = str.split(`{${k}}`).join(String(vars[k]));
      }
      return str;
    },
    [locale],
  );

  const value = useMemo<I18nValue>(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// The provider and its hook belong together; splitting them to satisfy fast
// refresh would only add an indirection file.
// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
