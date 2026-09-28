/**
 * AdAnchor — the bottom anchor bar, pinned above every scrolling page.
 *
 * An anchored unit is seen on every screenful instead of once on the way past,
 * which is why it is the highest-yield position on the site. The cost is that
 * it sits over the content, so three things keep it civil:
 *
 *   - it can be closed, and stays closed for the rest of the browsing session
 *     (a fresh visit brings it back);
 *   - it waits for the page to settle before sliding in, so it never lands on
 *     top of what someone is reading in the first second;
 *   - it leaves a spacer of its own height in the flow, so the footer is still
 *     reachable underneath it.
 *
 * It is deliberately absent from the game screen: that layout is pinned to the
 * viewport and a bar over the bottom rank would cover the board.
 *
 * On a phone it rides on top of the tab bar rather than under it, and flags
 * `<html>` with `has-ad-anchor` while shown so the setup screen's sticky
 * "Play" button can stop above it (see `index.css`).
 */

import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { AdSlot } from './AdSlot';

const DISMISS_KEY = 'botagedrez.v1.adAnchorClosed';
const APPEAR_DELAY = 1500;

function alreadyClosed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function AdAnchor() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alreadyClosed()) return;
    const id = setTimeout(() => setVisible(true), APPEAR_DELAY);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    root.classList.add('has-ad-anchor');
    return () => root.classList.remove('has-ad-anchor');
  }, [visible]);

  const close = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Keeps the last rows of the footer clear of the bar. */}
      <div aria-hidden className="h-[62px] md:h-[102px]" />
      <div className="ad-anchor">
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-center px-3 py-1.5">
          <AdSlot ladder="anchor" bare />
          <button
            type="button"
            onClick={close}
            aria-label={t('ads.close')}
            className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
