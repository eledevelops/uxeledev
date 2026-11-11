import { projects } from "../data/projects";

export default function Projects() {
  return (
    <section id="projects" className="flex flex-col gap-8 px-6 py-16 md:gap-12 md:px-8 md:py-0">
      <div className="py-8 text-foreground md:p-32">
        <div className="mx-auto w-fit">
          <p className="text-body-lg md:text-intro">{"{ ...latest }"}</p>
          <h2 className="text-center text-heading-2xl md:text-display">PROJECTS</h2>
        </div>
      </div>
      <ul className="mx-auto grid w-full max-w-case-study grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
        {projects.map((project) => (
          <li key={project.id} className={project.span}>
            <button
              type="button"
              className="group relative block h-[240px] w-full overflow-hidden rounded-lg border border-border md:h-[365px]">
              <div className="absolute -inset-4 transition duration-base ease-out max-md:blur-card max-md:brightness-75 md:group-hover:blur-card md:group-hover:brightness-75 md:group-focus-visible:blur-card md:group-focus-visible:brightness-75">
                <img src={project.image} alt="" className="size-full object-cover" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-overlay" />
              <div className="relative flex h-full flex-col items-center justify-center gap-1 px-8 text-center text-neutral-50 transition duration-base ease-out md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                <span className="block text-heading md:text-heading-xl">{project.title}</span>
                <span className="block text-caption md:text-body-lg">{project.tagline}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
