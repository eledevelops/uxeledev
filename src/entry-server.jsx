// Server entry for prerendering: renders the app to an HTML string at build time
// (no browser). scripts/prerender.js puts that HTML into dist/client/index.html,
// and src/main.jsx then hydrates it in the browser.
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import App from "./App.jsx";

// For scripts/llms-full.js: the case study data, and a way to turn its JSX (intro, result) into text
export { projects } from "./data/index.js";

export function renderText(node) {
  return renderToStaticMarkup(<>{node}</>)
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export function render() {
  return renderToString(<App />);
}
