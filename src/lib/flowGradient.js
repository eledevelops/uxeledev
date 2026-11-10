/**
 * Flowing coral gradient: a WebGL port of the Figma "Moving gradient" shader
 * used on the About statement. Plain JavaScript, no React.
 *
 * Usage:
 *   const flow = createFlowGradient(canvas);
 *   flow.play();       // start the animation
 *   flow.pause();      // stop it (e.g. when scrolled off-screen)
 *   flow.drawStill();  // one frame, no animation (reduced motion)
 *   flow.destroy();    // stop and free the GPU memory (component cleanup)
 *
 * Returns null if the browser has no WebGL2. The text then simply keeps its
 * normal color.
 *
 * Differences from Figma (decided with Ele, see reference/about-gradient-test):
 * - a mathematical sphere instead of 150k triangles (same noise, same motion)
 * - 6 coral stops instead of 3, coral-50 removed, harder edges, half speed
 */

// Palette tokens from theme.css, read at runtime so the colors stay in one place.
const STOP_TOKENS = [
  "--color-coral-600",
  "--color-coral-100",
  "--color-coral-400",
  "--color-coral-700",
  "--color-coral-200",
  "--color-coral-500",
];
const HARDNESS = 4; // 1 = Figma's soft blend, higher = sharper blob edges
const SPEED = 0.5; // 0.5 = twice as slow as the Figma settings
const ZOOM_PERCENT = 72; // Figma "Zoom" setting
const RENDER_SCALE = 0.5; // the gradient is soft, half resolution looks identical and costs 4x less

const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uAspect;
uniform float uFocal;
uniform float uRadius;
uniform vec3 uColors[8];
uniform float uStops[8];
uniform int uCount;
uniform float uHardness;
out vec4 outColor;

// Figma values: detail 1.78, morph speed 3.74, rotation speed 12% (x0.25), flow 0.26, twist 0.04
const float DETAIL = 1.78;
const float MORPH_SPEED = 3.74;
const float ROTATION_SPEED = 0.03;
const float WARP = 0.26;
const float TWIST = 0.04;

