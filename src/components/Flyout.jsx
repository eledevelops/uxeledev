export default function Flyout({ label, children }) {
  return (
    <span className=" group relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 w-max max-w-flyout -translate-x-1/2 pb-2 opacity-0 transition-opacity duration-slow ease-out group-hover:opacity-100 group-focus-within:opacity-100">
        <span className="block rounded-lg border border-coral-100 bg-background px-4 py-3 text-caption text-foreground">
          {label}
        </span>
        <svg
          width="16.7071"
          height="8.85355"
          viewBox="0 0 16.7071 8.85355"
          className="absolute bottom-px left-1/2 -translate-x-1/2">
          <path
            d="M0.353553 0.353553L8.35355 8.35355L16.3536 0.353553"
            strokeLinejoin="round"
            className="fill-(--background-color-background) stroke-coral-100"
          />
        </svg>
      </span>
    </span>
  );
}
