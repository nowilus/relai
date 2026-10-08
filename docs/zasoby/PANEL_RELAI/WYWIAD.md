# Wywiad — panel wizualny RelAI

Data: 2026-10-08 · Autor zapisu: RelAI (gpt-6.1-sol) + Lukasz

Uzgodnione wymagania do przygotowania osobnego planu. Dokument zachowuje decyzje z wywiadu;
nie zastępuje planu wdrożenia ani jego akceptacji. Historia rozmowy i rozpoznania:
[DZIENNIK.md](../../DZIENNIK.md).

## Cel i zakres

- Graficzny panel pracy RelAI: przepływ, zadania, zależności, załoga, aktualizowane dokumenty,
  tokeny, hipotetyczne koszty API i timer cache. Dostarczany razem z RelAI.
- Pierwszy interfejs dla Codex desktop, następnie dla Claude Code. Lokalny Claude Code
  i Cursor mogą być wykonawcami załogi już w pierwszej wersji panelu Codeksa.
- Dane pozostają lokalnie. Pobranie publicznych cenników nie wysyła historii projektu.
- Panel jest powiązany z projektem bieżącego czatu. Projekt i powiązanie są widoczne
  w nagłówku; brak możliwości automatycznego rozpoznania wymaga jawnego powiązania.
- Główny widok: mapa przepływu z zależnościami, równoległością i rozwijanymi zadaniami.
- Nazwy przycisków komend pozostają `/relai-…`. Polski opis może objaśniać komendę,
  lecz nie zastępuje jej identyfikatora. Widoczna jest wywoływana procedura lub fraza.
- Kliknięcie komendy otwiera jej właściwe opcje i parametry przed przekazaniem do czatu.
  Użytkownik chce używać GUI zamiast ręcznego wpisywania komend.
- Podgląd dokumentów oraz wskazanie ich aktualizacji mają być dostępne podczas pracy.

## Uzgodnione ścieżki komend

| Komenda | Formularz i działanie | Wynik i decyzje |
|---|---|---|
| `/relai-stage` | Jeden formularz: plan i etap `Automatycznie` lub wskazane ręcznie. Domyślnie świeży czat, możliwość wybrania bieżącego. | Jedna karta potwierdzenia w panelu: plan, etap, model, zakres i weryfikacja. Kliknięcie uruchamia zatwierdzony etap bez ponownego pytania o ten sam start w czacie. Wymaga przyszłego dostosowania procedury. |
| `/relai-prompt` | Pole tekstu; model docelowy widoczny, domyślnie z sesji lub etapu. Pozostałe opcje rozwijane; niedostępne funkcje gospodarza oznaczone. | Oryginał, edytowalna propozycja i dopowiedzenia w panelu. Osobne wysłanie do bieżącego czatu (domyślnie), świeżego czatu albo kopiowanie. Optymalizacja sama nie wykonuje propozycji. |
| `/relai-crew` | Jeden przycisk z trybami: pełny przebieg, `review`, `rescue`, `setup`, `status`. Cel od człowieka, propozycja zadań i składu od agenta. Domyślnie bieżący czat, możliwość świeżego. | W panelu edycja i zatwierdzenie zadań, plików, zależności, ról, modeli i równoległości przed startem. Jawny wybór dozwolonych narzędzi. Koszty każdego wykonawcy, jeśli dostępne pomiary. |
| `/relai-branch` | Proponowana z kontekstu nazwa i cel do edycji; widoczne źródło: plan/etap albo wątek samodzielny. Zatwierdzenie utworzenia. | Podgląd karty i promptu, kopiowanie oraz osobny przycisk uruchomienia w świeżym czacie. Samo utworzenie odkłada wątek. |
| `/relai-backup` | Krótki formularz z ustawioną lokalizacją i możliwością jednorazowej zmiany; przycisk utworzenia backupu. | Ścieżka, rozmiar i wynik weryfikacji ZIP. |
| `/relai-audit` | Panel wybiera pełny raport albo `porzadki` / `zdrowie` i wywołuje komendę. | Wynik wyłącznie w czacie; dalsze decyzje o poprawkach w rozmowie. |
| `/relai-changelog` | Zakres: cały dziennik, od daty, od wersji albo ostatnie N wpisów. | Podgląd i kopiowanie w panelu; zapis do pliku osobnym działaniem. |
| `/relai-handover` | Formularz ścieżki z domyślną lokalizacją i możliwością zmiany. | Podgląd gotowego lokalnego pakietu HTML w panelu. |
| `/relai-tour` | Wybór pełnego oprowadzenia albo `krotko`. | Wynik w panelu i czacie. |
| `/relai-help` | Ściąga konkretnego projektu z wyszukiwaniem. | Przyciski otwierają formularze komend; samo czytanie pomocy nie uruchamia pracy. |
| `/relai-adopt` | Zgodnie z istniejącą procedurą: backup, analiza, zmiany i konflikty, zgoda, generacja, raport. | Postęp i raport w panelu; konflikty oraz zgoda na konkretne zmiany w czacie. |
| `/relai-update` | W panelu wersja obecna/docelowa, różnice, chronione nadpisania i wybór zmian. | Zatwierdzenie konkretnych zmian w panelu przed wykonaniem. |
| `/relai-models` | Lokalna lista z datą, pobranie z pokazanych źródeł, wybór klas, różnica stara/nowa. | Całość w panelu; pobranie i zatwierdzenie zapisu osobno. Lista modeli oddzielona od cennika API. |
| `/relai-clean` | Rozwijane grupy, pełne ścieżki, rozmiary i powody ochrony. Wybór usunięcia/zostawienia/trwałej ochrony oraz wyjątków. | Raport i decyzje w panelu; zatwierdzenie dokładnej listy. Nic domyślnie nie jest zaznaczone do usunięcia. |

