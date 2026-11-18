import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion";
import useSaveData from "./hooks/useSaveData";
import useSoftSnap from "./hooks/useSoftSnap";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CursorDot from "./components/CursorDot";
import BodyTexture from "./components/BodyTexture";
import HeroScrollVideo from "./components/HeroScrollVideo";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import Projects from "./sections/Projects";

import Skills from "./sections/Skills";
import About from "./sections/About";
import Contact from "./sections/Contact";

function App() {
  const reduceMotion = usePrefersReducedMotion();

  const saveData = useSaveData();
  useSoftSnap();

  const [heroFailed, setHeroFailed] = useState(false);
  const showVideo = !reduceMotion && !saveData && !heroFailed;

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [showVideo]);

  return (
    <>
      {/* Ambient dot texture behind the body sections (the hero and footer cover it) */}
      <BodyTexture />
      <Navbar />
      <main id="top" className="overflow-x-clip">
        {showVideo ? <HeroScrollVideo onFail={setHeroFailed} /> : <Hero />}

        <Intro />
        <Projects />
        <About />
        <Skills />

        <Contact />
      </main>
      <Footer />
      <CursorDot />
    </>
  );
}

export default App;
