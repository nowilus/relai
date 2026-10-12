// The parts the panel's views share, drawn as relai-panel 0.14 draws them (screenshots 01–07 of
// 2026-10-12): cards, buttons, Kalam headings, the row of segments. Colors from core/panel only
// (THEME, BAR, BAND, ROOT through rdzen.ts); sizes are the screenshots' px times U.
import type { CSSProperties, ReactNode, Ref } from 'react';
import { BAR, ROOT, THEME, mix } from '../../rdzen';
import { FONT } from '../../tokeny';

/** The panel's px in the film: the 1312 px screenshot window drawn about 1600 px wide. */
export const U = 1.24;

export const BUTTON = Object.freeze({
  primaryBg: ROOT.kartka,
  primaryText: ROOT.txt,
  secondaryBg: mix(THEME.card, BAR.text, 0.13),
  secondaryText: BAR.text,
});

interface PrzyciskProps { children: ReactNode, primary?: boolean, pressed?: number, boxRef?: Ref<HTMLDivElement>, size?: number }

/** A button of the panel: a light pill when chosen, a dark one otherwise; `pressed` 0..1 dips it. */
export const Przycisk = ({ children, primary = false, pressed = 0, boxRef, size = 16 }: PrzyciskProps) => (
  <div
    ref={boxRef}
    style={{
      flexShrink: 0,
      padding: `${4 * U}px ${10 * U}px`,
      borderRadius: 6 * U,
      background: primary ? BUTTON.primaryBg : BUTTON.secondaryBg,
      color: primary ? BUTTON.primaryText : BUTTON.secondaryText,
      fontFamily: FONT.ui,
      fontWeight: 500,
      fontSize: size * U,
      lineHeight: 1.25,
      whiteSpace: 'nowrap',
      transform: pressed > 0 ? `scale(${1 - 0.06 * pressed})` : undefined,
    }}
  >
    {children}
  </div>
);

/** A heading of the panel in Kalam (the pane draws these as Kalam outlines, headings.mjs). */
export const Naglowek = ({ children, color = THEME.mark, size = 26, style }: { children: ReactNode, color?: string, size?: number, style?: CSSProperties }) => (
  <div style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: size * U, lineHeight: 1.15, color, whiteSpace: 'nowrap', ...style }}>{children}</div>
);

interface KartaProps { children: ReactNode, featured?: boolean, accent?: boolean, style?: CSSProperties, boxRef?: Ref<HTMLDivElement> }

/** A card: dark at rest; brown with a mustard edge when recommended; clay edge when it is "this turn". */
export const Karta = ({ children, featured = false, accent = false, style, boxRef }: KartaProps) => (
  <div
    ref={boxRef}
    style={{
      borderRadius: 9 * U,
      border: `${1.2 * U}px solid ${accent ? THEME.accent : featured ? THEME.mark : THEME.line}`,
      background: featured || accent ? THEME.cardFeatured : THEME.card,
      padding: `${10 * U}px ${18 * U}px`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A row of segments, one per item, in the colors of the bar above the prompt (BAR.segment). */
export const Segmenty = ({ colors, height = 7, gap = 6 }: { colors: readonly string[], height?: number, gap?: number }) => (
  <div style={{ display: 'flex', gap: gap * U }}>
    {colors.map((c, i) => <div key={i} style={{ flex: 1, minWidth: 0, height: height * U, borderRadius: 2 * U, background: c }} />)}
  </div>
);

/** A cost as the panel writes it: Kalam, mustard. */
export const Kwota = ({ children, size = 26 }: { children: ReactNode, size?: number }) => (
  <span style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: size * U, color: THEME.mark, whiteSpace: 'nowrap', flexShrink: 0 }}>{children}</span>
);

export const tekst = (size = 16, color: string = THEME.body, weight = 400): CSSProperties => ({
  fontFamily: FONT.ui,
  fontSize: size * U,
  fontWeight: weight,
  color,
  lineHeight: 1.35,
});

export const ellipsis: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 };
