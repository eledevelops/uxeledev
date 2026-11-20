import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createFlowGradient } from "../lib/flowGradient";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function FlowText({ children, className = "" }) {
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const flow = createFlowGradient(canvasRef.current);
    if (!flow) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: textRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? flow.play() : flow.pause()),
      });
      const split = SplitText.create(textRef.current, { type: "words", aria: "none" });
      gsap.fromTo(
        split.words,
        { opacity: 0.0, scale: 1.3 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 90%",
            end: "bottom 50%",
            scrub: 2,
          },
        },
      );

      return () => flow.pause();
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      flow.drawStill();
    });

    return () => {
      mm.revert();
      flow.destroy();
    };
  }, []);

  return (
    // The words start at scale 1.3 and shrink into place, so while they animate they're bigger than the text.
    // The box bleeds 0.75em out on each side (negative margin + the same padding inside), so the gradient
    // covers the enlarged words while the text itself stays exactly where it was.
    <div className={`relative -mx-[0.75em] -my-[0.2em] mix-blend-multiply dark:mix-blend-screen ${className}`}>
      {/* The canvas stays 4px inside the white box, so its edges never peek out as a thin line.
          A canvas doesn't stretch from inset alone (its size comes from its own pixels), so set the size too. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute top-1 left-1 size-[calc(100%-var(--spacing-2))]"
      />
      <div
        ref={textRef}
        className="relative bg-white px-[0.75em] py-[0.2em] text-black mix-blend-screen dark:bg-black dark:text-white dark:mix-blend-multiply">
        {children}
      </div>
    </div>
  );
}
