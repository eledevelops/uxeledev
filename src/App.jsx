import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import Stats from "./sections/Stats";
import Projects from "./sections/Projects";
import Quote from "./sections/Quote";
import About from "./sections/About";
import Contact from "./sections/Contact";

function App() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
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
