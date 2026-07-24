/**
 * PieceGuide — a beginner-friendly reference explaining what each piece is,
 * how it moves and its approximate value. Fully translated.
 */

import { PieceType } from '@/engine/types';
import { useI18n } from '@/i18n';
import { PieceGlyph } from '@/components/board/PieceGlyph';

interface GuideEntry {
  type: PieceType;
  key: string;
  value: string; // pre-resolved value label
}

export function PieceGuide() {
  const { t } = useI18n();

  const entries: GuideEntry[] = [
    { type: 'p', key: 'pawn', value: t('guide.pts', { n: 1 }) },
    { type: 'n', key: 'knight', value: t('guide.pts', { n: 3 }) },
    { type: 'b', key: 'bishop', value: t('guide.pts', { n: 3 }) },
    { type: 'r', key: 'rook', value: t('guide.pts', { n: 5 }) },
    { type: 'q', key: 'queen', value: t('guide.pts', { n: 9 }) },
    { type: 'k', key: 'king', value: t('guide.invaluable') },
  ];

  return (
    <div className="scroll-slim h-full min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
      <p className="mb-3 text-xs text-slate-400">{t('guide.intro')}</p>
      <ul className="space-y-2">
        {entries.map((p) => (
          <li key={p.type} className="flex gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-board-light p-1">
              <PieceGlyph type={p.type} color="w" className="h-full w-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-slate-100">{t(`guide.${p.key}`)}</span>
                <span className="text-[0.7rem] font-medium text-brand-300">{p.value}</span>
              </div>
              <p className="mt-0.5 text-xs leading-snug text-slate-400">{t(`guide.${p.key}How`)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-xl bg-brand-500/10 p-3 text-xs leading-snug text-slate-300 ring-1 ring-brand-400/20">
        <p className="mb-1 font-semibold text-brand-200">{t('guide.specialTitle')}</p>
        <p>{t('guide.specialText')}</p>
      </div>
    </div>
  );
}
