// Prop of "Etap planu" (relai-stage), from its icon — a card and the clay play button. The plan's
// stages lie on a tape; the start card gets its stamp "Tak" (the confirmation card's own button,
// pane-parts.tsx — wiernosc.test.mjs), the stage done gets its tick and the marker jumps on to the
// next stage, which lights up as the one in progress.
import { PROP } from '../../tokeny';
import { PL } from '../../teksty';
import { Cien, H, NapisNaRekwizycie, Ptaszek, STROKE, W, arc, ease, glide, kreska, pop } from './rysunek';

const T = Object.freeze({ card: [0, 8], stamp: [10, 17], done: 20, jump: [26, 38], lit: 36 });
const STAGES = [120, 250, 380, 510, 640];
const TAPE_Y = 350;
const CARD = Object.freeze({ x: 380, y: 120, w: 300, h: 140 });

export const Etap = ({ t }: { t: number }) => {
  const card = ease(t, T.card[0] ?? 0, T.card[1] ?? 0);
  const stamp = ease(t, T.stamp[0] ?? 0, T.stamp[1] ?? 0);
  const jump = glide(t, T.jump[0] ?? 0, T.jump[1] ?? 0);
  const lit = ease(t, T.lit, T.lit + 6);
  const [mx, my] = arc([STAGES[2] ?? 0, TAPE_Y - 70], [((STAGES[2] ?? 0) + (STAGES[3] ?? 0)) / 2, TAPE_Y - 170], [STAGES[3] ?? 0, TAPE_Y - 70], jump);
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* the start card */}
        <g opacity={card} transform={`translate(0 ${(1 - card) * -20})`}>
          <rect x={CARD.x - CARD.w / 2 + 5} y={CARD.y - CARD.h / 2 + 7} width={CARD.w} height={CARD.h} rx={16} fill={PROP.shadow} />
          <rect x={CARD.x - CARD.w / 2} y={CARD.y - CARD.h / 2} width={CARD.w} height={CARD.h} rx={16} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
          <path d={`M ${CARD.x - 120} ${CARD.y - 38} h 150 M ${CARD.x - 120} ${CARD.y - 12} h 100`} {...kreska(PROP.inkSoft, STROKE * 0.7)} />
        </g>
        {/* the tape of stages */}
        <Cien cx={380} cy={TAPE_Y + 52} rx={330} ry={10} />
        <path d={`M 40 ${TAPE_Y} H 720`} {...kreska(PROP.line, 14)} />
        {STAGES.map((x, i) => {
          const isLit = i === 3 && lit > 0;
          return (
            <g key={x}>
              <rect x={x - 50} y={TAPE_Y - 36} width={100} height={72} rx={12} fill={i < 3 ? PROP.paper2 : PROP.paper} stroke={isLit ? PROP.clay : PROP.ink} strokeWidth={isLit ? STROKE * 1.2 : STROKE * 0.8} />
              <path d={`M ${x - 30} ${TAPE_Y - 8} h 60 M ${x - 30} ${TAPE_Y + 12} h 36`} {...kreska(PROP.inkSoft, 4)} />
            </g>
          );
        })}
        <Ptaszek x={STAGES[0] ?? 0} y={TAPE_Y - 44} r={18} k={1} />
        <Ptaszek x={STAGES[1] ?? 0} y={TAPE_Y - 44} r={18} k={1} />
        <Ptaszek x={STAGES[2] ?? 0} y={TAPE_Y - 44} r={18} k={pop(t, T.done, T.done + 8)} />
        {/* the marker of the stage in progress */}
        <path d={`M ${mx - 18} ${my - 16} H ${mx + 18} L ${mx} ${my + 12} Z`} fill={PROP.clay} stroke={PROP.clayDark} strokeWidth={3} strokeLinejoin="round" />
      </svg>
      {/* the stamp "Tak" on the card */}
      {stamp > 0 ? (
        <NapisNaRekwizycie
          x={CARD.x + 10}
          y={CARD.y - 10}
          w={140}
          h={64}
          size={44}
          color={PROP.clay}
          style={{ border: `5px solid ${PROP.clay}`, borderRadius: 12, opacity: stamp, transform: `rotate(-8deg) scale(${1.5 - 0.5 * stamp})` }}
        >
          {PL.nowaSesja.tak}
        </NapisNaRekwizycie>
      ) : null}
    </div>
  );
};
