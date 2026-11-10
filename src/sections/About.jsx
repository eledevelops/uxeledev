import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFlowGradient } from "../lib/flowGradient";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const statementRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const flow = createFlowGradient(canvasRef.current);
    if (!flow) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: statementRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? flow.play() : flow.pause()),
      });
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
    <section id="about" className="mx-auto flex max-w-case-study flex-col gap-10 px-6 py-16 lg:px-24 lg:py-32">
      <div className="relative mix-blend-multiply dark:mix-blend-screen">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
        <p
          ref={statementRef}
          className="relative bg-white text-heading text-black mix-blend-screen lg:text-heading-xl dark:bg-black dark:text-white dark:mix-blend-multiply">
          For over a decade, I've worked at the intersection of brand, design, and code — building visual identities,
          marketing systems, and the websites that bring them to life. Along the way, I've collaborated with global
          teams across multiple countries and cultures, helping companies establish and grow their presence in new
          markets.
        </p>
      </div>
      <hr className="border-border" />
      <p className="text-body text-muted-foreground">
        Earlier in my career, as Multimedia Manager at <strong>MotionPoint</strong>, I worked directly with clients to
        globalize their websites — <strong>helping increase conversion rates by 20-40%</strong> on average while driving
        traffic growth in both existing and new markets. It's an experience that still shapes how I think about building
        for global audiences today.
      </p>
    </section>
  );
}
