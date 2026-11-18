import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cardBrandGuidelines from "../assets/images/skills/card-brand-guidelines.webp";
import cardLogo from "../assets/images/skills/card-logo.svg";
import cardStickers from "../assets/images/skills/card-stickers.webp";

gsap.registerPlugin(ScrollTrigger);

const cardClass =
  "absolute left-[24.16%] top-[12.98%] aspect-square w-[51.95%] overflow-hidden rounded-lg border border-border bg-white shadow-card hover:z-10 md:left-[26.65%] md:top-[13.12%] md:w-[46.69%]";

export default function CardFan() {
  const fanRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        // gsap.matchMedia runs this function only while AT LEAST ONE condition matches,
        // so phones need their own condition (without it, nothing ran on mobile).
        isDesktop: "(min-width: 48rem)",
        isMobile: "(max-width: 47.99rem)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;

        const openSpread = isDesktop ? 33 : 25;
        const openDrop = isDesktop ? 4.6 : 3;
        const openAngle = isDesktop ? 16 : 12;
        const closedSpread = isDesktop ? 10.6 : 9;
        const closedAngle = isDesktop ? 4 : 3;

        if (reduceMotion) {
          gsap.set(leftCardRef.current, { xPercent: -openSpread, yPercent: openDrop, rotation: -openAngle });
          gsap.set(rightCardRef.current, { xPercent: openSpread, yPercent: openDrop, rotation: openAngle });
          return;
        }

        gsap
          .timeline({
            scrollTrigger: {
              trigger: fanRef.current,
              start: "top 85%",
              end: "top 35%",
              scrub: 1,
            },
          })
          .from(fanRef.current, { xPercent: 0, opacity: 0, duration: 1 })
          .fromTo(
            leftCardRef.current,
            { xPercent: -closedSpread, rotation: -closedAngle },
            { xPercent: -openSpread, yPercent: openDrop, rotation: -openAngle, duration: 1 },
          )
          .fromTo(
            rightCardRef.current,
            { xPercent: closedSpread, rotation: closedAngle },
            { xPercent: openSpread, yPercent: openDrop, rotation: openAngle, duration: 1 },
            "<",
          );
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={fanRef} className="relative aspect-[385/285] w-full md:aspect-[981/678]">
      <div ref={leftCardRef} className={cardClass}>
        <img src={cardBrandGuidelines} loading="lazy" alt="Brand guidelines pages" className="size-full object-cover" />
      </div>
      <div ref={rightCardRef} className={cardClass}>
        <img src={cardStickers} loading="lazy" alt="A sheet of illustrated stickers" className="size-full object-cover" />
      </div>
      <div className={cardClass}>
        <img
          src={cardLogo}
          loading="lazy"
          alt="A purple and blue brand logo"
          className="absolute inset-[15%] size-[70%] object-contain"
        />
      </div>
    </div>
  );
}
