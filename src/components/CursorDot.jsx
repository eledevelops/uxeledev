import { useEffect, useRef } from "react";

// Things you can click: the dot grows over these
const CLICKABLE = "a, button, label, select, summary, [role='button']";
// Text fields keep the normal I-beam cursor, so the dot hides over them
const TYPING = "input, textarea";

export default function CursorDot() {
  const dotRef = useRef(null);

  useEffect(() => {
    // Only for a real mouse. Phones and tablets have no cursor.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    const root = document.documentElement;
    // Hide the system arrow only once the dot is ready (see index.css)
    root.classList.add("has-cursor-dot");

    function handleMove(event) {
      // The `translate` property (not `transform`) so the grow `scale` doesn't scale the position too:
      // CSS applies translate after scale. -50% centers the dot on the mouse point.
      dot.style.translate = `calc(${event.clientX}px - 50%) calc(${event.clientY}px - 50%)`;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(TYPING)) dot.dataset.state = "hidden";
      else if (target?.closest(CLICKABLE)) dot.dataset.state = "grow";
      else dot.dataset.state = "dot";
    }

    function handleLeave() {
      dot.dataset.state = "hidden";
    }

    window.addEventListener("pointermove", handleMove);
    root.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      root.removeEventListener("pointerleave", handleLeave);
      root.classList.remove("has-cursor-dot");
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      data-state="hidden"
      className="cursor-dot pointer-events-none fixed top-0 left-0 z-100 size-4 rounded-full border border-white bg-accent transition-[scale,opacity] duration-fast ease-out data-[state=grow]:scale-300 data-[state=grow]:opacity-40 data-[state=hidden]:opacity-0 motion-reduce:transition-none"
    />
  );
}
