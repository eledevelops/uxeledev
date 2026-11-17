import { useEffect, useRef } from "react";

// Ambient dot texture behind the homepage body sections (spec: docs/body-texture-shader.md).
// Inspired by incredibles.dev's background, without the cursor/fluid part.
//
// How it works, in one fragment shader:
//   1. Moving gradient: slow, domain-warped fbm noise gives soft "clouds" from 0 to 1.
//   2. Dither: a 4×4 Bayer pattern turns that value into on/off dots (more dots where the cloud is denser).
//   3. Each "on" dot is the foreground token color at a very low opacity, drawn over the page background.
//
// The canvas renders at 1 pixel per dot (viewport ÷ pixelSize) and the browser scales it up with
// `image-rendering: pixelated`, so the dots stay crisp and the GPU does 4–16× less work.

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;   // canvas size in dots
uniform float uTime;        // seconds
uniform vec3 uColor;        // dot color (the foreground token)
uniform float uOpacity;     // dot opacity
uniform float uZoom;
uniform float uDetail;
uniform float uWarp;
uniform float uTwist;
uniform float uMorphSpeed;
uniform float uRotationSpeed;
uniform float uContrast;
uniform float uMinDensity;
uniform float uMaxDensity;

// Value noise: random values on a grid, smoothly blended in between
float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// fbm: 3 layers of noise, each finer and fainter. The offsets drift with time, so the shapes morph.
float fbm(vec2 p, float t) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    float phase = t + float(i) * 1.7;
    p = p * uDetail + vec2(12.7 + cos(phase), 4.3 + sin(phase));
    amplitude *= 0.5;
  }
  return value / 0.875; // 0.5 + 0.25 + 0.125: back to 0..1
}

