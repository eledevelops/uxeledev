// Every case study video file, found at build time. Vite turns this into
// { "../assets/videos/case-studies/siraya/homepage.webm": "/assets/homepage-a1b2.webm", … }
const files = import.meta.glob("../assets/videos/case-studies/**/*.{webm,mp4,webp}", {
  eager: true,
  import: "default",
});

// A gallery video by name, e.g. caseStudyVideo("siraya/homepage", { loop: false }).
// loop: true = autoplay on a loop, false = autoplay once and stop on the last frame.
export function caseStudyVideo(name, { loop = true } = {}) {
  const base = `../assets/videos/case-studies/${name}`;
  return {
    webm: files[`${base}.webm`],
    mp4: files[`${base}.mp4`],
    poster: files[`${base}-poster.webp`],
    loop,
  };
}
