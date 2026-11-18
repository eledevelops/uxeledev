import { useState } from "react";
import CaseStudy from "../components/CaseStudy";
import { projects } from "../data";
import FlowText from "../components/FlowText";
import { preloadCaseStudy } from "../lib/caseStudyImages";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="flex flex-col gap-8 px-6 py-16 md:gap-12 md:px-8 md:py-0">
      <div className="py-8 md:p-32">
        <div className="mx-auto w-full md:w-fit">
          <p className="text-center text-body-lg text-foreground md:text-left md:text-intro">{"{ ...latest }"}</p>
          <FlowText className="text-heading-2xl md:text-display">
            <h2 id="projects-title" className="text-center">
              PROJECTS
            </h2>
          </FlowText>
        </div>
      </div>
      <ul className="mx-auto grid w-full max-w-case-study grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
        {projects.map((project) => (
          <li key={project.id} className={project.span}>
            <button
              type="button"
              onClick={() => {
                setSelectedProject(project);
                setIsCaseStudyOpen(true);
              }}
              onPointerEnter={() => preloadCaseStudy(project)}
              onFocus={() => preloadCaseStudy(project)}
              className="group relative isolate block h-[240px] w-full overflow-hidden rounded-lg border border-border md:h-[365px]">
              <div className="absolute -inset-4 transition duration-base ease-out touch:blur-card touch:brightness-75 group-hover:blur-card group-hover:brightness-75 group-focus-visible:blur-card group-focus-visible:brightness-75">
                <img
                  src={project.image.img.src}
                  srcSet={project.image.sources.webp}
                  sizes="(min-width: 76rem) 76rem, 100vw"
                  width={project.image.img.w}
                  height={project.image.img.h}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-overlay" />
              <div
                className="relative flex h-full flex-col items-center justify-center gap-1 px-8 text-center text-neutral-50 transition duration-base ease-out can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-visible:opacity-100">
                <span className="block text-heading md:text-heading-xl">{project.title}</span>
                <span className="block text-caption md:text-body-lg">{project.tagline}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <CaseStudy project={selectedProject} isOpen={isCaseStudyOpen} onClose={() => setIsCaseStudyOpen(false)} />
    </section>
  );
}
