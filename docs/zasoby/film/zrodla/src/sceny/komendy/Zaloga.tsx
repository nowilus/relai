// Prop of "Załoga agentów" (relai-crew). The goal's card comes apart into three smaller tasks; a
// pawn — an agent — stands at each, and their three arrows meet in one tick: the bigger task done
// by the crew together.
import { PROP } from '../../tokeny';
import { Cien, H, Kartka, Ptaszek, STROKE, W, ease, glide, kreska, lerp, pop } from './rysunek';

const T = Object.freeze({ split: [6, 20], pawns: 18, arrows: 32, tick: 44 });
const GOAL = Object.freeze({ x: 120, y: 240 });
const TASKS = [100, 240, 380];
const TASK_X = 340;
const TICK = Object.freeze({ x: 650, y: 240 });
const PAWNS = [PROP.mustard, PROP.sage, PROP.clay];

/** A pawn: a head on a flared body, standing on the desk at (x, y). */
const Pionek = ({ x, y, color, k }: { x: number, y: number, color: string, k: number }) => (
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y + (1 - k) * -30})`} opacity={Math.min(1, k * 2)}>
      <ellipse cx={0} cy={6} rx={26} ry={6} fill={PROP.shadow} />
      <path d="M -14 -18 L -24 4 H 24 L 14 -18 Z" fill={color} stroke={PROP.ink} strokeWidth={4} strokeLinejoin="round" />
      <circle cy={-30} r={15} fill={color} stroke={PROP.ink} strokeWidth={4} />
    </g>
  )
);

export const Zaloga = ({ t }: { t: number }) => {
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* the goal's card: a target on it; it gives way to the three tasks */}
        <g opacity={1 - ease(t, T.split[0] ?? 0, (T.split[0] ?? 0) + 8)}>
          <Cien cx={GOAL.x} cy={GOAL.y + 110} rx={80} ry={10} />
          <Kartka x={GOAL.x} y={GOAL.y} w={150} h={190} lines={0}>
            <circle r={44} {...kreska(PROP.clay, STROKE)} />
            <circle r={24} {...kreska(PROP.clay, STROKE)} />
            <circle r={7} fill={PROP.clay} />
          </Kartka>
        </g>
        {TASKS.map((y, i) => {
          const k = glide(t, (T.split[0] ?? 0) + i * 2, (T.split[1] ?? 0) + i * 2);
          return k > 0 ? <Kartka key={y} x={lerp(GOAL.x, TASK_X, k)} y={lerp(GOAL.y, y, k)} w={lerp(150, 120, k)} h={lerp(190, 96, k)} rot={lerp(0, (i - 1) * 3, k)} lines={2} /> : null;
        })}
        {/* the three arrows, drawn to one tick */}
        {TASKS.map((y, i) => {
          const k = ease(t, T.arrows + i * 2, T.arrows + i * 2 + 10);
          const from = { x: TASK_X + 150, y };
          const to = { x: TICK.x - 50, y: TICK.y + (i - 1) * 22 };
          return k > 0 ? <path key={y} d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2 + 20} ${(from.y + to.y) / 2} ${to.x} ${to.y}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} {...kreska(PROP.ink, STROKE * 0.9)} /> : null;
        })}
        {TASKS.map((y, i) => <Pionek key={y} x={TASK_X + 100} y={y + 30} color={PAWNS[i] ?? PROP.clay} k={pop(t, T.pawns + i * 3, T.pawns + i * 3 + 9)} />)}
        <Ptaszek x={TICK.x} y={TICK.y} r={46} k={pop(t, T.tick, T.tick + 9)} />
      </svg>
    </div>
  );
};
