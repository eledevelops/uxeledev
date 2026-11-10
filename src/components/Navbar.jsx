import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import logo from "../assets/icons/logo.svg";
import moon from "../assets/icons/moon.svg";
import sun from "../assets/icons/sun.svg";
import separator from "../assets/icons/separator.svg";
import menu from "../assets/icons/menu.svg";
import close from "../assets/icons/close.svg";

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const overlay = overlayRef.current;
    const menuButton = menuButtonRef.current;
    const focusable = overlay.querySelectorAll("a, button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const desktop = window.matchMedia("(min-width: 48rem)");

    document.documentElement.style.overflow = "hidden";
    first.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    function handleDesktop() {
      if (desktop.matches) setIsMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleDesktop);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleDesktop);
      document.documentElement.style.overflow = "";
      menuButton.focus();
    };
  }, [isMenuOpen]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-5">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-navbar items-center justify-between rounded-xl border border-border bg-glass px-5 py-4 backdrop-blur-glass md:px-8 md:py-5">
        <a href="#top" aria-label="Back to top" className="flex text-foreground md:hidden">
          <Icon src={logo} className="size-8" />
        </a>
        <div className="hidden flex-1 md:flex">
          <ul className="flex items-center gap-3">
            <li>
              <a
                href="https://github.com/eledevelops"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-overline uppercase text-muted-foreground transition-colors hover:text-accent">
                Gh
              </a>
            </li>
            <li aria-hidden="true" className="flex">
              <Icon src={separator} className="size-[3px] text-muted-foreground" />
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/eleazar-madera-451163105/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-overline uppercase text-muted-foreground transition-colors hover:text-accent">
                Li
              </a>
            </li>
            <li aria-hidden="true" className="flex">
              <Icon src={separator} className="size-[3px] text-muted-foreground" />
            </li>
            <li>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="text-overline uppercase text-muted-foreground transition-colors hover:text-accent">
                X
              </a>
            </li>
          </ul>
        </div>
        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <a href="#top" className="flex flex-col items-center gap-1 text-caption text-accent">
              Home
              <span className="h-half w-[14px] rounded-full bg-accent"></span>
            </a>
          </li>
          <li>
            <a href="#projects" className="flex flex-col items-center gap-1 text-caption text-foreground">
              Projects
              <span className="h-half w-[14px]"></span>
            </a>
          </li>
          <li>
            <a
              href="#top"
              aria-label="Back to top"
              className="flex text-foreground transition-colors hover:text-accent">
              <Icon src={logo} className="size-8" />
            </a>
          </li>
          <li>
            <a href="#about" className="flex flex-col items-center gap-1 text-caption text-foreground">
              About
              <span className="h-half w-[14px]"></span>
            </a>
          </li>
          <li>
            <a href="#contact" className="flex flex-col items-center gap-1 text-caption text-foreground">
              Contact
              <span className="h-half w-[14px]"></span>
            </a>
          </li>
        </ul>
        <div className="hidden flex-1 justify-end md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:text-accent">
            <Icon src={isDark ? sun : moon} className=" size-5" />
          </button>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-expanded={isMenuOpen}
          aria-label="Open menu"
          className="flex size-8 items-center justify-center rounded-full text-foreground md:hidden">
          <Icon src={menu} className="size-5" />
        </button>
      </nav>

      {isMenuOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 flex flex-col justify-between bg-glass-strong p-6 backdrop-blur-glass md:hidden">
          <div className="flex items-center justify-between">
            <a
              href="#top"
              aria-label="Back to top"
              onClick={() => setIsMenuOpen(false)}
              className="flex text-foreground">
              <Icon src={logo} className="size-8" />
            </a>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="flex size-8 items-center justify-center rounded-full text-foreground">
              <Icon src={close} className="size-5" />
            </button>
          </div>

          <ul className="flex flex-col items-center gap-6 text-heading-xl">
            <li>
              <a href="#top" onClick={() => setIsMenuOpen(false)} className="text-accent">
                Home
              </a>
            </li>
            <li>
              <a href="#projects" onClick={() => setIsMenuOpen(false)} className="text-foreground">
                Projects
              </a>
            </li>
            <li>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-foreground">
                About
              </a>
            </li>
            <li>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-foreground">
                Contact
              </a>
            </li>
          </ul>

          <div className="flex flex-col gap-4">
            <hr className="border-divider" />
            <div className="flex items-center justify-between">
              <ul className="flex items-center gap-3">
                <li>
                  <a
                    href="https://github.com/eledevelops"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="text-overline uppercase text-muted-foreground transition-colors hover:text-accent">
                    Gh
                  </a>
                </li>
                <li aria-hidden="true" className="flex">
                  <Icon src={separator} className="size-[3px] text-muted-foreground" />
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/eleazar-madera-451163105/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="text-overline uppercase text-muted-foreground transition-colors hover:text-accent">
                    Li
                  </a>
                </li>
                <li aria-hidden="true" className="flex">
                  <Icon src={separator} className="size-[3px] text-muted-foreground" />
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="X"
                    className="text-overline uppercase text-muted-foreground transition-colors hover:text-accent">
                    X
                  </a>
                </li>
              </ul>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:text-accent">
                <Icon src={isDark ? sun : moon} className=" size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
