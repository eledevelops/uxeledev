import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Icon from "./Icon";
import logo from "../assets/icons/logo.svg";
import moon from "../assets/icons/moon.svg";
import sun from "../assets/icons/sun.svg";
import separator from "../assets/icons/separator.svg";
import menu from "../assets/icons/menu.svg";
import close from "../assets/icons/close.svg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The page sections that have a navbar link, in page order.
// The navbar links, the mobile menu and the active-section triggers are all built from this one list.
const sectionLinks = [
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

// The theme lives on <html class="dark"> (set before paint by the script in index.html).
// Read it as an external store, so prerendering (no document) and hydration agree.
function subscribeToTheme(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getIsDark = () => document.documentElement.classList.contains("dark");
const getIsDarkOnServer = () => false;

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const triggers = [];
    for (const link of sectionLinks) {
      const trigger = ScrollTrigger.create({
        trigger: `#${link.id}`,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            setActiveSection(link.id);
          }
        },
      });
      triggers.push(trigger);
    }

    // Scrolling back up above Projects (into the hero): no section link is active
    triggers.push(
      ScrollTrigger.create({
        trigger: "#projects",
        start: "top center",
        onLeaveBack: () => setActiveSection("top"),
      }),
    );

    return () => {
      for (const trigger of triggers) {
        trigger.kill();
      }
    };
  }, []);

  // Slides the one underline to the active desktop link
  useEffect(() => {
    function placeIndicator() {
      const indicator = indicatorRef.current;
      const activeLink = navLinksRef.current.querySelector('[aria-current="true"]');
      if (!activeLink) {
        indicator.style.opacity = "0";
        return;
      }
      const x = activeLink.offsetLeft + activeLink.offsetWidth / 2 - indicator.offsetWidth / 2;
      const y = activeLink.offsetTop + activeLink.offsetHeight - indicator.offsetHeight;
      indicator.style.transform = `translate(${x}px, ${y}px)`;
      indicator.style.opacity = "1";
    }

    placeIndicator();
    window.addEventListener("resize", placeIndicator);
    return () => window.removeEventListener("resize", placeIndicator);
  }, [activeSection]);

  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, getIsDarkOnServer);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const overlayRef = useRef(null);
  const navLinksRef = useRef(null);
  const indicatorRef = useRef(null);

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
    // The class is the source of truth: subscribeToTheme sees the change and updates isDark
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function desktopLink(link) {
    const isActive = activeSection === link.id;
    return (
      <li key={link.id}>
        <a
          href={`#${link.id}`}
          aria-current={isActive ? "true" : undefined}
          className={`flex flex-col items-center gap-1 text-body-bold transition-colors duration-base ${isActive ? "text-accent" : "text-foreground"}`}>
          {link.label}
          <span className="h-half w-[14px]"></span>
        </a>
      </li>
    );
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
        <div ref={navLinksRef} className="relative hidden md:block">
          <ul className="flex items-center gap-8">
            {sectionLinks.slice(0, 2).map(desktopLink)}
            <li>
              <a
                href="#top"
                aria-label="Back to top"
                className="flex text-foreground transition-colors hover:text-accent">
                <Icon src={logo} className="size-8" />
              </a>
            </li>
            {sectionLinks.slice(2).map(desktopLink)}
          </ul>
          {/* The one underline: it slides to whichever link is active */}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="absolute top-0 left-0 h-half w-[14px] rounded-full bg-accent opacity-0 transition-[transform,opacity] duration-slow ease-out"
          />
        </div>
        <div className="hidden flex-1 justify-end md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:text-accent">
            <Icon src={moon} className="size-5 dark:hidden" />
            <Icon src={sun} className="size-5 not-dark:hidden" />
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
              <a
                href="#top"
                onClick={() => setIsMenuOpen(false)}
                aria-current={activeSection === "top" ? "true" : undefined}
                className={activeSection === "top" ? "text-accent" : "text-foreground"}>
                Home
              </a>
            </li>
            {sectionLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={activeSection === link.id ? "true" : undefined}
                  className={activeSection === link.id ? "text-accent" : "text-foreground"}>
                  {link.label}
                </a>
              </li>
            ))}
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
                <Icon src={moon} className="size-5 dark:hidden" />
                <Icon src={sun} className="size-5 not-dark:hidden" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