## Naturalne wyzwalacze RelAI

- Dodatkowe przyciski grupują równoważne frazy pod działaniami, m.in. kontynuacja pracy,
  status projektu, zakończenie pracy i rozpoczęcie.
- Obejmują przydatne działania dotychczas uruchamiane tekstem, także inicjalizację i planowanie.
- Użytkownik widzi, jaka fraza lub procedura jest wywoływana. Źródła to rzeczywiste procedury
  i projektowa ściąga, a nie lista wymyślonych komend.

## Pomiary tokenów i hipotetycznego kosztu API

- Śledzenie obejmuje całą aktywność czatów projektu, również pracę poza procedurami RelAI.
- Zbieranie lokalnie podczas aktywnych sesji, także przy zamkniętym panelu GUI.
- Poza etapem lub przebiegiem załogi punktem wyjścia do zadania jest wiadomość uruchamiająca
  pracę. Dostępne ręczne scalanie zadań i przypisanie do etapu. Bez dodatkowego modelu
  analizującego każdą rozmowę.
- Raport obejmuje sesję, etap/zadanie oraz każdego agenta i model: orkiestratora, subagentów,
  testera, recenzenta i pozostałych uczestników. Jedna suma bez podwójnego liczenia subagentów.
- Oddzielne kategorie wejścia, wyjścia, odczytu i zapisu cache; model użyty przy danym wywołaniu
  decyduje o hipotetycznej cenie API. Zmiana modelu lub narzędzia nie przerywa przypisania pracy.
- Raport nie przypisuje procentów abonamentu do zadań. Korekta użytkownika zastąpiła ten
  pierwotny pomysł porównaniem rzeczywiście zmierzonych tokenów z cenami API.
- Brak liczników oznacza częściową sumę i jawne wskazanie brakujących pomiarów. Brak danych
  nie jest zerem ani domyślnie wyliczanym szacunkiem.
- Cenniki odświeżane wyłącznie przyciskiem. Widoczne źródło, data i ostrzeżenie o starej dacie;
  historyczne wyliczenia zachowują informację o użytych stawkach.

## Timer cache

- Timer przerwy w aktywności z ostrzeżeniami przed końcem przyjętego okna.
- Reset od potwierdzonego odczytu lub zapisu cache, także w wywołaniach modelu między
  wiadomościami użytkownika. Przy braku pomiaru jawnie oznaczony timer aktywności z mniej
  pewnego źródła.
