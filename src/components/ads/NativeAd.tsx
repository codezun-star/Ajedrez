/**
 * NativeAd — the container-based native block.
 *
 * Unlike the banner units this one does not `document.write`: it looks for a
 * div with one fixed id and appends its grid of recommendation cards into it.
 * Two consequences drive the implementation:
 *
 *   - **The id is global.** Two of these on one page means two containers with
 *     the same id and the script fills whichever it finds first, so a
 *     module-level claim lets exactly one instance be live at a time. Later
 *     ones render nothing instead of fighting over the container.
 *   - **It runs on insert.** The loader executes when its `<script>` is added,
 *     so navigating between routes re-adds the tag and gets a fresh set of
 *     cards. The tag is removed again on unmount so it never runs twice for
 *     one container.
 *
 * Like {@link AdSlot} it waits until it is near the viewport, and it reserves a
 * minimum height so the cards do not shove the page around when they land.
 */

import { useEffect, useRef, useState } from 'react';
import { NATIVE_AD } from '@/constants/ads';
import { useI18n } from '@/i18n';

/** Only one live container per document — the id is fixed by the network. */
let claimed = false;

export function NativeAd({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const [mine, setMine] = useState(false);
  const [near, setNear] = useState(false);

  // Claim the single container slot for this page, if it is still free.
  useEffect(() => {
    if (claimed) return;
    claimed = true;
    setMine(true);
    return () => {
      claimed = false;
    };
  }, []);

  useEffect(() => {
    const el = hostRef.current;
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
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!mine || !near) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = NATIVE_AD.src;
    script.setAttribute('data-cfasync', 'false');
    document.body.appendChild(script);
    return () => {
      script.remove();
      const container = document.getElementById(`container-${NATIVE_AD.id}`);
      if (container) container.innerHTML = '';
    };
  }, [mine, near]);

  if (!mine) return null;

  return (
    <aside ref={hostRef} className={`ad-slot ${className}`} aria-label={t('ads.label')}>
      <span className="ad-label">{t('ads.label')}</span>
      <div
        id={`container-${NATIVE_AD.id}`}
        className="w-full"
        style={{ minHeight: NATIVE_AD.minHeight }}
      />
    </aside>
  );
}
