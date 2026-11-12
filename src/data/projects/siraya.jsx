import sirayaImage from "../../assets/images/projects/siraya.webp";
import sirayaHomepageDesktop from "../../assets/images/case-studies/siraya/homepage-desktop.webp";
import sirayaHomepageMobile from "../../assets/images/case-studies/siraya/homepage-mobile.webp";
import sirayaRobot from "../../assets/images/case-studies/siraya/robot.webp";
import sirayaPhoneGlobalReach from "../../assets/images/case-studies/siraya/phone-global-reach.webp";
import sirayaBrochure01 from "../../assets/images/case-studies/siraya/brochure-01.webp";
import sirayaBrochure02 from "../../assets/images/case-studies/siraya/brochure-02.webp";
import sirayaBrochure03 from "../../assets/images/case-studies/siraya/brochure-03.webp";
import sirayaBrochure04 from "../../assets/images/case-studies/siraya/brochure-04.webp";

const siraya = {
  id: "siraya",
  title: "Siraya",
  tagline: "Brand, website and APAC growth: 600+ clients in 18 months",
  image: sirayaImage,
  span: "md:col-span-7",
  caseStudy: {
    title: "SIRAYA",
    intro: (
      <>
        Worked with Siraya for a little over 2 years. Together we helped them grow from a handful of clients to{" "}
        <strong>600+ in just 18 months.</strong>
      </>
    ),
    pillsTitle: "What I did:",
    pills: [
      "Brand Strategy",
      "Visual Identity",
      "Web & UI Design",
      "Website Development",
      "Globalization Strategy",
      "Custom WP Build",
    ],
    roles: "Lead Brand Designer & Front-End Developer",
    industry: "Cloud Infrastructure & CDN",
    website: "www.sirayatech.com",
    duration: "2024 – 2026",
    challenge:
      "Siraya was a young cloud infrastructure and CDN company with only a handful of clients and big plans for Asia-Pacific. To compete there, it needed a brand that looked credible next to established providers, and a website that could speak to businesses in their own language as it expanded into new markets. The site also had to stay current without depending on a developer for every blog post, press release or translation.",
    approach: [
      {
        lead: "Brand first.",
        text: "I set the brand strategy and built the visual identity, giving Siraya a clear, professional presence in a crowded technical market.",
      },
      {
        lead: "A website the team could run.",
        text: "I designed and developed a custom WordPress site with features built around how the team works. They can publish blog posts, press releases, case studies and translations on their own.",
      },
      {
        lead: "Built for APAC.",
        text: "I led the globalization strategy, structuring the site so each market got content in its own language rather than a one-size-fits-all English site.",
      },
      {
        lead: "Fast by default.",
        text: "Automated image optimization keeps pages light no matter what the team uploads. The site has held a PageSpeed Insights performance score of 92+.",
      },
    ],
    result: (
      <>
        In 18 months, Siraya grew from a handful of clients to more than 600. That growth led to partnerships with{" "}
        <strong>Cloudflare</strong> and <strong>TiDB</strong> and close collaboration with <strong>AWS</strong>.
      </>
    ),
    gallery: [
      {
        id: "homepage-desktop",
        image: sirayaHomepageDesktop,
        alt: "Siraya homepage on desktop",
        className: "col-span-2 lg:col-span-9 lg:h-[440px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "homepage-mobile",
        image: sirayaHomepageMobile,
        alt: "Siraya homepage on mobile",
        className: "col-span-1 lg:col-span-3 lg:h-[440px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "robot",
        image: sirayaRobot,
        alt: "Siraya robot mascot holding a giant Bitcoin coin",
        className: "col-span-1 lg:col-span-4 lg:h-[365px]",
        imageClass: "size-full object-contain p-8",
      },
      {
        id: "phone-global-reach",
        image: sirayaPhoneGlobalReach,
        alt: "Phone showing Siraya's global reach campaign",
        className: "col-span-2 lg:col-span-3 lg:h-[365px]",
        imageClass: "size-full object-contain p-8",
      },
      {
        id: "result",
        className: "col-span-2 lg:col-span-5 lg:h-[365px]",
      },
      {
        id: "brochure-01",
        image: sirayaBrochure01,
        alt: "Siraya brochure: Your Gateway to Global AI & Cloud Infra",
        className: "col-span-1 lg:col-span-3 lg:h-[397px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "brochure-02",
        image: sirayaBrochure02,
        alt: "Siraya brochure: Create with AI, Scale with Siraya",
        className: "col-span-1 lg:col-span-3 lg:h-[397px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "brochure-03",
        image: sirayaBrochure03,
        alt: "Siraya brochure: Designed to Reduce Your AI Spend",
        className: "col-span-1 lg:col-span-3 lg:h-[397px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "brochure-04",
        image: sirayaBrochure04,
        alt: "Siraya brochure: Trusted by Our Customers",
        className: "col-span-1 lg:col-span-3 lg:h-[397px]",
        imageClass: "size-full object-cover object-top",
      },
    ],
  },
};

export default siraya;
