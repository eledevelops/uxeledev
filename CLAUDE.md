# uxele.dev — Ele's portfolio

One-page front-end portfolio for Eleazar Madera ("Ele"). Live at uxele.dev (uxele.com redirects to it).
Goal: get a front-end developer job. Don't call Ele "junior" anywhere on the site.

## How we work (important)

Ele is learning React by building this site himself, one phase at a time.
- **One step per message, explained in detail:** where (exact file and line, and how to create new files/folders), the full code, "Why" (tables for classes and attributes, short bullets for concepts, every new React concept explained the first time), and "How to check".
- **Then ask: "Do you want to code this, or should I build it?"** Ele decides each time. Usually Ele has Claude build plain HTML/CSS markup and writes new React/JS concepts himself, but always ask. Don't edit project files until Ele answers.
- **When building, write exactly the explained code.** No extra patterns (arrays + `.map()`, sub-components, renamed variables) unless they were explained first; suggest improvements separately.
- **Hard parts Claude writes:** the hero scroll video (GSAP + WebGL), focus traps (mobile menu ✓, case study modal), the contact form Worker. Still explained in the same detail.
- **Review** Ele's code after each step: what works, what to fix and why. At the end of each phase: what a senior dev would change.
- Ask before guessing what Ele wants.

## Stack

- React 19 + Vite 8, plain JavaScript (`.jsx`), Oxlint (`npm run lint`).
- Tailwind CSS v4 via `@tailwindcss/vite`. Design tokens live in `src/theme.css` (generated from Figma) — use its classes, never raw hex or px values:
  colors `bg-background`, `bg-accent`, `text-foreground`, `text-muted-foreground`, `border-border`…; spacing `p-4` (number × 4px, but only these steps exist: 0, half, 1–6, 8, 10, 12, 16, 24, 32); radius `rounded-lg`…; motion `duration-fast|base|slow`, `ease-out|in-out`.
  Only the design-system palette exists (Tailwind's default colors are cleared).
- Dark mode: the `dark` class on `<html>` (set before paint by the script in `index.html`, saved in localStorage as `theme`). Semantic colors switch by themselves — no `dark:` classes needed for color.
- Animation: **GSAP + ScrollTrigger only.** Add another library only if an idea truly needs it.
- Reduced motion: when `prefers-reduced-motion: reduce`, nothing blurs, zooms, slides or scrubs — content shows in its final state. Wrap GSAP in `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`, serves `dist/`). Pushing to `main` on GitHub (eledevelops/uxeledev) deploys.
- Font: Inter Tight, self-hosted (`@fontsource-variable/inter-tight`, imported in `src/index.css`; `--font-sans` is "Inter Tight Variable"; preloaded in `index.html` and `404.html`).
- Prerendered: `npm run build` = `vite build` + `vite build -c vite.prerender.config.js` (Node build of `src/entry-server.jsx` into `dist-ssr/`) + `node scripts/prerender.js` (puts the HTML into `dist/client/index.html`). `src/main.jsx` hydrates it (`createRoot` in dev).

## Structure

- `src/components/` — reusable pieces (Navbar, Icon, Button, Field, CaseStudy, ContactModal, FlowText, GalleryVideo, BodyTexture…)
- `src/sections/` — homepage sections (Hero, Intro, Stats, Projects, About, Skills, Contact; `Quote.jsx` is kept but not rendered)
- `src/data/` — content as data: `projects/<id>.jsx` per case study (collected in `data/index.js`), `skills.js`
- `src/lib/` — plain-JS engines and helpers (heroScene, flowGradient, bodyTexture WebGL; caseStudyImages, caseStudyVideos)
- `src/hooks/` — custom hooks (useAutoplay, usePrefersReducedMotion, useSaveData)
- `src/assets/` — icons, images, case study videos. `public/` — files served as-is (favicon, `hero/` frames, llms.txt, robots, sitemap, `_headers`)
- `worker/` — contact form Worker. `scripts/` — build scripts (prerender). `docs/` — specs. `reference/` — local-only demos and tools (gitignored)

## Rules learned while building

- **Rendering must not touch the browser** (the page is prerendered in Node). Read `window`/`document`/`navigator`/`localStorage` only inside effects or event handlers, or through `useSyncExternalStore` with a `getServerSnapshot` (see `usePrefersReducedMotion`, `useSaveData`, the Navbar theme). Otherwise `npm run build` crashes or hydration mismatches.
- **Images:** `import photo from "./photo.webp?responsive"` gives `{ sources, img }` for `<img srcSet>` (recipe in `vite.config.js` → `imageDirectives`, shared with the prerender build). Case study gallery `sizes` come from `tileSizes()`. Phone-only crops use `<picture>` + `?w=…&h=…&fit=cover`.
- **Case study videos:** `caseStudyVideo("project/name", { loop })` finds `.webm`/`.mp4`/`-poster.webp` in `src/assets/videos/case-studies/`; the poster is the last frame (reduced motion shows it).
- **Hover-only effects:** use the `can-hover:` / `touch:` variants (input type), not screen widths. Tailwind v4 resets buttons to the arrow cursor; `theme.css` brings back `cursor: pointer`.
- **Icons with two colors** (e.g. `field-valid.svg`) use `<img>`; `Icon` masks to one color. To hide an `Icon`, use a variant (`dark:hidden`, `not-dark:hidden`), since `Icon` always sets `inline-block`.

## Design

Figma file "Portfolio One-Pager": https://www.figma.com/design/v3yo7suDl2zr2rcvvfOE9P/Portfolio-One-Pager
Every frame is marked Ready for dev; layer names, icon names (`Icon / Tech / React`) and Tailwind code names are set in Dev Mode.
Case studies open as **modals** (not pages); one template for all 5 (Siraya, CDNetworks, Mega Hard, Deltabase, Siraya.ai Models). Footer is always dark.

## Build plan (phases)

0 Setup + deploy ✓ · 1 Shell ✓ · 2 Static sections ✓ · 3 Projects ✓ · 4 Case study modal ✓ · 5 Contact form ✓ · 6 Hero scroll video ✓ · 7 Skills card fan ✓ · 8 Launch polish ✓ (SEO + JSON-LD + llms.txt, 404, contact hardening, Lighthouse 99/100/100/100 mobile, responsive images, bento videos, self-hosted font, prerendering).

Decided: hero frames stay on Workers static assets, not R2 (see `docs/hero-scroll-video.md`).

## Specs to read first

- **Hero scroll video:** read `docs/hero-scroll-video.md` before touching the hero. The working demo is in `reference/night-scroll-demo/` (run it with a local server, not by double-clicking).
- **Body texture (dot background):** `docs/body-texture-shader.md`, built in `src/components/BodyTexture.jsx`.
