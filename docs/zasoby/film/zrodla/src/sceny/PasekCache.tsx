// The cache bar's row of five batteries (STYL_PASKOW_CLAUDE.md v3.6, Aneks Z11, 10.3–10.4):
// label muted · value bold, the icon shows what is LEFT and takes its color from that share.
import type { ReactNode, Ref } from 'react';
import { BAR, BATTERY, leftColor } from '../rdzen';
import { SCALE } from '../tokeny';
import type { Miara } from '../dane/typy';

const S = SCALE;

/** The battery icon of 10.3, in the panel's own numbers; `fill` is the drawn share, 0..1. */
export const Bateria = ({ fill, color }: { fill: number, color: string }) => (
  <svg width={BATTERY.icon.w * S} height={BATTERY.icon.h * S} viewBox={`0 0 ${BATTERY.icon.w} ${BATTERY.icon.h}`} style={{ flexShrink: 0, display: 'block' }}>
    <rect x={0.75} y={0.75} width={22} height={10.5} rx={3} fill="none" stroke={BAR.muted} strokeWidth={1.5} />
    <rect x={23.5} y={3.5} width={2} height={5} rx={1} fill={BAR.muted} />
    <rect x={2.5} y={2.5} width={Math.max(0, 18 * fill)} height={7} rx={1.5} fill={color} />
  </svg>
);

interface MiaraProps {
  miara: Miara,
  grow: number, // 0..1, the entry growth of the fill up to its true share
  boxRef?: Ref<HTMLDivElement>,
  children?: ReactNode, // an annotation that belongs to this measure and moves with it
}

export const MiaraBaterii = ({ miara, grow, boxRef, children }: MiaraProps) => {
  const left = miara.zostalo.wartosc;
  // reset is never an alarm: always sage (10.4, measure 3)
  const color = miara.klucz === 'reset' ? leftColor(100) : leftColor(left);
  return (
    <div ref={boxRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
      <Bateria fill={(left / 100) * grow} color={color} />
      <span style={{ marginLeft: BATTERY.icon.gap * S, color: BAR.muted }}>{miara.etykieta.wartosc}</span>
      <b style={{ marginLeft: BATTERY.spanGap * S, color: BAR.text, fontWeight: 600 }}>{miara.wartosc.wartosc}</b>
      {children}
    </div>
  );
};

interface WierszProps {
  miary: readonly Miara[],
  grow: (index: number) => number,
  target: Miara['klucz'],
  targetRef: Ref<HTMLDivElement>,
  annotation: ReactNode,
  dimOthers: number, // 0..1: how far the measures the camera does not go to step back
}

export const WierszBaterii = ({ miary, grow, target, targetRef, annotation, dimOthers }: WierszProps) => (
  <div style={{ display: 'flex', alignItems: 'center', columnGap: BATTERY.itemGap * S, rowGap: 6 * S, flexWrap: 'wrap', fontSize: BATTERY.font * S }}>
    {miary.map((m, i) => (
      <div key={m.klucz} style={{ display: 'flex', opacity: m.klucz === target ? 1 : 1 - 0.58 * dimOthers }}>
        <MiaraBaterii miara={m} grow={grow(i)} boxRef={m.klucz === target ? targetRef : undefined}>
          {m.klucz === target ? annotation : null}
        </MiaraBaterii>
      </div>
    ))}
  </div>
);
