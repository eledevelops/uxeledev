export default function Stats() {
  return (
    <section className="flex flex-col items-center gap-8 px-6 py-16 text-foreground">
      <p className="w-full text-center text-body-lg md:w-auto md:text-intro">Data driven designs empowered by tech.</p>
      <ul className="flex w-full max-w-case-study flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:gap-12">
        <li className="lg:flex-1">
          <p className="text-heading-xl xl:text-heading-2xl">5K+</p>
          <p className="text-meta">Hours Of Team Collab</p>
        </li>
        <li className="lg:flex-1">
          <p className="text-heading-xl xl:text-heading-2xl">100+</p>
          <p className="text-meta">Projects In 5 Domains</p>
        </li>
        <li className="lg:flex-1">
          <p className="text-heading-xl xl:text-heading-2xl">10+</p>
          <p className="text-meta">Years Of Experience</p>
        </li>
        <li className="lg:flex-1">
          <p className="text-heading-xl xl:text-heading-2xl">Polyethnic</p>
          <p className="text-meta">Mind Set</p>
        </li>
      </ul>
    </section>
  );
}
