import validIcon from "../assets/icons/field-valid.svg";

// One labelled form field: label, input (or textarea), and its error or success message.
// Every other prop (name, type, value, onChange, onBlur, placeholder…) is passed straight to the input.
//
// States (Figma: Components > Field): Default 1px border, Focus / Error / Valid 2px.
// The 2nd pixel is an inset ring instead of a thicker border, so the text never shifts by 1px.

// Fades in when it appears (CSS @starting-style). Reduced motion: theme.css makes it instant.
const FADE_IN = "transition-opacity duration-base ease-out starting:opacity-0";

export default function Field({ id, label, error, valid, multiline = false, ...inputProps }) {
  const errorId = `${id}-error`;
  const validId = `${id}-valid`;

  const Control = multiline ? "textarea" : "input";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body">
        {label}
      </label>
      <div className="relative">
        <Control
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : valid ? validId : undefined}
          className={`block w-full rounded-lg border bg-background py-3 pr-10 pl-4 text-body text-foreground transition-[border-color,box-shadow] duration-base ease-out placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-(--border-color-accent) focus:ring-inset focus:outline-none ${multiline ? "resize-none" : ""} ${error ? "border-error ring-1 ring-(--border-color-error) ring-inset" : valid ? "border-success ring-1 ring-(--border-color-success) ring-inset" : "border-border"}`}
          {...inputProps}
        />
        {/* Valid checkmark (Figma asset, two colors, so a plain img instead of Icon).
            Input: centered vertically. Textarea: centered on the first line of text. */}
        {valid && (
          <img
            src={validIcon}
            alt=""
            width="20"
            height="20"
            className={`pointer-events-none absolute right-4 ${multiline ? "top-3 mt-half" : "top-1/2 -translate-y-1/2"} ${FADE_IN}`}
          />
        )}
      </div>
      {error && (
        <p id={errorId} className="text-caption text-error">
          {error}
        </p>
      )}
      {valid && (
        <p id={validId} className={`text-caption text-success ${FADE_IN}`}>
          Looks good!
        </p>
      )}
    </div>
  );
}
