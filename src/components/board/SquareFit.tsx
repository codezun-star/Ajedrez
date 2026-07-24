/**
 * SquareFit — centers its child and sizes it to the largest square that fits
 * the available space. This lets the board grow as big as possible in any
 * layout: limited by width in portrait, by height in landscape/desktop, without
 * ever overflowing. Size is measured with a ResizeObserver so it stays correct
 * across rotation and window changes.
 */

import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

export function SquareFit({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize(Math.floor(Math.min(rect.width, rect.height)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex min-h-0 flex-1 items-center justify-center">
      <div style={{ width: size || '100%', height: size || undefined }}>{children}</div>
    </div>
  );
}
