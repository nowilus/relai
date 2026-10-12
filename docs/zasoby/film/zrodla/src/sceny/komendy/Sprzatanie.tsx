// Prop of "Sprzątanie" (relai-clean), from its icon — a bin. Scraps of working files lie on the
// desk; a bubble asks first ("?") and turns into a tick — clean works only after a yes — then the
// scraps fly into the bin and its lid shuts.
import { PROP } from '../../tokeny';
import { Cien, H, Ptaszek, STROKE, W, arc, ease, glide, kreska, lerp, pop, wobble } from './rysunek';

const T = Object.freeze({ ask: [2, 10], yes: 16, fly: 24, step: 3, flight: 12, shut: 56 });
const BIN = Object.freeze({ x: 590, y: 250 });
const SCRAPS: readonly { at: [number, number], rot: number, s: number }[] = [
  { at: [110, 330], rot: 20, s: 1 },
  { at: [200, 380], rot: -35, s: 0.8 },
  { at: [300, 340], rot: 60, s: 0.9 },
  { at: [170, 270], rot: -10, s: 0.75 },
  { at: [380, 390], rot: 15, s: 0.85 },
  { at: [260, 230], rot: 80, s: 0.7 },
];

/** A crumpled scrap of paper: an uneven polygon with a fold line. */
const Scinek = ({ x, y, rot, s, opacity = 1 }: { x: number, y: number, rot: number, s: number, opacity?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <path d="M -34 -20 L -6 -32 L 22 -26 L 36 -2 L 26 26 L -4 32 L -30 18 Z" fill={PROP.paper} stroke={PROP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -18 -10 L 6 4 L 18 -14 M -8 18 L 8 6" {...kreska(PROP.inkSoft, 3)} />
  </g>
);

export const Sprzatanie = ({ t }: { t: number }) => {
  const ask = pop(t, T.ask[0] ?? 0, T.ask[1] ?? 0);
  const yes = ease(t, T.yes, T.yes + 6);
  const lastIn = T.fly + (SCRAPS.length - 1) * T.step + T.flight;
  const lidOpen = ease(t, T.fly - 4, T.fly + 4) * (1 - ease(t, lastIn, T.shut));
  const lidBounce = wobble(t, T.shut, 10) * 4;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* the bubble that asks before anything goes */}
        <g transform={`translate(270 110) scale(${ask})`} opacity={ask > 0 ? 1 - ease(t, T.fly + 6, T.fly + 14) : 0}>
          <path d="M -64 -50 H 64 a 20 20 0 0 1 20 20 V 30 a 20 20 0 0 1 -20 20 H -10 L -34 76 L -32 50 H -64 a 20 20 0 0 1 -20 -20 V -30 a 20 20 0 0 1 20 -20 Z" fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE} strokeLinejoin="round" />
          <g opacity={1 - yes}>
            <path d="M -14 -14 a 14 14 0 1 1 18 13 q -4 2 -4 10 v 4" {...kreska(PROP.ink, STROKE * 1.4)} />
            <circle cx={0} cy={28} r={5} fill={PROP.ink} />
          </g>
          <Ptaszek x={0} y={0} r={34} k={yes} />
        </g>
        <Cien cx={BIN.x} cy={BIN.y + 150} rx={90} ry={10} />
        {/* the bin's body */}
        <path d={`M ${BIN.x - 62} ${BIN.y} L ${BIN.x - 48} ${BIN.y + 146} H ${BIN.x + 48} L ${BIN.x + 62} ${BIN.y} Z`} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        {[-24, 0, 24].map((dx) => <path key={dx} d={`M ${BIN.x + dx} ${BIN.y + 26} V ${BIN.y + 120}`} {...kreska(PROP.inkSoft, STROKE * 0.8)} />)}
        {/* the scraps: each flies over the rim and drops in */}
        {SCRAPS.map((s, i) => {
          const k = glide(t, T.fly + i * T.step, T.fly + i * T.step + T.flight);
          const [x, y] = arc(s.at, [lerp(s.at[0], BIN.x, 0.5), 20], [BIN.x, BIN.y + 14], k);
          return <Scinek key={i} x={x} y={y} rot={s.rot + k * 200} s={s.s * lerp(1, 0.7, k)} opacity={k >= 1 ? 0 : 1} />;
        })}
        {/* the front lip of the bin over the scraps going in, then the lid */}
        <path d={`M ${BIN.x - 62} ${BIN.y} L ${BIN.x - 58} ${BIN.y + 30} H ${BIN.x + 58} L ${BIN.x + 62} ${BIN.y} Z`} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        <g transform={`rotate(${50 * lidOpen + lidBounce} ${BIN.x + 72} ${BIN.y - 6})`}>
          <rect x={BIN.x - 74} y={BIN.y - 16} width={148} height={18} rx={8} fill={PROP.line} stroke={PROP.ink} strokeWidth={STROKE * 0.9} />
          <path d={`M ${BIN.x - 18} ${BIN.y - 16} v -12 h 36 v 12`} {...kreska(PROP.ink, STROKE * 0.9)} />
        </g>
      </svg>
    </div>
  );
};
