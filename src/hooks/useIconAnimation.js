import { useEffect } from "react";

// Phones and tablets: no real hover, so the icon plays on its own instead
const TOUCH_QUERY = "(hover: none), (pointer: coarse)";

/**
 * Shared playback for the animated skill icons.
 * - Mouse: hovering plays the animation, leaving reverses it.
 * - Touch: it loops by itself (play, hold, reverse, rest) while the icon is on screen.
 * - Reduced motion: no loop.
 *
 * `play` and `reverse` must be stable (wrap them in useCallback).
 * Returns the pointer handlers to spread on the icon's <svg>.
 */
export default function useIconAnimation(ref, play, reverse, { hold = 1800, rest = 1400 } = {}) {
  useEffect(() => {
    const isTouch = window.matchMedia(TOUCH_QUERY).matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isTouch || reduceMotion || !ref.current) return;

    const loop = { timer: 0 };
    const cycle = () => {
      play();
      loop.timer = setTimeout(() => {
        reverse();
        loop.timer = setTimeout(cycle, rest);
      }, hold);
    };
    const stop = () => {
      clearTimeout(loop.timer);
      reverse();
    };

    // Only loop while the icon is visible, so off-screen icons cost nothing
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? cycle() : stop()));
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      clearTimeout(loop.timer);
    };
  }, [ref, play, reverse, hold, rest]);

  // Pointer events tell mouse from finger, so a tap doesn't fight the loop
  return {
    onPointerEnter: (event) => event.pointerType === "mouse" && play(),
    onPointerLeave: (event) => event.pointerType === "mouse" && reverse(),
  };
}
