// 404 page: runs the same moving coral gradient as FlowText on the "Whoa!" title.
// Plain JavaScript (no React), so the 404 page stays tiny.
import { createFlowGradient } from "./lib/flowGradient";

const flow = createFlowGradient(document.getElementById("flow-gradient"));

if (flow) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    flow.drawStill();
  } else {
    flow.play();
  }
}
