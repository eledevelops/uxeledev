import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import Field from "./Field";
import close from "../assets/icons/close.svg";

const TURNSTILE_SITE_KEY = import.meta.env.DEV ? "1x00000000000000000000AA" : "0x4AAAAAAF_-1Pjx564p87xP";

// Loads Turnstile's script the first time the form opens, and only once.
// Returns a Promise that resolves with window.turnstile when the script is ready.
let turnstilePromise = null;

function loadTurnstile() {
  if (turnstilePromise === null) {
    turnstilePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        turnstilePromise = null;
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return turnstilePromise;
}

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
    if (!isOpen || widgetIdRef.current !== null) {
      return;
    }
    loadTurnstile()
      .then((turnstile) => {
        // Already rendered (e.g. React StrictMode runs this effect twice in dev): don't add a second widget
        if (widgetIdRef.current !== null) {
          return;
        }
        widgetIdRef.current = turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "contact",
          appearance: "interaction-only",
          callback: (newToken) => setToken(newToken),
          "expired-callback": () => setToken(""),
        });
      })
      .catch(() => {});
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
      if (widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
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
          <Field
            id="contact-name"
            label="Name"
            error={errors.name}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <Field
            id="contact-email"
            label="Email"
            error={errors.email}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Field
            id="contact-message"
            label="Message"
            error={errors.message}
            multiline
            name="message"
            rows={5}
            placeholder="Tell me about your project..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

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
