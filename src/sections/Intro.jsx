import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import RotatingWord from "../components/RotatingWord";

gsap.registerPlugin(ScrollTrigger, SplitText);

const TEXT =
  "I am a front-end developer with 10+ years of experience engineering brands, campaigns and the websites that carry them.";

// The 4 stats under the sentence. Numbers count up from 0 to `count` (then `suffix`);
// the entry with `words` (Mind Set) fades in, then rotates through its words.

const STATS = [
  { count: 5, suffix: "K+", label: "Hours Of Team Collab" },
  { count: 100, suffix: "+", label: "Projects In Multiple Domains" },
  { count: 10, suffix: "+", label: "Years Of Experience" },
  {
    words: ["Global", "Expansive", "Limitless", "Holistic", "Universal", "Inclusive", "Boundless"],
    label: "Mind Set",
  },
];

export default function Intro() {
  const sectionRef = useRef(null);
  const lettersRef = useRef(null);
  const afterRef = useRef(null); // the tagline + stats, shown after the letters land

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Each letter falls straight from right in front of the viewer (giant, blurry, filling the screen)
    // onto the page, and bounces as it lands. When the last letter has settled, the tagline and the
    // 4 stats rise in one after another, and the numbers count up.
    // Reduced motion: no animation, everything just shows.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const split = SplitText.create(lettersRef.current, { type: "words,chars", aria: "none" });
      const letters = split.chars;
      // One random start time per letter, shared by both tweens so fade and fall stay in sync
      const delays = letters.map(() => gsap.utils.random(0, 1));

      const FALL = 0.7; // seconds from giant to landed

      const IMPACT = 0.4; // the landing bounce (0.12 + 0.12 + 0.08 + 0.08)
      const lettersDone = Math.max(...delays) + FALL + IMPACT;
      const tagline = afterRef.current.querySelector("[data-tagline]");
      const stats = afterRef.current.querySelectorAll("li");
      const counters = afterRef.current.querySelectorAll("[data-count]");

      const timeline = gsap
        .timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true } })
        // The drop: giant (filling the screen) → normal size, accelerating like a falling object
        .from(
          letters,
          {
            scale: 15,
            filter: "blur(2px)", // scales with the letter: very soft while giant, sharp when it lands
            duration: FALL,
            ease: "power2.in",
            delay: (i) => delays[i],
          },
          0,
        )
        // Ghostly while giant, solid as it lands (so the giants don't merge into a dark cloud)
        .from(letters, { opacity: 0, duration: FALL, ease: "power2.in", delay: (i) => delays[i] }, 0)
        // The impact: a quick bounce in size as it hits the page, then settle
        .to(
          letters,
          {
            keyframes: [
              { scale: 1.12, duration: 0.12, ease: "power1.out" },
              { scale: 1, duration: 0.12, ease: "power1.in" },
              { scale: 1.04, duration: 0.08, ease: "power1.out" },
              { scale: 1, duration: 0.08, ease: "power1.in" },
            ],
            delay: (i) => delays[i] + FALL,
          },
          0,
        )
        // Then the tagline, then the stats one after another
        .from(tagline, { opacity: 0, y: 24, duration: 0.6, ease: "power3.out" }, lettersDone)
        .from(stats, { opacity: 0, y: 32, duration: 0.7, ease: "power3.out", stagger: 0.15 }, lettersDone + 0.25);

      // Count each number up from 0 while its stat rises in
      counters.forEach((element, i) => {
        const end = Number(element.dataset.count);
        const counter = { value: 0 };
        timeline.to(
          counter,
          {
            value: end,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => (element.textContent = `${Math.round(counter.value)}${element.dataset.suffix}`),
          },
          lettersDone + 0.25 + i * 0.15,
        );
      });

      // If this is undone (unmount, reduced motion turned on), put the final numbers back
      return () =>
        counters.forEach((element) => (element.textContent = element.dataset.count + element.dataset.suffix));
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="flex min-h-svh flex-col items-center justify-center gap-12 px-6 py-24 text-foreground md:gap-32">
      <p className="max-w-intro text-center text-heading-xl md:text-heading-2xl">
        {/* Screen readers read the sentence normally; the animated letters are hidden from them */}
        <span className="sr-only">{TEXT}</span>
        <span ref={lettersRef} aria-hidden="true">
          {TEXT}
        </span>
      </p>
      <div ref={afterRef} className="flex w-full flex-col items-center gap-8">
        <p data-tagline className="w-full text-center text-body-lg md:w-auto md:text-intro">
          Data driven designs empowered by tech.
        </p>
        <ul className="flex w-full max-w-case-study flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:gap-12">
          {STATS.map((stat) => (
            <li key={stat.label} className="lg:flex-1">
              {stat.count ? (
                <p data-count={stat.count} data-suffix={stat.suffix} className="text-heading-xl xl:text-heading-2xl">
                  {`${stat.count}${stat.suffix}`}
                </p>
              ) : (
                <p className="text-heading-xl xl:text-heading-2xl text-accent">
                  <RotatingWord words={stat.words} />
                </p>
              )}
              <p className="text-meta">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
