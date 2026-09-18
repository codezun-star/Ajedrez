/**
 * BrandLogo — the botAgedrez lockup (knight + board + wordmark) as an image.
 *
 * The artwork ships in two files because the wordmark's "bot" is near-black
 * navy: on the dark surface it would disappear, so `logo-dark.png` carries a
 * lightened wordmark and a slightly lifted knight.
 *
 * Only the file for the active theme is rendered. Rendering both and hiding one
 * with `display:none` looked equivalent, but a hidden `<img>` with a `src` is
 * still fetched — so every page downloaded ~190 KB of logo to show 95 KB of it,
 * on the critical path, twice over.
 *
 * Callers set the height (`h-14`, `h-32`, …); the width follows the aspect
 * ratio. `priority` marks the instance that is the page's largest element above
 * the fold — the hero — so the browser fetches it ahead of the rest of the
 * page. Every instance points at the same file, so the header and footer copies
 * cost no extra request; there is nothing to lazy-load.
 */

import { useGameStore } from '@/store/gameStore';

const WIDTH = 411;
const HEIGHT = 353;

export function BrandLogo({
  className = '',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const theme = useGameStore((s) => s.settings.theme);
  return (
    <img
      src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
      alt="botAgedrez"
      width={WIDTH}
      height={HEIGHT}
      draggable={false}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={`w-auto max-w-full object-contain select-none ${className}`}
    />
  );
}
