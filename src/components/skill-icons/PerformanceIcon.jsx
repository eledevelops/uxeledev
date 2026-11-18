import { useCallback, useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import useIconAnimation from "../../hooks/useIconAnimation";

// Pivot of the needle: center of its rounded hub, in the SVG's 1024×1024 units
const NEEDLE_PIVOT = "516.4 511";
// Rotation that swings the drawn needle (pointing right) back to the far left of the gauge
const NEEDLE_START = -166;

// Equalizer bars: x position and top (y2) of each one; all share a baseline at y=768
const BAR_BASELINE = 768;
const BARS = [
  [331.03, 637.3],
  [363.51, 604.23],
  [395.04, 637.3],
  [428.46, 653.84],
  [461.87, 627.85],
  [495.29, 604.23],
  [528.71, 637.3],
  [561.18, 604.23],
  [592.72, 637.3],
  [626.13, 653.84],
  [659.55, 627.85],
  [692.97, 604.23],
];

/**
 * Performance gauge icon. On hover the needle sweeps from left to right,
 * accelerating, then bounces 3 times against its limit while the bars below
 * jump up and down. On leave the needle sweeps back and the bars settle.
 */
export default function PerformanceIcon({ className = "", title = "Performance" }) {
  const uid = useId().replace(/:/g, "") + "-";
  const svgRef = useRef(null);
  const needleRef = useRef(null);
  const ctxRef = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // gsap.context scopes the tweens so ctx.revert() cleans them all up on unmount
    const ctx = gsap.context((self) => {
      const bars = gsap.utils.toArray(".perf-bar");
      const tl = gsap.timeline({ paused: true });

      if (!reduceMotion) {
        tl
          // 1. Needle sweeps from far left to its drawn position, slow then fast
          .fromTo(
            needleRef.current,
            { rotation: NEEDLE_START, svgOrigin: NEEDLE_PIVOT },
            { rotation: 0, duration: 1, ease: "power2.in" },
          )
          // 2. Three bounces off the limit, each one smaller and quicker
          .to(needleRef.current, { rotation: -9, duration: 0.14, ease: "sine.out" })
          .to(needleRef.current, { rotation: 0, duration: 0.14, ease: "sine.in" })
          .to(needleRef.current, { rotation: -6, duration: 0.12, ease: "sine.out" })
          .to(needleRef.current, { rotation: 0, duration: 0.12, ease: "sine.in" })
          .to(needleRef.current, { rotation: -3, duration: 0.1, ease: "sine.out" })
          .to(needleRef.current, { rotation: 0, duration: 0.1, ease: "sine.in" });

        // Bars grow and shrink from their baseline, not their center
        bars.forEach((bar) => gsap.set(bar, { svgOrigin: `${bar.dataset.x} ${BAR_BASELINE}` }));
      }

      tlRef.current = tl;

      // Bars loop for as long as the pointer stays, so they live outside the timeline.
      // repeatRefresh picks a new random height on every repeat.
      self.add("startBars", () => {
        if (reduceMotion) return;
        gsap.killTweensOf(bars);
        bars.forEach((bar, i) => {
          gsap.to(bar, {
            scaleY: () => gsap.utils.random(0.45, 1.25),
            duration: gsap.utils.random(0.22, 0.4),
            ease: "sine.inOut",
            repeat: -1,
            repeatRefresh: true,
            delay: i * 0.03,
          });
        });
      });

      self.add("stopBars", () => {
        if (reduceMotion) return;
        gsap.killTweensOf(bars);
        gsap.to(bars, { scaleY: 1, duration: 0.45, ease: "sine.out", stagger: 0.02 });
      });
    }, svgRef);

    ctxRef.current = ctx;
    return () => ctx.revert();
  }, []);

  const play = useCallback(() => {
    tlRef.current?.play();
    ctxRef.current?.startBars();
  }, []);
  const reverse = useCallback(() => {
    tlRef.current?.reverse();
    ctxRef.current?.stopBars();
  }, []);
  const pointerHandlers = useIconAnimation(svgRef, play, reverse);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label={title}
      className={`performance-icon ${className}`}
      {...pointerHandlers}
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient
          id={`${uid}linear-gradient`}
          x1="80.6"
          y1="99.92"
          x2="934.2"
          y2="915.3"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff6b35" />
          <stop offset="1" stopColor="#cc4a1c" />
        </linearGradient>
        <linearGradient
          id={`${uid}linear-gradient-2`}
          x1="512"
          y1="1000.89"
          x2="512"
          y2="24.89"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fafafa" stopOpacity="0" />
          <stop offset="1" stopColor="#fafafa" />
        </linearGradient>
        <linearGradient
          id={`${uid}linear-gradient-3`}
          x1="459.51"
          y1="353.8"
          x2="606.5"
          y2="796.79"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#262626" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
      <rect
        id={`${uid}squircle-shape`}
        x="0"
        width="1024"
        height="1024"
        rx="262.09"
        ry="262.09"
        fill={`url(#${uid}linear-gradient)`}
      />
      <path
        id={`${uid}icon-shadow`}
        d="M1024,740.7v21.21c0,144.75-117.35,262.09-262.09,262.09h-499.83C117.34,1024,0,906.66,0,761.91v-21.21c0,144.75,117.34,262.09,262.08,262.09h499.83c144.74,0,262.09-117.34,262.09-262.09Z"
        fill="#111"
        opacity=".3"
      />
      <path
        id={`${uid}icon-reflection`}
        d="M262.09,1000.89c-63.6,0-123.39-24.77-168.35-69.74-44.97-44.97-69.73-104.76-69.73-168.35v-499.82c0-63.6,24.77-123.39,69.73-168.35,44.97-44.97,104.76-69.73,168.35-69.73h499.82c63.6,0,123.39,24.77,168.35,69.73,44.97,44.97,69.74,104.76,69.74,168.35v499.82c0,63.6-24.77,123.39-69.74,168.35-44.97,44.97-104.76,69.74-168.35,69.74h-499.82Z"
        fill={`url(#${uid}linear-gradient-2)`}
        opacity=".2"
      />
      <g id={`${uid}background-circle`}>
        <path
          d="M512,919.53c-55.02,0-108.39-10.77-158.63-32.02-48.53-20.53-92.11-49.91-129.54-87.34s-66.81-81.01-87.34-129.54c-21.25-50.24-32.02-103.61-32.02-158.63s10.77-108.39,32.02-158.63c20.53-48.53,49.91-92.11,87.34-129.54s81.01-66.81,129.54-87.34c50.24-21.25,103.61-32.02,158.63-32.02s108.39,10.77,158.63,32.02c48.53,20.53,92.11,49.91,129.54,87.34s66.81,81.01,87.34,129.54c21.25,50.24,32.02,103.61,32.02,158.63s-10.77,108.39-32.02,158.63c-20.53,48.53-49.91,92.11-87.34,129.54s-81.01,66.81-129.54,87.34c-50.24,21.25-103.61,32.02-158.63,32.02Z"
          fill={`url(#${uid}linear-gradient-3)`}
        />
        <path
          d="M512,107.47c54.61,0,107.59,10.69,157.46,31.79,48.17,20.37,91.43,49.54,128.59,86.7,37.15,37.15,66.32,80.42,86.7,128.59,21.09,49.87,31.79,102.84,31.79,157.46s-10.69,107.59-31.79,157.46c-20.37,48.17-49.54,91.43-86.7,128.59-37.15,37.15-80.42,66.32-128.59,86.7-49.87,21.09-102.84,31.79-157.46,31.79s-107.59-10.69-157.46-31.79c-48.17-20.37-91.43-49.54-128.59-86.7-37.15-37.15-66.32-80.42-86.7-128.59-21.09-49.87-31.79-102.84-31.79-157.46s10.69-107.59,31.79-157.46c20.37-48.17,49.54-91.43,86.7-128.59,37.15-37.15,80.42-66.32,128.59-86.7,49.87-21.09,102.84-31.79,157.46-31.79h0ZM512,101.47c-226.73,0-410.53,183.8-410.53,410.53s183.8,410.53,410.53,410.53,410.53-183.8,410.53-410.53S738.73,101.47,512,101.47h0Z"
          fill="#e5e5e5"
        />
      </g>
      <path
        id={`${uid}speed-meter`}
        d="M145.3,505c-12.21-198.1,147.47-367.12,344.53-376.33,183.85-11.16,353.2,118.83,396.42,297.54,6.45,25.71,10.36,52.17,11.71,78.79,0,0-135.52,0-135.52,0,12.59-157.75-115.35-295.63-272.62-304.43-175.67-12.39-327.21,129.53-336.23,304.43,0,0-8.29,0-8.29,0h0Z"
        fill="#fff"
        opacity=".12"
      />
      <g ref={needleRef} id={`${uid}needle`}>
        <path
          d="M516.32,550.25c-18.29,0-34-12.44-38.2-30.26-2.54-10.77-.39-22.17,5.88-31.28,6.28-9.11,16.17-15.18,27.13-16.64l367.72-49.11,1.14,4.84-350.93,120.31c-4.13,1.42-8.42,2.14-12.74,2.14Z"
          fill="#ffffff"
        />
        <path
          d="M879.18,425.44l-350.93,120.31c-3.96,1.36-7.99,2-11.93,2-16.53,0-31.74-11.26-35.76-28.34-4.99-21.15,9.37-41.99,30.91-44.87l367.72-49.11h0ZM878.52,420.48l-367.72,49.11c-11.66,1.56-22.18,8.01-28.86,17.7-6.68,9.69-8.96,21.82-6.26,33.27,4.47,18.95,21.18,32.19,40.63,32.19,4.6,0,9.16-.76,13.55-2.27l350.93-120.31-2.28-9.69h0Z"
          fill="#666"
        />
      </g>
      {/* Each bar = thick white line with a thin blue line on top, animated together */}
      <g id={`${uid}bars`}>
        {BARS.map(([x, top]) => (
          <g key={x} className="perf-bar" data-x={x}>
            <line
              x1={x}
              y1={BAR_BASELINE}
              x2={x}
              y2={top}
              fill="none"
              stroke="#fff"
              strokeMiterlimit="10"
              strokeWidth="6.33"
            />
            <line
              x1={x}
              y1={BAR_BASELINE}
              x2={x}
              y2={top}
              fill="none"
              stroke="#5db3f9"
              strokeMiterlimit="10"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
