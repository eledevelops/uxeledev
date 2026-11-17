import { useSyncExternalStore } from "react";

// navigator.connection only exists in Chromium browsers; elsewhere Data Saver is just "off"
function subscribe(onChange) {
  navigator.connection?.addEventListener("change", onChange);
  return () => navigator.connection?.removeEventListener("change", onChange);
}

function getSnapshot() {
  return navigator.connection?.saveData === true;
}

function getServerSnapshot() {
  return false;
}

// true when the visitor turned on Data Saver (Chrome / Android)
export default function useSaveData() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
