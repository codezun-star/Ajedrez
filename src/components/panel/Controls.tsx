/**
 * Controls — the row of in-game actions: take back, flip board, resign and a
 * copy-PGN shortcut. Plus a compact readout of the AI's last search.
 */

import { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { exportPgn } from '@/engine/pgn';
import { UndoIcon, FlipIcon, FlagIcon, CopyIcon } from '@/components/ui/Icons';
import { formatAdvantage } from '@/utils/format';

/** Copy text to the clipboard, with a legacy fallback for blocked contexts. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy method */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function Controls() {
  const undo = useGameStore((s) => s.undo);
  const flipBoard = useGameStore((s) => s.flipBoard);
  const resign = useGameStore((s) => s.resign);
  const aiThinking = useGameStore((s) => s.aiThinking);
  const isOver = useGameStore((s) => s.status.isOver);
  const moves = useGameStore((s) => s.moves);
  const aiInfo = useGameStore((s) => s.aiInfo);
  const status = useGameStore((s) => s.status);

  const [confirmResign, setConfirmResign] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');

  const canUndo = moves.length > 0 && !aiThinking && !isOver;

  const handleCopyPgn = async () => {
    if (moves.length === 0) return;
    const pgn = exportPgn(moves, status.result);
    const ok = await copyToClipboard(pgn);
    setCopyState(ok ? 'ok' : 'fail');
    setTimeout(() => setCopyState('idle'), 1800);
  };

  const copyLabel = copyState === 'ok' ? '¡Copiado!' : copyState === 'fail' ? 'Error' : 'Copiar PGN';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <ControlButton label="Deshacer" onClick={undo} disabled={!canUndo} icon={<UndoIcon className="h-5 w-5" />} />
        <ControlButton label="Voltear" onClick={flipBoard} icon={<FlipIcon className="h-5 w-5" />} />
        <ControlButton
          label={copyLabel}
          onClick={handleCopyPgn}
          disabled={moves.length === 0}
          icon={copyState === 'ok' ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
          highlight={copyState === 'ok'}
          danger={copyState === 'fail'}
        />
        <ControlButton
          label={confirmResign ? '¿Seguro?' : 'Rendirse'}
          onClick={() => {
            if (isOver) return;
            if (confirmResign) {
              resign();
              setConfirmResign(false);
            } else {
              setConfirmResign(true);
              setTimeout(() => setConfirmResign(false), 3000);
            }
          }}
          disabled={isOver}
          icon={<FlagIcon className="h-5 w-5" />}
          danger={confirmResign}
        />
      </div>
      {confirmResign && (
        <p className="-mt-1 text-center text-[0.7rem] text-red-300">
          Pulsa otra vez para confirmar la rendición
        </p>
      )}

      {aiInfo && (
        <div className="hidden items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-xs text-slate-400 sm:flex">
          <span>
            Profundidad <b className="text-slate-200">{aiInfo.depth}</b>
          </span>
          <span>
            {(aiInfo.nodes / 1000).toFixed(0)}k nodos
          </span>
          <span title="Evaluación desde el punto de vista de la IA">
            Eval IA{' '}
            <b className={aiInfo.score >= 0 ? 'text-emerald-300' : 'text-red-300'}>
              {formatAdvantage(aiInfo.score)}
            </b>
          </span>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  icon,
  danger,
  highlight,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  danger?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[0.7rem] font-medium
                  transition-all duration-200 active:scale-95 disabled:opacity-30 ${
                    danger
                      ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/40'
                      : highlight
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
    >
      <IconButtonInner>{icon}</IconButtonInner>
      <span>{label}</span>
    </button>
  );
}

function IconButtonInner({ children }: { children: React.ReactNode }) {
  return <span className="flex h-5 items-center justify-center">{children}</span>;
}
