/**
 * useInstallPrompt — what the settings sheet can offer to install the app.
 *
 * Chromium browsers fire `beforeinstallprompt` once the page qualifies as an
 * installable app, and the event is the only handle for showing the install
 * dialog from our own button. It can fire before React has mounted anything,
 * so the listener is attached when this module is first evaluated and the
 * event is kept at module scope. Its default isn't prevented: the browser's
 * own install affordance stays exactly as it was, this only adds a second way
 * in.
 *
 * Safari has no such event. On iOS the only route is Share → Add to Home
 * Screen, so there the sheet shows that instruction instead of a button.
 */

import { useEffect, useReducer } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac; the touch points give it away.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function useInstallPrompt() {
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  const standalone = isStandalone();

  const promptInstall = async () => {
    const event = deferred;
    if (!event) return;
    try {
      await event.prompt();
      await event.userChoice;
    } catch {
      /* already shown, or the browser withdrew it */
    }
    // An event can only be prompted once.
    deferred = null;
    notify();
  };

  return {
    canPrompt: !!deferred && !standalone,
    showIosHint: !deferred && !standalone && isIos(),
    promptInstall,
  };
}
