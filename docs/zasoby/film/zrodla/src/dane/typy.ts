// The shape of src/dane/paski.json, written by skrypty/dane.mjs: every leaf carries its source.
export type Fakt<T> = { wartosc: T, zrodlo: string };
export type StatusPunktu = 'done' | 'pending' | 'running' | 'failed' | 'unknown';

export type Miara = {
  klucz: 'cache' | 'limit5h' | 'reset' | 'tydzien' | 'kontekst',
  etykieta: Fakt<string>,
  wartosc: Fakt<string>,
  zostalo: Fakt<number>,
};

/** The shape of src/dane/panel.json, written by skrypty/panel.mjs (scene 3). */
export type DanePanelu = {
  mapa: {
    plan: Fakt<string>, statusPlanu: Fakt<string>,
    etapy: Fakt<{ id: string, nazwa: string, status: string }[]>,
    kosztyEtapow: Fakt<Record<string, string>>,
    kosztSesji: Fakt<string>, kosztPlanu: Fakt<string>,
    zwiniete: Fakt<[string, string][]>,
  },
  dokumenty: {
    naglowek: Fakt<string>,
    kafle: Fakt<{ nazwa: string, typ: string, opis: string, plus: string, minus: string, turaTa: boolean }[]>,
    grupy: Fakt<[string, string][]>,
    sciezka: Fakt<string>, opis: Fakt<string>,
    cytat: Fakt<{ rodzaj: 'hunk' | 'ctx' | 'add' | 'del', a: string, b: string, tekst: string }[]>,
  },
  koszty: {
    suma: Fakt<string>, sumaOpis: Fakt<string>, podpis: Fakt<string>,
    udzialy: Fakt<{ klucz: 'input' | 'cacheRead' | 'cacheWrite' | 'output', nazwa: string, opis: string, dolary: number }[]>,
    kafle: Fakt<{ liczba: string, nazwa: string }[]>,
    cennik: Fakt<string>,
    modele: Fakt<{ id: string, rekordy: string, koszt: string }[]>,
    siec: Fakt<string>,
  },
};

export type DanePaskow = {
  plan: {
    plan: Fakt<string>, etap: Fakt<string>, status: Fakt<string>, nazwa: Fakt<string>,
    zamkniete: Fakt<number>, etapy: Fakt<number>,
  },
  postep: {
    zrobione: Fakt<number>, razem: Fakt<number>, slowa: Fakt<string>,
    punkty: Fakt<{ status: StatusPunktu, nazwa: string }[]>,
  },
  cache: { miary: Miara[], koszt: Fakt<string>, kosztJednostka: Fakt<string> },
};

/** The shape of src/dane/sceny.json, written by skrypty/sceny.mjs (scenes 4 and 5, E4). */
export type FaktKarty = { etykieta: string, wartosc: string, ton: 'ok' | 'warn' | 'zwykly' };
export type DaneScen = {
  nowaSesja: {
    naglowek: Fakt<string>, podpis: Fakt<string>, tytul: Fakt<string>,
    fakty: Fakt<FaktKarty[]>, pytanie: Fakt<string>,
    komenda: Fakt<string>, otwarto: Fakt<string>, zostaje: Fakt<string>,
    plan: Fakt<{ plan: string, etap: string, status: string, nazwa: string, zamkniete: number, etapy: number }>,
  },
  pracaWraca: {
    pytanie: Fakt<string>, dalej: Fakt<string>, opcje: Fakt<string[]>, prog: Fakt<number>,
    fraza: Fakt<string>, kroki: Fakt<string[]>,
    plikWznowienia: Fakt<string>, gotowe: Fakt<string>, zapis: Fakt<string>, odnowiony: Fakt<string>,
    przyciski: Fakt<string[]>, wznow: Fakt<string>,
  },
};
