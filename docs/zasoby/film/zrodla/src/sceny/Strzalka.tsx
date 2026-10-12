// A short arrow drawn by hand from one point of the stage to another: a soft curve and a two-stroke
// head, in the note's ink. Decorative geometry; nothing of it is text.
import { INK, SCALE } from '../tokeny';
import type { Punkt } from '../kamera';

const S = SCALE;

interface StrzalkaProps { from: Punkt, to: Punkt, drawn: number, bend?: number }

export const Strzalka = ({ from, to, drawn, bend = 0.3 }: StrzalkaProps) => {
  const left = Math.min(from.x, to.x) - 40;
  const top = Math.min(from.y, to.y) - 40;
  const a = { x: from.x - left, y: from.y - top };
  const b = { x: to.x - left, y: to.y - top };
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const c = { x: a.x + dx / 2 - dy * bend, y: a.y + dy / 2 + dx * bend };
  const len = Math.hypot(dx, dy) || 1;
  const ux = (b.x - c.x) / Math.hypot(b.x - c.x, b.y - c.y);
  const uy = (b.y - c.y) / Math.hypot(b.x - c.x, b.y - c.y);
  const h = Math.min(16 * S, len * 0.35);
  const wing = (sign: number) => `M ${(b.x - ux * h - uy * h * 0.6 * sign).toFixed(2)} ${(b.y - uy * h + ux * h * 0.6 * sign).toFixed(2)} L ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  const head = Math.max(0, (drawn - 0.8) / 0.2);
  const stroke = { fill: 'none', stroke: INK.note, strokeWidth: 2.2 * S, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width={Math.abs(dx) + 80} height={Math.abs(dy) + 80} style={{ position: 'absolute', left, top, overflow: 'visible', pointerEvents: 'none' }}>
      <path d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawn} opacity={drawn > 0 ? 1 : 0} {...stroke} />
      <path d={`${wing(1)} ${wing(-1)}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - head} opacity={head > 0 ? 1 : 0} {...stroke} />
    </svg>
  );
};
