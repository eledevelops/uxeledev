/**
 * Hero scroll video: draws the day or night scene frame by frame on one WebGL
 * canvas, with live stars in the night sky. Plain JavaScript, no React.
 * Port of reference/night-scroll-demo (spec: docs/hero-scroll-video.md).
 *
 * Usage:
 *   const scene = createHeroScene(canvas, { theme: "dark", onProgress });
 *   scene.setFrame(120);     // video frame to show, 0 to FRAME_COUNT - 1 (decimals are fine)
 *   scene.setTheme("light"); // swap scenes; the other scene starts loading the first time
 *   scene.play();            // start the render loop
 *   scene.pause();           // stop it (e.g. when the hero is off-screen)
 *   scene.destroy();         // stop, cancel loading, free the GPU memory (component cleanup)
 *
 * onProgress(fraction) is called while the active theme's frames load (0 to 1).
 * Returns null if the browser has no WebGL. The hero then keeps its static image.
 */
import { STAR_CENTER_Y } from "./heroStarCenters";

export const FRAME_COUNT = 724; // frames per scene (15 s at 48 fps)
const FILE_COUNT = FRAME_COUNT / 2; // each file holds two frames
const FRAME_W = 1920;
const FRAME_H = 1080;
const SCENES = {
  dark: { firstFile: 0, stars: true }, // f000–f361
  light: { firstFile: FILE_COUNT, stars: false }, // f362–f723
};
const PARALLEL_LOADS = 6; // how many files download at the same time
const MAX_DPR = 2; // never draw at more than 2x, even on 3x phones
const STARS = { count: 1500, speed: 0.1, trailFade: 0.36, brightness: 0.25 };
const CENTER_X = 0.5; // the spiral center is always in the middle horizontally

const fileUrl = (index) => `/hero/f${String(index).padStart(3, "0")}.webp`;

// ── Shaders (GPU programs) ─────────────────────────────────────────

// Covers the whole canvas with one rectangle and passes the position (0 to 1) on.
const QUAD_VS = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

// Star trails: copy last frame's trails a little darker (and shifted with the camera).
const FADE_FS = `
precision mediump float;
varying vec2 uv;
uniform sampler2D uPrev;
uniform vec2 uShift;
uniform float uKeep;
void main() {
  vec2 s = uv - uShift;
  vec4 c = (s.x < 0.0 || s.y < 0.0 || s.x > 1.0 || s.y > 1.0) ? vec4(0.0) : texture2D(uPrev, s);
  gl_FragColor = max(c * uKeep - 1.0 / 255.0, 0.0);
}`;

// Stars: one round, soft point per star.
const STAR_VS = `
attribute vec2 aPos;
attribute float aSize;
attribute vec4 aCol;
uniform vec2 uRes;
varying vec4 vCol;
void main() { vCol = aCol; gl_PointSize = aSize; gl_Position = vec4(aPos / uRes * 2.0 - 1.0, 0.0, 1.0); }`;

const STAR_FS = `
precision mediump float;
varying vec4 vCol;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = vCol.a * smoothstep(1.0, 0.6, d);
  gl_FragColor = vec4(vCol.rgb * a, a);
}`;

// Final picture: the video frame, cropped like object-fit: cover, plus the
// star trails only where the sky matte is white.
// File layout: rows 0–1080 frame A, 1080–2160 frame B, 2160–2700 mattes (A left, B right).
const FRAME_FS = `
precision mediump float;
varying vec2 uv;
uniform sampler2D uFrame;
uniform sampler2D uTrail;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform float uSlot;
uniform float uStars;
void main() {
  vec2 s = vec2(uv.x, 1.0 - uv.y);
  vec2 v = clamp(s * uScale + uOffset, 0.0, 1.0);
  vec3 col = texture2D(uFrame, vec2(v.x, (uSlot * 1080.0 + v.y * 1079.0) / 2700.0)).rgb;
  float sky = texture2D(uFrame, vec2((uSlot + v.x) * 0.5, (2160.0 + v.y * 539.0) / 2700.0)).r * uStars;
  vec4 t = texture2D(uTrail, uv);
  gl_FragColor = vec4(col + t.rgb * sky, 1.0);
}`;

// ── WebGL helpers ──────────────────────────────────────────────────

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource, uniformNames) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  // Look up every uniform once here, instead of on every frame.
  const uniforms = {};
  for (const name of uniformNames) uniforms[name] = gl.getUniformLocation(program, name);
  return { program, uniforms };
}

function createTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

// Coarse to fine: first and last file, then every 8th, 4th, 2nd, and the rest.
// Scrolling works early (with jumpier frames) and gets smoother as files arrive.
function buildLoadOrder() {
  const order = [0, FILE_COUNT - 1];
  const seen = new Set(order);
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < FILE_COUNT; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}
const LOAD_ORDER = buildLoadOrder();

