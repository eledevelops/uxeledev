// Prerender: after `vite build`, render the app to HTML and put it inside <div id="root">,
// so the page shows real content before JavaScript runs. React then hydrates it (src/main.jsx).
import { readFile, writeFile } from "node:fs/promises";
import { render } from "../dist-ssr/entry-server.js";

const file = "dist/client/index.html";
const html = await readFile(file, "utf8");
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error(`Prerender: ${marker} not found in ${file}`);

await writeFile(file, html.replace(marker, `<div id="root">${render()}</div>`));
console.log(`Prerendered ${file}`);
