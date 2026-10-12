// The Dokumenty tab of the panel (screenshots 04 and 05): the documents changed since the last
// commit as tiles, the one changed in this turn edged in clay; a tile opened shows its diff row by
// row in the colors of core/panel DIFF. The tiles and the quoted diff are panel.json's, from the
// screenshots; the diff's lines are a quotation of STATUS.md as it was on 2026-10-12.
import type { Ref } from 'react';
import { DIFF, THEME } from '../../rdzen';
import { FONT } from '../../tokeny';
import { PL } from '../../teksty';
import type { DanePanelu } from '../../dane/typy';
import { Karta, Naglowek, Przycisk, U, ellipsis, tekst } from './Czesci';

const W = PL.panel.dokumenty;
type Kafel = DanePanelu['dokumenty']['kafle']['wartosc'][number];

/** A document icon: a page with a folded corner and its type on a label (the pane's outline). */
const Ikona = ({ typ, size = 48 }: { typ: string, size?: number }) => (
  <div style={{ position: 'relative', width: size * 0.82 * U, height: size * U, borderRadius: 4 * U, border: `${2.4 * U}px solid ${THEME.mark}`, flexShrink: 0 }}>
    <div style={{ position: 'absolute', left: '-14%', right: '-14%', bottom: '18%', borderRadius: 3 * U, border: `${2 * U}px solid ${THEME.mark}`, background: THEME.cardFeatured, textAlign: 'center', fontFamily: FONT.handBold, fontWeight: 700, fontSize: size * 0.24 * U, lineHeight: 1.3, color: THEME.mark }}>{typ}</div>
  </div>
);

const KafelDok = ({ k, open, openRef }: { k: Kafel, open: boolean, openRef?: Ref<HTMLDivElement> }) => (
  <Karta accent={k.turaTa} style={{ width: 196 * U, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 * U, padding: `${14 * U}px ${10 * U}px ${10 * U}px` }}>
    <Ikona typ={k.typ} />
    <span style={{ ...tekst(16, k.turaTa ? THEME.accentText : THEME.title, 700), marginTop: 6 * U }}>{k.nazwa}</span>
    <span style={tekst(16)}>{k.opis}</span>
    <span style={tekst(16)}><span style={{ color: DIFF.addText }}>{k.plus}</span>{'  '}<span style={{ color: DIFF.delText }}>{k.minus}</span></span>
    <Przycisk primary={open} boxRef={openRef}>{open ? PL.panel.zamknij : PL.panel.otworz}</Przycisk>
  </Karta>
);

const Diff = ({ d }: { d: DanePanelu['dokumenty'] }) => {
  const first = d.kafle.wartosc[0];
  return (
    <Karta featured style={{ display: 'flex', flexDirection: 'column', gap: 8 * U, padding: `${14 * U}px ${20 * U}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 * U }}>
        <Ikona typ={first?.typ ?? ''} size={34} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={tekst(16, THEME.title, 700)}>{d.sciezka.wartosc}</span>
          <span style={tekst(16)}>{`${d.opis.wartosc} `}<span style={{ color: DIFF.addText }}>{first?.plus}</span>{' '}<span style={{ color: DIFF.delText }}>{first?.minus}</span></span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 * U }}>
        <Przycisk primary>{W.zmiany}</Przycisk>
        <Przycisk>{W.podglad}</Przycisk>
        <Przycisk>{PL.panel.zamknij}</Przycisk>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {d.cytat.wartosc.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10 * U,
              padding: `${2 * U}px ${8 * U}px`,
              marginTop: r.rodzaj === 'hunk' && i > 0 ? 10 * U : 0,
              background: r.rodzaj === 'add' ? DIFF.addBg : r.rodzaj === 'del' ? DIFF.delBg : undefined,
              ...tekst(15, r.rodzaj === 'hunk' ? DIFF.hunk : r.rodzaj === 'add' ? DIFF.addText : r.rodzaj === 'del' ? DIFF.delText : DIFF.ctxText),
            }}
          >
            {r.rodzaj === 'hunk' ? <span>{r.tekst}</span> : (
              <>
                <span style={{ width: 26 * U, textAlign: 'right', color: DIFF.gutter, flexShrink: 0 }}>{r.a}</span>
                <span style={{ width: 26 * U, textAlign: 'right', color: DIFF.gutter, flexShrink: 0 }}>{r.b}</span>
                <span style={{ width: 12 * U, flexShrink: 0, color: r.rodzaj === 'ctx' ? DIFF.gutter : undefined }}>{r.rodzaj === 'add' ? '+' : r.rodzaj === 'del' ? '−' : ''}</span>
                <span style={ellipsis}>{r.tekst}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </Karta>
  );
};

interface DokumentyProps {
  d: DanePanelu['dokumenty'],
  open: number, // 0..1: the first tile opened to its diff
  openRef?: Ref<HTMLDivElement>, // its button, the pointer's target
  changedRef?: Ref<HTMLDivElement>, // the card of the changed documents, the scroll's target
}

export const Dokumenty = ({ d, open, openRef, changedRef }: DokumentyProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * U }}>
    <Naglowek>{W.tytul}</Naglowek>
    <span style={tekst(16)}>{W.opis}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 * U }}>
      <Przycisk primary>{W.zmienione}</Przycisk>
      <Przycisk>{W.wszystkie}</Przycisk>
      <span style={{ width: 1.5 * U, height: 22 * U, background: THEME.line, margin: `0 ${6 * U}px` }} />
      <Przycisk primary>{W.kafle}</Przycisk>
      <Przycisk>{W.drzewo}</Przycisk>
    </div>
    <Karta featured boxRef={changedRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 * U, padding: `${12 * U}px ${20 * U}px ${16 * U}px` }}>
      <span style={tekst(16, THEME.accentText, 600)}>{d.naglowek.wartosc}</span>
      <div style={{ display: 'flex', gap: 10 * U }}>
        {d.kafle.wartosc.map((k, i) => <KafelDok key={i} k={k} open={i === 0 && open > 0} openRef={i === 0 ? openRef : undefined} />)}
      </div>
    </Karta>
    {open > 0 ? (
      <div style={{ opacity: Math.min(1, open), transform: open < 1 ? `translateY(${(1 - open) * 18}px)` : undefined }}>
        <Diff d={d} />
      </div>
    ) : null}
    {d.grupy.wartosc.map(([nazwa, opis]) => (
      <div key={nazwa} style={{ display: 'flex', alignItems: 'center', gap: 20 * U }}>
        <span style={tekst(16, THEME.mark, 700)}>{nazwa}</span>
        <span style={tekst(16)}>{opis}</span>
        <Przycisk>{W.pokaz}</Przycisk>
      </div>
    ))}
  </div>
);
