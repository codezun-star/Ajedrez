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
 *   /:locale/profile      → the player's stats (personal, so `noindex`)
 *
 * Anything else renders {@link NotFoundScreen}, which marks itself `noindex`.
 * It used to `Navigate` to `/` instead: the reader was moved somewhere they
 * hadn't asked for, and because the host answers 200 for every path, Search saw
 * a real page with the home page's content — a soft 404 for every dead URL.
 *
 * The pre-launch URLs (`/jugar`, `/blog`, `/blog/:slug`) still resolve: Cloudflare
 * 301s them via `public/_redirects`, and the routes below cover anyone who
 * reaches them client-side.
 *
 * A `_redirects` rule serves index.html for every path so these client routes
 * deep-link correctly.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { detectLocale, isLocale } from '@/i18n/locales';
import { blogPath, homePath, playPath, postPath, profilePath } from '@/i18n/routes';
import { BLOG_POSTS } from '@/content/blog';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { NotFoundScreen } from '@/components/screens/NotFoundScreen';
import { GameSkeleton, ScreenLoader } from '@/components/ui/Loaders';
import { MobileTabBar } from '@/components/app/MobileTabBar';

/**
 * The game (engine, AI worker, board) and the blog are split out of the main
 * bundle: a visitor landing on the marketing page shouldn't download a chess
 * engine to read it. Each is fetched on first navigation, behind the Suspense
 * fallbacks below.
 */
const PlayApp = lazy(() => import('./PlayApp'));
const BlogListScreen = lazy(() =>
  import('@/components/screens/BlogScreen').then((m) => ({ default: m.BlogListScreen })),
);
const BlogPostScreen = lazy(() =>
  import('@/components/screens/BlogScreen').then((m) => ({ default: m.BlogPostScreen })),
);
const ProfileScreen = lazy(() =>
  import('@/components/screens/StatsScreen').then((m) => ({ default: m.ProfileScreen })),
);
const loadSettingsSheet = () => import('@/components/app/SettingsSheet');
const SettingsSheet = lazy(() => loadSettingsSheet().then((m) => ({ default: m.SettingsSheet })));

export default function App() {
  const theme = useGameStore((s) => s.settings.theme);
  const { pathname } = useLocation();

  // Apply the theme class to <html> for every route. The inline script in
  // index.html has already done this for the first paint; this keeps it in step
  // when the reader toggles, and moves the browser chrome with it.
  useEffect(() => {
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document
      .querySelector('meta[data-theme-color]')
      ?.setAttribute('content', dark ? '#0c0f1d' : '#eef2f9');
  }, [theme]);

  // Scroll to top on navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Language-neutral entry points for the installed app's "Jugar" and
            "Perfil" shortcuts: a manifest holds one URL, but the visitor may
            be on any of the ten languages, so resolve it the way `/` does. */}
        <Route path="/play" element={<LegacyRedirect section="play" />} />
        <Route path="/profile" element={<LegacyRedirect section="profile" />} />

        {/* Legacy, pre-i18n URLs — kept alive so existing links and any
            indexed pages land on the right language instead of a 404. */}
        <Route path="/jugar" element={<LegacyRedirect section="play" />} />
        <Route path="/blog" element={<LegacyRedirect section="blog" />} />
        <Route path="/blog/:slug" element={<LegacyPostRedirect />} />

        <Route path="/:locale" element={<LocaleLayout />}>
          <Route index element={<HomeScreen />} />
          <Route
            path="play"
            element={
              <Suspense fallback={<GameSkeleton />}>
                <PlayApp />
              </Suspense>
            }
          />
          <Route
            path="blog"
            element={
              <Suspense fallback={<ScreenLoader />}>
                <BlogListScreen />
              </Suspense>
            }
          />
          <Route
            path="blog/:slug"
            element={
              <Suspense fallback={<ScreenLoader />}>
                <BlogPostScreen />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<ScreenLoader />}>
                <ProfileScreen />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundScreen />} />
        </Route>

        <Route path="*" element={<NotFoundScreen />} />
      </Routes>

      <SettingsHost />
    </>
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

  if (!valid) return <NotFoundScreen />;
  return (
    <>
      <Outlet />
      <MobileTabBar />
    </>
  );
}

/**
 * One settings sheet for the whole app; any screen opens it through history
 * state (see `useSheet`), so it survives route changes underneath.
 *
 * It is only ever needed after a tap, so its code stays out of the entry
 * bundle: fetched once the page is idle, mounted the first time it is asked
 * for, and kept mounted after that so its closing animation can play.
 */
function SettingsHost() {
  const location = useLocation();
  const requested = (location.state as { sheet?: string } | null)?.sheet === 'settings';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (requested) setMounted(true);
  }, [requested]);

  useEffect(() => {
    const warm = () => void loadSettingsSheet();
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(warm, { timeout: 6000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 3000);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <SettingsSheet />
    </Suspense>
  );
}

/** `/` — send visitors to their own language. */
function RootRedirect() {
  return <Navigate to={homePath(detectLocale())} replace />;
}

const SECTION_PATH = { play: playPath, blog: blogPath, profile: profilePath };

function LegacyRedirect({ section }: { section: keyof typeof SECTION_PATH }) {
  return <Navigate to={SECTION_PATH[section](detectLocale())} replace />;
}

/** An old `/blog/:slug` link resolves to whichever language wrote that slug. */
function LegacyPostRedirect() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return <NotFoundScreen />;
  return <Navigate to={postPath(post.lang, post.slug)} replace />;
}
