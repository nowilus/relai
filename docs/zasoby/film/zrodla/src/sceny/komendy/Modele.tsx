// Prop of "Lista modeli" (relai-models). The old plate with the models' names loses one pin,
// swings, loses the other and drops off; a fresh plate comes down in its place, is pinned, and its
// rows are written anew, each with a sage dot — the list as it is today.
import { PROP } from '../../tokeny';
import { Cien, H, Pinezka, STROKE, W, ease, glide, kreska, lerp } from './rysunek';

const T = Object.freeze({ pinL: 4, swing: [6, 16], fall: [16, 28], drop: [22, 32], pins: 31, rows: 34, row: 3 });
const PLATE = Object.freeze({ x: 210, y: 70, w: 340, h: 260 });
const ROWS = 5;

/** A plate of names: its rows as lines, the new one with a dot before each. */
const Tabliczka = ({ fresh, written }: { fresh: boolean, written: (i: number) => number }) => (
  <>
    <rect x={6} y={8} width={PLATE.w} height={PLATE.h} rx={18} fill={PROP.shadow} />
    <rect width={PLATE.w} height={PLATE.h} rx={18} fill={fresh ? PROP.paper : PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE * 0.9} />
    <rect x={20} y={20} width={PLATE.w - 40} height={34} rx={10} fill={fresh ? PROP.clay : PROP.line} opacity={fresh ? 0.85 : 1} />
    {Array.from({ length: ROWS }, (_, i) => {
      const k = written(i);
      const y = 88 + i * 36;
      return k > 0 ? (
        <g key={i}>
          {fresh ? <circle cx={44} cy={y} r={9} fill={PROP.sage} opacity={k} /> : null}
          <path d={`M 66 ${y} h ${lerp(0, i % 2 ? 170 : 220, k)}`} {...kreska(fresh ? PROP.ink : PROP.inkSoft, 6)} opacity={fresh ? 1 : 0.6} />
        </g>
      ) : null;
    })}
  </>
);

export const Modele = ({ t }: { t: number }) => {
  const swing = glide(t, T.swing[0] ?? 0, T.swing[1] ?? 0);
  const fall = glide(t, T.fall[0] ?? 0, T.fall[1] ?? 0);
  const drop = ease(t, T.drop[0] ?? 0, T.drop[1] ?? 0);
  const pinR = PLATE.x + PLATE.w - 30;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Cien cx={380} cy={PLATE.y + PLATE.h + 70} rx={200} ry={10} />
        {/* the old plate: it swings on its right pin, then drops away */}
        {fall < 1 ? (
          <g transform={`translate(0 ${fall * fall * 260}) rotate(${lerp(0, 24, swing) + fall * 20} ${pinR} ${PLATE.y + 26})`} opacity={1 - fall}>
            <g transform={`translate(${PLATE.x} ${PLATE.y})`}><Tabliczka fresh={false} written={() => 1} /></g>
          </g>
        ) : null}
        {/* the new plate, pinned and written row by row */}
        {drop > 0 ? (
          <g transform={`translate(${PLATE.x} ${lerp(PLATE.y - 120, PLATE.y, drop)})`} opacity={Math.min(1, drop * 2)}>
            <Tabliczka fresh written={(i) => ease(t, T.rows + i * T.row, T.rows + i * T.row + 8)} />
          </g>
        ) : null}
        {/* the pins: the old ones pop out, the new ones go in */}
        <Pinezka x={PLATE.x + 30} y={PLATE.y + 26} k={t < T.pinL ? 1 : 1 - ease(t, T.pinL, T.pinL + 4)} />
        <Pinezka x={pinR} y={PLATE.y + 26} k={t < (T.fall[0] ?? 0) ? 1 : 1 - ease(t, T.fall[0] ?? 0, (T.fall[0] ?? 0) + 4)} />
        <Pinezka x={PLATE.x + 30} y={PLATE.y + 26} k={ease(t, T.pins, T.pins + 5)} />
        <Pinezka x={pinR} y={PLATE.y + 26} k={ease(t, T.pins + 2, T.pins + 7)} />
      </svg>
    </div>
  );
};
