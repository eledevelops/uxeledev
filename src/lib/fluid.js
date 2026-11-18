// A small GPU fluid simulation ("stable fluids": advect, add swirl, keep it incompressible).
// The cursor stirs it: each move pushes velocity and drops "ink" (dye) into the liquid, which then
// swirls, spreads and slowly dissolves. bodyTexture.js reads the dye to color its dots.
//
// Usage (inside an existing WebGL2 context):
//   const fluid = createFluid(gl, { width, height }); // null if the GPU can't render float textures
//   fluid.splat(x, y, dx, dy);   // x, y in 0..1 (bottom-left origin), dx, dy = movement in 0..1 units
//   fluid.step(dt);              // advance the simulation by dt seconds
//   fluid.dye;                   // the dye texture to sample (red channel = ink amount)
//   fluid.resize(width, height); fluid.destroy();

const SIM_SIZE = 128; // velocity/pressure grid, short side (low = cheap and smooth)
const DYE_SIZE = 384; // ink grid, short side (sharper ink edges)
const PRESSURE_ITERATIONS = 20; // more = more accurate "incompressible" liquid
const CURL = 12; // swirl strength (vorticity confinement)
const VELOCITY_DISSIPATION = 60; // how fast motion fades
const DYE_DISSIPATION = 2.0; // how fast ink fades: visible for about 2.3 ÷ this many seconds (2.0 ≈ 1.2 s)
const SPLAT_RADIUS = 0.0002; // size of each cursor splat
const SPLAT_FORCE = 12000; // how hard the cursor pushes
const SPLAT_INK = 0.5; // ink dropped per cursor move

// Shared vertex shader: a full-screen triangle, plus the 4 neighbor coordinates the fluid steps need
const VERTEX = `
precision highp float;
attribute vec2 aPosition;
uniform vec2 texelSize;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Add a soft round "splat" of a value (velocity or ink) at a point
const SPLAT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}
`;

// Move a quantity along the velocity (look backwards along the flow), fading it a little
const ADVECTION = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 velocityTexel;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * velocityTexel;
  gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
}
`;

// How much the liquid spins at each point
const CURL_SHADER = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
`;

// Push the liquid around its spin points: keeps small swirls alive (the "curly" look)
const VORTICITY = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
  gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}
`;

// How much liquid flows out of each point (should be 0 for an incompressible liquid)
const DIVERGENCE = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
`;

// Fade a texture toward 0 (used to restart the pressure guess each frame)
const CLEAR = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main() {
  gl_FragColor = value * texture2D(uTexture, vUv);
}
`;

// One step of solving for the pressure that cancels the divergence (repeated PRESSURE_ITERATIONS times)
const PRESSURE = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}
`;

