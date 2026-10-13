// Words of the film that are not data: one section per scene of scenariusz.ts, in Polish (PL) and,
// since E6, in English (EN) — the two films differ only by this dictionary (plan, section 4,
// variant A). Figures never live here — not one digit in this file. A figure reaches the frame
// through a marker such as {komendy}, which wstaw() in fakty.ts fills from src/dane/manifest.json;
// a plural marker {komendy|komenda|komendy|komend} writes the noun form the figure takes. The test
// of facts holds every figure in the frame to the manifest and to paski.json.
// The product's own words — the panel's tabs and buttons, the bars' words, the cards, the words on
// the props — stay as the product draws them, in Polish in the English film too; EN repeats them
// as they are. One exception, Annex D: the commands' names in scene 2 are English in EN (PL keeps
// NAMES of core/panel, held equal by wiernosc.test.mjs).
// No imports: Node loads this file as is for the tests.
export const PL = Object.freeze({
  pamiec: Object.freeze({
    tytul: 'Pamięć',
    notatka: 'a gdyby projekt pamiętał?',
    haslo: 'Twój projekt pamięta wszystko',
    okno: 'nowa sesja',
    napisy: Object.freeze([
      'Każda nowa sesja zaczyna od pustej kartki.',
      'RelAI trzyma plan, decyzje i lekcje w repozytorium.',
    ]),
  }),
  paski: Object.freeze({
    nadpis: 'zawsze na widoku',
    tytul: 'Trzy paski nad promptem',
    // the second question was "jak daleko" until E3 (Łukasz, round 1: it did not fit the count)
    pytania: Object.freeze(['nad czym pracuję', 'ile zrobione', 'ile zostało']),
    napis1: 'Nad promptem stoją trzy paski: plan, postęp i cache.',
    napis2: 'Bateria pokazuje, ile zostało — jak w telefonie.',
    notatka: 'ile zostało',
    // the bars' own words (relai-panel, relai-progress): product words
    etapy: 'etapów',
    punkty: 'punktów',
    nastepny: 'następny',
    wToku: 'w toku',
    wszystko: 'wszystkie punkty odhaczone',
    zuzyte: 'zużyte',
    pelna: 'bateria pełna w',
    // the note on the progress count in PaskiDalej.tsx, laid out as the battery's note: the stage's
    // points ticked and the plan's stages closed, figures from paski.json; the note's own nouns
    // (E6: the bars' nouns above are the product's)
    postep: Object.freeze({
      tytul: 'postęp etapu',
      odhaczone: 'odhaczone',
      z: 'z',
      plan: 'plan:',
      punkty: 'punktów',
      etapy: 'etapów',
    }),
    // the continuation of the scene after the finished bars (PaskiDalej.tsx): its notes answer the
    // other two questions of `pytania`, its subtitles say what the plan and the progress bars count
    napisy: Object.freeze([
      'Postęp liczy punkty weryfikacji z promptu etapu.',
      'Plan pokazuje etap, nad którym pracuje ta sesja.',
    ]),
  }),
  panel: Object.freeze({
    tytul: 'Panel RelAI',
    // the tabs of the real panel, names and order (panel/hooks/pane-parts.tsx TABS; wiernosc.test.mjs)
    zakladki: Object.freeze(['Komendy', 'Koszty', 'Dokumenty', 'Mapa', 'Pomoc']),
    // the words of the panel's own surface, as relai-panel 0.14 writes them (screenshots 01–07)
    otworz: 'Otwórz',
    zamknij: 'Zamknij',
    teraz: Object.freeze({
      taSesja: 'Ta sesja',
      aktywny: 'aktywny plan',
      zmien: 'Zmień',
      start: 'Start etapu…',
      polecane: 'Polecane teraz',
    }),
    mapa: Object.freeze({
      taSesja: 'Ta sesja',
      aktywnyPlan: 'Aktywny plan',
      zamkniete: 'zamknięte',
      z: 'z',
      etapow: 'etapów',
      teraz: 'Teraz',
      szczegoly: 'Szczegóły',
      zwin: 'Zwiń',
      rozwin: 'Rozwiń',
      bezPomiaru: 'bez pomiaru',
    }),
    dokumenty: Object.freeze({
      tytul: 'Dokumenty projektu',
      opis: 'Zmienione na górze; otwórz dokument, żeby zobaczyć jego zmiany albo treść.',
      zmienione: 'Zmienione',
      wszystkie: 'Wszystkie',
      kafle: 'Kafle',
      drzewo: 'Drzewo',
      zmiany: 'Zmiany',
      podglad: 'Podgląd',
      pokaz: 'Pokaż',
    }),
    koszty: Object.freeze({
      tytul: 'Koszty sesji',
      cennik: 'Cennik',
      modele: 'Modele w pomiarach projektu',
      aktualizuj: 'Zaktualizuj cennik',
    }),
    napisy: Object.freeze([
      'Przycisk zamiast komendy — {komendy} {komendy|komenda|komendy|komend} w grupach.',
      'Mapa zaczyna od tego, co robi ta sesja.',
      'Dokumenty jako kafle, zmiana widoczna po wybraniu.',
      'Koszty sesji i etapów, liczone z cennika.',
    ]),
  }),
  // scene 2 "Komendy" (Annexes A and B): the names are NAMES of core/panel, word for word, and the
  // slogans the ones Łukasz accepted after two rounds, word for word (wiernosc.test.mjs)
  komendy: Object.freeze({
    tytul: 'Komendy',
    nazwy: Object.freeze({
      'relai-adopt': 'Adopcja projektu',
      'relai-prompt': 'Optymalizator promptu',
      'relai-stage': 'Etap planu',
      'relai-crew': 'Załoga agentów',
      'relai-branch': 'Odnoga planu',
      'relai-audit': 'Przegląd projektu',
      'relai-clean': 'Sprzątanie',
      'relai-backup': 'Kopia zapasowa',
      'relai-changelog': 'Lista zmian',
      'relai-update': 'Aktualizacja',
      'relai-models': 'Lista modeli',
      'relai-help': 'Ściąga projektu',
      'relai-tour': 'Wycieczka po projekcie',
      'relai-handover': 'Pakiet przekazania',
    }),
    slogany: Object.freeze({
      'relai-adopt': 'RelAI w projekcie, który już masz',
      'relai-prompt': 'Z luźnego zdania — precyzyjne polecenie',
      'relai-stage': 'Kolejny etap planu jednym kliknięciem',
      'relai-crew': 'Większe zadanie podzielone między agentów',
      'relai-branch': 'Poboczny pomysł czeka na swoją kolej',
      'relai-audit': 'Szybka kontrola stanu dokumentacji',
      'relai-clean': 'Usuwa zbędne pliki robocze',
      'relai-backup': 'Cały projekt w ZIP-ie, bez sekretów',
      'relai-changelog': 'Co się zmieniło — prosto z dziennika',
      'relai-update': 'Aktualizacja do najnowszej wersji RelAI',
      'relai-models': 'Zawsze aktualna lista modeli',
      'relai-help': 'Wszystkie komendy w jednym miejscu',
      'relai-tour': 'Szybkie wprowadzenie do projektu',
      'relai-handover': 'Cały projekt do przekazania w jednym pliku',
    }),
    // words written on the props: each is the product's own word, quoted from the command file
    // named beside it in wiernosc.test.mjs
    rekwizyty: Object.freeze({
      zip: 'ZIP',
      env: '.env',
    }),
    // the stamp on the stage card of /relai-stage: the confirmation card's own "Tak" in Polish,
    // translated in English with the names (Annex E; wiernosc.test.mjs)
    pieczatka: 'Tak',
  }),
  // scene 5: the card's own words (title, rows, question) come from core/panel through sceny.json;
  // "Tak" and "Nie" are the card's buttons in pane-parts.tsx (wiernosc.test.mjs)
  nowaSesja: Object.freeze({
    tytul: 'Etap w nowej sesji',
    tak: 'Tak',
    nie: 'Nie',
    okno: 'nowa sesja',
    napisy: Object.freeze([
      'Karta pyta, zanim cokolwiek ruszy.',
      'Etap startuje w nowej sesji z gotową komendą.',
      'Stara rozmowa zostaje — nic nie ginie.',
    ]),
  }),
  // scene 6: the card, the save phrase, its steps, the bar's rows and buttons come from
  // relai-cache-keeper and relai-core through sceny.json; "limit" is the bar's own label (screenshot
  // z1) and "Gdzie jesteśmy" the session's own heading — product words; "próg" is the film's
  pracaWraca: Object.freeze({
    tytul: 'Praca wraca',
    limit: 'limit {oknoLimitu}',
    prog: 'próg',
    gdzie: 'Gdzie jesteśmy',
    napisy: Object.freeze([
      'Przy {progLimitu} % limitu {oknoLimitu} RelAI proponuje zapis pracy.',
      'Testy, commit i plik wznowienia — przed końcem limitu.',
      'Po resecie praca wraca tam, gdzie stanęła.',
    ]),
  }),
  final: Object.freeze({
    tytul: 'Twój projekt pamięta wszystko',
    // the label under each figure, by the fact's key: the noun form the figure takes
    liczby: Object.freeze({
      planyZamkniete: '{planyZamkniete|plan zamknięty|plany zamknięte|planów zamkniętych}',
      komendy: '{komendy|komenda|komendy|komend}',
      testyRdzenia: '{testyRdzenia|test rdzenia|testy rdzenia|testów rdzenia}',
      narzedzia: '{narzedzia|narzędzie|narzędzia|narzędzi}',
    }),
    instalacja: 'instalacja',
    wersja: 'RelAI {wersja}',
    napisy: Object.freeze([
      'Działa w {narzedziaNazwy}.',
      'Ten film powstał według planu z paska.',
    ]),
  }),
  // the README loop (E6, Petla.tsx): scenes "Trzy paski" and "Panel" in a 720×900 frame; a title
  // over each part and one-line subtitles, short enough for a phone
  petla: Object.freeze({
    nadpisy: Object.freeze(['zawsze na widoku', 'panel w aplikacji']),
    tytuly: Object.freeze(['Trzy paski nad promptem', 'Przycisk zamiast komendy']),
    napisy: Object.freeze([
      'Plan, postęp i cache nad promptem.',
      'Bateria mówi, ile zostało z limitu.',
      'Każda komenda ma swój przycisk.',
      'Mapa zaczyna od tego, co robi ta sesja.',
    ]),
  }),
});

