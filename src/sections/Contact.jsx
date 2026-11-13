import { useState } from "react";
import FlowText from "../components/FlowText";
import Icon from "../components/Icon";
import linkedin from "../assets/icons/linkedin.svg";
import mail from "../assets/icons/mail.svg";
import ContactModal from "../components/ContactModal";

export default function Contact() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <section id="contact" className="mx-auto flex max-w-case-study flex-col gap-8 px-6 py-16 lg:px-24 lg:py-32">
      <FlowText className="text-heading-2xl md:text-hero xl:text-display">
        <h2>Let's build an experience to remember.</h2>
      </FlowText>
      <p className="text-body text-muted-foreground">
        Open to front-end and full-stack roles, freelance projects, and interesting collaborations.
      </p>
      <button
        type="button"
        onClick={() => setIsContactOpen(true)}
        className="self-start rounded-lg bg-linear-to-r from-coral-300 to-coral-600 px-4 py-3 text-body-bold text-white">
        Message Me
      </button>
      <hr className="border-border" />
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <a
            href="https://www.linkedin.com/in/eleazar-madera-451163105/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-foreground transition-colors hover:text-accent">
            <Icon src={linkedin} className="size-8" />
          </a>
          <a
            href="mailto:hello@eleazarmadera.com"
            aria-label="Email me"
            className="text-foreground transition-colors hover:text-accent">
            <Icon src={mail} className="size-10" />
          </a>
        </div>
        <a
          href="mailto:hello@eleazarmadera.com"
          className="text-heading text-accent hover:underline md:text-heading-xl">
          hello@eleazarmadera.com
        </a>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </section>
  );
}
