import { test } from "node:test";
import assert from "node:assert/strict";
import { jestProgramowa, nazwaGrafiki } from "./grafika.js";

test("software rasterizers are recognised by the renderer name", () => {
  for (const n of [
    "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "llvmpipe (LLVM 15.0.7, 256 bits)",
    "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Mesa softpipe",
    "lavapipe (LLVM 17)",
  ]) assert.equal(jestProgramowa(n), true, n);
});

test("graphics cards and hidden names are not software", () => {
  for (const n of [
    "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti (0x00002782) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Apple GPU", "Adreno (TM) 640", "Mali-G78", "WebKit WebGL", "", undefined, null,
  ]) assert.equal(jestProgramowa(n), false, String(n));
});

test("the renderer name comes from the debug extension when there is one, else from RENDERER", () => {
  const gl = (rozszerzenie) => ({
    RENDERER: 0x1f01,
    getExtension: () => (rozszerzenie ? { UNMASKED_RENDERER_WEBGL: 0x9246 } : null),
    getParameter: (p) => ({ 0x9246: "SwiftShader driver", 0x1f01: "WebKit WebGL" })[p],
  });
  assert.equal(nazwaGrafiki(gl(true)), "SwiftShader driver");
  assert.equal(nazwaGrafiki(gl(false)), "WebKit WebGL");
});
