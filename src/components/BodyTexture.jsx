import { useEffect, useRef } from "react";
import { createBodyTexture } from "../lib/bodyTexture";

// Ambient dot texture behind the homepage body sections (spec: docs/body-texture-shader.md).
// The WebGL engine lives in lib/bodyTexture.js (shared with the 404 page); this component mounts it.
// Every option (opacityLight, pixelSize, contrast…) can be passed as a prop, see BODY_TEXTURE_DEFAULTS.
export default function BodyTexture(props) {
  const canvasRef = useRef(null);
  // Props as a string, so the effect only re-runs when a value really changes (not on every render)
  const optionsKey = JSON.stringify(props);

  useEffect(() => {
    // The first child of <main> is the hero (scroll video or static image): skip frames while it covers the screen
    const hero = document.querySelector("main")?.firstElementChild;
    const destroy = createBodyTexture(canvasRef.current, {
      ...JSON.parse(optionsKey),
      isCovered: () => Boolean(hero) && hero.getBoundingClientRect().bottom >= window.innerHeight,
    });
    return () => destroy?.();
  }, [optionsKey]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="[image-rendering:pixelated]" />
    </div>
  );
}
