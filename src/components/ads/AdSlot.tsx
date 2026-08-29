/**
 * AdSlot — one banner, isolated in its own frame and sized to the room it got.
 *
 * Three problems this solves, all of which the raw ad tag has:
 *
 *   1. **It would kill the app.** The network's `invoke.js` renders with
 *      `document.write`, which after load replaces the entire document — in a
 *      single-page app that means a blank screen. Each unit therefore runs
 *      inside its own `srcdoc` iframe, where a `document.write` only ever
 *      rewrites that frame.
 *   2. **Fixed sizes on a fluid site.** A 728×90 tag on a phone overflows and
 *      the page scrolls sideways. A slot measures the width it actually
 *      received and takes the widest unit from its ladder that fits, so the
 *      same slot is a leaderboard on a desktop and a 320×50 strip on a phone.
 *   3. **Layout shift.** The box is reserved at its final height before the
 *      creative loads, so an ad arriving late never pushes the paragraph the
 *      reader is on down the page.
 *
 * Slots also stay unmounted until they are near the viewport: the ad call only
 * fires for a slot the reader will actually reach, which keeps the first paint
 * free of third-party work and counts as a viewable impression when it does
 * fire.
 *
 * On the sandbox: the frame gets `allow-same-origin` because the networks
 * treat a null-origin request as invalid traffic and stop filling it. What it
 * deliberately does *not* get is top-level navigation, so a creative cannot
 * yank the reader out of a game in progress; `<base target="_blank">` sends
 * legitimate clicks to a new tab for the same reason.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AD_LADDERS, AD_UNITS, AdLadder, AdUnit, BANNER_HOST } from '@/constants/ads';
import { useI18n } from '@/i18n';

/** How far outside the viewport a slot starts loading. */
const PRELOAD_MARGIN = '600px';

const SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';

function frameDoc(unit: AdUnit): string {
  const options = JSON.stringify({
    key: unit.key,
    format: 'iframe',
    height: unit.height,
    width: unit.width,
    params: {},
  });
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<base target="_blank">',
    '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>',
    '</head><body>',
    `<script>window.atOptions=${options};</script>`,
    `<script src="${BANNER_HOST}/${unit.key}/invoke.js"></script>`,
    '</body></html>',
  ].join('');
}

/** The widest unit in `ladder` that fits the measured box, if any. */
function pick(ladder: AdLadder, width: number, maxHeight?: number): AdUnit | null {
  for (const id of AD_LADDERS[ladder]) {
    const unit = AD_UNITS[id];
    if (unit.width <= width && (!maxHeight || unit.height <= maxHeight)) return unit;
  }
  return null;
}

export interface AdSlotProps {
  /** Which family of sizes this position can take. */
  ladder?: AdLadder;
  /** Cap for positions with a real vertical budget (a rail, the game panel). */
  maxHeight?: number;
  /** Extra classes on the outer box — spacing belongs to the caller. */
  className?: string;
  /** Hide the "Advertisement" caption (the anchor bar labels itself). */
  bare?: boolean;
}

export function AdSlot({ ladder = 'horizontal', maxHeight, className = '', bare }: AdSlotProps) {
  const { t } = useI18n();
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [near, setNear] = useState(false);

  // Measure the room this slot was given, and re-measure on rotation/resize.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Only call the network once the slot is within reach of the viewport.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const unit = useMemo(
    () => (width > 0 ? pick(ladder, width, maxHeight) : null),
    [ladder, width, maxHeight],
  );

  // Nothing in the ladder fits (a very narrow column): render nothing at all
  // rather than a box that overflows its parent.
  if (width > 0 && !unit) return null;

  return (
    <div ref={boxRef} className={`ad-slot ${className}`} aria-label={t('ads.label')} role="complementary">
      {!bare && unit && <span className="ad-label">{t('ads.label')}</span>}
      <div
        className="ad-frame"
        style={{ width: unit?.width, height: unit?.height, minHeight: unit ? undefined : 0 }}
      >
        {unit && near && (
          <iframe
            key={unit.key}
            title={t('ads.label')}
            width={unit.width}
            height={unit.height}
            sandbox={SANDBOX}
            scrolling="no"
            frameBorder={0}
            style={{ display: 'block', border: 0, width: unit.width, height: unit.height }}
            srcDoc={frameDoc(unit)}
          />
        )}
      </div>
    </div>
  );
}
