// Prop of "Aktualizacja" (relai-update). The project — a folder — climbs the steps one hop at a
// time to the top one, where a clay arrow marks the newest version; beside it the card of
// differences fills with its "+" and "−" lines (the update shows what it changed).
import { PROP } from '../../tokeny';
import { Cien, H, STROKE, W, ease, glide, kreska, lerp, pop } from './rysunek';

const T = Object.freeze({ hops: [6, 18], hop: 11, flag: 30, diff: 34, line: 4 });
const BOTTOM = 420;
const STEPS = Object.freeze([
  { x: 40, w: 160, top: 370 },
  { x: 200, w: 160, top: 290 },
  { x: 360, w: 160, top: 210 },
]);
const DIFF = Object.freeze({ x: 560, y: 110, w: 170, h: 230 });
const ROWS: readonly ('+' | '-')[] = ['+', '+', '-', '+'];

const Teczka = ({ x, y, rot }: { x: number, y: number, rot: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.25)`}>
    <path d="M -48 -60 h 34 l 10 10 h 52 a 8 8 0 0 1 8 8 v 42 h -104 z" fill={PROP.mustard} stroke={PROP.ink} strokeWidth={STROKE * 0.9} strokeLinejoin="round" />
    <rect x={-48} y={-48} width={96} height={48} rx={8} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.9} />
  </g>
);

export const Aktualizacja = ({ t }: { t: number }) => {
  // which step the folder stands on, and its hop between two of them
  const hopK = (i: number) => glide(t, (T.hops[i] ?? 0), (T.hops[i] ?? 0) + T.hop);
  const pos = hopK(0) + hopK(1);
  const from = STEPS[Math.min(2, Math.floor(pos))] ?? STEPS[0];
  const to = STEPS[Math.min(2, Math.floor(pos) + 1)] ?? from;
  const k = pos - Math.floor(pos);
  const x = lerp((from?.x ?? 0) + 80, (to?.x ?? 0) + 80, k);
  const y = lerp(from?.top ?? 0, to?.top ?? 0, k) - Math.sin(k * Math.PI) * 70;
  const flag = pop(t, T.flag, T.flag + 9);
  const diff = ease(t, T.diff - 4, T.diff + 4);
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Cien cx={290} cy={BOTTOM + 8} rx={270} ry={10} />
        {STEPS.map((s, i) => (
          <rect key={i} x={s.x} y={s.top} width={s.w} height={BOTTOM - s.top} rx={10} fill={i === 2 ? PROP.paper : PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.9} />
        ))}
        {/* the newest version: a clay arrow up on the top step */}
        {flag > 0 ? (
          <g transform={`translate(${(STEPS[2]?.x ?? 0) + 80} ${(STEPS[2]?.top ?? 0) - 96}) scale(${flag})`}>
            <path d="M 0 0 V -64" {...kreska(PROP.clay, STROKE * 1.4)} />
            <path d="M -26 -38 L 0 -66 L 26 -38" {...kreska(PROP.clay, STROKE * 1.4)} />
          </g>
        ) : null}
        <Teczka x={x} y={y} rot={Math.sin(k * Math.PI) * -8} />
        {/* the card of differences */}
        <g opacity={diff} transform={`translate(0 ${(1 - diff) * 20})`}>
          <rect x={DIFF.x + 5} y={DIFF.y + 7} width={DIFF.w} height={DIFF.h} rx={16} fill={PROP.shadow} />
          <rect x={DIFF.x} y={DIFF.y} width={DIFF.w} height={DIFF.h} rx={16} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
          {ROWS.map((r, i) => {
            const kk = ease(t, T.diff + i * T.line, T.diff + i * T.line + 6);
            const yy = DIFF.y + 48 + i * 46;
            const color = r === '+' ? PROP.sage : PROP.clay;
            return kk > 0 ? (
              <g key={i} opacity={kk}>
                <rect x={DIFF.x + 12} y={yy - 17} width={DIFF.w - 24} height={34} rx={8} fill={color} opacity={0.18} />
                <path d={r === '+' ? `M ${DIFF.x + 22} ${yy} h 22 M ${DIFF.x + 33} ${yy - 11} v 22` : `M ${DIFF.x + 22} ${yy} h 22`} {...kreska(color, 6)} />
                <path d={`M ${DIFF.x + 58} ${yy} h ${lerp(0, i === 2 ? 60 : 84, kk)}`} {...kreska(PROP.inkSoft, 5)} />
              </g>
            ) : null;
          })}
        </g>
      </svg>
    </div>
  );
};
