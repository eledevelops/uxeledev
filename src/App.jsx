import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <main id="top" className="pt-32">
        <h1 className="text-hero text-accent">Ele UX</h1>
        <p className="text-body-lg text-muted-foreground">This is some text!</p>
      </main>
      <Footer />
    </>
  );
}

export default App;
