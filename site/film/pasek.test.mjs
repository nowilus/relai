import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PROG_GORY, naGorze } from "./pasek.js";

describe("bar: the very top of the page", () => {
  test("the top of the page has no bar ground", () => {
    assert.equal(naGorze(0), true);
  });

  test("the ground arrives with the first wheel notch (100 px), not a third of a screen later", () => {
    assert.ok(PROG_GORY <= 40, `threshold ${PROG_GORY} px`);
    assert.equal(naGorze(PROG_GORY - 1), true);
    assert.equal(naGorze(PROG_GORY), false);
    assert.equal(naGorze(100), false);
  });
});
