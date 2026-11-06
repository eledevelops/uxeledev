/**
 * Renders an SVG file from src/assets/icons in the current text color.
 *
 * The SVG is used as a CSS mask: its shape cuts out a box filled with
 * `currentColor`. The color baked into the file doesn't matter, so the icon
 * follows whatever text color its parent has — text-foreground, dark mode,
 * hover:text-accent — with no extra code.
 *
 * Usage:
 *   import moon from "../assets/icons/moon.svg";
 *   <Icon src={moon} className="size-5" />
 */
export default function Icon({ src, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url("${src}")`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
