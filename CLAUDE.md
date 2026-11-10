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
- Font: Inter Tight (Google Fonts, loaded in `index.html`).

## Structure

- `src/components/` — reusable pieces (Navbar, Icon, …)
- `src/sections/` — homepage sections (Hero, Intro, Stats, Projects, Skills, About, Contact)
- `src/data/` — content as data (e.g. `projects.js` for the 5 case studies)
- `src/assets/icons/` — SVG icons
- `public/` — files served as-is (favicon; later `public/hero/` for the scroll video frames)
- `docs/` — specs. `reference/` — local-only demos (gitignored)

## Design

Figma file "Portfolio One-Pager": https://www.figma.com/design/v3yo7suDl2zr2rcvvfOE9P/Portfolio-One-Pager
Every frame is marked Ready for dev; layer names, icon names (`Icon / Tech / React`) and Tailwind code names are set in Dev Mode.
Case studies open as **modals** (not pages); one template for all 5 (Siraya, CDNetworks, Mega Hard, Deltabase, Siraya.ai Models). Footer is always dark.

## Build plan (phases)

0 Setup + deploy ✓ · 1 Shell: navbar ✓, theme toggle ✓, footer · 2 Static sections (Hero as a static image, Intro, Stats, Quote, About) · 3 Projects section · 4 Case study modal · 5 Contact form · 6 Hero scroll video · 7 Skills card fan · 8 Launch polish.

## Specs to read first

- **Hero scroll video:** read `docs/hero-scroll-video.md` before touching the hero. The working demo is in `reference/night-scroll-demo/` (run it with a local server, not by double-clicking).
