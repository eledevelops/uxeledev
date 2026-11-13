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
      const split = SplitText.create(textRef.current, { type: "words" });
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
    <div className="relative mix-blend-multiply dark:mix-blend-screen">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        ref={textRef}
        className={`relative bg-white text-black mix-blend-screen dark:bg-black dark:text-white dark:mix-blend-multiply ${className}`}>
        {children}
      </div>
    </div>
  );
}
