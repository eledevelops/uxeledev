import megaHardImage from "../../assets/images/projects/mega-hard.webp";
import megaHardHomepageDesktop from "../../assets/images/case-studies/mega-hard/homepage-desktop.webp";
import megaHardEventBooth from "../../assets/images/case-studies/mega-hard/event-booth.webp";
import megaHardBrochure from "../../assets/images/case-studies/mega-hard/brochure.webp";

const megaHard = {
  id: "mega-hard",
  title: "Mega Hard Limited",
  tagline: "A brand built for the security & gaming niche",
  image: megaHardImage,
  span: "md:col-span-6",
  caseStudy: {
    title: "MEGAHARD",
    intro: (
      <>
        A brand-new security company, a demanding niche and a blank page.{" "}
        <strong>
          I built the brand, the bilingual website and the launch materials from zero in under two months.
        </strong>
      </>
    ),
    pillsTitle: "What I did:",
    pills: [
      "Brand Strategy",
      "Visual Identity",
      "Brand Guidelines",
      "Marketing Collateral",
      "Web Design & Development",
      "Video Production",
    ],
    roles: "Lead Brand Designer & Front-End Developer",
    industry: "Network Infrastructure & Security",
    website: "www.megahardlimited.com",
    duration: "Dec. 2025 – Jan. 2026",
    challenge:
      "Mega Hard Limited was a brand-new company selling cloud and network security equipment and services to gaming and online betting operators. For that audience, downtime means lost revenue, so they only buy from providers they trust. With no history to point to, the brand had to look established from day one and speak the industry's language in both English and Chinese.",
    approach: [
      {
        lead: "Trust from day one.",
        text: "I built the brand strategy and visual identity around reliability and uptime, giving a company with no track record the presence of an established provider.",
      },
      {
        lead: "Speaking their language.",
        text: "I wrote messaging in the operators' own terms, focused on the threats and stakes they deal with every day, not generic enterprise security talk.",
      },
      {
        lead: "A bilingual home.",
        text: "I designed and built a custom WordPress site in English and Chinese to reach operators in both markets.",
      },
      {
        lead: "Ready to sell at launch.",
        text: "I produced the sales deck, brochures, a promo video and trade show assets, so the team could start selling the day the brand went live.",
      },
    ],
    result: (
      <>
        Mega Hard Limited launched as a complete, market-ready brand: identity, bilingual website, sales materials,
        video and event assets, all delivered in under two months.
      </>
    ),
    gallery: [
      {
        id: "homepage-desktop",
        image: megaHardHomepageDesktop,
        alt: "Mega Hard Limited homepage on desktop",
        className: "col-span-2 lg:col-span-8 lg:h-[440px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "result",
        className: "col-span-2 lg:col-span-4 lg:h-[440px]",
      },
      {
        id: "event-booth",
        image: megaHardEventBooth,
        alt: "Mega Hard and Cloudflare trade show booth",
        className: "col-span-2 lg:col-span-4 lg:h-[406px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "brochure",
        image: megaHardBrochure,
        alt: "Mega Hard brochure: Build AI Infrastructure for Web3 & Fintech",
        className: "col-span-2 lg:col-span-8 lg:h-[406px]",
        imageClass: "size-full object-cover object-top",
      },
    ],
  },
};

export default megaHard;
