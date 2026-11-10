import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Intro from "./sections/Intro";

function App() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <Intro />
      </main>
      <Footer />
    </>
  );
}

export default App;
