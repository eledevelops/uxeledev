import modelsApiImage from "../../assets/images/projects/models-api.webp";
import modelsApiModelsPage from "../../assets/images/case-studies/models-api/models-page.webp";

const modelsApi = {
  id: "models-api",
  title: "Models API",
  tagline: "AI model catalog with live filtering",
  image: modelsApiImage,
  span: "md:col-span-5",
  caseStudy: {
    title: "SIRAYA.AI Models",
    intro: (
      <>
        A live catalog of 100+ AI models from multiple providers. <strong>I built the browsing experience</strong> in
        plain JavaScript, with no framework, so customers can search, filter and compare models instantly.
      </>
    ),
    pillsTitle: "Built with:",
    pills: ["JavaScript", "HTML/CSS", "REST API", "Axios", "IntersectionObserver", "Responsive UI"],
    roles: "Front-End Developer",
    industry: "AI / LLM API Platform",
    website: "www.siraya.ai/models",
    challenge:
      "Siraya.ai offers access to a large and growing catalog of AI models from many providers, each with different capabilities, output types and pricing. Customers needed a fast way to find the right model without scrolling through one long list, and the page had to stay quick as the catalog kept growing.",
    approach: [
      {
        lead: "Fetch once, filter instantly.",
        text: "The API returns at most 100 models per request, so the page loops through every page on load and stores the full catalog. After that, every search, filter and sort runs in the browser with no extra network requests.",
      },
      {
        lead: "Filters that talk to each other.",
        text: "Provider, output type and capability filters combine freely, and each option shows a live count of matching models. Each count is calculated against every other active filter, so users never pick an option that leads to zero results.",
      },
      {
        lead: "Fast with any catalog size.",
        text: "Only 20 cards render at a time. An IntersectionObserver loads the next batch as you scroll, and search is debounced so typing never stutters.",
      },
      {
        lead: "Built to be used.",
        text: "Sort by newest or price (models without a price always sort last), dropdowns close with Esc or an outside click, ARIA states stay in sync, and there's a light/dark mode toggle.",
      },
    ],
    result: (
      <>
        A <strong>self-maintaining catalog</strong> that lets customers find the right model <strong>in seconds</strong>
        . New models, providers and capabilities appear in the filters automatically as the API updates, with no code
        changes. After the first load, every search, filter and sort runs instantly in the browser, with{" "}
        <strong>no extra requests to the server</strong>.
      </>
    ),
    gallery: [
      {
        id: "models-page",
        image: modelsApiModelsPage,
        alt: "Siraya.ai Models catalog with search, filters and model cards",
        className: "col-span-2 lg:col-span-7 lg:h-[365px]",
        imageClass: "size-full object-cover object-top",
      },
      {
        id: "result",
        className: "col-span-2 lg:col-span-5 lg:h-[365px]",
      },
    ],
  },
};

export default modelsApi;
