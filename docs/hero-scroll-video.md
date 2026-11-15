# Hero scroll video

The homepage opens on a pinned, full-screen video that scrubs frame by frame with the scroll,
and plays by itself on the first scroll down (autoplay). The only text on the video is the
shallow-water aside; then the pin releases into the page sections (Intro, Stats…), which stay as
their own sections below the video. Built in **Phase 6**.

**Code:** `src/components/HeroScrollVideo.jsx` (track, stage, GSAP, autoplay) and
`src/lib/heroScene.js` (WebGL engine: frame loading, drawing, stars). The original demo is in
`reference/night-scroll-demo/` (its frames are the old 24 fps set).

## How it works

- `.track` is **500vh** tall; inside it `.stage` is `position: sticky; top: 0; height: 100svh`.
- One GSAP ScrollTrigger on the track (`start: "top top"`, `end: "bottom bottom"`, `scrub: 0.6`)
  drives the frame from 0 to N−1 (`scene.setFrame()`). A render loop draws the nearest loaded frame,
  and only runs while the track is on screen.
- Everything is drawn in **one WebGL canvas**: the video frame, and in dark mode the live stars on top.
- The navbar stays fixed on top (transparent at the top, glass after 40px of scroll).

## Video frames

| | Value |
| --- | --- |
| Frames per scene | 724 (15 s at 48 fps) |
| Frame size | 1920 × 1080 |
| File packing | each WebP holds **two consecutive frames** stacked, plus their two sky mattes in a bottom strip → 1920 × 2700 per file |
| Files | `f000–f361.webp` = night (dark) scene, `f362–f723.webp` = day (light) scene. 362 files per scene; ~42 MB night, ~51 MB day (WebP quality 80) |
| Loading | only the active theme's scene loads, coarse to fine (every 8th file, then 4th, 2nd, 1st) with a thin progress bar. Until the active scene's first file arrives, the other scene's frames show |

The frames live in `public/hero/` (served as-is, not processed by Vite).

**Portrait set for phones:** `public/hero/portrait/` holds the same 724 frames cropped to the centre
608 × 1080 (~18 MB night, ~26 MB day). `HeroScrollVideo` uses it when the stage is narrower than
9:16 (a phone held upright), where *cover* only shows that centre slice anyway. Visitors with Data
Saver on (`navigator.connection.saveData`) get the static `Hero` instead, like reduced motion.

### Rebuilding the frames

1. Premiere: 60 fps sequence, clip set to **Time Interpolation → Optical Flow** (the source is
   24 fps). Export **ProRes 422 HQ** to `~/Desktop/Ele Portfolio Hero/exports/night-48fps.mxf`
   and `day-48fps.mxf` (the names say 48; the files are 60 fps, the script converts them).
2. `cd reference/hero-tools && node build.mjs 80` (80 = WebP quality). It converts to 48 fps
   with ffmpeg (`/opt/homebrew/bin/ffmpeg`), scales to 1920 × 1080, derives the night sky mattes
   from the old 24 fps frames in `reference/night-scroll-demo/frames/` (odd frames blend the two
   neighbours), and writes `reference/hero-build/hero/`. Copy those into `public/hero/`. Run it again with
   `node build.mjs 80 portrait` for the phone set (`reference/hero-build/portrait/` → `public/hero/portrait/`).
3. If the frame count changes, update `FRAME_COUNT` in `heroScene.js` and resample
   `STAR_CENTER_Y` in `src/lib/heroStarCenters.js` (one value per frame).

`reference/` is gitignored, so the script and sources stay local.

### Caching

`public/_headers` gives `/hero/*` `Cache-Control: public, max-age=86400` (1 day): returning visitors
reuse the frames without any request for 24 h, and a changed frame reaches everyone within a day.
For an instant change, put the new frames under a new folder name (cache busting) and update the
`folder` values in `HeroScrollVideo.jsx`. Headers only apply on Cloudflare and `npm run preview`,
not `npm run dev`.

### Where the frames live (revisit at the end of the project)