/** The shape of PL with its words widened to string: the keys are the contract, not the words. */
type Ksztalt<T> = T extends string ? string
  : T extends readonly (infer U)[] ? readonly Ksztalt<U>[]
  : { readonly [K in keyof T]: Ksztalt<T[K]> };
export type Slownik = Ksztalt<typeof PL>;

// The English film (E6). The tagline is the one of decision D-01; slogans and names of scene 2 as
// Łukasz accepted them on 2026-10-12 (Annex D), word for word (wiernosc.test.mjs).
export const EN: Slownik = Object.freeze({
  pamiec: Object.freeze({
    tytul: 'Memory',
    notatka: 'what if the project remembered?',
    haslo: 'Your project remembers everything',
    okno: 'new session',
    napisy: Object.freeze([
      'Every new session starts from a blank page.',
      'RelAI keeps the plan, decisions and lessons in the repository.',
    ]),
  }),
  paski: Object.freeze({
    nadpis: 'always in view',
    tytul: 'Three bars above the prompt',
    pytania: Object.freeze(['what am I working on', 'how much is done', 'how much is left']),
    napis1: 'Above the prompt stand three bars: plan, progress and cache.',
    napis2: 'The battery shows how much is left — like on a phone.',
    notatka: 'how much is left',
    etapy: PL.paski.etapy,
    punkty: PL.paski.punkty,
    nastepny: PL.paski.nastepny,
    wToku: PL.paski.wToku,
    wszystko: PL.paski.wszystko,
    zuzyte: 'used',
    pelna: 'battery at',
    postep: Object.freeze({
      tytul: 'stage progress',
      odhaczone: 'ticked',
      z: 'of',
      plan: 'plan:',
      punkty: 'points',
      etapy: 'stages',
    }),
    napisy: Object.freeze([
      'Progress counts the verification points of the stage prompt.',
      'The plan shows the stage this session is working on.',
    ]),
  }),
  panel: Object.freeze({
    ...PL.panel,
    napisy: Object.freeze([
      'A button instead of a command — {komendy} {komendy|command|commands} in groups.',
      'The map starts with what this session is doing.',
      'Documents as tiles, the change shown once you pick one.',
      'Session and stage costs, counted from the price list.',
    ]),
  }),
  komendy: Object.freeze({
    tytul: 'Commands',
    nazwy: Object.freeze({
      'relai-adopt': 'Project adoption',
      'relai-prompt': 'Prompt optimizer',
      'relai-stage': 'Plan stage',
      'relai-crew': 'Agent crew',
      'relai-branch': 'Plan branch',
      'relai-audit': 'Project review',
      'relai-clean': 'Cleanup',
      'relai-backup': 'Backup',
      'relai-changelog': 'Changelog',
      'relai-update': 'Update',
      'relai-models': 'Model list',
      'relai-help': 'Project cheat sheet',
      'relai-tour': 'Project tour',
      'relai-handover': 'Handover package',
    }),
    slogany: Object.freeze({
      'relai-adopt': 'RelAI in the project you already have',
      'relai-prompt': 'From a loose sentence to a precise prompt',
      'relai-stage': "The plan's next stage in one click",
      'relai-crew': 'A bigger task shared among agents',
      'relai-branch': 'A side idea waits for its turn',
      'relai-audit': 'A quick health check of your docs',
      'relai-clean': 'Clears away leftover working files',
      'relai-backup': 'The whole project in a ZIP, no secrets',
      'relai-changelog': 'What changed — straight from the journal',
      'relai-update': 'Up to the latest version of RelAI',
      'relai-models': 'An always up-to-date list of models',
      'relai-help': 'Every command in one place',
      'relai-tour': 'A quick introduction to the project',
      'relai-handover': 'The whole project in one handover file',
    }),
    rekwizyty: PL.komendy.rekwizyty,
    pieczatka: 'Yes',
  }),
  nowaSesja: Object.freeze({
    tytul: 'Stage in a new session',
    tak: PL.nowaSesja.tak,
    nie: PL.nowaSesja.nie,
    okno: 'new session',
    napisy: Object.freeze([
      'The card asks before anything moves.',
      'The stage starts in a new session with the command ready.',
      'The old conversation stays — nothing is lost.',
    ]),
  }),
  pracaWraca: Object.freeze({
    tytul: 'Work comes back',
    limit: PL.pracaWraca.limit,
    prog: 'threshold',
    gdzie: PL.pracaWraca.gdzie,
    napisy: Object.freeze([
      'At {progLimitu} % of the {oknoLimitu} limit, RelAI offers to save the work.',
      'Tests, a commit and a resume file — before the limit runs out.',
      'After the reset, work comes back where it stopped.',
    ]),
  }),
  final: Object.freeze({
    tytul: 'Your project remembers everything',
    liczby: Object.freeze({
      planyZamkniete: '{planyZamkniete|plan closed|plans closed}',
      komendy: '{komendy|command|commands}',
      testyRdzenia: '{testyRdzenia|core test|core tests}',
      narzedzia: '{narzedzia|tool|tools}',
    }),
    instalacja: 'install',
    wersja: PL.final.wersja,
    napisy: Object.freeze([
      'Works in {narzedziaNazwy}.',
      'This film was made following the plan in the bar.',
    ]),
  }),
  petla: Object.freeze({
    nadpisy: Object.freeze(['always in view', 'a panel in the app']),
    tytuly: Object.freeze(['Three bars above the prompt', 'A button, not a command']),
    napisy: Object.freeze([
      'Plan, progress and cache above the prompt.',
      'The battery shows what is left of the limit.',
      'Every command has its own button.',
      'The map starts with what this session does.',
    ]),
  }),
});

export const SLOWNIKI: Readonly<Record<'pl' | 'en', Slownik>> = Object.freeze({ pl: PL, en: EN });
