/** Time-control presets. `initialMs === 0` means an untimed game. */

export type TimeControlId = 'unlimited' | 'blitz' | 'rapid' | 'classical';

export interface TimeControl {
  id: TimeControlId;
  label: string;
  detail: string;
  initialMs: number;
  incrementMs: number;
  icon: string;
}

export const TIME_CONTROLS: Record<TimeControlId, TimeControl> = {
  unlimited: {
    id: 'unlimited',
    label: 'Sin reloj',
    detail: 'Sin límite de tiempo',
    initialMs: 0,
    incrementMs: 0,
    icon: '∞',
  },
  blitz: {
    id: 'blitz',
    label: 'Blitz',
    detail: '5 min + 3 s',
    initialMs: 5 * 60 * 1000,
    incrementMs: 3 * 1000,
    icon: '⚡',
  },
  rapid: {
    id: 'rapid',
    label: 'Rápida',
    detail: '10 min + 5 s',
    initialMs: 10 * 60 * 1000,
    incrementMs: 5 * 1000,
    icon: '🏃',
  },
  classical: {
    id: 'classical',
    label: 'Clásica',
    detail: '30 min',
    initialMs: 30 * 60 * 1000,
    incrementMs: 0,
    icon: '♟️',
  },
};

export const TIME_CONTROL_LIST = Object.values(TIME_CONTROLS);
