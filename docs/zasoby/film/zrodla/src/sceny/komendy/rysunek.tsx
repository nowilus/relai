// The drawing kit of the props of scene 2 "Komendy": the beats' easing, a sheet of paper, a shadow on the desk and
// a word written on a prop. Geometry is decorative and placed by hand inside the prop's own box
// (W × H); a word on a prop is laid out by the browser inside a box of that geometry (zasada 15).
import type { CSSProperties, ReactNode } from 'react';
import { interpolate } from 'remotion';
import { FONT, PROP } from '../../tokeny';

/** The prop's box: every prop draws in these coordinates. */
export const W = 760;
export const H = 480;
export const STROKE = 5;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0..1 between frames a and b, eased out. */
export const ease = (t: number, a: number, b: number): number =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

/** 0..1 between frames a and b, eased in and out. */
export const glide = (t: number, a: number, b: number): number =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });

/** A damped wobble after frame `at`: 0 before, swings and dies out within `len` frames. */
export const wobble = (t: number, at: number, len = 16): number =>
  t < at || t > at + len ? 0 : Math.sin(((t - at) / len) * Math.PI * 3) * (1 - (t - at) / len);

export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** A point on the quadratic curve a → c → b at k. */
export const arc = (a: [number, number], c: [number, number], b: [number, number], k: number): [number, number] => {
  const u = 1 - k;
  return [u * u * a[0] + 2 * u * k * c[0] + k * k * b[0], u * u * a[1] + 2 * u * k * c[1] + k * k * b[1]];
};

/** The soft shadow an object leaves on the desk. */
export const Cien = ({ cx, cy, rx, ry = 14, opacity = 1 }: { cx: number, cy: number, rx: number, ry?: number, opacity?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={PROP.shadow} opacity={opacity} />
);

interface KartkaProps {
  x: number, // the centre
  y: number,
  w?: number,
  h?: number,
  rot?: number,
  scale?: number,
  opacity?: number,
  lines?: number,
  fill?: string,
  children?: ReactNode,
}

/** A sheet of paper with a few written lines, turned about its centre. */
export const Kartka = ({ x, y, w = 110, h = 140, rot = 0, scale = 1, opacity = 1, lines = 3, fill = PROP.paper, children }: KartkaProps) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
    <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={12} fill={PROP.shadow} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={fill} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
    {Array.from({ length: lines }, (_, i) => (
      <path key={i} d={`M ${-w / 2 + 20} ${-h / 2 + 32 + i * 24} h ${(w - 40) * (i === lines - 1 ? 0.6 : 1)}`} stroke={PROP.inkSoft} strokeWidth={STROKE * 0.7} strokeLinecap="round" />
    ))}
    {children}
  </g>
);

/** 0..1 between frames a and b with a small overshoot: a thing popping onto the desk. */
export const pop = (t: number, a: number, b: number): number => {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const x = (t - a) / (b - a) - 1;
  return 1 + 2.70158 * x * x * x + 1.70158 * x * x;
};

/** A sage tick in a circle: something done. `k` 0..1 pops it in. */
export const Ptaszek = ({ x, y, r = 30, k }: { x: number, y: number, r?: number, k: number }) => (
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={r} fill={PROP.sage} />
      <path d={`M ${-r * 0.45} ${r * 0.02} L ${-r * 0.1} ${r * 0.36} L ${r * 0.48} ${-r * 0.32}`} {...kreska(PROP.paper, r * 0.2)} />
    </g>
  )
);

/** A mustard circle with "!": something to look at. Drawn, not written. */
export const Wykrzyknik = ({ x, y, r = 30, k }: { x: number, y: number, r?: number, k: number }) => (
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <circle r={r} fill={PROP.mustard} />
      <path d={`M 0 ${-r * 0.5} V ${r * 0.12}`} {...kreska(PROP.ink, r * 0.2)} />
      <circle cy={r * 0.45} r={r * 0.11} fill={PROP.ink} />
    </g>
  )
);

/** A clay pin pushed into the desk: it drops from above as `k` goes 0..1. */
export const Pinezka = ({ x, y, k, r = 13 }: { x: number, y: number, k: number, r?: number }) => (
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y - (1 - k) * 70})`} opacity={Math.min(1, k * 3)}>
      <circle r={r} fill={PROP.clay} stroke={PROP.clayDark} strokeWidth={3} />
      <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.28} fill={PROP.paper} opacity={0.7} />
    </g>
  )
);

/** The stroke style of the props: round ends and joins, no fill. */
export const kreska = (color: string = PROP.ink, width: number = STROKE) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

interface NapisNaRekwizycieProps {
  x: number, // the box the word is centred in, in prop coordinates
  y: number,
  w: number,
  h: number,
  size: number,
  color?: string,
  weight?: number,
  font?: string,
  style?: CSSProperties,
  children: ReactNode,
}

/** A word written on a prop: centred by the browser in a box of the prop's geometry. */
export const NapisNaRekwizycie = ({ x, y, w, h, size, color = PROP.ink, weight = 800, font = FONT.ui, style, children }: NapisNaRekwizycieProps) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      fontFamily: font,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);
