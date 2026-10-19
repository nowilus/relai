// A shared link with an anchor (/pl/biurko/#plan) must land on its stop. While the page loads it is
// still in the document flow, and the browser's own jump to the anchor runs then; were it smooth, its
// animation would outlive the switch to 3D and overwrite the instant jump in warstwa.js start()
// (measured 2026-10-19: #plan ended at the install stop, scrollY 2551 instead of 1523).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CSS = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "css", "strona.css"), "utf8");

/** Selectors of every rule that turns on smooth scrolling. */
export function selektoryPlynne(css) {
  return [...css.matchAll(/([^{}]+)\{[^{}]*scroll-behavior:\s*smooth/g)].map((m) => m[1].trim());
}

test("smooth scrolling exists for the document flow", () => {
  assert.ok(selektoryPlynne(CSS).length > 0);
});

test("smooth scrolling is off in 3D mode and while the page loads", () => {
  for (const s of selektoryPlynne(CSS)) {
    assert.match(s, /:not\(\.tryb-3d\)/, s);
    assert.match(s, /:not\(\.laduje\)/, s);
  }
});

test("the curtain class is set before the first paint, in the head of both desk pages", () => {
  const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
  for (const strona of [join(SITE, "biurko", "index.html"), join(SITE, "pl", "biurko", "index.html")]) {
    const glowa = readFileSync(strona, "utf8").split("</head>")[0];
    assert.match(glowa, /classList\.add\("laduje"\)/, strona);
  }
});