mat2 rotate(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

// 4×4 Bayer matrix: a fixed threshold from 0 to 15/16 for every dot in a 4×4 tile
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  // Centered, aspect-correct coordinates (1.0 = the screen height)
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Slow rotation of the whole field, plus a slight twist that grows away from the center
  uv = rotate(uTime * uRotationSpeed + length(uv) * uTwist) * uv;

  vec2 p = uv * (2.0 / uZoom);
  float t = uTime * uMorphSpeed;

  // Domain warp: bend the coordinates with another noise before reading the final noise
  vec2 offset = vec2(fbm(p + vec2(7.1, -3.9), t), fbm(p + vec2(-2.3, 5.2), t)) - 0.5;
  float cloud = fbm(p + offset * uWarp + vec2(t * 0.6, -t * 0.4), t);

  // More contrast = clearer clouds; then keep the density between min and max, so no area is blank or solid
  cloud = clamp((cloud - 0.5) * uContrast + 0.5, 0.0, 1.0);
  float density = mix(uMinDensity, uMaxDensity, cloud);

  // Dither: this dot is on when the cloud is denser than its Bayer threshold
  float on = density > bayer4(gl_FragCoord.xy) ? 1.0 : 0.0;

  float alpha = on * uOpacity;
  gl_FragColor = vec4(uColor * alpha, alpha); // premultiplied alpha
}
`;

const FRAME_INTERVAL = 1000 / 30; // cap at ~30 fps: the drift is slow, more frames wouldn't show

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Turns any CSS color (hex, rgb, oklch…) into [r, g, b] from 0 to 1, by painting one pixel
function cssColorToRgb(color) {
  const context = document.createElement("canvas").getContext("2d");
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export default function BodyTexture({
  pixelSize = 2, // dot size in CSS pixels
  zoom = 1, // bigger = larger clouds
  detail = 2, // how much finer each noise layer is
  warp = 1.6, // how much the clouds bend and swirl
  twist = 0.15, // extra rotation away from the center
  morphSpeed = 0.05, // how fast the cloud shapes change
  rotationSpeed = 0.004, // radians per second
  contrast = 4.5, // how defined the clouds are
  minDensity = 0.04, // share of dots in the emptiest areas (never 0: no blank patches)
  maxDensity = 0.7, // share of dots in the densest areas
  opacityLight = 0.05, // from Figma: Body texture / light
  opacityDark = 0.1, // from Figma: Body texture / dark
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    // No WebGL: hide the canvas, the plain page background is the fallback
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    // ── Program and the full-screen triangle ──
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // One triangle bigger than the screen covers every pixel (simpler than two triangles)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name) => gl.getUniformLocation(program, name);
    gl.uniform1f(uniform("uZoom"), zoom);
    gl.uniform1f(uniform("uDetail"), detail);
    gl.uniform1f(uniform("uWarp"), warp);
    gl.uniform1f(uniform("uTwist"), twist);
    gl.uniform1f(uniform("uMorphSpeed"), morphSpeed);
    gl.uniform1f(uniform("uRotationSpeed"), rotationSpeed);
    gl.uniform1f(uniform("uContrast"), contrast);
    gl.uniform1f(uniform("uMinDensity"), minDensity);
    gl.uniform1f(uniform("uMaxDensity"), maxDensity);
    const uResolution = uniform("uResolution");
    const uTime = uniform("uTime");
    const uColor = uniform("uColor");
    const uOpacity = uniform("uOpacity");

    const startTime = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The first child of <main> is the hero (scroll video or static image)
    const hero = document.querySelector("main")?.firstElementChild;

    function draw(now) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - startTime) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Colors come from the design tokens: the dots are the foreground color, very faint
    function applyTheme() {
      const isDark = document.documentElement.classList.contains("dark");
      gl.uniform3fv(uColor, cssColorToRgb(getComputedStyle(document.body).color));
      gl.uniform1f(uOpacity, isDark ? opacityDark : opacityLight);
      draw(performance.now());
    }

    // 1 canvas pixel per dot; the CSS size is a whole number of dots, so every dot is the same size
    function resize() {
      const columns = Math.ceil(window.innerWidth / pixelSize);
      const rows = Math.ceil(window.innerHeight / pixelSize);
      canvas.width = columns;
      canvas.height = rows;
      canvas.style.width = `${columns * pixelSize}px`;
      canvas.style.height = `${rows * pixelSize}px`;
      gl.uniform2f(uResolution, columns, rows);
      draw(performance.now());
    }

    // ── Animation loop: ~30 fps, skipped while the hero covers the whole screen ──
    // The values that change while it runs live in one object (same pattern as useAutoplay)
    const loop = { frameId: null, lastFrame: 0, resizeTimer: null };

    function tick(now) {
      loop.frameId = requestAnimationFrame(tick);
      if (now - loop.lastFrame < FRAME_INTERVAL) return;
      if (hero && hero.getBoundingClientRect().bottom >= window.innerHeight) return;
      loop.lastFrame = now;
      draw(now);
    }

    function play() {
      if (loop.frameId === null) loop.frameId = requestAnimationFrame(tick);
    }

    function pause() {
      if (loop.frameId !== null) {
        cancelAnimationFrame(loop.frameId);
        loop.frameId = null;
      }
    }

    // Hidden tab or reduced motion: stop. Reduced motion still shows one still frame.
    function updatePlayback() {
      if (document.hidden || reducedMotion.matches) {
        pause();
        if (reducedMotion.matches) draw(startTime);
      } else {
        play();
      }
    }

    function onResize() {
      clearTimeout(loop.resizeTimer);
      loop.resizeTimer = setTimeout(resize, 150);
    }

    // The browser can drop the GPU context (driver reset, too many contexts): fall back to the plain background
    function onContextLost() {
      pause();
      canvas.style.display = "none";
    }

    // Theme switch: the dark class on <html> changes. Read the colors on the next frame,
    // after the browser has applied the new styles.
    const themeObserver = new MutationObserver(() => requestAnimationFrame(applyTheme));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    resize();
    applyTheme();
    updatePlayback();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      pause();
      clearTimeout(loop.resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", updatePlayback);
      reducedMotion.removeEventListener("change", updatePlayback);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [
    pixelSize,
    zoom,
    detail,
    warp,
    twist,
    morphSpeed,
    rotationSpeed,
    contrast,
    minDensity,
    maxDensity,
    opacityLight,
    opacityDark,
  ]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="[image-rendering:pixelated]" />
    </div>
  );
}
