import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";
import Stats from "./sections/Stats";

function App() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <Intro />
        <Stats />
      </main>
      <Footer />
    </>
  );
}

export default App;
