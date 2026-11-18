import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

// Plays the hero video by itself on the first scroll down at the top of the page:
// GSAP scrolls the page through the track, then glides to the next section.
// Any new user input stops it and hands scrolling back: a NEW scroll gesture (down or up),
// a new touch or click, any key. The rest of the gesture that started it is absorbed.
// Telling "the swipe that started the autoplay" apart from "the visitor scrolls again":
const GESTURE_GAP = 300; // ms: a longer pause between wheel events ends the starting swipe
const MOMENTUM_EVENTS = 4; // this many shrinking deltas in a row = the finger lifted, momentum is fading

export default function useAutoplay(trackRef, stageRef, { enabled = true, seconds = 11, onChange } = {}) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Changing values live in one object: the running autoplay timeline (null when idle),
    // where the current finger went down, and when the last wheel event arrived.
    const state = {
      autoplay: null,
      touchStartY: 0,
      lastWheel: 0,
      lastDelta: 0,
      startingSwipe: false, // still receiving the swipe that started the autoplay
      shrinking: 0, // shrinking deltas in a row
      rising: 0, // growing deltas in a row
      inMomentum: false, // the starting swipe has reached its fading momentum
    };
    const isAtTop = () => window.scrollY < 50;

    function startAutoplay() {
      onChange(true);
      state.startingSwipe = true;
      state.shrinking = 0;
      state.rising = 0;
      state.inMomentum = false;
      const track = trackRef.current;
      const videoEnd = track.offsetTop + track.offsetHeight - window.innerHeight;
      const nextSectionTop = track.offsetTop + track.offsetHeight;
      state.autoplay = gsap
        .timeline({ onComplete: () => (state.autoplay = null) })
        .to(window, { scrollTo: videoEnd, duration: seconds, ease: "none" })
        .call(() => onChange(false))
        .to(window, { scrollTo: nextSectionTop, duration: 1.2, ease: "power2.inOut" });
    }

    function stopAutoplay() {
      state.autoplay.kill();
      state.autoplay = null;
      onChange(false);
    }

    function onWheel(event) {
      // One trackpad swipe is a stream of wheel events, then momentum that keeps fading
      // (each event smaller than the last). A pause, or a delta that jumps up again,
      // means the visitor is scrolling again.
      const now = performance.now();
      const delta = Math.abs(event.deltaY);
      const paused = now - state.lastWheel > GESTURE_GAP;
      if (delta < state.lastDelta) {
        state.shrinking += 1;
        state.rising = 0;
      } else if (delta > state.lastDelta + 1) {
        state.rising += 1;
        state.shrinking = 0;
      }
      if (state.shrinking >= MOMENTUM_EVENTS) state.inMomentum = true;
      // While the finger is still on the trackpad deltas go up and down; only once the momentum
      // is fading do deltas growing twice in a row mean a new push. (A busy browser can merge two
      // events into one bigger one, but that jumps up once and then drops back.)
      const pushedAgain = state.inMomentum && state.rising >= 2;
      state.lastWheel = now;
      state.lastDelta = delta;

      if (state.autoplay) {
        if (state.startingSwipe && event.deltaY > 0 && !paused && !pushedAgain) {
          event.preventDefault(); // still the swipe that started the autoplay (or its fading momentum)
          return;
        }
        // Any new scroll, down or up: stop and let this scroll move the page normally
        state.startingSwipe = false;
        stopAutoplay();
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
  }, [trackRef, stageRef, enabled, seconds, onChange]);
}
