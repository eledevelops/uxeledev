# Hero scroll video

The homepage opens on a pinned, full-screen video that scrubs frame by frame with the scroll.
It covers Hero → Intro statement → Stats → shallow-water aside → "{ ...latest } PROJECTS" title,
then releases into the case study cards. It is built in **Phase 6** of the build plan; until then
the Hero shows the static daytime/nighttime image.

**Source of truth:** the working demo in `reference/night-scroll-demo/` (index.html + frames).
Where this doc and the old storyboard disagree, the demo wins — see "Changed since the storyboard".

## How it works

- `.track` is **500vh** tall; inside it `.stage` is `position: sticky; top: 0; height: 100svh`.
- One GSAP ScrollTrigger on the track (`start: "top top"`, `end: "bottom bottom"`, `scrub: 0.6`)
  drives `state.frame` from 0 to N−1. A render loop draws the nearest loaded frame.
- Everything is drawn in **one WebGL canvas**: the video frame, and in dark mode the live stars on top.
- The navbar stays fixed on top (transparent at the top, glass after 40px of scroll).

## Video frames

| | Value |
| --- | --- |
| Frames per scene | 362 (15 s at 24 fps) |
| Frame size | 1920 × 1080 |
| File packing | each WebP holds **two consecutive frames** stacked, plus their two sky mattes in a bottom strip → 1920 × 2700 per file |
| Files | `f000–f180.webp` = night (dark) scene, `f181–f361.webp` = day (light) scene. 181 files per scene, ~79 MB total |
| Loading | only the active theme's scene loads, coarse to fine (every 8th file, then 4th, 2nd, 1st) with a thin progress bar. Until the active scene's first file arrives, the other scene's frames show |

In the React build the frames go in `public/hero/` (served as-is, not processed by Vite).

## Light and dark

- **Light:** day scene, no stars.
- **Dark:** starless night scene (lotus lanterns on the lake) with **live WebGL stars** drawn only
  where the sky matte is white, so they never cover the person, mountains or water.
- Switching theme swaps scenes instantly (the other scene starts loading on first switch).

### Stars (dark only)

Recreates Ele's `stars.html` slow-shutter spiral: stars rotate around a center that follows the camera
tilt (`CENTER_Y[]`, one value per frame, fraction of frame height; `CENTER_X = 0.5`), with trails.

| Setting | Value |
| --- | --- |
| `numStars` | 1500 |
| `speedMultiplier` | 0.1 |
| `trailFade` | 0.36 |
| `brightness` | 0.25 |

No settings panel in production.

## Text over the video

### Intro, Stats, Projects title — from the storyboard (not in the demo yet)

| Scroll % | Video | Text |
| --- | --- | --- |
| 0–7% | Hero image, still | Small "Scroll" cue, fades out on first scroll |
| 7–25% | Breath, smile, slow push-in | Intro statement reveals word by word (10–22%), words go from 15% to 100% opacity, "front-end developer" lands last in coral; exits 23–27% with a light blur |
| 25–57% | Stands, 4 steps on water, coral light rings | "Data driven designs empowered by tech." at 28%; one stat per ring at 38, 42, 47, 51% (5K+, 100+, 10+ count up from 0; "Polyethnic" letters scramble then resolve); exits 54–57% |
| 56–77% | Camera tilts up, moon grows | Shallow-water aside — see below (demo timings) |
| 75–93% | Tilt until the moon fills the frame | "{ ...latest }" types in at 76%, braces first; PROJECTS rises letter by letter from a mask 82–92%, coral-to-peach gradient sweeps left to right |
| 93–100% | Holds on the full moon | Video fades into the page background; pin releases; the title is in its Figma position and the first case study card rises in below |

A soft dark gradient behind the bottom third keeps Intro and Stats readable; it clears for the Projects beat.

### Shallow-water aside — as built in the demo

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
character spans are `aria-hidden`. The canvas has an `aria-label` describing the scene.

## Reduced motion

`prefers-reduced-motion: reduce` → show the static hero image (day or night) and the sections in
normal order, **no pin, no scrub, no blur, stars not animated**. Use
`gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => { ... })` so the scroll
animation never builds when motion is reduced. (The demo does a lighter version; follow this rule.)

## Changed since the storyboard (the demo wins)

| Storyboard said | Now |
| --- | --- |
| One video for both themes | Separate day and night scenes; night gets live WebGL stars |
| Video files (mp4) scrubbed with `currentTime` | WebP image sequence on a WebGL canvas (mp4 seeking was choppy) |
| Aside: small, italic, lower third | Aside: gigantic, centered, per-character blur-in |
| Aside exits as the title types in | The punchline stays |

## Porting to React (Phase 6)

- One `HeroScrollVideo` component. Canvas, track and stage in JSX; WebGL + GSAP setup inside
  `useLayoutEffect` with `gsap.context()` so everything is cleaned up on unmount.
- Read the theme from the same source as `ThemeToggle` (the `dark` class on `<html>`), and swap scenes when it changes.
- Keep the frame loader and render loop outside React state (refs), so scrolling never re-renders React.
- Claude writes the port; Ele studies it and wires it in.

## Gotcha: Chrome and `file://`

Opening the demo's `index.html` by double-clicking shows a blank screen in Chrome:
WebGL refuses images from `file://` ("The image element contains cross-origin data").
Always run it from a server: VS Code **Live Server**, or `npx serve .` in the demo folder.
The real site is always served over https, so this only affects local demos.
