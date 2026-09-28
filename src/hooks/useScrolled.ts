/**
 * useScrolled — true once the page has scrolled past `threshold` pixels.
 *
 * Drives the mobile app bar: a hairline and a firmer backdrop appear only when
 * content is actually sliding underneath it, and a page title can wait until
 * the page's own heading has scrolled out of view. Reads are batched to one
 * per frame so a fling doesn't re-render on every scroll event.
 */

import { useEffect, useState } from 'react';

export function useScrolled(threshold = 4): boolean {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > threshold,
  );

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}
