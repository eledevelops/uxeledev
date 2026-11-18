import { useRef } from "react";
import gsap from "gsap";
import Icon from "./Icon";
import moon from "../assets/icons/moon.svg";
import sun from "../assets/icons/sun.svg";

// Light/dark switch. The moon (light mode) and sun (dark mode) sit on top of each other and
// crossfade; after each click a coral glow blooms out around the button and fades away.
export default function ThemeToggle({ isDark, onToggle }) {
  const glowRef = useRef(null);

  function handleClick() {
    onToggle();
    // Reduced motion: switch the theme, skip the bloom (it scales)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      glowRef.current,
      { opacity: 1, scale: 0.6 },
      { opacity: 0, scale: 1.6, duration: 0.9, ease: "power2.out" },
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative grid size-8 place-items-center rounded-full text-foreground transition-colors hover:text-accent">
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-coral-400/30 opacity-0 shadow-[0_0_16px_6px] shadow-coral-400/60"
      />
      <Icon src={moon} className="col-start-1 row-start-1 size-5 transition-opacity duration-slow ease-out dark:opacity-0" />
      <Icon
        src={sun}
        className="col-start-1 row-start-1 size-5 opacity-0 transition-opacity duration-slow ease-out dark:opacity-100"
      />
    </button>
  );
}
