/**
 * FlagIcon — the flag for each supported locale, drawn as inline SVG.
 *
 * We deliberately do NOT use the regional-indicator emoji (🇪🇸, 🇬🇧, …): Windows
 * ships no flag glyphs for them, so on most desktops they degrade to bare
 * letter pairs ("ES", "GB") while phones show real flags. Hand-drawn SVG keeps
 * the selector identical on every OS, costs no network request and scales
 * cleanly.
 *
 * Each flag is authored in a 24×16 viewBox (the common 3:2 ratio); shapes are
 * simplified to what still reads correctly at ~20px wide.
 */

import { ReactNode } from 'react';
import { Locale } from '@/i18n/locales';

const FLAGS: Record<Locale, ReactNode> = {
  // Spain — red / yellow / red, the centre band double height.
  es: (
    <>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </>
  ),

  // United Kingdom — simplified Union Jack.
  en: (
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#FFF" strokeWidth="3.2" />
      <path d="M0 0 24 16M24 0 0 16" stroke="#C8102E" strokeWidth="1.8" />
      <path d="M12 0V16M0 8H24" stroke="#FFF" strokeWidth="5.4" />
      <path d="M12 0V16M0 8H24" stroke="#C8102E" strokeWidth="3.2" />
    </>
  ),

  // Brazil — green field, yellow lozenge, blue globe.
  pt: (
    <>
      <rect width="24" height="16" fill="#009B3A" />
      <path d="M12 2 22 8 12 14 2 8Z" fill="#FEDF00" />
      <circle cx="12" cy="8" r="3.1" fill="#002776" />
      <path d="M9.1 6.9a6 6 0 0 1 5.9 1.6" stroke="#FFF" strokeWidth="0.7" fill="none" />
    </>
  ),

  // France — vertical blue / white / red.
  fr: (
    <>
      <rect width="24" height="16" fill="#FFF" />
      <rect width="8" height="16" fill="#002395" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </>
  ),

  // Germany — black / red / gold.
  de: (
    <>
      <rect width="24" height="16" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#DD0000" />
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
    </>
  ),

  // Russia — white / blue / red.
  ru: (
    <>
      <rect width="24" height="16" fill="#FFF" />
      <rect y="5.33" width="24" height="5.34" fill="#0039A6" />
      <rect y="10.67" width="24" height="5.33" fill="#D52B1E" />
    </>
  ),

  // India — saffron / white / green with the Ashoka chakra.
  hi: (
    <>
      <rect width="24" height="16" fill="#FFF" />
      <rect width="24" height="5.33" fill="#FF9933" />
      <rect y="10.67" width="24" height="5.33" fill="#138808" />
      <circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth="0.55" />
      <circle cx="12" cy="8" r="0.45" fill="#000080" />
    </>
  ),

  // China — red field, one large star and four small ones.
  zh: (
    <>
      <rect width="24" height="16" fill="#DE2910" />
      <path
        d="M5.5 2.3 6.22 4.51 8.54 4.51 6.66 5.88 7.38 8.09 5.5 6.72 3.62 8.09 4.34 5.88 2.46 4.51 4.78 4.51Z"
        fill="#FFDE00"
      />
      <circle cx="10.2" cy="2.3" r="0.62" fill="#FFDE00" />
      <circle cx="11.9" cy="4.2" r="0.62" fill="#FFDE00" />
      <circle cx="11.9" cy="6.6" r="0.62" fill="#FFDE00" />
      <circle cx="10.2" cy="8.5" r="0.62" fill="#FFDE00" />
    </>
  ),

  // Japan — white field, centred red disc.
  ja: (
    <>
      <rect width="24" height="16" fill="#FFF" />
      <circle cx="12" cy="8" r="4.4" fill="#BC002D" />
    </>
  ),

  // Saudi Arabia — green field with the sword; the shahada above is suggested
  // rather than reproduced, since real script is illegible at this size.
  ar: (
    <>
      <rect width="24" height="16" fill="#165D31" />
      <path d="M6 10.6h11" stroke="#FFF" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M17 10.6 19 9.4v2.4Z" fill="#FFF" />
      <path
        d="M6.5 6.4h2.2M10 6.4h1.6M12.9 6.4h1.7M15.9 6.4h1.8M7.6 4.6h3M12 4.6h4"
        stroke="#FFF"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
    </>
  ),
};

interface FlagIconProps {
  code: Locale;
  /** Sizing/extra classes. Defaults to a 20×13 chip. */
  className?: string;
}

export function FlagIcon({ code, className }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={`shrink-0 rounded-[2px] ring-1 ring-black/10 ${className ?? 'h-3.5 w-5'}`}
      aria-hidden="true"
      focusable="false"
    >
      {FLAGS[code]}
    </svg>
  );
}
