import { useState } from "react";
import FlowText from "../components/FlowText";
import Icon from "../components/Icon";
import linkedin from "../assets/icons/linkedin.svg";
import mail from "../assets/icons/mail.svg";
import ContactModal from "../components/ContactModal";
import Button from "../components/Button";

export default function Contact() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <section
      id="contact"
      className="mx-auto flex min-h-svh max-w-case-frame flex-col justify-center gap-8 px-6 py-16 md:px-16 lg:py-32">
      <FlowText className="text-heading-2xl md:text-hero xl:text-display">
        <h2>Let's build an experience that support your goals.</h2>
      </FlowText>
      <p className="text-body-lg text-muted-foreground">
        Open to front-end and full-stack roles, freelance projects, and interesting collaborations.
      </p>
      <Button size="lg" onClick={() => setIsContactOpen(true)} className="self-start">
        Message Me
      </Button>

      <hr className="border-border" />
      <div className="flex align-middle flex-col gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <a
            href="https://www.linkedin.com/in/eleazar-madera-451163105/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="flex text-foreground transition-colors hover:text-accent">
            <Icon src={linkedin} className="size-8" />
          </a>
          |
        </div>
        <a href="mailto:hello@uxele.dev" className="text-heading text-accent hover:underline md:text-heading-xl">
          hello@uxele.dev
        </a>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </section>
  );
}
