/**
 * Loading affordances shown while a route's code chunk is fetched.
 *
 * The game (engine + AI worker + board) and the blog (markdown of twenty
 * articles) are loaded on demand, so the landing page no longer ships them.
 * That download is the one moment the app has nothing to show, which is what
 * these cover: a spinner for content pages, and a board-shaped skeleton for the
 * game so the layout doesn't jump when it arrives.
 */

/** A small indeterminate spinner. Inherits `currentColor`. */
export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Centred spinner for a whole page. `label` is announced to screen readers. */
export function ScreenLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div
      className="app-aura flex min-h-[60vh] w-full items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-brand-400">
        <Spinner className="h-8 w-8" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

/**
 * The game screen's shape, drawn while its chunk loads: two player strips, a
 * square board and the side panel. Mirrors GameScreen's layout so the real UI
 * drops straight into place.
 */
export function GameSkeleton() {
  return (
    <div
      className="mx-auto flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Cargando la partida…</span>

      <div className="mb-2 flex shrink-0 items-center justify-between">
        <div className="h-6 w-28 animate-pulse rounded-lg bg-white/10" />
        <div className="flex gap-2">
          <div className="h-10 w-16 animate-pulse rounded-xl bg-white/10" />
          <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
          <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
          <StripSkeleton />
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="aspect-square w-full max-h-full animate-pulse rounded-2xl bg-white/10 ring-1 ring-black/20" />
          </div>
          <StripSkeleton />
        </div>
        <div className="h-[40dvh] min-h-[16rem] shrink-0 lg:h-auto lg:w-[20rem] xl:w-[22rem]">
          <div className="card flex h-full flex-col gap-3 p-3 sm:p-4">
            <div className="h-9 w-full animate-pulse rounded-xl bg-white/10" />
            <div className="min-h-0 flex-1 animate-pulse rounded-xl bg-white/5" />
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StripSkeleton() {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-xl bg-white/10 sm:h-10 sm:w-10" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
    </div>
  );
}
