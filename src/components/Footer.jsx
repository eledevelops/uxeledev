const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="dark flex flex-col gap-4 border-t border-divider bg-background px-6 py-16 text-caption text-muted-foreground md:flex-row md:items-center md:justify-between md:px-24 md:py-10">
      <p>© {year} Eleazar Madera</p>
      <ul className="flex items-center gap-4">
        <li>
          <a
            href="https://github.com/eledevelops"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-accent">
            GitHub
          </a>
        </li>
        <li aria-hidden="true">·</li>
        <li>
          <a
            href="https://www.linkedin.com/in/eleazar-madera-451163105/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-accent">
            LinkedIn
          </a>
        </li>
        <li aria-hidden="true">·</li>
        <li>
          <a href="#top" className="transition-colors hover:text-accent">
            Back to top
          </a>
        </li>
      </ul>
    </footer>
  );
}
