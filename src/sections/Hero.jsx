import heroDay from "../assets/images/hero-day.webp";
import heroNight from "../assets/images/hero-night.webp";
import waterFade from "../assets/images/water-fade.png";

export default function Hero() {
  return (
    <section className="relative">
      <h1 className="sr-only">Eleazar Madera, front-end developer</h1>
      <img
        src={heroDay}
        alt="Eleazar sitting on a stone bench over calm water at sunrise"
        width="2688"
        height="1520"
        className="h-[780px] w-full object-cover md:h-auto dark:hidden"
      />
      <img
        src={heroNight}
        alt="Eleazar sitting on a stone bench over calm water at night, surrounded by glowing lotus lanterns"
        width="2688"
        height="1520"
        className="hidden h-[780px] w-full object-cover md:h-auto dark:block"
      />
      <img src={waterFade} alt="" className="absolute inset-x-0 bottom-0 hidden h-[70px] w-full md:block" />
    </section>
  );
}
