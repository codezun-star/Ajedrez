/**
 * useSound — lightweight sound effects synthesized with the Web Audio API.
 *
 * We generate tones on the fly instead of shipping audio files: it keeps the
 * bundle tiny, avoids network requests, and gives a clean, consistent
 * "chess-app" feel. All playback respects the global mute setting.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export type SoundName =
  | 'move'
  | 'capture'
  | 'castle'
  | 'check'
  | 'promote'
  | 'select'
  | 'illegal'
  | 'start'
  | 'win'
  | 'lose'
  | 'draw';

interface Tone {
  freq: number;
  duration: number;
  type: OscillatorType;
  delay?: number;
  gain?: number;
}

/** Each effect is a small sequence of tones (a mini-arpeggio). */
const RECIPES: Record<SoundName, Tone[]> = {
  select: [{ freq: 440, duration: 0.04, type: 'sine', gain: 0.12 }],
  move: [{ freq: 320, duration: 0.07, type: 'triangle', gain: 0.16 }],
  capture: [
    { freq: 200, duration: 0.06, type: 'square', gain: 0.16 },
    { freq: 140, duration: 0.1, type: 'sawtooth', delay: 0.03, gain: 0.14 },
  ],
  castle: [
    { freq: 300, duration: 0.07, type: 'triangle', gain: 0.16 },
    { freq: 400, duration: 0.08, type: 'triangle', delay: 0.07, gain: 0.16 },
  ],
  check: [
    { freq: 660, duration: 0.08, type: 'sine', gain: 0.18 },
    { freq: 880, duration: 0.1, type: 'sine', delay: 0.08, gain: 0.16 },
  ],
  promote: [
    { freq: 523, duration: 0.09, type: 'sine', gain: 0.16 },
    { freq: 659, duration: 0.09, type: 'sine', delay: 0.09, gain: 0.16 },
    { freq: 784, duration: 0.12, type: 'sine', delay: 0.18, gain: 0.16 },
  ],
  illegal: [{ freq: 130, duration: 0.12, type: 'sawtooth', gain: 0.12 }],
  start: [
    { freq: 392, duration: 0.1, type: 'triangle', gain: 0.16 },
    { freq: 523, duration: 0.12, type: 'triangle', delay: 0.1, gain: 0.16 },
  ],
  win: [
    { freq: 523, duration: 0.12, type: 'sine', gain: 0.18 },
    { freq: 659, duration: 0.12, type: 'sine', delay: 0.12, gain: 0.18 },
    { freq: 784, duration: 0.12, type: 'sine', delay: 0.24, gain: 0.18 },
    { freq: 1047, duration: 0.22, type: 'sine', delay: 0.36, gain: 0.18 },
  ],
  lose: [
    { freq: 392, duration: 0.16, type: 'triangle', gain: 0.16 },
    { freq: 311, duration: 0.16, type: 'triangle', delay: 0.16, gain: 0.16 },
    { freq: 233, duration: 0.3, type: 'triangle', delay: 0.32, gain: 0.16 },
  ],
  draw: [
    { freq: 440, duration: 0.14, type: 'sine', gain: 0.16 },
    { freq: 440, duration: 0.2, type: 'sine', delay: 0.18, gain: 0.14 },
  ],
};

export function useSound() {
  const muted = useGameStore((s) => s.settings.muted);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;
      const ctx = getCtx();
      if (!ctx) return;
      // Browsers start the context suspended until a user gesture.
      if (ctx.state === 'suspended') void ctx.resume();

      const now = ctx.currentTime;
      for (const tone of RECIPES[name]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + (tone.delay ?? 0);
        const peak = tone.gain ?? 0.15;

        osc.type = tone.type;
        osc.frequency.setValueAtTime(tone.freq, start);
        // Quick attack, exponential decay → a soft "blip" rather than a click.
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + tone.duration + 0.02);
      }
    },
    [muted, getCtx],
  );

  // Release the audio context on unmount.
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    };
  }, []);

  return play;
}
