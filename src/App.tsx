/**
 * App — the router. Applies the global theme and maps URLs to screens:
 *   /            → marketing home / landing
 *   /jugar       → the interactive game
 *   /blog        → article index
 *   /blog/:slug  → a single article
 *
 * A `_redirects` rule on Cloudflare Pages serves index.html for every path so
 * these client routes deep-link correctly.
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
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
      <Route path="/" element={<HomeScreen />} />
      <Route path="/jugar" element={<PlayApp />} />
      <Route path="/blog" element={<BlogListScreen />} />
      <Route path="/blog/:slug" element={<BlogPostScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
