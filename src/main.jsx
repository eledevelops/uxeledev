import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The built site has prerendered HTML in #root (scripts/prerender.js): hydrate it, so React
// takes over the existing page instead of rebuilding it. In `npm run dev` #root is empty: render.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
