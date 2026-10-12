// Prop of "Adopcja projektu" (relai-adopt), from its icon — a document and the dashed box RelAI
// moves it into. The sheets of an existing repository lie scattered on the desk; beside them a
// copy box closes first (adoption starts with a backup), then the RelAI note (the mark, with its own pin) lands on top and
// the sheets glide into tidy rows under it.
import { Img, staticFile } from 'remotion';
import { PROP } from '../../tokeny';
import { Cien, H, Kartka, STROKE, W, glide, lerp, pop } from './rysunek';

const T = Object.freeze({ lid: [4, 14], note: 16, sheets: 24, step: 3, move: 16 });

// scattered (from) and tidy (to): two rows of three under the note
const SHEETS: readonly { from: [number, number, number], to: [number, number] }[] = [
  { from: [120, 300, -18], to: [190, 250] },
  { from: [260, 380, 12], to: [320, 250] },
  { from: [380, 260, -6], to: [450, 250] },
  { from: [170, 170, 22], to: [190, 390] },
  { from: [320, 160, -25], to: [320, 390] },
  { from: [470, 360, 16], to: [450, 390] },
];
const BOX = Object.freeze({ x: 590, y: 300, w: 130, h: 96 });
const NOTE = Object.freeze({ x: 320, y: 112, size: 150 });

export const Adopcja = ({ t }: { t: number }) => {
  const lid = glide(t, T.lid[0] ?? 0, T.lid[1] ?? 0);
  const note = pop(t, T.note, T.note + 10);
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* the copy box: its lid swings shut */}
        <Cien cx={BOX.x + BOX.w / 2} cy={BOX.y + BOX.h + 6} rx={BOX.w * 0.6} ry={10} />
        <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={16} fill={PROP.paper2} stroke={PROP.clay} strokeWidth={STROKE} strokeDasharray="12 10" />
        <g transform={`rotate(${lerp(-110, 0, lid)} ${BOX.x} ${BOX.y})`}>
          <rect x={BOX.x - 4} y={BOX.y - 14} width={BOX.w + 8} height={18} rx={8} fill={PROP.line} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
        </g>
        {SHEETS.map((s, i) => {
          const k = glide(t, T.sheets + i * T.step, T.sheets + i * T.step + T.move);
          return <Kartka key={i} x={lerp(s.from[0], s.to[0], k)} y={lerp(s.from[1], s.to[1], k)} rot={lerp(s.from[2], 0, k)} w={96} h={120} />;
        })}
      </svg>
      {/* the RelAI note, pinned over the tidy rows */}
      {note > 0 ? (
        <Img
          src={staticFile('znak/logo.svg')}
          style={{ position: 'absolute', left: NOTE.x - NOTE.size / 2, top: NOTE.y - NOTE.size / 2, width: NOTE.size, height: NOTE.size, opacity: Math.min(1, note * 2), transform: `scale(${note}) rotate(-4deg)`, clipPath: 'inset(15% 10% 19% 10% round 3%)' }}
        />
      ) : null}
    </div>
  );
};
