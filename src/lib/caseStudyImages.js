// How wide a gallery tile is on screen, from its grid classes, so the browser can pick an image size.
// Phones: 2-column grid (col-span-1 = half, col-span-2 = full). From lg: 12 columns, at most 76rem wide.
export function tileSizes(className) {
  const isHalf = /(^|\s)col-span-1(\s|$)/.test(className);
  const lgColumns = Number(className.match(/lg:col-span-(\d+)/)?.[1] ?? 12);
  return `(min-width: 64rem) ${((lgColumns / 12) * 76).toFixed(1)}rem, ${isHalf ? 50 : 100}vw`;
}

// Projects already preloaded (once is enough: after that the files are in the browser cache)
const preloaded = new Set();

// Starts downloading what a case study shows first: its background and first gallery image
// (or, if the first tile is a video, that video's poster).
// Called when a project card is hovered or focused, so the modal opens with them ready.
export function preloadCaseStudy(project) {
  if (preloaded.has(project.id) || navigator.connection?.saveData) return;
  preloaded.add(project.id);

  const { background, gallery } = project.caseStudy;
  for (const url of [background.poster, background.image, background.floatingImage]) {
    if (url) new Image().src = url;
  }

  const first = gallery.find((tile) => tile.image || tile.video);
  if (first?.video) {
    new Image().src = first.video.poster;
  } else if (first) {
    const image = new Image();
    image.sizes = tileSizes(first.className);
    image.srcset = first.image.sources.webp ?? "";
    image.src = first.image.img.src;
  }
}
