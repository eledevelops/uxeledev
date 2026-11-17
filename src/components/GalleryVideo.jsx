import { useEffect, useRef } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

// A case study gallery tile as a muted video. It plays only while visible, and pauses off screen.
// loop: false plays once and then stays on the last frame (it doesn't restart when you scroll back).
// Reduced motion or Data Saver: nothing downloads, and the poster (the last frame) shows instead.
export default function GalleryVideo({ video, label, className }) {
  const videoRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = videoRef.current;
    if (reduceMotion || navigator.connection?.saveData) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !element.ended) {
          element.play().catch(() => {});
        } else {
          element.pause();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      loop={video.loop}
      preload="none"
      poster={video.poster}
      aria-label={label}
      className={className}>
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
