/**
 * PieceGuide — a beginner-friendly reference explaining what each piece is,
 * how it moves and its approximate value. Shown in a tab of the side panel so
 * new players can learn the rules without leaving the game.
 */

import { PieceType } from '@/engine/types';
import { PieceGlyph } from '@/components/board/PieceGlyph';

interface GuideEntry {
  type: PieceType;
  name: string;
  value: string;
  how: string;
}

const GUIDE: GuideEntry[] = [
  {
    type: 'p',
    name: 'Peón',
    value: '1 punto',
    how: 'Avanza 1 casilla (o 2 en su primer movimiento). Captura en diagonal. Si llega al otro extremo, corona y se convierte en otra pieza.',
  },
  {
    type: 'n',
    name: 'Caballo',
    value: '3 puntos',
    how: 'Salta en forma de “L”: dos casillas en una dirección y una perpendicular. Es la única pieza que puede saltar sobre otras.',
  },
  {
    type: 'b',
    name: 'Alfil',
    value: '3 puntos',
    how: 'Se mueve en diagonal cualquier número de casillas. Cada alfil se queda siempre en su color.',
  },
  {
    type: 'r',
    name: 'Torre',
    value: '5 puntos',
    how: 'Se mueve en línea recta, horizontal o vertical, cualquier número de casillas. Participa en el enroque con el rey.',
  },
  {
    type: 'q',
    name: 'Dama',
    value: '9 puntos',
    how: 'La pieza más poderosa: combina torre y alfil. Se mueve en recta y en diagonal, cualquier distancia.',
  },
  {
    type: 'k',
    name: 'Rey',
    value: 'Invaluable',
    how: 'Se mueve 1 casilla en cualquier dirección. El objetivo del juego es atraparlo: si está en jaque y no puede escapar, es jaque mate.',
  },
];

export function PieceGuide() {
  return (
    <div className="scroll-slim h-full min-h-0 overflow-y-auto pr-1">
      <p className="mb-3 text-xs text-slate-400">
        ¿Nuevo en el ajedrez? Así se mueve cada pieza:
      </p>
      <ul className="space-y-2">
        {GUIDE.map((p) => (
          <li key={p.type} className="flex gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-board-light p-1">
              <PieceGlyph type={p.type} color="w" className="h-full w-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-slate-100">{p.name}</span>
                <span className="text-[0.7rem] font-medium text-brand-300">{p.value}</span>
              </div>
              <p className="mt-0.5 text-xs leading-snug text-slate-400">{p.how}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-xl bg-brand-500/10 p-3 text-xs leading-snug text-slate-300 ring-1 ring-brand-400/20">
        <p className="mb-1 font-semibold text-brand-200">Jugadas especiales</p>
        <p>
          <b>Enroque:</b> el rey y una torre se mueven a la vez para poner el rey a salvo.{' '}
          <b>Captura al paso:</b> un peón puede capturar a otro que acaba de avanzar dos casillas a su
          lado. <b>Coronación:</b> un peón que llega al final se convierte en dama (u otra pieza).
        </p>
      </div>
    </div>
  );
}
