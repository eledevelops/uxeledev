// 404 page: runs the same moving coral gradient as FlowText on the "Whoa!" title,
// and the same ambient dot texture as the homepage behind the page.
// Plain JavaScript (no React), so the 404 page stays tiny.
import { createFlowGradient } from "./lib/flowGradient";
import { createBodyTexture } from "./lib/bodyTexture";

createBodyTexture(document.getElementById("body-texture"));

const flow = createFlowGradient(document.getElementById("flow-gradient"));

if (flow) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    flow.drawStill();
  } else {
    flow.play();
  }
}
