// Install configurator. Commands follow docs/INSTALACJA.md; deep links open a prefilled prompt only.
// Pure core (zbudujKomendy) has no DOM access; DOM is touched only inside zamontuj / odczytajWybor.

export const SKLADNIKI = Object.freeze(["relai", "panel", "postep", "cache"]);

const PLUGINY = Object.freeze({ panel: "relai-panel", postep: "relai-progress", cache: "relai-cache-keeper" });
const REPO = "nowilus/relai";
const TRYBY = ["instaluje", "aktualizuje"];
const NARZEDZIA = ["claude", "cursor", "codex"];
const JEZYKI = ["pl", "en"];
const MAX_PROMPT = 5000;
const KLON = `git clone https://github.com/${REPO}.git ~/narzedzia/relai`;
const AKTUALIZACJA_REPO = "cd ~/narzedzia/relai && git pull";

function waliduj(wybor, jezyk) {
  if (!wybor || typeof wybor !== "object") throw new TypeError("wybor must be an object");
  if (!TRYBY.includes(wybor.tryb)) throw new TypeError(`unknown tryb: ${String(wybor.tryb)}`);
  if (!NARZEDZIA.includes(wybor.narzedzie)) throw new TypeError(`unknown narzedzie: ${String(wybor.narzedzie)}`);
  if (!Array.isArray(wybor.skladniki)) throw new TypeError("skladniki must be an array");
  for (const s of wybor.skladniki) {
    if (!SKLADNIKI.includes(s)) throw new TypeError(`unknown skladnik: ${String(s)}`);
  }
  if (!JEZYKI.includes(jezyk)) throw new TypeError(`unknown jezyk: ${String(jezyk)}`);
}

function liniePluginuClaude(tryb, rdzen, panele) {
  const linie = [];
  if (tryb === "instaluje") {
    if (rdzen) linie.push(`claude plugin install relai --marketplace ${REPO}`);
    else if (panele.length) linie.push(`claude plugin marketplace add ${REPO}`);
    for (const p of panele) linie.push(`claude plugin install ${p}@relai`);
    return linie;
  }
  if (rdzen || panele.length) {
    linie.push("claude plugin marketplace update relai");
    if (rdzen) linie.push("claude plugin update relai@relai");
    for (const p of panele) linie.push(`claude plugin update ${p}@relai`);
  }
  return linie;
}

function linieAdapteru(narzedzie, tryb, jezyk) {
  const folder = jezyk === "pl" ? "<folder-projektu>" : "<project-folder>";
  const instalator = `node ~/narzedzia/relai/adapters/${narzedzie}/install.js ${folder}`;
  const zrodlo = tryb === "instaluje" ? KLON : AKTUALIZACJA_REPO;
  if (narzedzie === "cursor") return [zrodlo, instalator];
  const wtyczka = tryb === "instaluje"
    ? ["codex plugin marketplace add ~/narzedzia/relai"]
    : ["codex plugin marketplace upgrade"];
  return [zrodlo, ...wtyczka, "codex plugin add relai@relai", instalator];
}

function zbudujPrompt(tryb, linie, jezyk) {
  if (linie.length === 0) return "";
  const lista = linie.join("\n");
  const prompt = jezyk === "pl"
    ? `${tryb === "instaluje" ? "Zainstaluj" : "Zaktualizuj"} RelAI. Uruchom w powłoce po kolei:\n${lista}\nPotem powiedz, czy trzeba zrestartować aplikację.`
    : `${tryb === "instaluje" ? "Install" : "Update"} RelAI. Run these in the shell, in order:\n${lista}\nThen tell me whether the app needs a restart.`;
  if (prompt.startsWith("/")) throw new Error("prompt must not start with /");
  if (prompt.length > MAX_PROMPT) throw new Error(`prompt longer than ${MAX_PROMPT} characters`);
  return prompt;
}

function zbudujUwagi({ narzedzie, wybrane, rdzen, panele, linie }) {
  const uwagi = [];
  if (linie.length === 0 && wybrane.length === 0) uwagi.push("brakWyboru");
  if (narzedzie !== "claude" && panele.length) uwagi.push("panelTylkoClaude");
  if (narzedzie === "claude" && !rdzen && panele.length) uwagi.push("panelBezRelai");
  if (linie.length) uwagi.push("restart");
  if (narzedzie !== "claude" && linie.length) uwagi.push("sciezkaWindows");
  return uwagi;
}

/**
 * @param {{ tryb: "instaluje" | "aktualizuje", narzedzie: "claude" | "cursor" | "codex", skladniki: string[] }} wybor
 * @param {"pl" | "en"} [jezyk]
 */
