import react from "../assets/icons/skills/react.svg";
import javascript from "../assets/icons/skills/javascript.svg";
import html from "../assets/icons/skills/html.svg";
import css from "../assets/icons/skills/css.svg";
import wordpress from "../assets/icons/skills/wordpress.svg";
import bootstrap from "../assets/icons/skills/bootstrap.svg";
import tailwind from "../assets/icons/skills/tailwind.svg";
import brandIdentity from "../assets/icons/skills/brand-identity.svg";
import marketingCollateral from "../assets/icons/skills/marketing-collateral.svg";
import adobe from "../assets/icons/skills/adobe.svg";
import figma from "../assets/icons/skills/figma.svg";
// Animated icons (components instead of image files)
import LensIcon from "../components/skill-icons/LensIcon";
import PerformanceIcon from "../components/skill-icons/PerformanceIcon";
import ClapperIcon from "../components/skill-icons/ClapperIcon";

// The three "What I do" steps in the Skills section (Figma: Skills / What I do).
export const skillGroups = [
  {
    title: "Dev",
    text: "These are the tools I use to get great results.",
    icons: [
      { name: "React", src: react },
      { name: "JavaScript", src: javascript },
      { name: "HTML", src: html },
      { name: "CSS", src: css },
      { name: "WordPress", src: wordpress },
      { name: "Bootstrap", src: bootstrap },
      { name: "Tailwind CSS", src: tailwind },
    ],
  },
  {
    title: "Design",
    text: "From creating brand identities and logo designs to marketing materials and sales presentations that stand out to consolidate efforts into measurable goals.",
    icons: [
      { name: "Brand identity", src: brandIdentity },
      { name: "Marketing collateral", src: marketingCollateral },
      { name: "Adobe Creative Cloud", src: adobe },
      { name: "Figma", src: figma },
    ],
  },
  {
    title: "Digital Content",
    text: "Alongside development, I bring a photography and video production background — from board-level corporate photography to video production for live conferences. I understand how visual content should be shaped, compressed, and formatted for the web, which shapes how I approach media on every site I build.",
    icons: [
      { name: "Photography", Component: LensIcon },
      { name: "Web performance", Component: PerformanceIcon },
      { name: "Video production", Component: ClapperIcon },
    ],
  },
];

// Figma: Soft Skills list
export const softSkills = [
  "Vast experience working internationally",
  "Thrives in a team environment",
  "Self-guided",
  "Clear communication with clients and stakeholders",
  "Translating business goals into design decisions",
  "Bilingual collaboration (English / Spanish)",
  "Mentoring and giving design feedback",
  "Managing projects from brief to launch",
];
