// The Mapa tab of the panel (screenshot 03): "Ta sesja" first, then the active plan with its stages
// — status sign and word from core/panel FLOW, the segment of each stage in the bar's colors — and
// the folded rows below. Stages from STATUS.md (panel.json, live), costs from the screenshot.
import type { Ref } from 'react';
import { BAR, FLOW, THEME } from '../../rdzen';
import { PL } from '../../teksty';
import type { DanePanelu, DanePaskow } from '../../dane/typy';
import { Karta, Kwota, Naglowek, Przycisk, Segmenty, U, ellipsis, tekst } from './Czesci';

const M = PL.panel.mapa;
type Etap = DanePanelu['mapa']['etapy']['wartosc'][number];
const flow = (status: string) => FLOW.stage[status as keyof typeof FLOW.stage] ?? null;

const WierszEtapu = ({ e, koszt, now }: { e: Etap, koszt: string | undefined, now: boolean }) => {
  const f = flow(e.status);
  return (
    <Karta accent={now} style={{ display: 'flex', alignItems: 'center', gap: 16 * U, padding: `${8 * U}px ${14 * U}px`, background: now ? undefined : THEME.card }}>
      <span style={{ ...tekst(16, f?.color ?? THEME.body, 700), width: 18 * U, textAlign: 'center' }}>{f?.mark ?? '?'}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ ...tekst(16, THEME.title, 700), ...ellipsis }}>{`${e.id} · ${e.nazwa}`}</span>
        <span style={tekst(16, f?.color ?? THEME.body)}>{e.status.toLowerCase()}</span>
      </div>
      {koszt ? <Kwota>{koszt}</Kwota> : <span style={tekst(16)}>{M.bezPomiaru}</span>}
      <Przycisk>{M.szczegoly}</Przycisk>
    </Karta>
  );
};

export const Mapa = ({ d, m, sessionRef }: { d: DanePaskow, m: DanePanelu['mapa'], sessionRef?: Ref<HTMLDivElement> }) => {
  const etapy = m.etapy.wartosc;
  const now = etapy.find((e) => e.status === 'W TOKU') ?? etapy.find((e) => e.status === 'GOTOWY DO STARTU');
  const koszty = m.kosztyEtapow.wartosc;
  const closed = `${M.zamkniete} ${d.plan.zamkniete.wartosc} ${M.z} ${d.plan.etapy.wartosc} ${M.etapow}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * U }}>
      <Naglowek>{M.taSesja}</Naglowek>
      <Karta featured style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* the words the film rings: this session's plan and stage */}
          <div ref={sessionRef} style={{ width: 'fit-content', display: 'flex', flexDirection: 'column' }}>
            <span style={tekst(16, THEME.mark, 700)}>{`${d.plan.plan.wartosc} · ${d.plan.etap.wartosc}`}</span>
            <span style={tekst(16)}>{`${d.plan.status.wartosc} · ${d.plan.nazwa.wartosc}`}</span>
          </div>
        </div>
        <Kwota size={32}>{m.kosztSesji.wartosc}</Kwota>
      </Karta>
      <Karta style={{ display: 'flex', alignItems: 'center', gap: 28 * U }}>
        <Naglowek color={THEME.accentText}>{M.aktywnyPlan}</Naglowek>
        <span style={{ flex: 1, ...tekst(16), ...ellipsis }}>{`${m.plan.wartosc} · ${d.plan.status.wartosc} · ${closed} · ${m.kosztPlanu.wartosc}`}</span>
        <Przycisk>{`▾ ${M.zwin}`}</Przycisk>
      </Karta>
      <Karta featured style={{ display: 'flex', flexDirection: 'column', gap: 10 * U, padding: `${12 * U}px ${18 * U}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 * U }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={tekst(16, THEME.mark, 700)}>{m.plan.wartosc}</span>
            <span style={tekst(16)}>{`${m.statusPlanu.wartosc} · ${closed}`}</span>
          </div>
          <Kwota size={32}>{m.kosztPlanu.wartosc}</Kwota>
          <Przycisk primary>{M.zwin}</Przycisk>
        </div>
        <Segmenty colors={etapy.map((e) => BAR.segment[flow(e.status)?.item ?? 'unknown'])} height={9} gap={12} />
        {now ? <span style={tekst(14, THEME.title, 700)}>{`${M.teraz}: ${now.id} · ${now.nazwa}`}</span> : null}
        {etapy.map((e) => <WierszEtapu key={e.id} e={e} koszt={koszty[e.id]} now={e === now} />)}
      </Karta>
      {m.zwiniete.wartosc.map(([nazwa, opis]) => (
        <Karta key={nazwa} style={{ display: 'flex', alignItems: 'center', gap: 28 * U }}>
          <Naglowek color={THEME.accentText}>{nazwa}</Naglowek>
          <span style={{ flex: 1, ...tekst(16), ...ellipsis }}>{opis}</span>
          <Przycisk>{`▸ ${M.rozwin}`}</Przycisk>
        </Karta>
      ))}
    </div>
  );
};
