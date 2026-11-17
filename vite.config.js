import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagetools } from "vite-imagetools";

function imageDirectives(url) {
  if (url.searchParams.has("responsive")) {
    return new URLSearchParams({ w: "800;1600;2400", withoutEnlargement: "", as: "picture" });
  }
  return new URLSearchParams();
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), imagetools({ defaultDirectives: imageDirectives })],

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
