import { useCallback, useId, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import useIconAnimation from "../../hooks/useIconAnimation";

/**
 * Film clapperboard icon. On hover the board tilts, the top arm lifts and
 * claps shut, then the play icon fades in. On leave it all plays in reverse.
 * On touch screens it loops by itself (see useIconAnimation).
 */
export default function ClapperIcon({ className = "", title = "Video production" }) {
  const uid = useId().replace(/:/g, "") + "-";
  const svgRef = useRef(null);
  const boardRef = useRef(null);
  const armRef = useRef(null);
  const playRef = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // gsap.context scopes the tweens so ctx.revert() cleans them all up on unmount
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      if (!reduceMotion) {
        tl
          // 1. Board tilts counterclockwise around the squircle's center with one soft
          //    overshoot before settling at -6° (back.out: higher number = bigger overshoot)
          .to(boardRef.current, { rotation: -6, svgOrigin: "512 512", duration: 0.7, ease: "back.out(1.6)" })
          // 2. Top arm lifts open on its hinge (bottom-left corner of the arm),
          //    overlapping the tilt so the two moves blend into one motion
          .to(armRef.current, { rotation: -6, svgOrigin: "128.18 383.98", duration: 0.5, ease: "sine.inOut" }, "-=0.4")
          // 3. ...then swings shut, flat against the bottom arm (the art is drawn 13.39° open)
          .to(armRef.current, { rotation: 13.39, svgOrigin: "128.18 383.98", duration: 0.32, ease: "power2.in" });
      }

      // 4. Play icon fades in just as the clap lands
      tl.fromTo(playRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "sine.out" }, "-=0.05");

      tlRef.current = tl;
    }, svgRef);

    return () => ctx.revert();
  }, []);

  const play = useCallback(() => tlRef.current?.play(), []);
  const reverse = useCallback(() => tlRef.current?.reverse(), []);
  const pointerHandlers = useIconAnimation(svgRef, play, reverse);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label={title}
      className={`clapper-icon ${className}`}
      {...pointerHandlers}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink">
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
          y1="1000"
          x2="512"
          y2="24"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fafafa" stopOpacity="0" />
          <stop offset="1" stopColor="#fafafa" />
        </linearGradient>
        <linearGradient
          id={`${uid}linear-gradient-3`}
          x1="468.3"
          y1="496.58"
          x2="597"
          y2="884.45"
          gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#262626" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient
          id={`${uid}linear-gradient-4`}
          x1="491.93"
          y1="364.65"
          x2="548.14"
          y2="534.05"
          xlinkHref={`#${uid}linear-gradient-3`}
        />
        <linearGradient
          id={`${uid}linear-gradient-5`}
          x1="491.93"
          y1="283.35"
          x2="548.14"
          y2="452.75"
          gradientTransform="translate(-19.55 -87.84)"
          xlinkHref={`#${uid}linear-gradient-3`}
        />
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
        d="M262.09,1000c-63.6,0-123.39-24.77-168.35-69.74-44.97-44.97-69.73-104.76-69.73-168.35v-499.82c0-63.6,24.77-123.39,69.73-168.35,44.97-44.97,104.76-69.73,168.35-69.73h499.82c63.6,0,123.39,24.77,168.35,69.73,44.97,44.97,69.74,104.76,69.74,168.35v499.82c0,63.6-24.77,123.39-69.74,168.35-44.97,44.97-104.76,69.74-168.35,69.74h-499.82Z"
        fill={`url(#${uid}linear-gradient-2)`}
        opacity=".2"
      />

      {/* Everything that tilts together: board, both arms and the play icon */}
      <g ref={boardRef} id={`${uid}clapperboard`}>
        <g id={`${uid}clapperboard-bottom`}>
          <path
            d="M158,893c-14.89,0-27-12.11-27-27v-479.8h762v479.8c0,14.89-12.11,27-27,27H158Z"
            fill={`url(#${uid}linear-gradient-3)`}
          />
          <path
            d="M890,389.2v476.8c0,13.23-10.77,24-24,24H158c-13.23,0-24-10.77-24-24v-476.8h756ZM896,383.2H128v482.8c0,16.57,13.43,30,30,30h708c16.57,0,30-13.43,30-30v-482.8h0Z"
            fill="#e5e5e5"
          />
        </g>
        <g id={`${uid}clapperboard-bottom-arm`}>
          <g>
            <rect x="130.5" y="387.49" width="763" height="75.31" fill={`url(#${uid}linear-gradient-4)`} />
            <path d="M891,389.99v70.31H133v-70.31h758ZM896,384.99H128v80.31h768v-80.31h0Z" fill="#e5e5e5" />
          </g>
          <polygon points="604.86 460.54 688.87 460.54 731.92 389.75 647.91 389.75 604.86 460.54" fill="#666" />
          <polygon points="761.95 460.54 845.96 460.54 889.01 389.75 805 389.75 761.95 460.54" fill="#666" />
          <polygon points="447.76 460.54 531.78 460.54 574.83 389.75 490.82 389.75 447.76 460.54" fill="#666" />
          <polygon points="290.67 460.54 374.69 460.54 417.74 389.75 333.72 389.75 290.67 460.54" fill="#666" />
          <polygon points="133.58 460.54 217.59 460.54 260.65 389.75 176.63 389.75 133.58 460.54" fill="#666" />
        </g>
        <g ref={armRef} id={`${uid}clapperboard-top-arm`}>
          <g>
            <rect
              x="110.95"
              y="218.35"
              width="763"
              height="75.31"
              transform="translate(-45.89 120.97) rotate(-13.39)"
              fill={`url(#${uid}linear-gradient-5)`}
            />
            <path
              d="M853.02,134.06l16.28,68.4L131.89,377.96l-16.28-68.4,737.4-175.5h0ZM856.72,128.04L109.59,305.85l18.59,78.13,747.13-177.81-18.59-78.13h0Z"
              fill="#e5e5e5"
            />
          </g>
          <polygon points="590.98 268.94 672.71 249.49 698.21 170.66 616.47 190.11 590.98 268.94" fill="#666" />
          <polygon points="743.81 232.57 825.54 213.12 851.03 134.29 769.3 153.74 743.81 232.57" fill="#666" />
          <polygon points="438.16 305.31 519.89 285.86 545.38 207.03 463.65 226.48 438.16 305.31" fill="#666" />
          <polygon points="285.33 341.68 367.07 322.23 392.56 243.4 310.83 262.85 285.33 341.68" fill="#666" />
          <polygon points="132.51 378.06 214.24 358.6 239.73 279.77 158 299.22 132.51 378.06" fill="#666" />
        </g>
        <polygon
          ref={playRef}
          id={`${uid}play-icon`}
          points="412.99 547.54 412.99 730.34 611.01 638.94 412.99 547.54"
          fill="#fff"
        />
      </g>
    </svg>
  );
}