- Przy nieznanym TTL w Codeksie datowany profil modelu stanowi oznaczoną prognozę.
  Użytkownik może zmienić założenie. Nie deklarujemy pewnego czasu wygaśnięcia.
- Ostrzeżenia w panelu i jako powiadomienia systemowe; techniczna dostępność do sprawdzenia.
- Domyślne progi 10 i 5 minut, edytowalne. Koniec timera nie dowodzi resetu rozmowy
  ani utraty całego cache.

## Rozpoznane fakty i granice weryfikacji

- RelAI 2.7.1 ma wspólny rdzeń procesu, trzy adaptery i 14 komend. Manifest Codeksa nie zawiera
  obecnie panelu MCP ani kolektora pomiarów. `core/process/crew.js` ma identyfikatory przebiegów
  i zadań oraz statusy, ale delegacje zapisują wyjście tekstowe.
- Lokalny zapis bieżącego czatu Codeksa zawiera pola wejścia, wejścia z cache, zapisów cache,
  wyjścia i rozumowania. Odczyt nie dowodzi stabilnego kontraktu pluginu ani pełnego przypisania
  do zadań i subagentów.
- Dokumentacja MCP Apps/Extensions opisuje panel przy rozmowie i komunikację z czatem.
  Nie przeprowadzono próby uruchomienia własnego widoku ani wysłania akcji w zainstalowanym
  gospodarzu. Nowy czat, powiązanie projektu, pełny dostęp do danych, powiadomienia i
  zatwierdzenie bez powtórnego pytania wymagają dowodu działania.
- Historyczny rekord Claude Code z 2026-08-20 w zapisach RelAI ma dodatnie
  `cache_creation.ephemeral_1h_input_tokens`; potwierdza godzinny TTL tamtego przebiegu.
- Dokumentacja OpenAI API z odczytu 2026-10-08 opisuje minimum 30 minut dla GPT-5.6 i nowszych
  od zapisu lub ponownego użycia. Nie potwierdzono dokładnego TTL abonamentowej sesji Codeksa.
- Cache opiera się na zgodności prefiksu. Samo pozostanie w sesji albo wykonanie forka nie
  gwarantuje trafienia.

Źródła rozpoznania (odczyt 2026-10-08):

- [Plugin Extensions](https://developers.openai.com/plugins/build/extensions)
- [Protokół Extensions](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md)
- [Codex app-server](https://learn.chatgpt.com/docs/app-server)
- [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage)
- [Claude Code channels](https://code.claude.com/docs/en/channels)
- [Claude prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

## Reguły przygotowania planu

- Osobny interaktywny, samowystarczalny HTML według szablonu RelAI; bez CDN, z rozwijanymi
  sekcjami, diagramem i działającym symulatorem kosztów na realnym przykładzie.
- Warianty z uzasadnionymi werdyktami, ryzyka z poziomami i konkretną mitygacją, etapy
  z szacunkami i wczesnym widocznym efektem, rozstrzygnięte przypadki brzegowe, decyzje człowieka.
- Wykonawca etapów: Opus, zgodnie z istniejącymi ustawieniami projektu. Autor planu:
  Fable według reguły projektu; ewentualny wyjątek dla bieżącej sesji wymaga odpowiedzi człowieka.
- Źródło specyfikacji w tym repozytorium: `core/templates/` (D-87), z zachowaniem pierwszeństwa
  nadpisania lokalnego szablonu, jeśli istnieje. Projektowy kierunek wizualny i decyzje zamrożone
  są w `docs/USTAWIENIA.md` oraz `docs/DECYZJE.md`.
- D-80 wykluczała GUI i telemetrię z wcześniejszego zakresu; nowa inicjatywa ma dostać osobny
  plan i jawne rozstrzygnięcie tej granicy, bez przepisywania dawnych planów.
- Akceptacja planu poprzedza implementację. Pierwszy prompt etapowy powstaje po akceptacji.
