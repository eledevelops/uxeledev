import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

// Shows one word of `words` at a time and moves to the next one every `seconds`.
// Each change: the old word blurs out upward, the new one blurs in from below.
// Reduced motion: no rotating, the first word just stays.
export default function RotatingWord({ words, seconds = 1.5 }) {
  const [index, setIndex] = useState(0);
  const wordRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Every `seconds`: blur the current word out, THEN switch to the next one
  useEffect(() => {
    if (prefersReducedMotion) return;
    const word = wordRef.current;

    const timer = setInterval(() => {
      gsap.to(word, {
        opacity: 0,
        y: -16,
        filter: "blur(8px)",
        duration: 0.3,
        ease: "power1.in",
        onComplete: () => setIndex((current) => (current + 1) % words.length),
      });
    }, seconds * 1000);

    return () => {
      clearInterval(timer);
      gsap.killTweensOf(word);
      gsap.set(word, { clearProps: "opacity,transform,filter" });
    };
  }, [words.length, seconds, prefersReducedMotion]);

  // Every time the word changes: blur the new word in
  useEffect(() => {
    if (prefersReducedMotion) return;
    const tween = gsap.fromTo(
      wordRef.current,
      { opacity: 0, y: 16, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" },
    );
    return () => tween.progress(1).kill();
  }, [index, prefersReducedMotion]);

  return (
    <span ref={wordRef} className="inline-block">
      {words[index]}
    </span>
  );
}
