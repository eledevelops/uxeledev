import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import close from "../assets/icons/close.svg";

const TURNSTILE_SITE_KEY = import.meta.env.DEV ? "1x00000000000000000000AA" : "0x4AAAAAAF_-1Pjx564p87xP";

export default function ContactModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [token, setToken] = useState("");
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStatus("idle");
      setErrors({});
    }
  }

  useEffect(() => {
    if (isOpen) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || widgetIdRef.current !== null || !window.turnstile) {
      return;
    }
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action: "contact",
      appearance: "interaction-only",
      callback: (newToken) => setToken(newToken),
      "expired-callback": () => setToken(""),
    });
  }, [isOpen]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      dialogRef.current.close();
    }
  }

  function validate() {
    const newErrors = {};
    if (name.trim() === "") {
      newErrors.name = "Please add your name.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (message.trim() === "") {
      newErrors.message = "Please add a short message.";
    }
    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, token }),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    } finally {
      window.turnstile.reset(widgetIdRef.current);
      setToken("");
    }
  }

  const isSent = status === "sent";

  return (
    <dialog
      aria-labelledby="contact-title"
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="m-auto w-[calc(100%-3rem)] max-w-modal rounded-2xl bg-background text-foreground backdrop:bg-glass-strong backdrop:backdrop-blur-glass translate-y-4 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-base ease-out open:translate-y-0 open:opacity-100 starting:open:translate-y-0 starting:open:opacity-0 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-slow open:backdrop:opacity-100 starting:open:backdrop:opacity-0">
      <div className="flex flex-col gap-8 p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2
              id="contact-title"
              className={
                isSent
                  ? "text-heading"
                  : "self-start bg-linear-to-r from-coral-400 to-coral-100 bg-clip-text text-heading-xl text-transparent"
              }>
              {isSent ? "Message sent" : "Let's talk"}
            </h2>
            <p className={isSent ? "text-body text-muted-foreground" : "text-body-bold text-muted-foreground"}>
              {isSent
                ? "Thanks for reaching out. I'll get back to you at the email you provided."
                : "Tell me about your project or the role. I read every message."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            aria-label="Close contact form"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-base ease-out hover:text-accent">
            <Icon src={close} className="size-8" />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate hidden={isSent} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="contact-name" className="text-body">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className={`rounded-lg border bg-background px-4 py-3 text-body text-foreground transition-colors duration-base ease-out placeholder:text-muted-foreground focus:border-accent focus:outline-none ${errors.name ? "border-error" : "border-border"}`}
            />
            {errors.name && (
              <p id="contact-name-error" className="text-caption text-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-email" className="text-body">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              className={`rounded-lg border bg-background px-4 py-3 text-body text-foreground transition-colors duration-base ease-out placeholder:text-muted-foreground focus:border-accent focus:outline-none ${errors.email ? "border-error" : "border-border"}`}
            />
            {errors.email && (
              <p id="contact-email-error" className="text-caption text-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contact-message" className="text-body">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder="Tell me about your project..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              className={`resize-none rounded-lg border bg-background px-4 py-3 text-body text-foreground transition-colors duration-base ease-out placeholder:text-muted-foreground focus:border-accent focus:outline-none ${errors.message ? "border-error" : "border-border"}`}
            />
            {errors.message && (
              <p id="contact-message-error" className="text-caption text-error">
                {errors.message}
              </p>
            )}
          </div>

          <div ref={turnstileRef} />

          {status === "error" && (
            <p role="alert" className="text-caption text-error">
              Something went wrong. Please try again, or email me at{" "}
              <a href="mailto:hello@eleazarmadera.com" className="underline">
                hello@eleazarmadera.com
              </a>
              .
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending" || token === ""}
            className="rounded-lg bg-linear-to-r from-coral-300 to-coral-600 px-4 py-3 text-body-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>
        </form>
        {isSent && (
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current.close()}
            className="rounded-lg bg-foreground px-4 py-3 text-body-bold text-background">
            Close
          </button>
        )}
      </div>
    </dialog>
  );
}
