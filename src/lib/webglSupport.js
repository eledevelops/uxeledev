// Is WebGL drawn by a real graphics card?
// Without one (headless test browsers like PageSpeed/Lighthouse, virtual machines, some locked-down
// computers), Chrome draws WebGL on the CPU with a "software renderer". The page then freezes for
// seconds, so the WebGL effects (hero video, dot texture, flowing gradient) are skipped and their
// fallbacks show instead (static hero image, plain background, plain text).
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

let fast; // checked once, then remembered for every effect

export function hasFastWebGL() {
  if (fast === undefined) {
    // failIfMajorPerformanceCaveat: the browser refuses the context (in a few ms) when it would
    // have to fall back to software rendering. The cheapest check, so it goes first.
    const gl = document.createElement("canvas").getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) {
      fast = false;
    } else {
      // Backup check for browsers that were told to use a software renderer on purpose: the real
      // renderer name ("Apple M1", "Adreno 650", "SwiftShader"…). Browsers that hide it fall back
      // to the generic RENDERER string.
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      fast = !SOFTWARE_RENDERER.test(renderer);
      // Free the test context right away (browsers allow only a few at a time)
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }
  return fast;
}
