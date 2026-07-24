/**
 * useIsWide — true when the board and side panel should sit side-by-side.
 *
 * That happens on desktop (≥1024px) OR whenever the viewport is in landscape
 * (wider than tall), which covers a phone the user has rotated. In portrait we
 * stack the board on top and the panel below. Recomputed on resize and
 * orientation change.
 */

import { useEffect, useState } from 'react';

function compute(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 1024 || window.innerWidth > window.innerHeight;
}

export function useIsWide(): boolean {
  const [wide, setWide] = useState(compute);

  useEffect(() => {
    const onChange = () => setWide(compute());
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);

  return wide;
}
