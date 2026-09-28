/**
 * MobileTabBar — the bottom navigation of the phone layout, as in a native
 * app: Home, Blog, a raised Play button in the middle, Profile and Settings.
 *
 * Phones only (`md:hidden`); from tablet width up the site header carries the
 * navigation. It steps aside during a game, whose screen is pinned to the full
 * viewport height and needs every pixel of it for the board — leaving the game
 * (logo, "Menu" after the result, "New game") brings it back.
 *
 * While mounted it flags `<html>` with `has-tabbar`, which is how the anchored
 * ad bar and the sticky "Play" button know to sit above it instead of under it.
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  HomeIcon,
  PlayIcon,
  Settings2Icon,
  UserRoundIcon,
  LucideIcon,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useI18n } from '@/i18n';
import { blogPath, homePath, playPath, profilePath } from '@/i18n/routes';
import { useSheet } from '@/hooks/useSheet';

export function MobileTabBar() {
  const { t, locale } = useI18n();
  // The host may serve a page with or without its trailing slash.
  const pathname = useLocation().pathname.replace(/\/+$/, '') || '/';
  const screen = useGameStore((s) => s.screen);
  const settings = useSheet('settings');

  const home = homePath(locale);
  const play = playPath(locale);
  const inGame = pathname === play && screen === 'game';

  useEffect(() => {
    if (inGame) return;
    const root = document.documentElement;
    root.classList.add('has-tabbar');
    return () => root.classList.remove('has-tabbar');
  }, [inGame]);

  if (inGame) return null;

  const isActive = (to: string) => (to === home ? pathname === home : pathname.startsWith(to));

  return (
    <>
      {/* Keeps the end of every page clear of the bar. */}
      <div aria-hidden className="tabbar-spacer md:hidden" />
      <nav className="tabbar md:hidden" aria-label={t('app.tabs')}>
        <div className="mx-auto grid h-[var(--tabbar-h)] max-w-lg grid-cols-5 items-stretch px-1">
          <Tab
            to={home}
            icon={HomeIcon}
            label={t('nav.home')}
            active={!settings.open && isActive(home)}
          />
          <Tab
            to={blogPath(locale)}
            icon={BookOpenIcon}
            label={t('nav.blog')}
            active={!settings.open && isActive(blogPath(locale))}
          />
          <PlayTab to={play} label={t('nav.play')} active={!settings.open && isActive(play)} />
          <Tab
            to={profilePath(locale)}
            icon={UserRoundIcon}
            label={t('nav.profile')}
            active={!settings.open && isActive(profilePath(locale))}
          />
          <button
            type="button"
            onClick={settings.show}
            aria-haspopup="dialog"
            aria-expanded={settings.open}
            className="tab-item"
            data-active={settings.open || undefined}
          >
            <TabIcon icon={Settings2Icon} active={settings.open} />
            <span className="tab-label">{t('nav.settings')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

/** Re-tapping the tab you are already on scrolls back to the top, as in iOS. */
function scrollTopIfActive(active: boolean) {
  if (active) window.scrollTo({ top: 0, behavior: 'smooth' });
}

function Tab({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={() => scrollTopIfActive(active)}
      aria-current={active ? 'page' : undefined}
      className="tab-item"
      data-active={active || undefined}
    >
      <TabIcon icon={icon} active={active} />
      <span className="tab-label">{label}</span>
    </Link>
  );
}

function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span className="relative flex h-8 w-14 items-center justify-center">
      {active && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 rounded-full bg-brand-500/15"
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        />
      )}
      <Icon className="relative h-[1.35rem] w-[1.35rem]" strokeWidth={active ? 2.4 : 2} />
    </span>
  );
}

/**
 * The centre action: the one thing this app is for, one thumb-reach away.
 * It stays inside the bar rather than bulging above it — the anchored ad sits
 * right on top of the bar, and a raised button would cover part of it.
 */
function PlayTab({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      onClick={() => scrollTopIfActive(active)}
      aria-current={active ? 'page' : undefined}
      className="tab-item"
      data-active={active || undefined}
    >
      <span
        // `-mt-1`: drawn at 36px but laid out at the 32px of the other icons,
        // growing upwards only, so every label sits on the same line.
        className={`-mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-[#ffffff] shadow-glow transition-transform ${
          active ? 'ring-2 ring-brand-400/50 ring-offset-0' : ''
        }`}
      >
        {/* Physical margin: a play triangle points right in every script, so
            its optical-centering nudge must not flip under RTL. */}
        <PlayIcon className="ml-0.5 h-5 w-5" fill="currentColor" strokeWidth={1.5} />
      </span>
      <span className="tab-label">{label}</span>
    </Link>
  );
}
