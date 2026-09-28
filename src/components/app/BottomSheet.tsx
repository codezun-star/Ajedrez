/**
 * BottomSheet — the mobile menu surface: slides up from the bottom edge over a
 * dimmed page, and goes away by dragging it down, tapping outside, Escape, the
 * close button or the phone's back gesture (see `useSheet`).
 *
 * Only the handle and title row start a drag. The body scrolls on its own, and
 * letting a drag begin anywhere would fight that scroll on every flick.
 *
 * Rendered into `document.body` so no transformed ancestor (the screens fade
 * and slide in with Framer Motion) can become the containing block of its
 * `position: fixed` layer.
 */

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useI18n } from '@/i18n';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** How far (px) or how fast (px/s) a downward drag must go to dismiss. */
const DISMISS_OFFSET = 96;
const DISMISS_VELOCITY = 500;

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const { t } = useI18n();
  const controls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);

  // While open: Escape closes, the page behind stops scrolling, focus moves
  // into the sheet and returns to whatever opened it afterwards.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="sheet-panel absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 380 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) onClose();
            }}
          >
            <div
              className="shrink-0 cursor-grab touch-none select-none px-4 pb-2 pt-2.5 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-400/40" />
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <h2 className="min-w-0 truncate font-display text-lg font-bold text-white">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={t('app.close')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors active:bg-white/20"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="sheet-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
