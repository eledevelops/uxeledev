import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createHeroScene, FRAME_COUNT } from "../lib/heroScene";
import useAutoplay from "../hooks/useAutoplay";
import Icon from "./Icon";
import play from "../assets/icons/play.svg";

gsap.registerPlugin(ScrollTrigger, SplitText);

const AUTOPLAY_SECONDS = 11; // 724 frames in 11 s ≈ 66 fps
const AUTOPLAY_ENABLED = true; // true = the first scroll down plays the video by itself

export default function HeroScrollVideo({ onFail }) {
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const scrimRef = useRef(null);
  const set1Ref = useRef(null);
  const set2Ref = useRef(null);
  const stageRef = useRef(null);
  const pillRef = useRef(null);
  const pillButtonRef = useRef(null);

  useAutoplay(trackRef, stageRef, { enabled: AUTOPLAY_ENABLED, seconds: AUTOPLAY_SECONDS });

  useLayoutEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const isPortrait = canvasRef.current.clientWidth / canvasRef.current.clientHeight < 9 / 16;
    const scene = createHeroScene(canvasRef.current, {
      theme: isDark ? "dark" : "light",
      folder: isPortrait ? "/hero/portrait" : "/hero",
      frameWidth: isPortrait ? 608 : 1920,
      onProgress: (fraction) => {
        barRef.current.style.width = `${fraction * 100}%`;
        barRef.current.style.opacity = fraction < 1 ? 1 : 0;
      },
    });

    if (!scene) {
      onFail(true);
      return;
    }

    const canvas = canvasRef.current;
    const handleContextLost = () => onFail(true);
    canvas.addEventListener("webglcontextlost", handleContextLost);

    const themeObserver = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      scene.setTheme(isDarkNow ? "dark" : "light");
    });

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const video = { frame: 0 };
      ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? scene.play() : scene.pause()),
      });

      const splitLine = (line) => SplitText.create(line, { type: "words,chars" }).chars;
      const [line1, line2] = [...set1Ref.current.children].map(splitLine);
      const [line3, line4, line5] = [...set2Ref.current.children].map(splitLine);
      gsap.set([line1, line2, line3, line4, line5].flat(), { opacity: 0, filter: "blur(18px)", y: 16 });

      const sharpen = { opacity: 1, filter: "blur(0px)", y: 0, ease: "power2.out", duration: 0.03, stagger: 0.0025 };
      gsap
        .timeline({
          scrollTrigger: {
            trigger: trackRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        })
        .to(
          video,
          { frame: FRAME_COUNT - 1, ease: "none", duration: 1, onUpdate: () => scene.setFrame(video.frame) },
          0,
        )
        .to(pillRef.current, { autoAlpha: 0, duration: 0.02, ease: "none" }, 0)
        .to(scrimRef.current, { opacity: 1, duration: 0.03 }, 0.56)
        .to(line1, sharpen, 0.575)
        .to(line2, sharpen, 0.6)
        .to(set1Ref.current, { opacity: 0, y: -40, filter: "blur(14px)", duration: 0.025, ease: "power1.in" }, 0.69)
        .to(line3, sharpen, 0.72)
        .to(line4, sharpen, 0.745)
        .to(line5, sharpen, 0.77)
        .set({}, {}, 1);

      // Play cue: enters once (fade in while scaling from 2 to 1), then pulses softly to invite a click.
      // The pulse is its own repeating timeline (grow a little, settle back, rest 1 s), nested so it
      // only starts after the entrance has finished.
      const pill = pillButtonRef.current;
      const pulse = gsap
        .timeline({ repeat: -1, repeatDelay: 1 })
        .to(pill, { scale: 1.06, duration: 0.35, ease: "sine.out" })
        .to(pill, { scale: 1, duration: 0.5, ease: "sine.inOut" });
      gsap
        .timeline({ delay: 0.4 })
        .fromTo(pill, { autoAlpha: 0, scale: 2 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power3.out" })
        .add(pulse, "+=0.4");

      return () => scene.pause();
    });

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      themeObserver.disconnect();
      mm.revert();
      scene.destroy();
    };
  }, [onFail]);

  return (
    <div ref={trackRef} className="relative h-[500vh]">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden bg-background">
        <h1 className="sr-only">Eleazar Madera, front-end developer</h1>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Eleazar walks across a calm lake while the camera tilts up into the sky"
          className="absolute inset-0 size-full"
        />
        <div
          ref={scrimRef}
          className="pointer-events-none absolute inset-0 bg-radial-[ellipse_72%_58%_at_50%_50%] from-(--background-color-glass) to-transparent to-72% opacity-0"
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-center text-aside text-foreground text-shadow-aside">
          <p className="sr-only">The water was very very shallow... no miracles here, just dedication and hard work.</p>
          <div ref={set1Ref} aria-hidden="true" className="col-start-1 row-start-1">
            <p>The water was</p>
            <p>very very shallow...</p>
          </div>
          <div ref={set2Ref} aria-hidden="true" className="col-start-1 row-start-1">
            <p>no miracles here,</p>
            <p>just dedication</p>
            <p>and hard work.</p>
          </div>
        </div>
        {/* Play cue. A click bubbles up to the stage, whose click handler (useAutoplay) starts the video.
            Two layers, so the two animations never fight over the same opacity: the wrapper fades out
            as the video starts scrolling (timeline), the button enters once on load (fade + scale 2 → 1).
            The button starts hidden (invisible opacity-0); GSAP reveals it. */}
        <div ref={pillRef} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            ref={pillButtonRef}
            type="button"
            className="invisible flex items-center gap-2 rounded-full whitespace-nowrap border border-border bg-glass px-5 py-3 text-body-bold text-foreground opacity-0 backdrop-blur-glass transition-colors duration-base hover:border-coral-400 hover:bg-coral-400 hover:text-white focus-visible:border-coral-400 focus-visible:bg-coral-400 focus-visible:text-white">
            <Icon src={play} className="size-5" />
            Play
            <span className="font-normal ">
              <span className="touch:hidden">or Scroll</span>
              <span className="can-hover:hidden">or swipe up</span>
            </span>
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-half">
          <span ref={barRef} className="block h-full w-0 bg-accent transition-[width,opacity] duration-base ease-out" />
        </div>
      </div>
    </div>
  );
}
