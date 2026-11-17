import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagetools } from "vite-imagetools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), imagetools()],
  environments: {
    // Only the browser build (not the Worker) gets two HTML pages: the site, and the 404 page
    // Cloudflare shows for unknown addresses ("not_found_handling": "404-page" in wrangler.jsonc).
    client: {
      build: {
        rollupOptions: {
          input: { main: "index.html", notFound: "404.html" },
        },
      },
    },
  },
});
