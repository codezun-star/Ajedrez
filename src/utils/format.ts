/** Small formatting helpers used across the UI. */

/** Format milliseconds as m:ss, or m:ss.d under 10 s for a blitz feel. */
export function formatClock(ms: number): string {
  if (!Number.isFinite(ms)) return '∞';
  const clamped = Math.max(0, ms);
  const totalSeconds = clamped / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (minutes === 0 && totalSeconds < 10) {
    const tenths = Math.floor((totalSeconds * 10) % 10);
    return `0:${String(seconds).padStart(2, '0')}.${tenths}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Format an epoch timestamp as a short, locale-friendly date. */
export function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Signed centipawn advantage → "+1.5" style pawn string. */
export function formatAdvantage(centipawns: number): string {
  const pawns = centipawns / 100;
  if (pawns === 0) return '';
  return (pawns > 0 ? '+' : '') + pawns.toFixed(pawns % 1 === 0 ? 0 : 1);
}
