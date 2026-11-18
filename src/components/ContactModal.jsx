import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import Field from "./Field";
import Button from "./Button";
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
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [token, setToken] = useState("");
  // True when Turnstile's script can't load (blocked by an extension or a network filter)
  const [turnstileBlocked, setTurnstileBlocked] = useState(false);
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStatus("idle");
      setTouched({});
      setTurnstileBlocked(false);
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
          callback: (newToken) => {
            setToken(newToken);
            // The visitor clicked Send before the check finished: hide the "one moment" message
            setStatus((current) => (current === "verifying" ? "idle" : current));
          },
          "expired-callback": () => setToken(""),
        });
      })
      // Script blocked or offline: say so, and point to email (opening the form again retries)
      .catch(() => setTurnstileBlocked(true));
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

  // Calculated on every render from the current values (not stored in state)
  const errors = validate();

  // Remember that the user has left this field, so its message can show
  function markTouched(field) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length > 0) {
      return;
    }
    // No Turnstile token yet: blocked (its message is already showing) or still checking
    if (token === "") {
      if (!turnstileBlocked) {
        setStatus("verifying");
      }
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
      className="m-auto w-[calc(100%-3rem)] max-w-modal rounded-2xl bg-background text-foreground backdrop:bg-glass-strong backdrop:backdrop-blur-glass translate-y-4 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-base ease-out open:translate-y-0 open:opacity-100 starting:open:translate-y-0 starting:open:opacity-0 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-slow open:backdrop:opacity-100 starting:open:backdrop:opacity-0 border border-border shadow-glow">
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
            error={touched.name ? errors.name : undefined}
            valid={touched.name && !errors.name}
            onBlur={() => markTouched("name")}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={200}
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <Field
            id="contact-email"
            label="Email"
            error={touched.email ? errors.email : undefined}
            valid={touched.email && !errors.email}
            onBlur={() => markTouched("email")}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Field
            id="contact-message"
            label="Message"
            error={touched.message ? errors.message : undefined}
            valid={touched.message && !errors.message}
            onBlur={() => markTouched("message")}
            multiline
            name="message"
            rows={5}
            maxLength={5000}
            placeholder="Tell me about your project..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <div ref={turnstileRef} />

          {status === "verifying" && (
            <p role="status" className="text-caption text-muted-foreground">
              One moment: checking you're not a bot. Please press Send again in a second.
            </p>
          )}

          {(status === "error" || turnstileBlocked) && (
            <p role="alert" className="text-caption text-error">
              {turnstileBlocked
                ? "The spam check couldn't load (a browser extension or network filter may be blocking it). Please email me at"
                : "Something went wrong. Please try again, or email me at"}{" "}
              <a href="mailto:hello@uxele.dev" className="underline">
                hello@uxele.dev
              </a>
              .
            </p>
          )}

          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send Message"}
          </Button>
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
