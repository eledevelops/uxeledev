import cdnetworksImage from "../../assets/images/projects/cdnetworks.webp";

import cdnetworksHomepageDesktop from "../../assets/images/case-studies/cdnetworks/homepage-desktop.webp";
import cdnetworksHomepageMobile from "../../assets/images/case-studies/cdnetworks/homepage-mobile.webp";
import cdnetworksBrochure01 from "../../assets/images/case-studies/cdnetworks/brochure-01.webp";
import cdnetworksBrochure02 from "../../assets/images/case-studies/cdnetworks/brochure-02.webp";
import cdnetworksBackgroundWebm from "../../assets/videos/case-studies/cdnetworks/background.webm";
import cdnetworksBackgroundMp4 from "../../assets/videos/case-studies/cdnetworks/background.mp4";
import cdnetworksBackgroundPoster from "../../assets/videos/case-studies/cdnetworks/poster.webp";

const cdnetworks = {
  id: "cdnetworks",
  title: "MileWeb → Quantil → CDNetworks",
  tagline: "Eight years, three names, one brand journey across Asia-Pacific",
  image: cdnetworksImage,
  span: "md:col-span-12",
  caseStudy: {
    title: "CDNetworks",
    intro: (
      <>
        Eight years, three company names, <strong>one brand</strong> journey. I grew with the company from MileWeb to
        Quantil to CDNetworks, and <strong>led the rebrand that carried it across Asia-Pacific.</strong>
      </>
    ),
    pillsTitle: "What I did:",
    pills: [
      "Brand Strategy",
      "Visual Identity",
      "Brand Guidelines",
      "Marketing Collateral",
      "Web Design & Development",
      "Sales & Trade Show Design",
    ],
    roles: "Lead Brand Designer & Front-End Developer",
    industry: "Content Delivery Network",
    website: "www.cdnetworks.com",
    duration: "2016 – 2024",
    challenge:
      "In 2019, Wangsu acquired Quantil, CDNetworks and Video CDN, bringing several companies with separate identities under one roof. Quantil's brand had to stay in place to keep a key client that required a US presence, while CDNetworks needed a modern, unified identity strong enough to take the company beyond South Korea and into all of Asia-Pacific.",
    approach: [
      {
        lead: "One brand from many.",
        text: "I led the rebrand that unified the acquired companies under a modernized CDNetworks identity: logo, color system and brand guidelines.",
      },
      {
        lead: "Marketing that sells.",
        text: "I extended the brand into sales and prospect-specific materials, social media and trade show booth design.",
      },
      {
        lead: "Built to scale.",
        text: "I created video guidelines so third-party vendors could produce on-brand content without me in the room.",
      },
      {
        lead: "The brand, online.",
        text: "I designed and built the new CDNetworks website from scratch, giving the rebrand its most visible home: the first place most customers would meet it.",
      },
    ],
    result: (
      <>
        The rebrand became the face of CDNetworks' expansion from South Korea into all of Asia-Pacific. The brand system
        was still in active use more than two years after my role ended.
      </>
    ),
    gallery: [
      {
        id: "homepage-desktop",
        image: cdnetworksHomepageDesktop,
        alt: "CDNetworks homepage on desktop",
        className: "col-span-2 lg:col-span-9 lg:h-[440px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "homepage-mobile",
        image: cdnetworksHomepageMobile,
        alt: "CDNetworks global network page on mobile",
        className: "col-span-2 h-[320px] lg:col-span-3 lg:h-[440px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "result",
        className: "col-span-2 lg:col-span-6 lg:h-[406px]",
      },
      {
        id: "brochure-01",
        image: cdnetworksBrochure01,
        alt: "CDNetworks About page",
        className: "col-span-1 lg:col-span-3 lg:h-[406px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "brochure-02",
        image: cdnetworksBrochure02,
        alt: "CDNetworks Why CDNetworks page",
        className: "col-span-1 lg:col-span-3 lg:h-[406px]",
        imageClass: "size-full object-cover object-top",
      },
    ],
    background: {
      video: cdnetworksBackgroundWebm,
      videoMp4: cdnetworksBackgroundMp4,
      poster: cdnetworksBackgroundPoster,
      className: "opacity-30",
    },
  },
};

export default cdnetworks;