// ── The scene ──────────────────────────────────────────────────────

export function createHeroScene(canvas, { theme, onProgress = () => {} }) {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;

  const fade = createProgram(gl, QUAD_VS, FADE_FS, ["uPrev", "uShift", "uKeep"]);
  const star = createProgram(gl, STAR_VS, STAR_FS, ["uRes"]);
  const comp = createProgram(gl, QUAD_VS, FRAME_FS, [
    "uFrame",
    "uTrail",
    "uScale",
    "uOffset",
    "uSlot",
    "uStars",
  ]);
  const quadPos = gl.getAttribLocation(fade.program, "p");
  const compPos = gl.getAttribLocation(comp.program, "p");
  const starPos = gl.getAttribLocation(star.program, "aPos");
  const starSize = gl.getAttribLocation(star.program, "aSize");
  const starCol = gl.getAttribLocation(star.program, "aCol");

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  function drawQuad(program, location) {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disableVertexAttribArray(location);
  }

  // ── State (plain variables: changing them never re-renders React) ──
  let currentTheme = theme;
  let frame = 0;
  let frameId = null;
  let destroyed = false;
  let shownKey = null; // which file is in the GPU right now, e.g. "dark12"
  let lastCenter = null;

  // ── Frame loading: only the visible theme loads ──
  const images = { dark: new Array(FILE_COUNT).fill(null), light: new Array(FILE_COUNT).fill(null) };
  const loadStarted = { dark: false, light: false };
  const loadedCount = { dark: 0, light: 0 };

  function loadScene(name) {
    if (loadStarted[name]) return;
    loadStarted[name] = true;
    let next = 0;

    function loadNext() {
      if (destroyed || next >= LOAD_ORDER.length) return;
      const index = LOAD_ORDER[next++];
      const image = new Image();
      image.src = fileUrl(SCENES[name].firstFile + index);
      image
        .decode()
        .then(() => {
          if (!destroyed) images[name][index] = image;
        })
        .catch(() => {}) // a missing file just stays empty; its neighbours fill in
        .finally(() => {
          if (destroyed) return;
          loadedCount[name]++;
          if (name === currentTheme) onProgress(loadedCount[name] / FILE_COUNT);
          loadNext();
        });
    }
    for (let k = 0; k < PARALLEL_LOADS; k++) loadNext();
  }

  // The closest file that has already loaded (looks both ways).
  function nearestFile(name, file) {
    const list = images[name];
    for (let d = 0; d < FILE_COUNT; d++) {
      if (file - d >= 0 && list[file - d]) return file - d;
      if (file + d < FILE_COUNT && list[file + d]) return file + d;
    }
    return -1;
  }

  // ── Stars: random spots on a spiral around the camera's sky center ──
  const stars = Array.from({ length: STARS.count }, () => {
    const t = Math.random();
    const rgb = t > 0.8 ? [173, 216, 230] : t > 0.6 ? [255, 223, 186] : [255, 255, 255];
    return {
      radius: Math.sqrt(Math.random()) * 1.05,
      angle: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.004,
      size: Math.random() * 1.5 + 0.5,
      rgb: rgb.map((c) => c / 255),
      brightness: Math.random(),
    };
  });
  const starData = new Float32Array(STARS.count * 7); // x, y, size, r, g, b, alpha
  const starBuffer = gl.createBuffer();

  // ── Size: match the canvas's on-screen size, crop the video like object-fit: cover ──
  const frameTexture = createTexture(gl);
  let trails = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let displayW = 0;
  let displayH = 0;
  let offsetX = 0;
  let offsetY = 0;

  // Two trail textures we draw back and forth between ("ping-pong").
  function createTrails() {
    trails.forEach((trail) => {
      gl.deleteTexture(trail.texture);
      gl.deleteFramebuffer(trail.framebuffer);
    });
    trails = [0, 1].map(() => {
      const texture = createTexture(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, framebuffer };
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    createTrails();
    const scale = Math.max(width / FRAME_W, height / FRAME_H);
    displayW = FRAME_W * scale;
    displayH = FRAME_H * scale;
    offsetX = (width - displayW) / 2;
    offsetY = (height - displayH) / 2;
    lastCenter = null;
    draw(); // resizing clears the canvas, so redraw right away
  }

  // Where the stars spin around, in CSS pixels, for a (decimal) frame number.
  function centerAt(f) {
    const i = Math.min(Math.floor(f), FRAME_COUNT - 2);
    const t = f - i;
    const y = STAR_CENTER_Y[i] * (1 - t) + STAR_CENTER_Y[i + 1] * t;
    return [offsetX + CENTER_X * displayW, offsetY + y * displayH];
  }

  function drawStars() {
    const [cx, cy] = centerAt(frame);
    const reach = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(width - cx, cy),
      Math.hypot(cx, height - cy),
      Math.hypot(width - cx, height - cy),
    );
    const shift = lastCenter ? [(cx - lastCenter[0]) / width, -(cy - lastCenter[1]) / height] : [0, 0];
    lastCenter = [cx, cy];
    const [source, target] = trails;

    // 1. Fade last frame's trails into the target texture.
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(fade.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source.texture);
    gl.uniform1i(fade.uniforms.uPrev, 0);
    gl.uniform2f(fade.uniforms.uShift, shift[0], shift[1]);
    gl.uniform1f(fade.uniforms.uKeep, 1 - STARS.trailFade);
    drawQuad(fade.program, quadPos);

    // 2. Move every star a little along its circle and draw it on top.
    let k = 0;
    for (const s of stars) {
      s.angle += s.speed * STARS.speed;
      const x = cx + Math.cos(s.angle) * s.radius * reach;
      const y = cy + Math.sin(s.angle) * s.radius * reach;
      starData[k++] = x * dpr;
      starData[k++] = (height - y) * dpr;
      starData[k++] = s.size * 2 * dpr + 1;
      starData[k++] = s.rgb[0];
      starData[k++] = s.rgb[1];
      starData[k++] = s.rgb[2];
      starData[k++] = s.brightness * STARS.brightness;
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(star.program);
    gl.uniform2f(star.uniforms.uRes, canvas.width, canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, starData, gl.DYNAMIC_DRAW);
    [starPos, starSize, starCol].forEach((location) => gl.enableVertexAttribArray(location));
    gl.vertexAttribPointer(starPos, 2, gl.FLOAT, false, 28, 0);
    gl.vertexAttribPointer(starSize, 1, gl.FLOAT, false, 28, 8);
    gl.vertexAttribPointer(starCol, 4, gl.FLOAT, false, 28, 12);
    gl.drawArrays(gl.POINTS, 0, stars.length);
    [starPos, starSize, starCol].forEach((location) => gl.disableVertexAttribArray(location));
    gl.disable(gl.BLEND);

    // 3. Swap: this frame's target is next frame's source.
    trails = [target, source];
    return target.texture;
  }

  function draw() {
    const want = Math.round(frame);
    const wantFile = want >> 1; // two frames per file: frames 24 and 25 are both in file 12
    // Show the active theme; until its first file arrives, show the other theme.
    let scene = currentTheme;
    let file = nearestFile(scene, wantFile);
    if (file < 0) {
      scene = scene === "dark" ? "light" : "dark";
      file = nearestFile(scene, wantFile);
    }
    if (file < 0) return; // nothing has loaded yet

    // Top or bottom frame of the file (0 or 1). A neighbour file uses its closest frame.
    const slot = file === wantFile ? want & 1 : file < wantFile ? 1 : 0;
    const key = scene + file;
    if (key !== shownKey) {
      gl.bindTexture(gl.TEXTURE_2D, frameTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[scene][file]);
      shownKey = key;
    }

    const withStars = SCENES[scene].stars;
    const trailTexture = withStars ? drawStars() : trails[0].texture;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(comp.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frameTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, trailTexture);
    gl.uniform1i(comp.uniforms.uFrame, 0);
    gl.uniform1i(comp.uniforms.uTrail, 1);
    gl.uniform2f(comp.uniforms.uScale, width / displayW, height / displayH);
    gl.uniform2f(comp.uniforms.uOffset, -offsetX / displayW, -offsetY / displayH);
    gl.uniform1f(comp.uniforms.uSlot, slot);
    gl.uniform1f(comp.uniforms.uStars, withStars ? 1 : 0);
    drawQuad(comp.program, compPos);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  loadScene(currentTheme);

  // ── Render loop: only runs between play() and pause() ──
  function tick() {
    draw();
    frameId = requestAnimationFrame(tick);
  }

  return {
    setFrame(value) {
      frame = Math.min(Math.max(value, 0), FRAME_COUNT - 1);
    },
    setTheme(name) {
      if (name === currentTheme) return;
      currentTheme = name;
      lastCenter = null;
      onProgress(loadedCount[name] / FILE_COUNT);
      loadScene(name);
    },
    play() {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(tick);
    },
    pause() {
      if (frameId === null) return;
      cancelAnimationFrame(frameId);
      frameId = null;
    },
    destroy() {
      // Free the GPU objects but keep the context: React's StrictMode (development)
      // runs effects twice, and the second run reuses this same canvas.
      this.pause();
      destroyed = true;
      resizeObserver.disconnect();
      trails.forEach((trail) => {
        gl.deleteTexture(trail.texture);
        gl.deleteFramebuffer(trail.framebuffer);
      });
      gl.deleteTexture(frameTexture);
      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(starBuffer);
      [fade, star, comp].forEach(({ program }) => gl.deleteProgram(program));
    },
  };
}
