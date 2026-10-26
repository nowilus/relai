// One bar above the prompt as the real panel draws it (STYL_PASKOW_CLAUDE.md v3.6, sections 2, 3
// and 5): the label column, the content, the figure column, on the bar's own soft background.
// Geometry is the panel's in cells, times SCALE; the browser lays it out, no hand coordinates.
import type { CSSProperties, ReactNode } from 'react';
import { BAR } from '../rdzen';
import { CELL, FONT, SCALE } from '../tokeny';
import type { DanePaskow, StatusPunktu } from '../dane/typy';
import { PL } from '../teksty';

type Band = { label: string, color: string, bg: string };

interface PasekProps {
  band: Band,
  figure: ReactNode,
  children: ReactNode,
  style?: CSSProperties,
}

export const TEXT = 15 * SCALE; // the app's body size in the bars

export const Pasek = ({ band, figure, children, style }: PasekProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `${14 * CELL}px minmax(0, 1fr) auto`,
      columnGap: 2 * CELL,
      alignItems: 'center',
      background: band.bg,
      borderRadius: 11 * SCALE,
      padding: `${10 * SCALE}px ${1.5 * CELL}px`,
      fontFamily: FONT.ui,
      fontSize: TEXT,
      lineHeight: 1.25,
      ...style,
    }}
  >
    <span style={{ color: band.color, fontWeight: 600 }}>{band.label}</span>
    <div style={{ minWidth: 0 }}>{children}</div>
    <div style={{ minWidth: 11 * CELL, textAlign: 'right', whiteSpace: 'nowrap' }}>{figure}</div>
  </div>
);

export const Liczba = ({ value, unit }: { value: string, unit: string }) => (
  <>
    <b style={{ color: BAR.text, fontWeight: 700 }}>{value}</b>
    <span style={{ color: BAR.muted }}> {unit}</span>
  </>
);

const ellipsis: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

// overflow: hidden — a long status ("GOTOWY DO STARTU") in the finale's narrow bar ran over the
// figure "3/5 etapów" (E4 of PIPELINE_WYDAN); the row now ends at its grid cell
export const TrescPlanu = ({ plan, statusColor }: { plan: DanePaskow['plan'], statusColor: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 1.6 * CELL, minWidth: 0, overflow: 'hidden' }}>
    <b style={{ color: BAR.text, fontWeight: 700, whiteSpace: 'nowrap' }}>{plan.plan.wartosc} · {plan.etap.wartosc}</b>
    <b style={{ color: statusColor, fontWeight: 700, whiteSpace: 'nowrap' }}>{plan.status.wartosc}</b>
    <span style={{ color: BAR.muted, minWidth: 0, ...ellipsis }}>{plan.nazwa.wartosc}</span>
  </div>
);

/** The calm line under the segments, word for word as relai-progress writes it (segments.ts). */
export function calmLine(items: readonly { status: StatusPunktu, nazwa: string }[]): string {
  const running = items.find((it) => it.status === 'running');
  const next = items.find((it) => it.status === 'pending');
  const parts = [running ? `${PL.paski.wToku}: ${running.nazwa}` : '', next ? `${PL.paski.nastepny}: ${next.nazwa}` : ''].filter(Boolean);
  return parts.length ? parts.join(' · ') : PL.paski.wszystko;
}

interface SegmentyProps {
  items: readonly { status: StatusPunktu, nazwa: string }[],
  words: string, // what the bar says instead of segments when there is nothing to count
  appear: (index: number) => number, // 0..1, how far segment i has grown in
}

export const Segmenty = ({ items, words, appear }: SegmentyProps) => items.length === 0 ? (
  // relai-progress draws the words alone, muted, when the stage has no boxes to count
  <div style={{ color: BAR.muted, ...ellipsis }}>{words}</div>
) : (
  <div>
    <div style={{ display: 'flex', height: 8 * SCALE }}>
      {items.map((it, i) => (
        <div key={i} style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '94%',
              height: '100%',
              borderRadius: 2 * SCALE,
              background: BAR.segment[it.status],
              transform: `scaleX(${appear(i)})`,
              transformOrigin: 'left center',
            }}
          />
        </div>
      ))}
    </div>
    <div style={{ marginTop: 4 * SCALE, fontSize: 11.5 * SCALE, lineHeight: `${14 * SCALE}px`, color: BAR.muted, ...ellipsis }}>
      {calmLine(items)}
    </div>
  </div>
);
