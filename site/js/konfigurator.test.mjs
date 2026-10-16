import { test } from "node:test";
import assert from "node:assert/strict";
import { SKLADNIKI, zbudujKomendy } from "./konfigurator.js";

const TRYBY = ["instaluje", "aktualizuje"];
const NARZEDZIA = ["claude", "cursor", "codex"];
const JEZYKI = ["pl", "en"];
const PLUGINY = { panel: "relai-panel", postep: "relai-progress", cache: "relai-cache-keeper" };

function podzbiory() {
  const wynik = [];
  for (let maska = 0; maska < 1 << SKLADNIKI.length; maska++) {
    wynik.push(SKLADNIKI.filter((_, i) => maska & (1 << i)));
  }
  return wynik;
}

function kombinacje(jezyk) {
  const wynik = [];
  for (const tryb of TRYBY) {
    for (const narzedzie of NARZEDZIA) {
      for (const skladniki of podzbiory()) wynik.push({ tryb, narzedzie, skladniki, jezyk });
    }
  }
  return wynik;
}

function sprawdzWspolne(k, w) {
  const etykieta = JSON.stringify(k);
  assert.ok(Object.isFrozen(w), `frozen: ${etykieta}`);
  for (const linia of w.linie) {
    assert.notEqual(linia, "", `empty line: ${etykieta}`);
    assert.equal(linia, linia.trim(), `untrimmed line: ${etykieta}`);
  }
  assert.ok(!w.prompt.startsWith("/"), `prompt starts with /: ${etykieta}`);
  assert.ok(w.prompt.length <= 5000, `prompt too long: ${etykieta}`);
}

function sprawdzLinki(k, w) {
  const etykieta = JSON.stringify(k);
  if (k.narzedzie === "claude" && w.linie.length > 0) {
    assert.ok(w.linkTerminal.startsWith("claude-cli://open?q="), etykieta);
    assert.ok(w.linkAplikacja.startsWith("claude://code/new?q="), etykieta);
    assert.equal(decodeURIComponent(w.linkTerminal.split("?q=")[1]), w.prompt, etykieta);
    assert.equal(decodeURIComponent(w.linkAplikacja.split("?q=")[1]), w.prompt, etykieta);
  } else {
    assert.equal(w.linkTerminal, null, etykieta);
    assert.equal(w.linkAplikacja, null, etykieta);
    assert.equal(w.prompt, "", etykieta);
  }
}

function sprawdzPlugin(k, w) {
  const etykieta = JSON.stringify(k);
  for (const [skl, plugin] of Object.entries(PLUGINY)) {
    const trafienia = w.linie.filter((l) => l.includes(plugin)).length;
    const oczekiwane = k.narzedzie === "claude" && k.skladniki.includes(skl) ? 1 : 0;
    assert.equal(trafienia, oczekiwane, `${plugin}: ${etykieta}`);
  }
}

function sprawdzPierwszaLinia(k, w) {
  const etykieta = JSON.stringify(k);
  if (k.narzedzie !== "claude" || w.linie.length === 0) return;
  if (k.tryb === "aktualizuje") {
    assert.equal(w.linie[0], "claude plugin marketplace update relai", etykieta);
  } else if (k.skladniki.includes("relai")) {
    assert.equal(w.linie[0], "claude plugin install relai --marketplace nowilus/relai", etykieta);
  } else {
    assert.equal(w.linie[0], "claude plugin marketplace add nowilus/relai", etykieta);
  }
}

function sprawdzPusty(k, w) {
  if (k.skladniki.length > 0) return;
  const etykieta = JSON.stringify(k);
  assert.deepEqual([...w.linie], [], etykieta);
  assert.equal(w.prompt, "", etykieta);
  assert.equal(w.linkTerminal, null, etykieta);
  assert.equal(w.linkAplikacja, null, etykieta);
  assert.deepEqual([...w.uwagi], ["brakWyboru"], etykieta);
}

for (const jezyk of JEZYKI) {
  test(`all 96 combinations satisfy the invariants (${jezyk})`, () => {
    // Arrange
    const wszystkie = kombinacje(jezyk);
    let sprawdzone = 0;

    // Act + Assert
    for (const k of wszystkie) {
      const w = zbudujKomendy(k, jezyk);
      sprawdzWspolne(k, w);
      sprawdzLinki(k, w);
      sprawdzPlugin(k, w);
      sprawdzPierwszaLinia(k, w);
      sprawdzPusty(k, w);
      sprawdzone += 1;
    }
    assert.equal(sprawdzone, 96);
  });
}

test("plugin order follows SKLADNIKI regardless of input order and duplicates are ignored", () => {
  const w = zbudujKomendy({
    tryb: "instaluje",
    narzedzie: "claude",
    skladniki: ["cache", "panel", "cache", "relai", "panel"],
  }, "en");

  assert.deepEqual([...w.linie], [
    "claude plugin install relai --marketplace nowilus/relai",
    "claude plugin install relai-panel@relai",
    "claude plugin install relai-cache-keeper@relai",
  ]);
});

test("claude update lists marketplace update, core and panel plugins in order", () => {
  const w = zbudujKomendy({ tryb: "aktualizuje", narzedzie: "claude", skladniki: ["postep", "relai"] }, "en");

  assert.deepEqual([...w.linie], [
    "claude plugin marketplace update relai",
    "claude plugin update relai@relai",
    "claude plugin update relai-progress@relai",
  ]);
});

