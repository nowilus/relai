// Prop of "Przegląd projektu" (relai-audit). A magnifier travels along the project's documents;
// over each one it has passed a mark appears — a tick for what is in order, one "!" for what
// needs a look.
import { PROP } from '../../tokeny';
import { Cien, H, Kartka, Ptaszek, STROKE, W, Wykrzyknik, glide, kreska, lerp, pop } from './rysunek';

const T = Object.freeze({ sweep: [4, 50] });
const DOCS = [130, 290, 450, 610];
const DOC_Y = 300;
const WARN = 2; // the document that gets "!"
const LENS = Object.freeze({ from: 40, to: 700, y: 270, r: 62 });

export const Przeglad = ({ t }: { t: number }) => {
  const k = glide(t, T.sweep[0] ?? 0, T.sweep[1] ?? 0);
  const lx = lerp(LENS.from, LENS.to, k);
  // the frame the lens passes a document's middle: its mark pops then
  const passed = (x: number) => (T.sweep[0] ?? 0) + ((x - LENS.from) / (LENS.to - LENS.from)) * ((T.sweep[1] ?? 0) - (T.sweep[0] ?? 0));
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Cien cx={380} cy={DOC_Y + 92} rx={320} ry={10} />
        {DOCS.map((x, i) => <Kartka key={x} x={x} y={DOC_Y} w={120} h={150} rot={(i % 2 ? 1 : -1) * 2} lines={4} />)}
        {DOCS.map((x, i) => {
          const at = passed(x);
          return i === WARN
            ? <Wykrzyknik key={x} x={x} y={DOC_Y - 130} r={32} k={pop(t, at, at + 9)} />
            : <Ptaszek key={x} x={x} y={DOC_Y - 130} r={32} k={pop(t, at, at + 9)} />;
        })}
        {/* the magnifier: a glass ring with a handle, a breath of paper inside */}
        <g transform={`translate(${lx} ${LENS.y})`} opacity={t < (T.sweep[1] ?? 0) + 14 ? 1 - Math.max(0, (t - (T.sweep[1] ?? 0)) / 14) : 0}>
          <path d={`M ${LENS.r * 0.7} ${LENS.r * 0.7} L ${LENS.r * 1.5} ${LENS.r * 1.5}`} {...kreska(PROP.ink, STROKE * 3)} />
          <circle r={LENS.r} fill={PROP.paper} opacity={0.35} />
          <circle r={LENS.r} {...kreska(PROP.ink, STROKE * 1.6)} />
          <path d={`M ${-LENS.r * 0.55} ${-LENS.r * 0.2} a ${LENS.r * 0.6} ${LENS.r * 0.6} 0 0 1 ${LENS.r * 0.4} ${-LENS.r * 0.38}`} {...kreska(PROP.paper, 5)} />
        </g>
      </svg>
    </div>
  );
};
