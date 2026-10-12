// Prop of "Optymalizator promptu" (relai-prompt). A loose sentence — a scribble in a speech bubble —
// stays where it is while its copy goes through a sieve; out of the sieve comes an even note with
// clay points. The original stays beside the proposal, as the optimizer shows both.
import { PROP } from '../../tokeny';
import { Cien, H, STROKE, W, ease, glide, kreska, lerp, wobble } from './rysunek';

const T = Object.freeze({ copy: [6, 20], shake: 20, note: [26, 40], points: 36 });

// the bubble: a rounded box with a tail, the scribble inside
const Dymek = ({ x, y, opacity = 1, scale = 1 }: { x: number, y: number, opacity?: number, scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d="M -95 -55 H 95 a 22 22 0 0 1 22 22 V 33 a 22 22 0 0 1 -22 22 H -40 L -70 82 L -62 55 H -95 a 22 22 0 0 1 -22 -22 V -33 a 22 22 0 0 1 22 -22 Z" fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE} strokeLinejoin="round" />
    <path d="M -80 -18 c 14 -22 24 18 40 -2 s 22 -20 34 6 s 26 14 34 -10 s 20 -6 40 8" {...kreska(PROP.inkSoft, STROKE * 0.8)} />
    <path d="M -80 18 c 18 14 26 -16 44 0 s 18 12 30 -6 s 22 6 30 4" {...kreska(PROP.inkSoft, STROKE * 0.8)} />
  </g>
);

const SIEVE = Object.freeze({ x: 380, y: 210 });

export const Optymalizator = ({ t }: { t: number }) => {
  const copy = glide(t, T.copy[0] ?? 0, T.copy[1] ?? 0);
  const note = ease(t, T.note[0] ?? 0, T.note[1] ?? 0);
  const shake = wobble(t, T.shake, 12) * 5;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* the original stays on the desk */}
        <Cien cx={130} cy={330} rx={110} ry={10} />
        <Dymek x={140} y={240} />
        {/* its copy flies into the sieve and shrinks into it */}
        {copy > 0 && copy < 1 ? <Dymek x={lerp(140, SIEVE.x, copy)} y={lerp(240, SIEVE.y - 40, copy) - Math.sin(copy * Math.PI) * 80} scale={lerp(1, 0.4, copy)} opacity={1 - copy * 0.6} /> : null}
        {/* the sieve: a bowl with its mesh, shaking as it works */}
        <g transform={`translate(${SIEVE.x + shake} ${SIEVE.y})`}>
          <path d="M -90 -30 H 90 L 56 46 H -56 Z" fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE} strokeLinejoin="round" />
          {[-60, -30, 0, 30, 60].map((dx) => <path key={dx} d={`M ${dx} -30 L ${dx * 0.62} 46`} {...kreska(PROP.inkSoft, 3)} />)}
          <path d="M -76 0 H 76 M -66 24 H 66" {...kreska(PROP.inkSoft, 3)} />
          <path d="M -104 -30 H 104" {...kreska(PROP.ink, STROKE * 1.2)} />
        </g>
        {/* the even note slides out at the bottom right, its points written one by one */}
        <g transform={`translate(${lerp(SIEVE.x, 600, note)} ${lerp(SIEVE.y + 40, 300, note)}) rotate(${lerp(-8, 2, note)})`} opacity={Math.min(1, note * 3)}>
          <rect x={-95} y={-95} width={190} height={190} rx={14} fill={PROP.shadow} transform="translate(5 7)" />
          <rect x={-95} y={-95} width={190} height={190} rx={14} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
          {[0, 1, 2, 3].map((i) => {
            const k = ease(t, T.points + i * 3, T.points + i * 3 + 8);
            return (
              <g key={i} opacity={k > 0 ? 1 : 0}>
                <circle cx={-66} cy={-56 + i * 38} r={8} fill={PROP.clay} />
                <path d={`M -46 ${-56 + i * 38} H ${lerp(-46, i === 3 ? 20 : 66, k)}`} {...kreska(PROP.ink, STROKE * 0.9)} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
