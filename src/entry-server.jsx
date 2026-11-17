// Server entry for prerendering: renders the app to an HTML string at build time
// (no browser). scripts/prerender.js puts that HTML into dist/client/index.html,
// and src/main.jsx then hydrates it in the browser.
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export function render() {
  return renderToString(<App />);
}
