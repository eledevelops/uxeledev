import { useEffect, useState } from "react";
import Icon from "./Icon";
import logo from "../assets/icons/logo.svg";
import moon from "../assets/icons/moon.svg";
import sun from "../assets/icons/sun.svg";
import separator from "../assets/icons/separator.svg";

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-5">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-navbar items-center justify-between rounded-xl border border-border bg-glass px-8 py-5 backdrop-blur-glass">
        <div className="flex flex-1">
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
        <ul className="flex items-center gap-8">
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
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:text-accent">
            <Icon src={isDark ? sun : moon} className=" size-5" />
          </button>
        </div>
      </nav>
    </header>
  );
}
