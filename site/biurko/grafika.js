// Software rendering (no GPU) draws the desk at 0.8 to 1.7 s per frame (SwiftShader, E6), so such a
// browser gets the page in the flow with the poster instead of the scene. Pure name check, plus the
// small DOM part that reads the renderer's name from a WebGL2 context.

const PROGRAMOWE = /swiftshader|llvmpipe|softpipe|lavapipe|basic render|microsoft warp|software rasterizer/i;

/** True when the renderer name belongs to a software rasterizer, not to a graphics card. */
export function jestProgramowa(nazwa) {
  return typeof nazwa === "string" && PROGRAMOWE.test(nazwa);
}

/** The renderer's name from a WebGL2 context ("" when the browser hides it). */
export function nazwaGrafiki(gl) {
  const rozszerzenie = gl.getExtension("WEBGL_debug_renderer_info");
  return String(gl.getParameter(rozszerzenie ? rozszerzenie.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
}