// ── Ported from Figma's WGSL, function by function ─────────────────
vec3 hash33(vec3 p) {
  vec3 q = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(q) * 43758.5453) * 2.0 - 1.0;
}
vec3 smootherCurve(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
float gradDot(vec3 cell, vec3 offset, vec3 local) { return dot(hash33(cell + offset), local - offset); }
float perlin3(vec3 p) {
  vec3 cell = floor(p);
  vec3 local = fract(p);
  vec3 w = smootherCurve(local);
  float n000 = gradDot(cell, vec3(0, 0, 0), local);
  float n100 = gradDot(cell, vec3(1, 0, 0), local);
  float n010 = gradDot(cell, vec3(0, 1, 0), local);
  float n110 = gradDot(cell, vec3(1, 1, 0), local);
  float n001 = gradDot(cell, vec3(0, 0, 1), local);
  float n101 = gradDot(cell, vec3(1, 0, 1), local);
  float n011 = gradDot(cell, vec3(0, 1, 1), local);
  float n111 = gradDot(cell, vec3(1, 1, 1), local);
  float nx00 = mix(n000, n100, w.x);
  float nx10 = mix(n010, n110, w.x);
  float nx01 = mix(n001, n101, w.x);
  float nx11 = mix(n011, n111, w.x);
  float nxy0 = mix(nx00, nx10, w.y);
  float nxy1 = mix(nx01, nx11, w.y);
  return mix(nxy0, nxy1, w.z) * 1.1547;
}
vec3 rotateOctave(vec3 p) {
  return vec3(0.00 * p.x + 0.80 * p.y + 0.60 * p.z, -0.80 * p.x + 0.36 * p.y - 0.48 * p.z, -0.60 * p.x - 0.48 * p.y + 0.64 * p.z);
}
float fbm(vec3 p) {
  vec3 q = p;
  float total = 0.0, amplitude = 1.0, weight = 0.0;
  for (int i = 0; i < 3; i++) {
    total += perlin3(q) * amplitude;
    weight += amplitude;
    q = rotateOctave(q) * 2.02 + vec3(3.7, 1.9, 6.3);
    amplitude *= 0.48;
  }
  return total / max(weight, 0.0001);
}
vec3 warpVector(vec3 p) {
  return vec3(perlin3(p), perlin3(p + vec3(5.2, 1.3, 2.8)), perlin3(p + vec3(1.7, 9.2, 4.4)));
}
float wrapPhase(float phase) { const float tau = 6.28318530718; return phase - floor(phase / tau) * tau; }
vec3 curvedDomainMotion(float t, vec3 rates, vec3 phases) {
  return vec3(sin(wrapPhase(t * rates.x + phases.x)), sin(wrapPhase(t * rates.y + phases.y)), cos(wrapPhase(t * rates.z + phases.z)));
}
vec3 primaryDomainMotion(float t) {
  return normalize(vec3(0.73, -0.41, 0.55)) * t * 0.105 + normalize(vec3(-0.28, 0.91, 0.31)) * t * 0.023
    + curvedDomainMotion(t, vec3(0.071, 0.043, 0.029), vec3(0.0, 1.73, 4.11)) * 0.16;
}
vec3 warpDomainMotion(float t) {
  return normalize(vec3(-0.46, 0.38, 0.80)) * t * 0.137 + normalize(vec3(0.84, 0.51, -0.18)) * t * 0.031
    + curvedDomainMotion(t, vec3(0.089, 0.053, 0.034), vec3(2.21, 5.07, 0.83)) * 0.12;
}
float heightField(vec3 direction, float morphTime) {
  float frequency = mix(1.05, 3.4, clamp(DETAIL / 5.0, 0.0, 1.0));
  vec3 p = direction * frequency + vec3(1.7, 3.1, 5.3) + primaryDomainMotion(morphTime);
  vec3 warp = warpVector(p * 0.55 + warpDomainMotion(morphTime) * 0.42 + vec3(0.7, -1.1, 0.4)) * WARP;
  return fbm(p + warp);
}
vec3 rotateAroundAxis(vec3 p, vec3 axis, float angle) {
  float c = cos(angle), s = sin(angle);
  return p * c + cross(axis, p) * s + axis * dot(axis, p) * (1.0 - c);
}
vec3 rotateX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
const vec3 TWIST_AXIS = vec3(-0.68, 0.54, 0.49) / length(vec3(-0.68, 0.54, 0.49));
float torsionAngle(vec3 d) {
  float axial = clamp(dot(d, TWIST_AXIS), -1.0, 1.0);
  return axial * (1.5 - 0.5 * axial * axial) * TWIST;
}
float spreadCoordinate(float raw) { return clamp((raw - 0.5) * 3.0 + 0.5, 0.0, 1.0); }
vec3 srgbToLinear(vec3 c) { vec3 v = max(c, 0.0); return mix(v / 12.92, pow((v + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), v)); }
vec3 linearToSrgb(vec3 c) { vec3 v = max(c, 0.0); return mix(v * 12.92, 1.055 * pow(v, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), v)); }
vec3 linearToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  vec3 lms = pow(max(vec3(l, m, s), 0.0), vec3(1.0 / 3.0));
  return vec3(0.2104542553 * lms.x + 0.7936177850 * lms.y - 0.0040720468 * lms.z,
              1.9779984951 * lms.x - 2.4285922050 * lms.y + 0.4505937099 * lms.z,
              0.0259040371 * lms.x + 0.7827717662 * lms.y - 0.8086757660 * lms.z);
}
vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
             -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
             -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 gradientAt(float t) {
  // Up to 8 stops: find the two stops around t, sharpen, smoothstep, blend in OKLab.
  int low = 0;
  for (int i = 0; i < 7; i++) {
    if (i >= uCount - 1) break;
    if (t >= uStops[i]) low = i;
  }
  int high = min(low + 1, uCount - 1);
  float amount = clamp((t - uStops[low]) / max(uStops[high] - uStops[low], 0.0001), 0.0, 1.0);
  amount = clamp((amount - 0.5) * uHardness + 0.5, 0.0, 1.0);
  amount = amount * amount * (3.0 - 2.0 * amount);
  return linearToSrgb(oklabToLinear(mix(linearToOklab(srgbToLinear(uColors[low])), linearToOklab(srgbToLinear(uColors[high])), amount)));
}

