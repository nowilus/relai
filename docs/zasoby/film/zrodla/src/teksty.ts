// Words of the film that are not data, in Polish: one section per scene of scenariusz.ts. Figures
// never live here — not one digit in this file. A figure reaches the frame through a marker such
// as {komendy}, which wstaw() in fakty.ts fills from src/dane/manifest.json; the test of facts holds
// every figure in the frame to the manifest and to paski.json. The English twin comes with the loop.
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
    etapy: 'etapów',
    punkty: 'punktów',
    nastepny: 'następny',
    wToku: 'w toku',
    wszystko: 'wszystkie punkty odhaczone',
    zuzyte: 'zużyte',
    pelna: 'bateria pełna w',
    // the note on the progress count in PaskiDalej.tsx, laid out as the battery's note: the stage's
    // points ticked and the plan's stages closed, figures from paski.json
    postep: Object.freeze({
      tytul: 'postęp etapu',
      odhaczone: 'odhaczone',
      z: 'z',
      plan: 'plan:',
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
      'Przycisk zamiast komendy — {komendy} komend w grupach.',
      'Mapa zaczyna od tego, co robi ta sesja.',
      'Dokumenty jako kafle, zmiana widoczna po wybraniu.',
      'Koszty sesji i etapów, liczone z cennika.',
    ]),
  }),
  nowaSesja: Object.freeze({
    tytul: 'Etap w nowej sesji',
    pytanie: 'Zaczynamy?',
    tak: 'Tak',
    nie: 'Nie',
    ekran: 'karta „Tak / Nie”, nowa sesja z komendą w polu, start etapu',
    napisy: Object.freeze([
      'Karta pyta, zanim cokolwiek ruszy.',
      'Etap startuje w nowej sesji z gotową komendą.',
      'Stara rozmowa zostaje — nic nie ginie.',
    ]),
  }),
  pracaWraca: Object.freeze({
    tytul: 'Praca wraca',
    zapisz: 'zapisz pracę',
    wznow: 'Wznów pracę',
    ekran: 'karta progu limitu, zapis pracy, po resecie „Wznów pracę”',
    napisy: Object.freeze([
      'Przy {progLimitu} % limitu {oknoLimitu} RelAI proponuje zapis pracy.',
      'Testy, commit i plik wznowienia — przed końcem limitu.',
      'Po resecie praca wraca tam, gdzie stanęła.',
    ]),
  }),
  final: Object.freeze({
    tytul: 'Twój projekt pamięta wszystko',
    liczby: Object.freeze({
      planyZamkniete: 'planów zamkniętych',
      komendy: 'komend',
      testyRdzenia: 'testów rdzenia',
      narzedzia: 'narzędzia',
    }),
    instalacja: 'instalacja',
    wersja: 'RelAI {wersja}',
    ekran: 'liczby projektu, instalacja, pasek planu, który zrobił ten film',
    napisy: Object.freeze([
      'Działa w {narzedziaNazwy}.',
      'Ten film powstał według planu z paska.',
    ]),
  }),
  // the words of the animatic's boards, gone once a scene is built in full
  plansza: Object.freeze({
    ekran: 'tu będzie',
    sekundy: 's',
  }),
});
