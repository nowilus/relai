// The language of the film (E6): a composition sets it once, every scene reads its words from the
// dictionary of that language. Polish is the default, so a scene rendered on its own is the
// Polish scene it was before E6.
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { SLOWNIKI } from './teksty';
import type { Slownik } from './teksty';
import { wstaw as wstawFakty } from './fakty';
import type { Fakty, Jezyk } from './fakty';

const JezykCtx = createContext<Jezyk>('pl');

export const ZJezykiem = ({ jezyk, children }: { jezyk: Jezyk, children: ReactNode }) => (
  <JezykCtx.Provider value={jezyk}>{children}</JezykCtx.Provider>
);

export const useJezyk = (): Jezyk => useContext(JezykCtx);

/** The dictionary of the film's language. */
export const useT = (): Slownik => SLOWNIKI[useJezyk()];

/** wstaw() in the film's language: lists and plural forms as the language writes them. */
export const useWstaw = (): ((tekst: string, fakty: Fakty) => string) => {
  const jezyk = useJezyk();
  return (tekst, fakty) => wstawFakty(tekst, fakty, jezyk);
};
