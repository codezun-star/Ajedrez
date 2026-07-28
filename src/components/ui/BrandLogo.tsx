/**
 * BrandLogo — the botAgedrez lockup (knight + board + wordmark) as an image.
 *
 * The artwork ships in two files because the wordmark's "bot" is near-black
 * navy: on the dark surface it would disappear, so `logo-dark.png` carries a
 * lightened wordmark and a slightly lifted knight. Only one of the two is ever
 * rendered — the other is `display:none`, so screen readers announce the alt
 * text exactly once.
 *
 * Callers set the height (`h-14`, `h-32`, …); the width follows the aspect
 * ratio.
 */

const WIDTH = 411;
const HEIGHT = 353;

export function BrandLogo({ className = '' }: { className?: string }) {
  const common = `w-auto max-w-full object-contain select-none ${className}`;
  return (
    <>
      <img
        src="/logo.png"
        alt="botAgedrez"
        width={WIDTH}
        height={HEIGHT}
        draggable={false}
        className={`${common} dark:hidden`}
      />
      <img
        src="/logo-dark.png"
        alt="botAgedrez"
        width={WIDTH}
        height={HEIGHT}
        draggable={false}
        className={`hidden ${common} dark:block`}
      />
    </>
  );
}
