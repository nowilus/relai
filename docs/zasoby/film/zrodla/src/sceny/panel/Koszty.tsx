// The Koszty tab of the panel (screenshots 06 and 07): the session's sum with the bar of its four
// token categories in core/panel COST_COLORS, three tiles, then the price list the costs are
// counted with — the panel's one network read, only after "Tak" on its card. Figures from the
// screenshots through panel.json; the line about the network read is quoted from pane-costs.tsx.
import type { Ref } from 'react';
import { BAR, COST_COLORS, THEME } from '../../rdzen';
import { FONT } from '../../tokeny';
import { PL } from '../../teksty';
import type { DanePanelu } from '../../dane/typy';
import { Karta, Kwota, Naglowek, Przycisk, U, tekst } from './Czesci';

const K = PL.panel.koszty;
const TILE_COLORS = [THEME.title, COST_COLORS.input, THEME.title];

export const Koszty = ({ k, netRef }: { k: DanePanelu['koszty'], netRef?: Ref<HTMLDivElement> }) => {
  const udzialy = k.udzialy.wartosc;
  const total = udzialy.reduce((s, u) => s + u.dolary, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * U }}>
      <Naglowek>{K.tytul}</Naglowek>
      <Karta featured style={{ display: 'flex', flexDirection: 'column', gap: 12 * U, padding: `${16 * U}px ${20 * U}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 * U }}>
          <Kwota size={44}>{k.suma.wartosc}</Kwota>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={tekst(16, THEME.title, 700)}>{k.sumaOpis.wartosc}</span>
            <span style={tekst(16)}>{k.podpis.wartosc}</span>
          </div>
        </div>
        <div style={{ display: 'flex', height: 10 * U, borderRadius: 5 * U, overflow: 'hidden' }}>
          {udzialy.map((u) => <div key={u.klucz} style={{ width: `${(u.dolary / total) * 100}%`, background: COST_COLORS[u.klucz] }} />)}
        </div>
        <div style={{ display: 'flex', gap: 24 * U, flexWrap: 'wrap' }}>
          {udzialy.map((u) => (
            <span key={u.klucz} style={{ display: 'flex', alignItems: 'center', gap: 8 * U, ...tekst(16) }}>
              <span style={{ width: 8 * U, height: 8 * U, borderRadius: '50%', background: COST_COLORS[u.klucz] }} />
              <b style={{ color: THEME.title, fontWeight: 600 }}>{u.nazwa}</b>
              <span>{u.opis}</span>
            </span>
          ))}
        </div>
      </Karta>
      <div style={{ display: 'flex', gap: 12 * U }}>
        {k.kafle.wartosc.map((t, i) => (
          <Karta key={t.nazwa} style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 16 * U, padding: `${14 * U}px ${20 * U}px` }}>
            <span style={{ fontFamily: FONT.handBold, fontWeight: 700, fontSize: 30 * U, color: TILE_COLORS[i] ?? THEME.title }}>{t.liczba}</span>
            <span style={tekst(16, THEME.title, 700)}>{t.nazwa}</span>
          </Karta>
        ))}
      </div>
      <Karta style={{ display: 'flex', alignItems: 'center', gap: 28 * U, borderColor: THEME.accent }}>
        <Naglowek color={THEME.accentText}>{K.cennik}</Naglowek>
        <span style={tekst(16)}>{k.cennik.wartosc}</span>
      </Karta>
      <Karta featured style={{ display: 'flex', flexDirection: 'column', gap: 10 * U, padding: `${14 * U}px ${20 * U}px` }}>
        <span style={tekst(16, THEME.mark, 700)}>{K.modele}</span>
        {k.modele.wartosc.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={tekst(16, BAR.text)}>{m.id}</span>
              <span style={tekst(15)}>{m.rekordy}</span>
            </div>
            <span style={tekst(16, THEME.mark, 700)}>{m.koszt}</span>
          </div>
        ))}
        <div style={{ display: 'flex' }}><Przycisk primary>{K.aktualizuj}</Przycisk></div>
        <div ref={netRef} style={{ ...tekst(16), width: 'fit-content' }}>{k.siec.wartosc}</div>
      </Karta>
    </div>
  );
};
