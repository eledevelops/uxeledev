import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import Stats from "./sections/Stats";
import Quote from "./sections/Quote";
import About from "./sections/About";

function App() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <Intro />
        <Stats />
        <Quote />
        <About />
      </main>
      <Footer />
    </>
  );
}

export default App;
