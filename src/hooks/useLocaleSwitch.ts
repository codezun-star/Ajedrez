/**
 * useLocaleSwitch — change the UI language by moving to the same page in the
 * other language's tree.
 *
 * The locale lives in the URL, so switching is a navigation — and from an
 * article it lands on that article's translation rather than dropping the
 * reader on the index. Shared by the desktop dropdown and the mobile settings
 * sheet so both resolve a page's counterpart the same way.
 */

import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Locale } from '@/i18n/locales';
import { blogPath, homePath, playPath, postPath, profilePath } from '@/i18n/routes';
import { getPost, translatedSlug } from '@/content/blog';

export function useLocaleSwitch(): (next: Locale, options?: { replace?: boolean }) => void {
  const { locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (next, options) => {
      const [, section, slug] = pathname.split('/').filter(Boolean);
      let target: string;
      if (section === 'play') target = playPath(next);
      else if (section === 'profile') target = profilePath(next);
      else if (section !== 'blog') target = homePath(next);
      else if (!slug) target = blogPath(next);
      else {
        const post = getPost(locale, slug);
        const translated = post && translatedSlug(post, next);
        target = translated ? postPath(next, translated) : blogPath(next);
      }
      setLocale(next);
      navigate(target, { replace: options?.replace });
    },
    [locale, navigate, pathname, setLocale],
  );
}
