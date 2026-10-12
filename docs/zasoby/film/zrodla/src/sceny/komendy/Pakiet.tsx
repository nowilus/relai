// Prop of "Pakiet przekazania" (relai-handover). The stack of the project's documents goes into one
// envelope; it is shut and sealed in clay and travels to another hand waiting on the right — the
// whole project handed over in one file.
import { PROP } from '../../tokeny';
import { Cien, H, Kartka, STROKE, W, arc, glide, kreska, lerp, pop } from './rysunek';

const T = Object.freeze({ sheets: 4, step: 4, flight: 11, flap: [24, 32], seal: 32, reach: [28, 40], travel: [40, 54] });
const ENV = Object.freeze({ x: 190, y: 250, w: 230, h: 150 });
const STACK: readonly [number, number, number][] = [[80, 300, -6], [92, 285, 4], [72, 270, -2], [86, 255, 7]];
const HAND = Object.freeze({ x: 560, y: 350 }); // the middle of the palm
const REACH = 320; // how far off to the right the hand starts

/**
 * A hand reaching in from the right, palm up, seen from the side: the cuff, the palm, the four
 * fingers lying together (two lines part them) and the thumb raised to hold what it is given.
 */
const Dlon = ({ dx }: { dx: number }) => (
  <g transform={`translate(${HAND.x + dx} ${HAND.y})`}>
    <path d="M -150 -4 H -40 a 26 26 0 0 1 0 52 H -150 a 26 26 0 0 1 0 -52 Z" fill={PROP.paper2} stroke={PROP.ink} strokeWidth={4} />
    <path d="M -150 13 H -60 M -146 30 H -60" {...kreska(PROP.inkSoft, 3)} />
    <path d="M -70 -14 H 70 V 56 H -50 a 36 36 0 0 1 -36 -36 V 2 a 16 16 0 0 1 16 -16 Z" fill={PROP.paper2} stroke={PROP.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -54 -12 C -66 -40 -48 -62 -30 -58 C -18 -54 -18 -36 -22 -12" fill={PROP.paper2} stroke={PROP.ink} strokeWidth={4} strokeLinejoin="round" />
    <rect x={64} y={-30} width={150} height={96} rx={22} fill={PROP.mustard} stroke={PROP.ink} strokeWidth={4} />
  </g>
);

export const Pakiet = ({ t }: { t: number }) => {
  const flap = glide(t, T.flap[0] ?? 0, T.flap[1] ?? 0);
  const seal = pop(t, T.seal, T.seal + 8);
  const go = glide(t, T.travel[0] ?? 0, T.travel[1] ?? 0);
  const reach = glide(t, T.reach[0] ?? 0, T.reach[1] ?? 0);
  // the envelope travels into the hand, held between the fingers and the thumb
  const dx = lerp(0, HAND.x - 100 - (ENV.x + ENV.w / 2), go);
  const dy = lerp(0, HAND.y - 52 - (ENV.y + ENV.h / 2), go) - Math.sin(go * Math.PI) * 50;
  const scale = lerp(1, 0.72, go);
  const cx = ENV.x + ENV.w / 2;
  const cy = ENV.y + ENV.h / 2;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Cien cx={HAND.x + (1 - reach) * REACH} cy={HAND.y + 76} rx={190} ry={10} opacity={reach} />
        <g opacity={Math.min(1, reach * 2)}><Dlon dx={(1 - reach) * REACH} /></g>
        <Cien cx={cx + dx} cy={ENV.y + ENV.h + 16} rx={140 * scale} ry={10} opacity={1 - go} />
        <g transform={`translate(${dx} ${dy}) translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
          {/* the envelope's back */}
          <rect x={ENV.x} y={ENV.y} width={ENV.w} height={ENV.h} rx={10} fill={PROP.line} stroke={PROP.ink} strokeWidth={STROKE * 0.9} />
          {/* the sheets dropping in */}
          {STACK.map(([x, y, rot], i) => {
            const k = glide(t, T.sheets + i * T.step, T.sheets + i * T.step + T.flight);
            const [sx, sy] = arc([x, y], [lerp(x, cx, 0.5), 60], [cx, ENV.y + 70], k);
            return k < 1 ? <Kartka key={i} x={sx} y={sy} rot={lerp(rot, 0, k)} w={120} h={150} scale={lerp(1, 0.9, k)} /> : null;
          })}
          {/* the front: two side folds and the bottom one */}
          <path d={`M ${ENV.x} ${ENV.y + 8} L ${cx} ${ENV.y + 92} L ${ENV.x + ENV.w} ${ENV.y + 8} V ${ENV.y + ENV.h - 10} a 10 10 0 0 1 -10 10 H ${ENV.x + 10} a 10 10 0 0 1 -10 -10 Z`} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.9} strokeLinejoin="round" />
          <path d={`M ${ENV.x + 6} ${ENV.y + ENV.h - 6} L ${cx} ${ENV.y + 84} L ${ENV.x + ENV.w - 6} ${ENV.y + ENV.h - 6}`} {...kreska(PROP.line, 4)} />
          {/* the flap: open up, then folded down over the front */}
          <path d={`M ${ENV.x} ${ENV.y} L ${cx} ${ENV.y + lerp(-96, 96, flap)} L ${ENV.x + ENV.w} ${ENV.y} Z`} fill={flap < 0.5 ? PROP.paper2 : PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.9} strokeLinejoin="round" />
          {seal > 0 ? (
            <g transform={`translate(${cx} ${ENV.y + 92}) scale(${seal})`}>
              <circle r={22} fill={PROP.clay} stroke={PROP.clayDark} strokeWidth={4} />
              <circle r={10} {...kreska(PROP.clayDark, 3)} />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
};
