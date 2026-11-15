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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <Navbar />
      <main id="top">
        {reduceMotion ? <Hero /> : <HeroScrollVideo />}
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
