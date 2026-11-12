import deltabaseImage from "../../assets/images/projects/deltabase.webp";

import deltabaseHomepageDesktop from "../../assets/images/case-studies/deltabase/homepage-desktop.webp";
import deltabaseBrandGuidelines from "../../assets/images/case-studies/deltabase/brand-guidelines.webp";

const deltabase = {
  id: "deltabase",
  title: "Deltabase",
  tagline: "Full brand and website in two weeks",
  image: deltabaseImage,
  span: "md:col-span-6",
  caseStudy: {
    title: "DELTABASE",
    intro: (
      <>
        A new company, a new country and two weeks on the clock.{" "}
        <strong>I delivered Deltabase's complete brand and website in just 14 days.</strong>
      </>
    ),
    pillsTitle: "What I did:",
    pills: [
      "Brand Strategy",
      "Visual Identity",
      "Brand Guidelines",
      "Marketing Collateral",
      "Web Design & Development",
    ],
    roles: "Lead Brand Designer & Front-End Developer",
    industry: "Cloud Infrastructure & CDN",
    website: "www.deltabase.vn",
    duration: "Two Weeks",
    challenge:
      "Siraya was ready to expand into Vietnam, but selling there meant having a local company on the ground. Local requirements called for an in-country entity, and Vietnamese businesses prefer local providers because it simplifies government compliance. Deltabase needed to look like an established Vietnamese business, fully independent from Siraya, with its brand, website and materials ready in just two weeks.",
    approach: [
      {
        lead: "Local by design.",
        text: "I positioned Deltabase as a Vietnamese company first, built to meet in-country requirements and earn the trust of local buyers.",
      },
      {
        lead: "A brand of its own.",
        text: "I created a fully independent identity (logo, color system and guidelines), with no visual ties to Siraya.",
      },
      {
        lead: "A website, fast.",
        text: "I designed and built a custom WordPress site for deltabase.vn, ready to represent the company from day one.",
      },
      {
        lead: "Ready for business.",
        text: "I produced the marketing materials the local team needed to start meeting customers right away.",
      },
    ],
    result: (
      <>
        Deltabase launched in two weeks with a complete brand, website and marketing materials, giving Siraya the local
        presence it needed to do business in Vietnam.
      </>
    ),
    gallery: [
      {
        id: "homepage-desktop",
        image: deltabaseHomepageDesktop,
        alt: "Deltabase homepage on desktop",
        className: "col-span-2 lg:col-span-8 lg:h-[440px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "result",
        className: "col-span-2 lg:col-span-4 lg:h-[440px]",
      },
      {
        id: "brand-guidelines",
        image: deltabaseBrandGuidelines,
        alt: "Deltabase brand guidelines pages: logo, typography and colors",
        className: "col-span-2 lg:col-span-12 lg:h-[406px]",
        imageClass: "size-full object-cover object-top",
      },
    ],
  },
};
export default deltabase;
