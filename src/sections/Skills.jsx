import FlowText from "../components/FlowText";
import CardFan from "../components/CardFan";
import Icon from "../components/Icon";
import { skillGroups, softSkills } from "../data/skills";
import check from "../assets/icons/check.svg";
import whatIDoBackground from "../assets/images/skills/what-i-do-bg.webp";
import globalTeams from "../assets/images/skills/global-teams.webp";
import eleStanding from "../assets/images/skills/ele-standing.webp";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title">
      {/* Title */}
      <div className="flex justify-center px-6 pt-16 pb-8 md:p-32">
        <div className="w-full md:w-fit">
          <p className="text-body-lg text-foreground md:text-intro">{"{ my }"}</p>
          <FlowText className="text-heading-2xl md:text-display">
            <h2 id="skills-title" className="text-center">
              SKILLS
            </h2>
          </FlowText>
        </div>
      </div>

      {/* What I do: the card fan stays (sticky) while the three steps scroll past.
          overflow-x-clip (not hidden) so the fan can slide in from the side without a sideways scrollbar,
          and sticky still works. */}
      <div className="relative overflow-x-clip">
        <img
          src={whatIDoBackground}
          alt=""
          loading="lazy"
          className="pointer-events-none absolute inset-0 size-full object-cover opacity-10"
        />
        <div className="relative mx-auto flex max-w-case-frame flex-col gap-10 px-6 pt-12 pb-16 lg:flex-row lg:items-start lg:gap-16 lg:px-16 lg:py-24">
          <div className="w-full lg:sticky lg:top-32 lg:w-2/5 lg:shrink-0 xl:w-card-fan">
            <CardFan />
          </div>
          <div className="flex flex-1 flex-col gap-12 lg:gap-0">
            {skillGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-4 lg:min-h-[37.5rem] lg:justify-center lg:gap-8">
                <h3 className="text-heading-2xl text-foreground xl:text-hero">{group.title}</h3>
                <p className="text-body text-foreground lg:text-body-lg">{group.text}</p>
                <ul className="flex flex-wrap gap-4 lg:gap-8">
                  {group.icons.map((icon) => (
                    <li key={icon.name}>
                      <img src={icon.src} alt={icon.name} loading="lazy" className="size-16 lg:size-24" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Teams: photo with the quote card hanging over its bottom edge */}
      <div className="relative shadow-card">
        <img
          src={globalTeams}
          alt="Eleazar and four teammates laughing in a cloud of colored powder"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="relative flex min-h-[42.5rem] flex-col items-center gap-3 px-6 py-12 text-center text-black md:min-h-[59rem] md:gap-8 md:px-16 md:py-24">
          <h3 className="text-heading-2xl md:text-hero">Global Teams</h3>
          <p className="max-w-intro text-body-lg md:text-intro">
            Cross-cultural collaboration. Distributed team workflows. Website globalization strategy.
            <span className="hidden md:inline"> Tons of fun!</span>
          </p>
        </div>
        <p className="absolute inset-x-4 bottom-0 z-10 mx-auto max-w-case-study translate-y-10 rounded-2xl bg-background p-5 text-center text-heading text-foreground md:inset-x-16 md:p-8 md:text-heading-xl">
          The greatest reward in my career are the friends and connections I made around the world.
        </p>
      </div>

      {/* Soft Skills */}
      <div className="mx-auto flex max-w-case-frame flex-col gap-8 px-6 pt-24 pb-16 md:px-16 md:pb-24">
        <h3 className="text-heading-2xl text-foreground md:text-hero">Soft Skills</h3>
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-8">
          <ul className="flex w-full flex-col gap-4 md:flex-1 md:gap-6">
            {softSkills.map((skill) => (
              <li key={skill} className="flex items-center gap-4 text-body text-foreground md:text-body-lg">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent p-1 text-coral-50 md:size-8">
                  <Icon src={check} className="size-full" />
                </span>
                {skill}
              </li>
            ))}
          </ul>
          <img
            src={eleStanding}
            alt="Eleazar standing with arms crossed, smiling"
            width="600"
            height="1114"
            loading="lazy"
            className="w-[13.75rem] md:-my-24 md:mr-16 md:w-[18.25rem] md:shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
