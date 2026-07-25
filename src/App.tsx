/**
 * App — the router. Applies the global theme and maps URLs to screens.
 *
 * Every indexable page sits under a language prefix so each of the ten
 * languages is its own crawlable tree:
 *
 *   /                     → detects the visitor's language and redirects
 *   /:locale              → that language's hub (landing page)
 *   /:locale/play         → the interactive game
 *   /:locale/blog         → article index for that language
 *   /:locale/blog/:slug   → a single article
 *
 * The pre-launch URLs (`/jugar`, `/blog`, `/blog/:slug`) still resolve: Cloudflare
 * 301s them via `public/_redirects`, and the routes below cover anyone who
 * reaches them client-side.
 *
 * A `_redirects` rule serves index.html for every path so these client routes
 * deep-link correctly.
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { DEFAULT_LOCALE, detectLocale, isLocale } from '@/i18n/locales';
import { blogPath, homePath, playPath, postPath } from '@/i18n/routes';
import { BLOG_POSTS } from '@/content/blog';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { BlogListScreen, BlogPostScreen } from '@/components/screens/BlogScreen';
import PlayApp from './PlayApp';

export default function App() {
  const theme = useGameStore((s) => s.settings.theme);
  const { pathname } = useLocation();

  // Apply the theme class to <html> for every route.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Scroll to top on navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Legacy, pre-i18n URLs — kept alive so existing links and any indexed
          pages land on the right language instead of a 404. */}
      <Route path="/jugar" element={<LegacyRedirect section="play" />} />
      <Route path="/blog" element={<LegacyRedirect section="blog" />} />
      <Route path="/blog/:slug" element={<LegacyPostRedirect />} />

      <Route path="/:locale" element={<LocaleLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="play" element={<PlayApp />} />
        <Route path="blog" element={<BlogListScreen />} />
        <Route path="blog/:slug" element={<BlogPostScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Validates the `:locale` segment and makes the URL the source of truth for the
 * active language — so a shared link always opens in the language it was
 * written in, whatever the visitor last picked.
 */
function LocaleLayout() {
  const { locale: param } = useParams();
  const { locale, setLocale } = useI18n();
  const valid = isLocale(param);

  useEffect(() => {
    if (valid && param !== locale) setLocale(param);
  }, [valid, param, locale, setLocale]);

  if (!valid) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** `/` — send visitors to their own language. */
function RootRedirect() {
  return <Navigate to={homePath(detectLocale())} replace />;
}

function LegacyRedirect({ section }: { section: 'play' | 'blog' }) {
  const target = detectLocale();
  return <Navigate to={section === 'play' ? playPath(target) : blogPath(target)} replace />;
}

/** An old `/blog/:slug` link resolves to whichever language wrote that slug. */
function LegacyPostRedirect() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return <Navigate to={blogPath(DEFAULT_LOCALE)} replace />;
  return <Navigate to={postPath(post.lang, post.slug)} replace />;
}