export function zbudujKomendy(wybor, jezyk = "en") {
  waliduj(wybor, jezyk);
  const wybrane = SKLADNIKI.filter((s) => wybor.skladniki.includes(s));
  const rdzen = wybrane.includes("relai");
  const panele = wybrane.filter((s) => s in PLUGINY).map((s) => PLUGINY[s]);

  let linie = [];
  if (wybor.narzedzie === "claude") linie = liniePluginuClaude(wybor.tryb, rdzen, panele);
  else if (rdzen) linie = linieAdapteru(wybor.narzedzie, wybor.tryb, jezyk);

  const prompt = wybor.narzedzie === "claude" ? zbudujPrompt(wybor.tryb, linie, jezyk) : "";
  const q = encodeURIComponent(prompt);
  const maLinki = prompt !== "";
  return Object.freeze({
    linie: Object.freeze(linie),
    prompt,
    linkTerminal: maLinki ? `claude-cli://open?q=${q}` : null,
    linkAplikacja: maLinki ? `claude://code/new?q=${q}` : null,
    uwagi: Object.freeze(zbudujUwagi({ narzedzie: wybor.narzedzie, wybrane, rdzen, panele, linie })),
  });
}

/** Reads the form state; browser only (FormData). */
export function odczytajWybor(form) {
  const dane = new FormData(form);
  return {
    tryb: dane.get("tryb") || "instaluje",
    narzedzie: dane.get("narzedzie") || "claude",
    skladniki: dane.getAll("skladnik"),
  };
}

function ustawLink(el, href) {
  if (!el) return;
  if (href) {
    el.setAttribute("href", href);
    el.removeAttribute("hidden");
  } else {
    el.removeAttribute("href");
    el.setAttribute("hidden", "");
  }
}

function wypiszUwagi(lista, uwagi, teksty, doc) {
  if (!lista) return;
  lista.textContent = "";
  for (const klucz of uwagi) {
    const tekst = teksty.uwagi?.[klucz];
    if (!tekst) continue;
    const li = doc.createElement("li");
    li.textContent = tekst;
    lista.appendChild(li);
  }
}

function zaznaczTekst(el, doc, win) {
  const zakres = doc.createRange();
  zakres.selectNodeContents(el);
  const sel = win.getSelection();
  sel.removeAllRanges();
  sel.addRange(zakres);
}

// If the page keeps focus after the link click, no app handled the custom scheme.
function obserwujLink(el, doc, win, przyBraku) {
  if (!el) return;
  el.addEventListener("click", () => {
    let timer = null;
    const anuluj = () => {
      clearTimeout(timer);
      win.removeEventListener("blur", anuluj);
      doc.removeEventListener("visibilitychange", anuluj);
    };
    win.addEventListener("blur", anuluj);
    doc.addEventListener("visibilitychange", anuluj);
    timer = setTimeout(() => {
      anuluj();
      if (doc.hasFocus() && doc.visibilityState === "visible") przyBraku();
    }, 1500);
  });
}

/** Wires the configurator form; browser only. */
export function zamontuj(form, teksty) {
  const doc = form.ownerDocument;
  const win = doc.defaultView;
  const wyjscie = form.querySelector("[data-komendy]");
  const kopiuj = form.querySelector("[data-kopiuj]");
  const terminal = form.querySelector("[data-terminal]");
  const aplikacja = form.querySelector("[data-aplikacja]");
  const uwagi = form.querySelector("[data-uwagi]");
  const status = form.querySelector("[data-status]");
  let tekstKomend = "";
  let timerKopiuj = null;

  const ustawStatus = (t) => { if (status) status.textContent = t; };

  function odswiez() {
    const wynik = zbudujKomendy(odczytajWybor(form), teksty.jezyk);
    tekstKomend = wynik.linie.join("\n");
    wyjscie.textContent = tekstKomend || teksty.brakWyboru;
    ustawLink(terminal, wynik.linkTerminal);
    ustawLink(aplikacja, wynik.linkAplikacja);
    wypiszUwagi(uwagi, wynik.uwagi, teksty, doc);
    ustawStatus("");
  }

  async function skopiuj() {
    if (!tekstKomend) return;
    try {
      await win.navigator.clipboard.writeText(tekstKomend);
      kopiuj.textContent = teksty.skopiowano;
      ustawStatus(teksty.skopiowano);
    } catch {
      zaznaczTekst(wyjscie, doc, win);
      ustawStatus(teksty.zaznaczono);
    }
    clearTimeout(timerKopiuj);
    timerKopiuj = setTimeout(() => { kopiuj.textContent = teksty.kopiuj; }, 1600);
  }

  form.addEventListener("change", odswiez);
  form.addEventListener("submit", (e) => e.preventDefault());
  kopiuj?.addEventListener("click", skopiuj);
  obserwujLink(terminal, doc, win, () => ustawStatus(teksty.brakSchematu));
  obserwujLink(aplikacja, doc, win, () => ustawStatus(teksty.brakSchematu));
  odswiez();
}
