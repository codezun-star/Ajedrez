/**
 * EloChart — a compact, dependency-free SVG line chart of the player's rating
 * over time. Uses a viewBox so it scales fluidly, with a soft gradient area
 * fill under the line and dots on each sampled game.
 */

import { useMemo } from 'react';

interface EloChartProps {
  data: { date: number; elo: number }[];
}

export function EloChart({ data }: EloChartProps) {
  const { path, area, points, width, height } = useMemo(() => {
    const width = 320;
    const height = 120;
    const padding = 8;

    if (data.length === 0) {
      return { path: '', area: '', points: [], width, height };
    }

    const elos = data.map((d) => d.elo);
    const min = Math.min(...elos) - 20;
    const max = Math.max(...elos) + 20;
    const range = Math.max(1, max - min);
    const n = data.length;

    const x = (i: number) => padding + (i / Math.max(1, n - 1)) * (width - padding * 2);
    const y = (elo: number) => padding + (1 - (elo - min) / range) * (height - padding * 2);

    const points = data.map((d, i) => ({ x: x(i), y: y(d.elo), elo: d.elo }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area = `${path} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${points[0].x.toFixed(1)} ${height - padding} Z`;

    return { path, area, points, width, height };
  }, [data]);

  if (data.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center text-sm text-slate-500">
        Juega algunas partidas para ver tu progreso de ELO.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="eloArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4361ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4361ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#eloArea)" />
      <path d={path} fill="none" stroke="#6a8dff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3.5 : 2} fill={i === points.length - 1 ? '#ffc857' : '#9db9ff'} />
      ))}
    </svg>
  );
}
