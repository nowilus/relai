// Prop of "Odnoga planu" (relai-branch). The plan's stages ride on a tape; a side idea — one
// mustard card — lifts off it and is pinned on the board beside, to wait for its turn, while the
// tape goes on without stopping.
import { PROP } from '../../tokeny';
import { Cien, H, Pinezka, STROKE, W, arc, ease, glide, kreska, lerp } from './rysunek';

const T = Object.freeze({ lift: [8, 26], pin: [26, 32] });
const TAPE = Object.freeze({ y: 350, left: 60, right: 700 });
const SPEED = 2.2; // px a frame: the tape moves through the whole window
const GAP = 150;
const SIDE = 3; // the card that lifts off
const SPOT: [number, number] = [570, 120]; // where it is pinned

const Karta = ({ x, y, rot = 0, side = false }: { x: number, y: number, rot?: number, side?: boolean }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-46} y={-30} width={92} height={60} rx={10} fill={PROP.shadow} transform="translate(4 6)" />
    <rect x={-46} y={-30} width={92} height={60} rx={10} fill={side ? PROP.paper : PROP.paper2} stroke={side ? PROP.mustard : PROP.ink} strokeWidth={side ? STROKE * 1.1 : STROKE * 0.8} />
    <path d="M -28 -8 h 56 M -28 10 h 34" {...kreska(PROP.inkSoft, 4)} />
  </g>
);

export const Odnoga = ({ t }: { t: number }) => {
  const run = Math.min(75, Math.max(0, t)) * SPEED;
  const lift = glide(t, T.lift[0] ?? 0, T.lift[1] ?? 0);
  // the side card leaves the tape where it stood when the lift began
  const liftAt = (T.lift[0] ?? 0) * SPEED;
  const sideFrom: [number, number] = [TAPE.left + 40 + SIDE * GAP - liftAt, TAPE.y - 32];
  const [sx, sy] = arc(sideFrom, [sideFrom[0] + 40, 30], SPOT, lift);
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="odnoga-tasma"><rect x={TAPE.left} y={TAPE.y - 80} width={TAPE.right - TAPE.left} height={120} /></clipPath>
        </defs>
        {/* the board the side card is pinned to */}
        <rect x={SPOT[0] - 90} y={SPOT[1] - 70} width={180} height={140} rx={16} fill={PROP.line} opacity={0.55} />
        <rect x={SPOT[0] - 90} y={SPOT[1] - 70} width={180} height={140} rx={16} {...kreska(PROP.inkSoft, 4)} strokeDasharray="10 10" />
        {/* the tape: a belt over two rollers, the cards riding on it */}
        <Cien cx={380} cy={TAPE.y + 40} rx={340} ry={10} />
        <path d={`M ${TAPE.left} ${TAPE.y} H ${TAPE.right}`} {...kreska(PROP.ink, 16)} />
        <path d={`M ${TAPE.left} ${TAPE.y} H ${TAPE.right}`} {...kreska(PROP.line, 9)} strokeDasharray="14 18" strokeDashoffset={run} />
        <circle cx={TAPE.left} cy={TAPE.y} r={16} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={4} />
        <circle cx={TAPE.right} cy={TAPE.y} r={16} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={4} />
        <g clipPath="url(#odnoga-tasma)">
          {Array.from({ length: 7 }, (_, i) => (i === SIDE && lift > 0 ? null : <Karta key={i} x={TAPE.left + 40 + i * GAP - run} y={TAPE.y - 32} side={i === SIDE} />))}
        </g>
        {lift > 0 ? <Karta x={sx} y={sy} rot={lerp(0, 5, lift)} side /> : null}
        <Pinezka x={SPOT[0]} y={SPOT[1] - 22} k={ease(t, T.pin[0] ?? 0, T.pin[1] ?? 0)} />
      </svg>
    </div>
  );
};