test("polish and english prompts use their own wording for install and update", () => {
  const pl = { narzedzie: "claude", skladniki: ["relai"] };

  const plInst = zbudujKomendy({ ...pl, tryb: "instaluje" }, "pl").prompt;
  const plUpd = zbudujKomendy({ ...pl, tryb: "aktualizuje" }, "pl").prompt;
  const enInst = zbudujKomendy({ ...pl, tryb: "instaluje" }, "en").prompt;
  const enUpd = zbudujKomendy({ ...pl, tryb: "aktualizuje" }, "en").prompt;

  assert.equal(
    plInst,
    "Zainstaluj RelAI. Uruchom w powłoce po kolei:\nclaude plugin install relai --marketplace nowilus/relai\nPotem powiedz, czy trzeba zrestartować aplikację.",
  );
  assert.ok(plUpd.startsWith("Zaktualizuj RelAI. Uruchom w powłoce po kolei:\n"));
  assert.equal(
    enInst,
    "Install RelAI. Run these in the shell, in order:\nclaude plugin install relai --marketplace nowilus/relai\nThen tell me whether the app needs a restart.",
  );
  assert.ok(enUpd.startsWith("Update RelAI. Run these in the shell, in order:\n"));
});

test("cursor install and update lines use the language-specific folder placeholder", () => {
  const inst = zbudujKomendy({ tryb: "instaluje", narzedzie: "cursor", skladniki: ["relai"] }, "pl");
  const upd = zbudujKomendy({ tryb: "aktualizuje", narzedzie: "cursor", skladniki: ["relai"] }, "en");

  assert.deepEqual([...inst.linie], [
    "git clone https://github.com/nowilus/relai.git ~/narzedzia/relai",
    "node ~/narzedzia/relai/adapters/cursor/install.js <folder-projektu>",
  ]);
  assert.deepEqual([...upd.linie], [
    "cd ~/narzedzia/relai && git pull",
    "node ~/narzedzia/relai/adapters/cursor/install.js <project-folder>",
  ]);
});

test("codex install and update lines match INSTALACJA.md", () => {
  const inst = zbudujKomendy({ tryb: "instaluje", narzedzie: "codex", skladniki: ["relai"] }, "en");
  const upd = zbudujKomendy({ tryb: "aktualizuje", narzedzie: "codex", skladniki: ["relai"] }, "pl");

  assert.deepEqual([...inst.linie], [
    "git clone https://github.com/nowilus/relai.git ~/narzedzia/relai",
    "codex plugin marketplace add ~/narzedzia/relai",
    "codex plugin add relai@relai",
    "node ~/narzedzia/relai/adapters/codex/install.js <project-folder>",
  ]);
  assert.deepEqual([...upd.linie], [
    "cd ~/narzedzia/relai && git pull",
    "codex plugin marketplace upgrade",
    "codex plugin add relai@relai",
    "node ~/narzedzia/relai/adapters/codex/install.js <folder-projektu>",
  ]);
});

test("uwagi appear in the documented order and at most once", () => {
  const cursorPanel = zbudujKomendy({ tryb: "instaluje", narzedzie: "cursor", skladniki: ["relai", "panel"] }, "en");
  const claudePanelOnly = zbudujKomendy({ tryb: "instaluje", narzedzie: "claude", skladniki: ["cache"] }, "en");
  const claudeFull = zbudujKomendy({ tryb: "aktualizuje", narzedzie: "claude", skladniki: ["relai", "panel"] }, "en");
  const cursorPanelOnly = zbudujKomendy({ tryb: "instaluje", narzedzie: "codex", skladniki: ["panel"] }, "en");

  assert.deepEqual([...cursorPanel.uwagi], ["panelTylkoClaude", "restart", "sciezkaWindows"]);
  assert.deepEqual([...claudePanelOnly.uwagi], ["panelBezRelai", "restart"]);
  assert.deepEqual([...claudeFull.uwagi], ["restart"]);
  assert.deepEqual([...cursorPanelOnly.linie], []);
  assert.deepEqual([...cursorPanelOnly.uwagi], ["panelTylkoClaude"]);
});

test("a prompt with &, #, ?, spaces and newlines round-trips through encodeURIComponent", () => {
  const prompt = "a & b # c ? d\nline two = 100%\tend";

  const dekodowany = decodeURIComponent(encodeURIComponent(prompt));

  assert.equal(dekodowany, prompt);
  assert.ok(!/[&# \n?]/.test(encodeURIComponent(prompt)));
});

test("invalid input throws TypeError", () => {
  const ok = { tryb: "instaluje", narzedzie: "claude", skladniki: ["relai"] };

  assert.throws(() => zbudujKomendy({ ...ok, tryb: "usuwa" }), TypeError);
  assert.throws(() => zbudujKomendy({ ...ok, narzedzie: "vim" }), TypeError);
  assert.throws(() => zbudujKomendy({ ...ok, skladniki: ["relai", "nieznany"] }), TypeError);
  assert.throws(() => zbudujKomendy({ ...ok, skladniki: "relai" }), TypeError);
  assert.throws(() => zbudujKomendy(null), TypeError);
  assert.throws(() => zbudujKomendy(ok, "de"), TypeError);
});
