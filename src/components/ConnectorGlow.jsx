import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const COMET = 80; // length of the glowing segment, in px

// A coral comet that runs once along the Challenge → Approach connector in CaseStudy, to guide the eye.
// It sits inside the Challenge block and traces the centers of the two bordered connector divs,
// so its path is built from the block's measured size. Plays when the line scrolls into view.
// Reduced motion: nothing plays (the path stays hidden).
export default function ConnectorGlow({ play }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Measure the Challenge block (the svg's parent), and again whenever it resizes
  useEffect(() => {
    const block = svgRef.current.parentElement;
    const observer = new ResizeObserver(() => setSize({ w: block.offsetWidth, h: block.offsetHeight }));
    observer.observe(block);
    return () => observer.disconnect();
  }, []);

  // Once per opening: wait until the connector is on screen, then send the comet from start to end
  useEffect(() => {
    if (!play) return;
    const svg = svgRef.current;
    const path = pathRef.current;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          // Measured now, when the modal is open and laid out (before that, sizes are 0)
          const length = path.getTotalLength();
          context.add(() => {
            gsap.fromTo(
              path,
              { strokeDasharray: `${COMET} ${length + COMET}`, strokeDashoffset: COMET, opacity: 1 },
              { strokeDashoffset: -length, duration: 1.5, ease: "power1.inOut" },
            );
          });
        },
        { threshold: 0.75 },
      );
      observer.observe(svg);
      return () => observer.disconnect();
    });
    return () => mm.revert();
  }, [play]);

  const { w, h } = size;
  // Same geometry as the connector divs: 12px gap (ml-3), 160px across, 56px below, 44px drop,
  // ending at 3/4 of the block (the center of "The Approach"). +1 = the middle of each 2px border.
  const d = `M${w + 12} ${h / 2 + 1} H${w + 171} V${h + 57} H${w * 0.75 + 1} V${h + 100}`;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      width={w + 174}
      height={h + 101}
      className="pointer-events-none absolute top-0 left-0 hidden [filter:drop-shadow(0_0_3px_var(--background-color-accent))_drop-shadow(0_0_10px_var(--background-color-accent))] lg:block">
      <path
        ref={pathRef}
        d={d}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-(--background-color-accent) opacity-0"
      />
    </svg>
  );
}
