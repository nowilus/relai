// Prop of "Lista zmian" (relai-changelog). The journal's long scroll unrolls down the desk; three of
// its lines are marked in clay and fly over to a short card, where they become the list of changes,
// each with its "+".
import { PROP } from '../../tokeny';
import { Cien, H, STROKE, W, arc, ease, glide, kreska, lerp } from './rysunek';

const T = Object.freeze({ unroll: [0, 16], mark: 16, step: 4, fly: 26, flight: 12 });
const SCROLL = Object.freeze({ x: 70, y: 40, w: 190, h: 400 });
const LINES = 13;
const PICKED = [2, 6, 10]; // the lines that make the list
const CARD = Object.freeze({ x: 470, y: 130, w: 230, h: 210 });
const lineY = (i: number) => SCROLL.y + 34 + i * 27;

export const ListaZmian = ({ t }: { t: number }) => {
  const open = glide(t, T.unroll[0] ?? 0, T.unroll[1] ?? 0);
  const h = lerp(70, SCROLL.h, open);
  const card = ease(t, T.fly - 6, T.fly + 2);
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="lista-zwoj"><rect x={SCROLL.x} y={SCROLL.y} width={SCROLL.w} height={h} /></clipPath>
        </defs>
        {/* the journal's scroll */}
        <Cien cx={SCROLL.x + SCROLL.w / 2} cy={SCROLL.y + h + 26} rx={120} ry={10} />
        <rect x={SCROLL.x + 6} y={SCROLL.y + 8} width={SCROLL.w} height={h} fill={PROP.shadow} />
        <rect x={SCROLL.x} y={SCROLL.y} width={SCROLL.w} height={h} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
        <g clipPath="url(#lista-zwoj)">
          {Array.from({ length: LINES }, (_, i) => {
            const picked = PICKED.indexOf(i);
            const mark = picked < 0 ? 0 : ease(t, T.mark + picked * T.step, T.mark + picked * T.step + 6);
            return (
              <g key={i}>
                {mark > 0 ? <path d={`M ${SCROLL.x + 16} ${lineY(i)} H ${lerp(SCROLL.x + 16, SCROLL.x + SCROLL.w - 16, mark)}`} {...kreska(PROP.clay, 16)} opacity={0.35} /> : null}
                <path d={`M ${SCROLL.x + 22} ${lineY(i)} h ${i % 3 === 2 ? 90 : 140}`} {...kreska(PROP.inkSoft, 4)} />
              </g>
            );
          })}
        </g>
        {/* the rolls at both ends */}
        <rect x={SCROLL.x - 14} y={SCROLL.y - 14} width={SCROLL.w + 28} height={26} rx={13} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
        <rect x={SCROLL.x - 14} y={SCROLL.y + h - 12} width={SCROLL.w + 28} height={26} rx={13} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
        {/* the short card of changes */}
        <g opacity={card} transform={`translate(0 ${(1 - card) * 20})`}>
          <Cien cx={CARD.x + CARD.w / 2} cy={CARD.y + CARD.h + 14} rx={130} ry={10} />
          <rect x={CARD.x + 5} y={CARD.y + 7} width={CARD.w} height={CARD.h} rx={16} fill={PROP.shadow} />
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
        </g>
        {PICKED.map((line, i) => {
          const k = glide(t, T.fly + i * T.step, T.fly + i * T.step + T.flight);
          if (k <= 0) return null;
          const to: [number, number] = [CARD.x + 40, CARD.y + 52 + i * 54];
          const [x, y] = arc([SCROLL.x + 22, lineY(line)], [380, lerp(lineY(line), to[1], 0.5) - 60], to, k);
          return (
            <g key={line} transform={`translate(${x} ${y})`}>
              <path d={`M ${lerp(0, 34, k)} 0 h ${lerp(140, 130, k)}`} {...kreska(k >= 1 ? PROP.ink : PROP.clay, 6)} />
              {k >= 1 ? <path d="M -6 0 h 22 M 5 -11 v 22" {...kreska(PROP.clay, 6)} /> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
