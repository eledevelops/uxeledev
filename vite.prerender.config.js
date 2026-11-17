// Second, small build used only for prerendering (see scripts/prerender.js):
// compiles src/entry-server.jsx for Node, with the same image settings as the site
// so image URLs in the prerendered HTML match the files in dist/client/assets.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { imageDirectives } from "./vite.config.js";

export default defineConfig({
  plugins: [react(), imagetools({ defaultDirectives: imageDirectives })],
  publicDir: false, // the public/ files are already in dist/client
  build: {
    ssr: "src/entry-server.jsx",
    outDir: "dist-ssr",
    emptyOutDir: true,
  },
  ssr: {
    // Bundle GSAP into the server build instead of importing it from node_modules at runtime
    noExternal: ["gsap"],
  },
});
