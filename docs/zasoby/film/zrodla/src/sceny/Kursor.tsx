// The pointer of scenes 4 and 5: the same arrow scene 3 draws inside Panel.tsx (a light body, a
// dark edge, a ring at its tip on a click), with a helper that walks it through timed stops.
// Panel.tsx keeps its own copy: scenes 1–3 were accepted as they are and are not redrawn (E4).
import { interpolate } from 'remotion';
import { ROOT, THEME } from '../rdzen';
import type { Punkt } from '../kamera';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

/** `click` 0..1 rings its tip. */
export const Kursor = ({ at, click, opacity }: { at: Punkt, click: number, opacity: number }) => (
  <div style={{ position: 'absolute', left: at.x, top: at.y, opacity, pointerEvents: 'none' }}>
    {click > 0 && click < 1 ? (
      <div style={{ position: 'absolute', left: -26 * click, top: -26 * click, width: 52 * click, height: 52 * click, borderRadius: '50%', border: `3px solid ${THEME.mark}`, opacity: 1 - click }} />
    ) : null}
    <svg width={34} height={46} viewBox="0 0 17 23" style={{ display: 'block', transform: click > 0 && click < 0.5 ? 'scale(0.9)' : undefined, transformOrigin: '0 0' }}>
      <path d="M1 1 L1 18 L5.2 14.2 L8 21 L11 19.8 L8.2 13.2 L14 13.2 Z" fill={ROOT.kartka} stroke={ROOT.txt} strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  </div>
);

/** Where the pointer is at frame `f` on its way through `stops` ([frame, point], in time order). */
export function droga(f: number, stops: readonly (readonly [number, Punkt])[]): Punkt {
  const first = stops[0];
  if (!first) return { x: 0, y: 0 };
  let at = first[1];
  for (let i = 1; i < stops.length; i++) {
    const [a, pa] = stops[i - 1] ?? first;
    const [b, pb] = stops[i] ?? first;
    if (f >= a) {
      const k = ease(f, a, b);
      at = { x: pa.x + (pb.x - pa.x) * k, y: pa.y + (pb.y - pa.y) * k };
    }
  }
  return at;
}

/** A click 0..1 over the 14 frames after `at`, 0 outside them. */
export const klik = (f: number, at: number): number => (f >= at && f < at + 14 ? (f - at) / 14 : 0);
