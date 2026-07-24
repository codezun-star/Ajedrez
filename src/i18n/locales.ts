/**
 * Supported locales and their metadata.
 *
 * Ten of the world's most spoken languages, spanning the biggest chess and web
 * audiences. Arabic is right-to-left; everything else is left-to-right.
 */

export type Locale = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'ru' | 'hi' | 'zh' | 'ja' | 'ar';

export interface LocaleMeta {
  code: Locale;
  /** Endonym — the language's name written in that language. */
  name: string;
  /** Short flag/emoji used in the picker. */
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES: LocaleMeta[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && LOCALES.some((l) => l.code === value);
}

/** Best-guess initial locale from the browser, falling back to the default. */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const c of candidates) {
    const short = c.slice(0, 2).toLowerCase();
    if (isLocale(short)) return short;
  }
  return DEFAULT_LOCALE;
}
