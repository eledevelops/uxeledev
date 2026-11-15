import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

// Plays the hero video by itself on the first scroll down at the top of the page:
// GSAP scrolls the page through the track, then glides to the next section.
// Any user input (scrolling up, a new touch or click, any key) stops it.
export default function useAutoplay(trackRef, stageRef, { enabled = true, seconds = 11 } = {}) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Changing values live in one object: the running autoplay timeline (null when idle)
    // and where the current finger went down.
    const state = { autoplay: null, touchStartY: 0 };
    const isAtTop = () => window.scrollY < 50;

    function startAutoplay() {
      const track = trackRef.current;
      const videoEnd = track.offsetTop + track.offsetHeight - window.innerHeight;
      const nextSectionTop = track.offsetTop + track.offsetHeight;
      state.autoplay = gsap
        .timeline({ onComplete: () => (state.autoplay = null) })
        .to(window, { scrollTo: videoEnd, duration: seconds, ease: "none" })
        .to(window, { scrollTo: nextSectionTop, duration: 1.2, ease: "power2.inOut" });
    }

    function stopAutoplay() {
      state.autoplay.kill();
      state.autoplay = null;
    }

    function onWheel(event) {
      if (state.autoplay) {
        if (event.deltaY < 0) stopAutoplay();
        else event.preventDefault();
      } else if (event.deltaY > 0 && isAtTop()) {
        event.preventDefault();
        startAutoplay();
      }
    }

    function onTouchStart(event) {
      state.touchStartY = event.touches[0].clientY;
    }

    function onTouchMove(event) {
      if (state.autoplay) {
        event.preventDefault();
      } else if (isAtTop() && state.touchStartY - event.touches[0].clientY > 10) {
        event.preventDefault();
        startAutoplay();
      }
    }

    function onKeyDown(event) {
      if (state.autoplay) {
        if (!event.repeat) stopAutoplay();
      } else if (isAtTop() && event.target === document.body && ["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        startAutoplay();
      }
    }

    function onPointerDown() {
      if (state.autoplay) stopAutoplay();
    }

    function onStageClick() {
      if (!state.autoplay && isAtTop()) startAutoplay();
    }

    const stage = stageRef.current;
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("click", onStageClick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("click", onStageClick);
      if (state.autoplay) state.autoplay.kill();
    };
  }, [trackRef, stageRef, enabled, seconds]);
}
