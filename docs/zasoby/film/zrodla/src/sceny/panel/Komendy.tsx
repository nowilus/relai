// The Komendy tab of the panel (screenshots 01 and 02): the card "Teraz" with the active plan and
// its stage's points, the two recommended commands, then every other command in its group. Names
// and purposes come from core/panel (NAMES, FEATURED, GROUPS), the plan from paski.json.
import type { Ref } from 'react';
import { Img, staticFile } from 'remotion';
import { BAND, BAR, FEATURED, GROUPS, NAMES, THEME, iconName } from '../../rdzen';
import { PL } from '../../teksty';
import { ukladKomend } from '../../komendy';
import type { DanePaskow } from '../../dane/typy';
import { calmLine } from '../Pasek';
import { Karta, Naglowek, Przycisk, Segmenty, U, ellipsis, tekst } from './Czesci';

const P = PL.panel;
export const UKLAD = ukladKomend(FEATURED, GROUPS);
const nameOf = (c: string) => NAMES[c]?.[0] ?? c;
const purposeOf = (c: string) => NAMES[c]?.[1] ?? '';
const icon = (c: string) => staticFile(`znak/ikona-${iconName(c)}.svg`);

const Teraz = ({ d }: { d: DanePaskow }) => {
  const items = d.postep.punkty.wartosc;
  return (
    <Karta featured style={{ display: 'flex', flexDirection: 'column', gap: 6 * U }}>
      <div style={{ display: 'flex', gap: 22 * U, alignItems: 'baseline' }}>
        <span style={tekst(16, THEME.title, 700)}>{`${d.plan.plan.wartosc} · ${d.plan.etap.wartosc}`}</span>
        <span style={tekst(16, THEME.mark, 700)}>{d.plan.status.wartosc}</span>
      </div>
      {items.length > 0 ? (
        <>
          <Segmenty colors={items.map((it) => BAR.segment[it.status])} height={9} gap={9} />
          <span style={tekst(16, BAND.progress.color, 700)}>{`${d.postep.zrobione.wartosc}/${d.postep.razem.wartosc}`}</span>
          <span style={{ ...tekst(15), ...ellipsis }}>{calmLine(items)}</span>
        </>
      ) : <span style={tekst(15)}>{d.postep.slowa.wartosc}</span>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 * U }}>
        <span style={tekst(15)}>{`${P.teraz.taSesja}: ${d.plan.plan.wartosc} · ${d.plan.etap.wartosc} — ${P.teraz.aktywny}`}</span>
        <Przycisk>{P.teraz.zmien}</Przycisk>
      </div>
      <div style={{ display: 'flex' }}><Przycisk primary>{P.teraz.start}</Przycisk></div>
    </Karta>
  );
};

const Polecana = ({ c, d, openRef }: { c: string, d: DanePaskow, openRef?: Ref<HTMLDivElement> }) => (
  <Karta featured style={{ display: 'flex', alignItems: 'center', gap: 22 * U, padding: `${12 * U}px ${18 * U}px` }}>
    <Img src={icon(c)} style={{ width: 52 * U, height: 52 * U, flexShrink: 0, marginLeft: 6 * U }} />
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <span><b style={tekst(16, THEME.mark, 700)}>{nameOf(c)}</b> <span style={tekst(16)}>{`/${c}`}</span></span>
      <span style={tekst(16)}>{purposeOf(c)}</span>
      {c === 'relai-stage' ? <span style={tekst(16, THEME.accentText)}>{`${d.plan.plan.wartosc} · ${d.plan.etap.wartosc} ${d.plan.nazwa.wartosc}`}</span> : null}
    </div>
    <Przycisk boxRef={openRef}>{P.otworz}</Przycisk>
  </Karta>
);

const Wiersz = ({ c }: { c: string }) => (
  <Karta style={{ display: 'flex', alignItems: 'center', gap: 16 * U, padding: `${7 * U}px ${12 * U}px` }}>
    <Img src={icon(c)} style={{ width: 30 * U, height: 30 * U, flexShrink: 0 }} />
    <span style={{ flex: 1, ...ellipsis }}>
      <b style={tekst(16, THEME.title, 700)}>{nameOf(c)}</b>
      <span style={tekst(16)}>{` /${c} · ${purposeOf(c)}`}</span>
    </span>
    <Przycisk>{P.otworz}</Przycisk>
  </Karta>
);

export const Komendy = ({ d, openRef }: { d: DanePaskow, openRef?: Ref<HTMLDivElement> }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * U }}>
    <Teraz d={d} />
    <Naglowek style={{ marginTop: 8 * U }}>{P.teraz.polecane}</Naglowek>
    {UKLAD.polecane.map((c, i) => <Polecana key={c} c={c} d={d} openRef={i === 0 ? openRef : undefined} />)}
    {UKLAD.grupy.map((g) => (
      <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 * U }}>
        <Naglowek style={{ marginTop: 10 * U }}>{g.title}</Naglowek>
        {g.commands.map((c) => <Wiersz key={c} c={c} />)}
      </div>
    ))}
  </div>
);
