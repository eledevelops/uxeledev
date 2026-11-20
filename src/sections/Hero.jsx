import heroDay from "../assets/images/hero-day.webp";
import heroNight from "../assets/images/hero-night.webp";
// Phones show only the middle of the wide image (object-cover, 780px tall), so they get a centered
// portrait crop made at build time by vite-imagetools: same look, fewer bytes.
import heroDayPhone from "../assets/images/hero-day.webp?w=912&h=1520&fit=cover&position=center";
import heroNightPhone from "../assets/images/hero-night.webp?w=912&h=1520&fit=cover&position=center";

// Up to 440px wide (phones)
const PHONE = "(max-width: 27.5rem)";

export default function Hero() {
  return (
    <section className="relative">
      <h1 className="sr-only">{"Eleazar Madera, Front\u2011End Developer"}</h1>
      <picture>
        <source media={PHONE} srcSet={heroDayPhone} />
        <img
          src={heroDay}
          alt="Eleazar sitting on a stone bench over calm water at sunrise"
          width="2688"
          height="1520"
          className="h-[780px] w-full object-cover md:h-auto dark:hidden"
        />
      </picture>
      <picture>
        <source media={PHONE} srcSet={heroNightPhone} />
        <img
          src={heroNight}
          alt="Eleazar sitting on a stone bench over calm water at night, surrounded by glowing lotus lanterns"
          width="2688"
          height="1520"
          className="hidden h-[780px] w-full object-cover md:h-auto dark:block"
        />
      </picture>
      <div className="absolute inset-x-0 bottom-0 hidden h-[70px] bg-linear-to-t from-water-light to-transparent md:block md:dark:hidden" />
      <div className="absolute inset-x-0 bottom-0 hidden h-[70px] bg-linear-to-t from-water-dark to-transparent md:dark:block" />
    </section>
  );
}
