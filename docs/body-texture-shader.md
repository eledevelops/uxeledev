# Task: Body texture shader (ambient dither background)

> **Status (2026-11-17): built** in `src/components/BodyTexture.jsx`, mounted once in `App.jsx`.
> Decisions made while building, which override the original task below:
> - **Colors:** two colors from tokens, like incredibles.dev, instead of the Figma 3-stop gradient + canvas opacity.
>   Each "on" dot is the foreground token (read from `body`'s computed color) at `opacityLight` 0.05 / `opacityDark` 0.10,
>   drawn over the page background. No non-token stops (`#F2F2F2` / `#121212`) needed, and no white "dead zone".
> - **Dot size:** `pixelSize` 2 (CSS px). The canvas renders 1 pixel per dot and is scaled up with `image-rendering: pixelated`,
>   so DPR doesn't matter and the GPU does 4–16× less work.
> - **No-blank-patches:** density stays between `minDensity` 0.04 and `maxDensity` 0.7, after a contrast boost (4.5) like incredibles.dev.
> - **Hero pause:** the loop skips frames while the first child of `<main>` (the hero) still covers the viewport.
> - **`loseContext()` on unmount: skipped.** React StrictMode reuses the same canvas in dev, and a lost context can't be re-acquired.
>   The program, shaders and buffer are deleted instead (same as the hero and FlowText).
> - The Globalization quote section was removed from the page; About and Contact are transparent.

You are working in Ele's portfolio repo (`uxeledev`): React + Vite + Tailwind CSS v4, GSAP for animation.
Design tokens live in `theme.css` (imported after `tailwindcss`). Dark mode = class `dark` on `<html>`.

Ele is learning React by building the site. Write this component, then explain the key parts
(WebGL setup, the shader, cleanup) in plain language so Ele can study it. Ask before
adding new tokens, dependencies or files outside the ones listed below.

## What to build

A subtle, **ambient, non-interactive** animated dot texture behind the homepage body sections
(everything below the hero scroll video). It is designed in Figma ("Portfolio One-Pager",
layers `Body texture / light` and `Body texture / dark`). It's inspired by incredibles.dev,
but with **no cursor interaction and no fluid sim**.

The recipe is two stacked passes in **one fragment shader**:

1. **Moving gradient:** slow, domain-warped fbm noise, mapped through a 3-stop grey gradient.
2. **Dither:** a 4×4 Bayer ordered dither with 2 levels (mono), so the gradient becomes fine 1-bit dots.

Then the whole canvas sits at a **very low opacity** over the page background.

## Values from Figma (current)

| | Light | Dark |
| --- | --- | --- |
| Layer opacity | **0.05** | **0.10** (provisional: Ele is still tuning it to match light's subtlety) |
| Gradient stop 0 | `#FAFAFA` (`neutral-50`) | `#0A0A0A` (`neutral-950`) |
| Gradient stop 0.5 | `#E5E5E5` (`neutral-200`) | `#1A1A1A` (`neutral-800`) |
| Gradient stop 1 | `#F2F2F2` (not a token) | `#121212` (not a token) |

Rules for the gradient stops:
- Read the token colors from CSS (`getComputedStyle(document.documentElement)` on `--color-neutral-*`). Don't hardcode them.
- Ask Ele how to handle the two non-token stops. `#F2F2F2` was chosen on purpose: a pure white stop made the dither produce **no dots** (a dead zone). Never use pure `#FFFFFF` as a stop.

Moving gradient settings in Figma: `intensity 4.29`, `morphSpeed 3.74`, `rotationSpeed 12`,
`zoom 72`, `detail 1.78`, `warp 0.26`, `twist 0.04`, `gradientBalance 0`.
Dither settings: `Bayer 4x4`, `levels 2`, `mono true`, `contrast 1`, `brightness 100`, `pixelSize 1`.

These are Figma's own units, so they don't map 1:1 to GLSL. Expose them as props with the same names
(`morphSpeed`, `rotationSpeed`, `zoom`, `detail`, `warp`, `twist`, `pixelSize`, `opacity`) and tune the defaults
by eye against a Figma screenshot. Aim for very slow drift and fine, even dots.

## Implementation

- **File:** `src/components/BodyTexture.jsx`. Raw WebGL (no Three.js or other new libraries) with one full-screen triangle and one fragment shader.
- **Placement:** a `position: fixed; inset: 0` canvas behind the content (`-z-10`, `pointer-events-none`, `aria-hidden="true"`). The opacity goes on the canvas element.
  - It must sit **under the body sections only**. The hero scroll video (`HeroScrollVideo`) covers it at the top.
  - The page itself stays `bg-background`.
- **Section backgrounds:** in Figma, the Globalization quote, About and Contact sections had their white fills removed so the texture shows through. Keep those sections transparent: no `bg-*` on them.
- **Footer:** it is always dark and opaque. It covers the texture.
- **Dither pixels:** compute the Bayer threshold from `gl_FragCoord` so dots stay crisp. Size the canvas to `innerWidth/innerHeight × devicePixelRatio` (cap DPR at 2), and scale the dot size by `pixelSize`.
- **Theme:** watch the `dark` class on `<html>` with a `MutationObserver`. When it changes, swap the gradient stops and the opacity (uniforms only, no re-init).
- **Performance:**
  - Keep the render loop and GL objects in refs, so React never re-renders per frame.
  - Cap the animation at ~30 fps.
  - Pause on `visibilitychange` (hidden tab).
  - Pause while the hero scroll video fully covers the viewport, if that's easy to detect. Otherwise skip it.
  - Handle resize with a debounced listener.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, render **one static frame** and don't animate.
- **Fallbacks:** if WebGL is unavailable, or the context is lost, remove the canvas. The plain `bg-background` is the fallback.
- **Cleanup on unmount:** cancel the RAF, disconnect the observers and listeners, delete the GL program and buffers, and call `loseContext()`.
- **Mounting:** mount it once in the homepage layout (e.g. `App.jsx`), not per section.

## Done when

- Light and dark both look like the Figma layers: barely there, slowly moving, fine dots, no blank patches.
- Text and images stay perfectly sharp. The texture is only behind them, never over them.
- There's no measurable scroll jank, and CPU/GPU are idle when the tab is hidden.
- Reduced motion shows a still texture.
- Ele gets a short explanation of how the shader works and which props to tweak.