// Subtract the pressure gradient from the velocity: the liquid becomes incompressible
const GRADIENT_SUBTRACT = `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
  return shader;
}

// A program plus its uniform locations, found by name
function createProgram(gl, vertexShader, fragmentSource) {
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.bindAttribLocation(program, 0, "aPosition"); // every program reads the triangle from slot 0
  gl.linkProgram(program);
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i).name;
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, fragmentShader, uniforms };
}

// Grid sizes for the current canvas shape, with the short side at `size`
function gridSize(width, height, size) {
  const aspect = width / height;
  return aspect > 1 ? { w: Math.round(size * aspect), h: size } : { w: size, h: Math.round(size / aspect) };
}

export function createFluid(gl, { width, height }) {
  // Needs WebGL2 and floating-point render targets (half floats keep it light)
  if (typeof WebGL2RenderingContext === "undefined" || !(gl instanceof WebGL2RenderingContext)) return null;
  if (!gl.getExtension("EXT_color_buffer_float") && !gl.getExtension("EXT_color_buffer_half_float")) return null;

  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const programs = {
    splat: createProgram(gl, vertexShader, SPLAT),
    advection: createProgram(gl, vertexShader, ADVECTION),
    curl: createProgram(gl, vertexShader, CURL_SHADER),
    vorticity: createProgram(gl, vertexShader, VORTICITY),
    divergence: createProgram(gl, vertexShader, DIVERGENCE),
    clear: createProgram(gl, vertexShader, CLEAR),
    pressure: createProgram(gl, vertexShader, PRESSURE),
    gradient: createProgram(gl, vertexShader, GRADIENT_SUBTRACT),
  };

  // A texture we can draw into (framebuffer) and read from
  function createTarget(w, h) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const complete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { texture, framebuffer, w, h, complete };
  }

  // Two targets we swap between: read from one, write the result into the other
  function createPingPong(w, h) {
    const pair = { read: createTarget(w, h), write: createTarget(w, h) };
    pair.swap = () => ([pair.read, pair.write] = [pair.write, pair.read]);
    return pair;
  }

  function deleteTarget(target) {
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.framebuffer);
  }

  const state = {
    sim: null,
    dye: null,
    velocity: null,
    dyeTargets: null,
    divergence: null,
    curl: null,
    pressure: null,
  };

  function allocate(w, h) {
    if (state.velocity) release();
    state.sim = gridSize(w, h, SIM_SIZE);
    state.dye = gridSize(w, h, DYE_SIZE);
    state.velocity = createPingPong(state.sim.w, state.sim.h);
    state.dyeTargets = createPingPong(state.dye.w, state.dye.h);
    state.pressure = createPingPong(state.sim.w, state.sim.h);
    state.divergence = createTarget(state.sim.w, state.sim.h);
    state.curl = createTarget(state.sim.w, state.sim.h);
    return state.velocity.read.complete && state.dyeTargets.read.complete;
  }

  function release() {
    for (const pair of [state.velocity, state.dyeTargets, state.pressure]) {
      deleteTarget(pair.read);
      deleteTarget(pair.write);
    }
    deleteTarget(state.divergence);
    deleteTarget(state.curl);
  }

  if (!allocate(width, height)) {
    release();
    return null;
  }

  // Bind a texture to a texture unit and return the unit number (for a sampler uniform)
  function bindTexture(target, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    return unit;
  }

  // Run a program over the whole target (the bound array buffer already holds the triangle)
  function run(target) {
    gl.viewport(0, 0, target.w, target.h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function activate(name, texel) {
    const p = programs[name];
    gl.useProgram(p.program);
    if (p.uniforms.texelSize) gl.uniform2f(p.uniforms.texelSize, 1 / texel.w, 1 / texel.h);
    return p.uniforms;
  }

  function splatInto(pair, x, y, color, aspect) {
    const u = activate("splat", pair.read);
    gl.uniform1i(u.uTarget, bindTexture(pair.read, 0));
    gl.uniform1f(u.aspectRatio, aspect);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, ...color);
    gl.uniform1f(u.radius, SPLAT_RADIUS * (aspect > 1 ? aspect : 1));
    run(pair.write);
    pair.swap();
  }

  return {
    get dye() {
      return state.dyeTargets.read.texture;
    },

    // Cursor moved from (x - dx, y - dy) to (x, y), all in 0..1 with a bottom-left origin
    splat(x, y, dx, dy) {
      const aspect = state.sim.w / state.sim.h;
      splatInto(state.velocity, x, y, [dx * SPLAT_FORCE, dy * SPLAT_FORCE, 0], aspect);
      splatInto(state.dyeTargets, x, y, [SPLAT_INK, 0, 0], aspect);
    },

    step(dt) {
      const sim = state.sim;
      gl.disable(gl.BLEND);

      let u = activate("curl", sim);
      gl.uniform1i(u.uVelocity, bindTexture(state.velocity.read, 0));
      run(state.curl);

      u = activate("vorticity", sim);
      gl.uniform1i(u.uVelocity, bindTexture(state.velocity.read, 0));
      gl.uniform1i(u.uCurl, bindTexture(state.curl, 1));
      gl.uniform1f(u.curl, CURL);
      gl.uniform1f(u.dt, dt);
      run(state.velocity.write);
      state.velocity.swap();

      u = activate("divergence", sim);
      gl.uniform1i(u.uVelocity, bindTexture(state.velocity.read, 0));
      run(state.divergence);

      u = activate("clear", sim);
      gl.uniform1i(u.uTexture, bindTexture(state.pressure.read, 0));
      gl.uniform1f(u.value, 0.8);
      run(state.pressure.write);
      state.pressure.swap();

      u = activate("pressure", sim);
      gl.uniform1i(u.uDivergence, bindTexture(state.divergence, 0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(u.uPressure, bindTexture(state.pressure.read, 1));
        run(state.pressure.write);
        state.pressure.swap();
      }

      u = activate("gradient", sim);
      gl.uniform1i(u.uPressure, bindTexture(state.pressure.read, 0));
      gl.uniform1i(u.uVelocity, bindTexture(state.velocity.read, 1));
      run(state.velocity.write);
      state.velocity.swap();

      u = activate("advection", sim);
      gl.uniform2f(u.velocityTexel, 1 / sim.w, 1 / sim.h);
      gl.uniform1f(u.dt, dt);
      gl.uniform1i(u.uVelocity, bindTexture(state.velocity.read, 0));
      gl.uniform1i(u.uSource, bindTexture(state.velocity.read, 0));
      gl.uniform1f(u.dissipation, VELOCITY_DISSIPATION);
      run(state.velocity.write);
      state.velocity.swap();

      gl.uniform1i(u.uVelocity, bindTexture(state.velocity.read, 0));
      gl.uniform1i(u.uSource, bindTexture(state.dyeTargets.read, 1));
      gl.uniform1f(u.dissipation, DYE_DISSIPATION);
      run(state.dyeTargets.write);
      state.dyeTargets.swap();

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },

    resize(w, h) {
      allocate(w, h);
    },

    destroy() {
      release();
      for (const p of Object.values(programs)) {
        gl.deleteProgram(p.program);
        gl.deleteShader(p.fragmentShader);
      }
      gl.deleteShader(vertexShader);
    },
  };
}