// ── The simplification: a mathematical sphere instead of 150k triangles ──
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 ndc = uv * 2.0 - 1.0;

  // Same camera as Figma: 3 units away, focal length from the zoom setting
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(ndc.x * uAspect / uFocal, ndc.y / uFocal, -1.0));
  float b = dot(ro, rd);
  float h = b * b - (dot(ro, ro) - uRadius * uRadius);

  if (h < 0.0) {
    // Ray misses the sphere: Figma's backdrop gradient
    vec2 screenUv = vec2(uv.x, 1.0 - uv.y);
    vec2 axis = normalize(vec2(0.62 * uAspect, 0.78));
    vec2 centered = vec2((screenUv.x - 0.5) * uAspect, screenUv.y - 0.5);
    float extent = abs(axis.x) * uAspect * 0.5 + abs(axis.y) * 0.5;
    outColor = vec4(gradientAt(clamp(dot(centered, axis) / (extent * 2.0) + 0.5, 0.0, 1.0)), 1.0);
    return;
  }

  vec3 hit = (ro + rd * (-b - sqrt(h))) / uRadius;

  // Undo Figma's animated rotation (in reverse order) to find the point on the original sphere
  float rotationTime = uTime * ROTATION_SPEED;
  vec3 q = rotateX(hit, 0.24);
  q = rotateAroundAxis(q, normalize(vec3(0.58, -0.69, 0.43)), -wrapPhase(rotationTime * 0.1732051));
  q = rotateAroundAxis(q, normalize(vec3(-0.71, 0.29, 0.64)), -wrapPhase(rotationTime * 0.2236068));
  q = rotateAroundAxis(q, normalize(vec3(0.36, 0.81, 0.46)), -wrapPhase(rotationTime * 0.287));
  q = rotateAroundAxis(q, TWIST_AXIS, -torsionAngle(normalize(q)));
  vec3 direction = normalize(q);

  float field = heightField(direction, uTime * MORPH_SPEED);
  outColor = vec4(gradientAt(spreadCoordinate(field * 0.5 + 0.5)), 1.0);
}`;

// "#cc4a1c" → [0.8, 0.29, 0.11] (WebGL wants colors from 0 to 1)
function hexToRgb(hex) {
  const value = hex.trim().replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
}

// Figma's camera math (from its render function), so "Zoom 72%" frames the sphere the same way.
function cameraFor(aspect) {
  const diagonal = Math.sqrt(1 + aspect * aspect);
  const baseFocal = 1.73;
  const targetFocal = baseFocal * 4;
  const required = (3 * diagonal) / Math.sqrt(targetFocal * targetFocal + diagonal * diagonal);
  const radius = Math.max(0.82, required / 0.72);
  const conservative = Math.min(3 - 0.001, radius * 0.72);
  const depth = Math.sqrt(Math.max(0.0001, 9 - conservative * conservative));
  const minCover = Math.min(10, Math.max(0.5, ((diagonal * depth) / (baseFocal * conservative)) * 1.12));
  const minZoom = Math.min(10, Math.max(0.5, minCover * 0.65));
  const zoom = Math.min(10, Math.max(minZoom, minZoom * Math.pow(10 / minZoom, ZOOM_PERCENT / 100)));
  return { focal: baseFocal * zoom, radius };
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export function createFlowGradient(canvas) {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;

  // ── Setup: compile the shaders, upload one triangle that covers the canvas ──
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name) => gl.getUniformLocation(program, name);

  // ── Colors: read the coral tokens from theme.css, spread the stops evenly ──
  const styles = getComputedStyle(document.documentElement);
  const colors = STOP_TOKENS.map((token) => hexToRgb(styles.getPropertyValue(token)));
  const positions = STOP_TOKENS.map((_, i) => i / (STOP_TOKENS.length - 1));
  while (colors.length < 8) colors.push([0, 0, 0]);
  while (positions.length < 8) positions.push(1);
  gl.uniform3fv(uniform("uColors"), colors.flat());
  gl.uniform1fv(uniform("uStops"), positions);
  gl.uniform1i(uniform("uCount"), STOP_TOKENS.length);
  gl.uniform1f(uniform("uHardness"), HARDNESS);

  // ── Size: match the canvas's on-screen size (at half resolution) ──
  const timeUniform = uniform("uTime");
  let elapsed = 0;

  function draw() {
    gl.uniform1f(timeUniform, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function resize() {
    const width = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
    const height = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    const aspect = width / height;
    const camera = cameraFor(aspect);
    gl.uniform2f(uniform("uRes"), width, height);
    gl.uniform1f(uniform("uAspect"), aspect);
    gl.uniform1f(uniform("uFocal"), camera.focal);
    gl.uniform1f(uniform("uRadius"), camera.radius);
    draw(); // resizing clears the canvas, so redraw right away
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  // ── Animation loop: only runs between play() and pause() ──
  let frameId = null;
  let lastTime = 0;

  function tick(now) {
    elapsed += ((now - lastTime) / 1000) * SPEED;
    lastTime = now;
    draw();
    frameId = requestAnimationFrame(tick);
  }

  return {
    play() {
      if (frameId !== null) return;
      lastTime = performance.now();
      frameId = requestAnimationFrame(tick);
    },
    pause() {
      if (frameId === null) return;
      cancelAnimationFrame(frameId);
      frameId = null;
    },
    drawStill() {
      draw();
    },
    destroy() {
      // Free the GPU objects but keep the context: React's StrictMode (development)
      // runs effects twice, and the second run reuses this same canvas.
      this.pause();
      resizeObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
