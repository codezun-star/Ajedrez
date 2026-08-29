/**
 * AdBreak — a full-width ad row between two sections of a marketing page.
 *
 * The pages are built from `max-w-6xl` sections with their own horizontal
 * padding; an ad dropped straight between them would sit against the viewport
 * edge on a phone and float off-grid on a desktop. This wraps a slot in the
 * same measurements the sections use, so a row of ads lines up with the content
 * above and below it instead of looking bolted on.
 */

import { AdLadder } from '@/constants/ads';
import { AdSlot } from './AdSlot';
import { NativeAd } from './NativeAd';

export function AdBreak({
  ladder = 'horizontal',
  native = false,
  className = '',
}: {
  ladder?: AdLadder;
  /** Render the native recommendation block instead of a banner. */
  native?: boolean;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 ${className}`}>
      {native ? <NativeAd /> : <AdSlot ladder={ladder} />}
    </div>
  );
}
