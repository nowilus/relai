// The shape of src/dane/paski.json, written by skrypty/dane.mjs: every leaf carries its source.
export type Fakt<T> = { wartosc: T, zrodlo: string };
export type StatusPunktu = 'done' | 'pending' | 'running' | 'failed' | 'unknown';

export type Miara = {
  klucz: 'cache' | 'limit5h' | 'reset' | 'tydzien' | 'kontekst',
  etykieta: Fakt<string>,
  wartosc: Fakt<string>,
  zostalo: Fakt<number>,
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
