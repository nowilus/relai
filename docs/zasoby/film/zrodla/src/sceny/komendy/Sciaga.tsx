// Prop of "Ściąga projektu" (relai-help). A crib card slides up out of a pocket; on it the
// commands' icons come up one by one — the real icons, in the order of this scene — all the
// commands in one place.
import { Img } from 'remotion';
import { PROP } from '../../tokeny';
import { CYKL } from '../../komendy';
import { ikona } from './Podpis';
import { Cien, H, STROKE, W, glide, kreska, pop } from './rysunek';

const T = Object.freeze({ out: [4, 20], icons: 20, step: 1.6 });
const POCKET = Object.freeze({ x: 205, y: 250, w: 350, h: 180 });
const CARD = Object.freeze({ w: 310, h: 270, top: 18 });
const ICON = 46;
const COLS = 5;
const ICON_GAP = 10;

export const Sciaga = ({ t }: { t: number }) => {
  const out = glide(t, T.out[0] ?? 0, T.out[1] ?? 0);
  const top = CARD.top + (1 - out) * 230;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Cien cx={380} cy={POCKET.y + POCKET.h + 10} rx={200} ry={10} />
        {/* the pocket's back, then the card rising out of it */}
        <rect x={POCKET.x} y={POCKET.y - 10} width={POCKET.w} height={POCKET.h + 10} rx={26} fill={PROP.line} />
        <rect x={380 - CARD.w / 2 + 5} y={top + 7} width={CARD.w} height={CARD.h} rx={18} fill={PROP.shadow} />
        <rect x={380 - CARD.w / 2} y={top} width={CARD.w} height={CARD.h} rx={18} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
      </svg>
      {/* the icons on the card, laid out by a grid */}
      <div
        style={{
          position: 'absolute',
          left: 380 - (COLS * ICON + (COLS - 1) * ICON_GAP) / 2,
          top: top + 26,
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${ICON}px)`,
          gap: ICON_GAP,
        }}
      >
        {CYKL.map((id, i) => {
          const k = pop(t, T.icons + i * T.step, T.icons + i * T.step + 8);
          return <Img key={id} src={ikona(id)} style={{ width: ICON, height: ICON, opacity: Math.min(1, k * 2), transform: `scale(${k})` }} />;
        })}
      </div>
      {/* the pocket's front, over the card's foot */}
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`M ${POCKET.x} ${POCKET.y} H ${POCKET.x + POCKET.w} V ${POCKET.y + POCKET.h - 50} Q ${POCKET.x + POCKET.w} ${POCKET.y + POCKET.h} ${380} ${POCKET.y + POCKET.h} Q ${POCKET.x} ${POCKET.y + POCKET.h} ${POCKET.x} ${POCKET.y + POCKET.h - 50} Z`} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE} strokeLinejoin="round" />
        <path d={`M ${POCKET.x + 18} ${POCKET.y + 16} H ${POCKET.x + POCKET.w - 18}`} {...kreska(PROP.inkSoft, 3)} strokeDasharray="8 8" />
      </svg>
    </div>
  );
};
