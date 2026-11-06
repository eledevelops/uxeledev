import Icon from "./Icon";
import logo from "../assets/icons/logo.svg";
import moon from "../assets/icons/moon.svg";
import separator from "../assets/icons/separator.svg";

/*
  STRUCTURE (step 3): a guide to copy from, not working code.
  Everything lives inside a component function that returns the JSX.

  export default function Navbar() {
    return (
      <header className="fixed inset-x-0 top-4 z-50 px-5">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-navbar items-center justify-between
                     rounded-xl border border-border bg-glass px-8 py-5 backdrop-blur-glass"
        >
          ── LEFT: social links ─────────────────────────────
          <div className="flex flex-1">
            <ul className="flex items-center gap-3">
              <li> Gh link </li>
              <li> separator icon </li>
              <li> Li link </li>
              <li> separator icon </li>
              <li> X link </li>
            </ul>
          </div>

          ── CENTER: nav links + logo ──────────────────────
          <ul className="flex items-center gap-8">
            <li> Home link (active for now) </li>
            <li> Projects link </li>
            <li> Logo link → #top </li>
            <li> About link </li>
            <li> Contact link </li>
          </ul>

          ── RIGHT: theme toggle ────────────────────────────
          <div className="flex flex-1 justify-end">
            <button> moon icon </button>
          </div>
        </nav>
      </header>
    );
  }

  Steps 4–7 fill in each "<li> … </li>" and the <button>.
*/

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-5">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-navbar items-center justify-between rounded-xl border border-border bg-glass px-8 py-5 backdrop-blur-glass">
        <div className="flex flex-1">
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
        </div>
        <ul className="flex items-center gap-8"></ul>
        <div className="flex flex-1 justify-end"></div>
      </nav>
    </header>
  );
}
