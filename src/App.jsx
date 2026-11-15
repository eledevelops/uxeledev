import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroScrollVideo from "./components/HeroScrollVideo";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import Stats from "./sections/Stats";
import Projects from "./sections/Projects";
import Quote from "./sections/Quote";
import About from "./sections/About";
import Contact from "./sections/Contact";

function App() {
  const reduceMotion = usePrefersReducedMotion();

  const saveData = navigator.connection?.saveData === true;

  const [heroFailed, setHeroFailed] = useState(false);
  const showVideo = !reduceMotion && !saveData && !heroFailed;

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [showVideo]);

  return (
    <>
      <Navbar />
      <main id="top">
        {showVideo ? <HeroScrollVideo onFail={setHeroFailed} /> : <Hero />}

        <Intro />
        <Stats />
        <Projects />
        <Quote />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
