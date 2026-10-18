import { test } from "node:test";
import assert from "node:assert/strict";
import { KLUCZ, docelowyJezyk, zamontujJezyk } from "./jezyk.js";

// A Polish browser on the EN page: where does the redirect go? Fake document with the absolute
// hreflang link (E8) and, optionally, the relative language link of the header.
function przekierowanie({ zLinkiem }) {
  const elementy = {
    'a[data-jezyk="pl"]': zLinkiem ? { href: "http://localhost:4520/pl/" } : null,
    'link[rel="alternate"][hreflang="pl"]': { href: "https://nowilus.github.io/relai/pl/" },
  };
  let cel = null;
  const doc = {
    documentElement: { lang: "en" },
    querySelector: (s) => elementy[s] ?? null,
    querySelectorAll: () => [],
  };
  const win = {
    navigator: { languages: ["pl-PL"] },
    localStorage: { getItem: () => null, setItem: () => {} },
    location: { replace: (href) => { cel = href; } },
  };
  zamontujJezyk(doc, win);
  return cel;
}

test("redirect follows the relative language link, not the absolute hreflang (local preview stays local)", () => {
  assert.equal(przekierowanie({ zLinkiem: true }), "http://localhost:4520/pl/");
});

test("positive control: without the language link the redirect falls back to hreflang", () => {
  assert.equal(przekierowanie({ zLinkiem: false }), "https://nowilus.github.io/relai/pl/");
});

test("storage key is relai-jezyk", () => {
  assert.equal(KLUCZ, "relai-jezyk");
});

test("saved pl on the EN page redirects to pl", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: "pl", preferowane: ["en-US"] }), "pl");
});

test("saved en on the PL page redirects to en", () => {
  assert.equal(docelowyJezyk({ aktualny: "pl", zapisany: "en", preferowane: ["pl"] }), "en");
});

test("saved choice equal to the current page stays", () => {
  assert.equal(docelowyJezyk({ aktualny: "pl", zapisany: "pl", preferowane: ["en"] }), null);
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: "en", preferowane: ["pl"] }), null);
});

test("saved en beats a Polish browser", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: "en", preferowane: ["pl-PL"] }), null);
});

test("first visit on EN with pl as first preference redirects to pl", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: null, preferowane: ["pl"] }), "pl");
});

test("pl-PL and uppercase PL count as Polish", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: null, preferowane: ["pl-PL", "en"] }), "pl");
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: null, preferowane: ["PL"] }), "pl");
});

test("only the first preference counts: en-US first, pl second stays", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: null, preferowane: ["en-US", "pl"] }), null);
});

test("an invalid saved value is treated as no saved choice", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: "de", preferowane: ["pl"] }), "pl");
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: "", preferowane: ["en"] }), null);
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: 42, preferowane: ["en"] }), null);
});

test("PL page without a saved choice and an English browser stays", () => {
  assert.equal(docelowyJezyk({ aktualny: "pl", zapisany: null, preferowane: ["en-US"] }), null);
});

test("PL page never redirects to EN without a saved choice", () => {
  assert.equal(docelowyJezyk({ aktualny: "pl", zapisany: null, preferowane: ["de", "fr"] }), null);
  assert.equal(docelowyJezyk({ aktualny: "pl", zapisany: undefined, preferowane: [] }), null);
});

test("empty or missing preferences on the EN page stay", () => {
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: null, preferowane: [] }), null);
  assert.equal(docelowyJezyk({ aktualny: "en", zapisany: null, preferowane: undefined }), null);
});
