/**
 * AdRail — a sticky vertical unit in the margin beside an article.
 *
 * Only rendered from `2xl` up, where the reading column leaves real empty
 * margin: below that the rail would either squeeze the text or overlap it.
 * It is pinned to the viewport rather than parked in the flow, so it stays
 * beside the reader for the whole article instead of scrolling away after the
 * first screen.
 */

import { AdSlot } from './AdSlot';

export function AdRail({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className={`fixed top-28 z-30 hidden w-[160px] 2xl:block ${
        side === 'left' ? 'left-6' : 'right-6'
      }`}
    >
      <AdSlot ladder="rail" maxHeight={620} />
    </div>
  );
}