The frames (~136 MB: desktop + portrait sets) are committed to git and deploy with the site. Git
keeps every version, so each rebuild adds ~136 MB to the repo history. **At the end of the project,
decide whether to move them to Cloudflare R2** (free tier; needs a bucket, an upload script, a
subdomain, CORS headers for WebGL, and new `folder` URLs).

## Light and dark

- **Light:** day scene, no stars.
- **Dark:** starless night scene (lotus lanterns on the lake) with **live WebGL stars** drawn only
  where the sky matte is white, so they never cover the person, mountains or water.
- Switching theme swaps scenes instantly (the other scene starts loading on first switch).

### Stars (dark only)

Recreates Ele's `stars.html` slow-shutter spiral: stars rotate around a center that follows the camera
tilt (`STAR_CENTER_Y[]` in `heroStarCenters.js`, one value per frame, fraction of frame height; `CENTER_X = 0.5`), with trails.

| Setting | Value |
| --- | --- |
| `numStars` | 1500 |
| `speedMultiplier` | 0.1 |
| `trailFade` | 0.36 |
| `brightness` | 0.25 |

No settings panel in production.

## Text over the video: the shallow-water aside

Text: **"The water was very very shallow... no miracles here, just dedication and hard work"**.
Meant to be funny and look intentional.

- **Gigantic and centered**, the focus of this beat: Inter Tight Bold,
  `font-size: clamp(44px, 8.6vw, 172px)`, `line-height: 0.96`, `letter-spacing: -0.035em`, centered.
- Line by line, **every character** sharpens from `blur(18px)`, opacity 0, y +16px →
  sharp, opacity 1, y 0 (ease `power2.out`, small stagger per character).
- A radial scrim fades in behind the text at 56% for contrast.

| Scroll % | Step |
| --- | --- |
| 56% | Scrim fades in |
| 57.5% | "The water was" |
| 60% | "very very shallow..." |
| 69% | Set 1 leaves (up 40px, blur 14px, fades) |
| 72% | "no miracles here," |
| 74.5% | "just dedication" |
| 77% | "and hard work" |
| to 100% | **The punchline stays** (no exit) and scrolls up with the page when the pin releases |

Accessibility: the full sentence is in a visually hidden `<p class="sr-only">`; the split
character spans are `aria-hidden`. The canvas has `role="img"` and an `aria-label` describing the
scene, and the stage holds the page's `sr-only` `<h1>`.

## Autoplay

On the first scroll down at the top (wheel, swipe, ↓ / Page Down / Space, or a click on the video),
GSAP's ScrollToPlugin scrolls the page through the track in `AUTOPLAY_SECONDS` (11 s ≈ 66 fps),
then glides to the Intro. Any user input (scrolling up, a new touch or click, any key) stops it and
hands control back. `AUTOPLAY_ENABLED` turns it off. Frame blending in the shader was tried and
dropped: it caused double images.

## Reduced motion

`prefers-reduced-motion: reduce` → `App.jsx` renders the static `Hero` (day or night image)
instead of `HeroScrollVideo` (read live with `usePrefersReducedMotion`, so toggling the setting swaps
without a reload; `ScrollTrigger.refresh()` re-measures the page after each swap). The same swap
happens with Data Saver on or if WebGL fails (`onFail`). No video means no frames load, no pin, no scrub, no autoplay. Inside
`HeroScrollVideo` the GSAP setup is also wrapped in
`gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", …)` as a second safety net.

## React notes

- WebGL + GSAP setup runs in `useLayoutEffect` (before paint, so the aside never flashes);
  `mm.revert()` and `scene.destroy()` clean up on unmount.
- The theme comes from the `dark` class on `<html>` (a `MutationObserver` calls `scene.setTheme()`).
- The frame loader and render loop live outside React state, so scrolling never re-renders React.

## Gotcha: Chrome and `file://`

Opening the demo's `index.html` by double-clicking shows a blank screen in Chrome:
WebGL refuses images from `file://` ("The image element contains cross-origin data").
Always run it from a server: VS Code **Live Server**, or `npx serve .` in the demo folder.
The real site is always served over https, so this only affects local demos.
