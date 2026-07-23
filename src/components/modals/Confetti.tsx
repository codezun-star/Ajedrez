/**
 * Confetti — a lightweight celebratory burst rendered with Framer Motion.
 * No canvas, no dependency: a fixed number of colored shards animate outward
 * and fall. Rendered only briefly when the player wins.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#f5a623', '#4361ff', '#34d399', '#f87171', '#ffc857', '#a78bfa'];

interface Shard {
  id: number;
  x: number; // vw offset from center
  delay: number;
  rotate: number;
  color: string;
  size: number;
  drift: number;
}

export function Confetti({ count = 90 }: { count?: number }) {
  const shards = useMemo<Shard[]>(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        x: (Math.random() - 0.5) * 100,
        delay: Math.random() * 0.6,
        rotate: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 40,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {shards.map((s) => (
        <motion.div
          key={s.id}
          className="absolute left-1/2 top-0"
          style={{ width: s.size, height: s.size * 0.6, backgroundColor: s.color, borderRadius: 2 }}
          initial={{ x: `${s.x}vw`, y: '-10vh', opacity: 1, rotate: 0 }}
          animate={{ x: `${s.x + s.drift}vw`, y: '110vh', opacity: [1, 1, 0.9, 0], rotate: s.rotate }}
          transition={{ duration: 2.4 + Math.random(), delay: s.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
