import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTION_IDS = ["intro", "projects", "about", "skills", "contact"];
const SNAP_RANGE = 0.25; // only snap when this close to a point (a quarter of the window height)

// Where the page should stop for each section: short ones centered in the window,
// tall ones (taller than the window) with their top at the top.
function snapPoints() {
  const windowHeight = window.innerHeight;
  return SECTION_IDS.map((id) => document.getElementById(id))
    .filter(Boolean)
    .map((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const isShort = section.offsetHeight < windowHeight;
      return isShort ? top - (windowHeight - section.offsetHeight) / 2 : top;
    });
}

// Soft snap: when scrolling stops near a section AHEAD of you (in the direction you were
// scrolling), glide it into view. It never pulls you back. Far from every point (e.g. in the
// middle of Projects or Skills) nothing happens. Off for reduced motion.
export default function useSoftSnap() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        snap: {
          snapTo: (progress, self) => {
            const maxScroll = ScrollTrigger.maxScroll(window);
            const y = progress * maxScroll;
            // Only snap in the direction you were scrolling (1 = down, -1 = up): never pull back
            const ahead = snapPoints().filter((point) => (self.direction === 1 ? point >= y : point <= y));
            const nearest = ahead.reduce(
              (best, point) => (Math.abs(point - y) < Math.abs(best - y) ? point : best),
              Infinity,
            );
            const closeEnough = Math.abs(nearest - y) <= window.innerHeight * SNAP_RANGE;
            return closeEnough ? nearest / maxScroll : progress;
          },
          delay: 0.15,
          duration: { min: 0.3, max: 0.7 },
          ease: "power2.inOut",
        },
      });
    });
    return () => mm.revert();
  }, []);
}
