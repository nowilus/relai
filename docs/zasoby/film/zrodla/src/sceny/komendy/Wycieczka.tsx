// Prop of "Wycieczka po projekcie" (relai-tour). A folded map of the project with its documents
// marked on it; a dashed trail is drawn from one document to the next and a clay pin hops along
// it, stop by stop.
import { PROP } from '../../tokeny';
import { Cien, H, Pinezka, STROKE, W, ease, glide, kreska, lerp } from './rysunek';

const T = Object.freeze({ trail: [6, 48] });
const MAP = Object.freeze({ x: 70, y: 40, w: 620, h: 380 });
const STOPS: readonly [number, number][] = [[160, 330], [290, 150], [460, 300], [600, 140]];
const TRAIL = `M ${STOPS[0]?.[0]} ${STOPS[0]?.[1]} C 170 200, 230 150, ${STOPS[1]?.[0]} ${STOPS[1]?.[1]} S 420 320, ${STOPS[2]?.[0]} ${STOPS[2]?.[1]} S 560 150, ${STOPS[3]?.[0]} ${STOPS[3]?.[1]}`;

/** A document marker on the map: a small sheet with two lines. */
const Dok = ({ x, y }: { x: number, y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-26} y={-34} width={52} height={66} rx={8} fill={PROP.paper} stroke={PROP.ink} strokeWidth={4} />
    <path d="M -14 -14 h 28 M -14 2 h 20" {...kreska(PROP.inkSoft, 3.5)} />
  </g>
);

export const Wycieczka = ({ t }: { t: number }) => {
  const trail = glide(t, T.trail[0] ?? 0, T.trail[1] ?? 0);
  // the pin stands at the last stop the trail has reached, and hops to the next one
  const seg = trail * (STOPS.length - 1);
  const at = Math.min(STOPS.length - 1, Math.floor(seg + 0.02));
  const hop = ease(seg - at, 0.55, 1) * (at < STOPS.length - 1 ? 1 : 0);
  const a = STOPS[at] ?? [0, 0];
  const b = STOPS[Math.min(STOPS.length - 1, at + 1)] ?? a;
  const px = lerp(a[0], b[0], hop);
  const py = lerp(a[1], b[1], hop) - Math.sin(hop * Math.PI) * 50 - 46;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <mask id="wycieczka-maska">
            <path d={TRAIL} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trail} {...kreska(PROP.paper, 16)} />
          </mask>
        </defs>
        <Cien cx={380} cy={MAP.y + MAP.h + 12} rx={320} ry={12} />
        {/* the map, folded in three */}
        <rect x={MAP.x + 6} y={MAP.y + 8} width={MAP.w} height={MAP.h} rx={14} fill={PROP.shadow} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={MAP.x + (i * MAP.w) / 3} y={MAP.y} width={MAP.w / 3} height={MAP.h} fill={i === 1 ? PROP.paper2 : PROP.paper} />
        ))}
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx={14} {...kreska(PROP.ink, STROKE * 0.8)} />
        <path d={`M ${MAP.x + MAP.w / 3} ${MAP.y} V ${MAP.y + MAP.h} M ${MAP.x + (2 * MAP.w) / 3} ${MAP.y} V ${MAP.y + MAP.h}`} {...kreska(PROP.line, 3)} />
        {/* a few contour lines, so it reads as a map */}
        <path d="M 90 230 q 60 -40 120 -10 t 120 0 M 420 400 q 50 -50 110 -30 t 130 -20 M 380 80 q 40 30 100 10" {...kreska(PROP.line, 4)} />
        <path d={TRAIL} mask="url(#wycieczka-maska)" {...kreska(PROP.clay, STROKE)} strokeDasharray="4 16" />
        {STOPS.map(([x, y]) => <Dok key={x} x={x} y={y} />)}
        <Pinezka x={px} y={py} k={ease(t, 0, 6)} r={16} />
      </svg>
    </div>
  );
};
