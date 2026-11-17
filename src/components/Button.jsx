// The coral gradient call-to-action button (Figma: Components > Button, Default + Hover).
// On hover a lighter gradient fades in over the default one (CSS can't animate between two gradients)
// and a soft shadow lifts it. Every other prop (onClick, disabled…) is passed straight to the <button>.
// The 404 page (plain HTML) has a copy of these classes on its "Back home" link.
export default function Button({ children, className = "", type = "button", ...buttonProps }) {
  return (
    <button
      type={type}
      className={`group relative isolate overflow-hidden rounded-lg bg-linear-to-r from-coral-300 from-38% to-coral-600 to-94% px-4 py-3 text-body-bold text-white transition-shadow duration-base ease-out enabled:hover:shadow-button focus-visible:shadow-button disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...buttonProps}>
      {/* Hover gradient: fades in over the default one */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-coral-300 via-coral-200 to-coral-600 opacity-0 transition-opacity duration-base ease-out group-enabled:group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      {children}
    </button>
  );
}
