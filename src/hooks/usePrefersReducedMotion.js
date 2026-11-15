import { useSyncExternalStore } from "react";

const query = window.matchMedia("(prefers-reduced-motion: reduce)");
function subscribe(onChange) {
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return query.matches;
}

// true when the visitor has "Reduce motion" turned on. Updates live if they change it.
export default function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
