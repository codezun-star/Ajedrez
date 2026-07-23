/**
 * PromotionModal — the piece picker shown when a pawn reaches the last rank.
 * Rendered as a small floating panel over the board; picking a piece completes
 * the move via the store.
 */

import { motion } from 'framer-motion';
import { PieceType } from '@/engine/types';
import { useGameStore } from '@/store/gameStore';
import { PieceGlyph } from './PieceGlyph';

const CHOICES: PieceType[] = ['q', 'r', 'b', 'n'];

export function PromotionModal() {
  const promotion = useGameStore((s) => s.promotion);
  const choosePromotion = useGameStore((s) => s.choosePromotion);
  const cancelPromotion = useGameStore((s) => s.cancelPromotion);

  if (!promotion) return null;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-surface-950/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={(e) => {
        // Click outside the picker cancels.
        if (e.target === e.currentTarget) cancelPromotion();
      }}
    >
      <motion.div
        className="card flex flex-col items-center gap-3 p-5"
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <p className="text-sm font-semibold text-slate-300">Corona tu peón</p>
        <div className="flex gap-2">
          {CHOICES.map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => choosePromotion(type)}
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 p-1.5
                         ring-1 ring-white/10 hover:bg-brand-500/20 hover:ring-brand-400/50"
              aria-label={`Coronar a ${type}`}
            >
              <PieceGlyph type={type} color={promotion.color} className="h-full w-full" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
