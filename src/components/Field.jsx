// One labelled form field: label, input (or textarea), and its error message.
// Every other prop (name, type, value, onChange, placeholder…) is passed straight to the input.

export default function Field({ id, label, error, valid, multiline = false, ...inputProps }) {
  const errorId = `${id}-error`;
  const validId = `${id}-valid`;

  const Control = multiline ? "textarea" : "input";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body">
        {label}
      </label>
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : valid ? validId : undefined}
        className={`rounded-lg border bg-background px-4 py-3 text-body text-foreground transition-colors duration-base ease-out placeholder:text-muted-foreground focus:border-accent focus:outline-none ${multiline ? "resize-none" : ""} ${error ? "border-error" : valid ? "border-success" : "border-border"}`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-caption text-error">
          {error}
        </p>
      )}
      {valid && (
        <p id={validId} className="text-caption text-success">
          Looks good!
        </p>
      )}
    </div>
  );
}
