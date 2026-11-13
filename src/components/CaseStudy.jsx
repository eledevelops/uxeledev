import { useEffect, useRef } from "react";
import Icon from "./Icon";
import close from "../assets/icons/close.svg";

export default function CaseStudy({ project, isOpen, onClose }) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current.scrollTop = 0;
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [isOpen]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      dialogRef.current.close();
    }
  }

  return (
    <dialog
      aria-labelledby="case-study-title"
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="m-auto h-full max-h-none w-full max-w-none bg-background text-foreground backdrop:bg-glass-strong backdrop:backdrop-blur-glass md:h-auto md:max-h-[calc(100dvh-4rem)] md:max-w-case-frame md:rounded-2xl translate-y-4 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-base ease-out open:translate-y-0 open:opacity-100 starting:open:translate-y-0 starting:open:opacity-0 backdrop:opacity-0 backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-slow open:backdrop:opacity-100 starting:open:backdrop:opacity-0
">
      {project && (
        <div className="relative flex flex-col gap-8 px-6 py-12 md:gap-12 md:p-16">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden mask-b-from-40% md:h-[760px] ${project.caseStudy.background.className}`}>
            {project.caseStudy.background.video ? (
              <video
                key={project.id}
                autoPlay={!prefersReducedMotion}
                preload={prefersReducedMotion ? "none" : "auto"}
                muted
                loop
                playsInline
                poster={project.caseStudy.background.poster}
                className="size-full object-cover">
                <source src={project.caseStudy.background.video} type="video/webm" />
                <source src={project.caseStudy.background.videoMp4} type="video/mp4" />
              </video>
            ) : (
              <div className="flex h-full w-max animate-drift dark:hue-rotate-180 dark:invert">
                <img src={project.caseStudy.background.image} alt="" className="h-full w-auto max-w-none" />
                <img src={project.caseStudy.background.image} alt="" className="h-full w-auto max-w-none" />
              </div>
            )}
            {project.caseStudy.background.floatingImage && (
              <img
                src={project.caseStudy.background.floatingImage}
                alt=""
                className="absolute top-[34%] right-[6%] w-[40%] max-w-[302px] animate-float opacity-30"
              />
            )}
          </div>

          <div className="flex items-start justify-between gap-6 md:pb-8">
            <h2 id="case-study-title" className="text-heading-2xl md:text-display">
              {project.caseStudy.title}
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current.close()}
              aria-label="Close case study"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-base ease-out hover:text-accent md:mt-1 md:mr-1">
              <Icon src={close} className="size-8" />
            </button>
          </div>
          <p className="text-body-lg md:text-intro">{project.caseStudy.intro}</p>
          <div className="flex flex-col gap-3 md:gap-4">
            <h3 className="text-heading md:text-heading-xl">{project.caseStudy.pillsTitle}</h3>
            <ul className="flex flex-wrap gap-2 md:gap-4">
              {project.caseStudy.pills.map((pill) => (
                <li key={pill} className="rounded-full border border-strong bg-background px-3 py-1 text-body">
                  {pill}
                </li>
              ))}
            </ul>
          </div>
          <dl className="flex flex-col gap-6 lg:flex-row lg:gap-16">
            <div className="flex flex-col gap-3 lg:flex-1">
              <dt className="text-heading">Roles</dt>
              <dd className="text-meta">{project.caseStudy.roles}</dd>
            </div>
            <div className="flex flex-col gap-3 lg:flex-1">
              <dt className="text-heading">Industry</dt>
              <dd className="text-meta">{project.caseStudy.industry}</dd>
            </div>
            <div className="flex flex-col gap-3 lg:flex-1">
              <dt className="text-heading">Website</dt>
              <dd className="text-meta">
                <a
                  href={`https://${project.caseStudy.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-base ease-out hover:text-accent">
                  {project.caseStudy.website}
                </a>
              </dd>
            </div>
            {project.caseStudy.duration && (
              <div className="flex flex-col gap-3 lg:flex-1">
                <dt className="text-heading">Duration</dt>
                <dd className="text-meta">{project.caseStudy.duration}</dd>
              </div>
            )}
          </dl>
          <hr className="border-divider" />
          <div className="relative flex flex-col gap-2 lg:w-2/3">
            <h3 className="text-heading">The Challenge:</h3>
            <p className="text-body">{project.caseStudy.challenge}</p>
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-full ml-3 hidden h-[calc(50%+56px)] w-[160px] border-t-2 border-r-2 border-divider lg:block"
            />
            <div
              aria-hidden="true"
              className="absolute top-[calc(100%+56px)] right-[172px] left-3/4 hidden h-[44px] border-t-2 border-l-2 border-divider lg:block"
            />
          </div>

          <div className="flex flex-col gap-4 md:gap-8 lg:pt-16">
            <h3 className="text-heading text-left lg:text-center">The Approach:</h3>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {project.caseStudy.approach.map((step) => (
                <li key={step.lead} className="text-body lg:text-center">
                  <strong>{step.lead}</strong> {step.text}
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-12 lg:gap-8">
            {project.caseStudy.gallery.map((tile) =>
              tile.id === "result" ? (
                <li
                  key={tile.id}
                  className={`flex flex-col justify-center gap-2 rounded-lg bg-foreground px-6 py-12 text-background ${tile.className}`}>
                  <h3 className="text-heading">The Result:</h3>
                  <p className="text-body-lg">{project.caseStudy.result}</p>
                </li>
              ) : (
                <li
                  key={tile.id}
                  className={`overflow-hidden rounded-lg border border-border bg-muted ${tile.className}`}>
                  <img src={tile.image} alt={tile.alt} loading="lazy" className={tile.imageClass} />
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </dialog>
  );
}
