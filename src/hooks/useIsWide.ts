/**
 * useIsWide — true when the board and side panel should sit side-by-side.
 *
 * That happens on desktop (≥1024px) OR whenever the viewport is in landscape
 * (wider than tall), which covers a phone the user has rotated. In portrait we
 * stack the board on top and the panel below. Recomputed on resize and
 * orientation change.
 */

import { useEffect, useState } from 'react';

/** Below this the viewport is too short for a full-height chrome + board. */
const SHORT_VIEWPORT = 560;

function compute(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 1024 || window.innerWidth > window.innerHeight;
}

function computeShort(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight < SHORT_VIEWPORT;
}

function useViewportFlag(read: () => boolean): boolean {
  const [value, setValue] = useState(read);

  useEffect(() => {
    const onChange = () => setValue(read());
    onChange();
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

export function useIsWide(): boolean {
  return useViewportFlag(compute);
}

/**
 * True on a viewport with very little vertical room — in practice a phone held
 * in landscape. There the header and both player strips would eat most of the
 * height the board needs, so the game screen rearranges instead of shrinking.
 */
export function useIsShort(): boolean {
  return useViewportFlag(computeShort);
}
