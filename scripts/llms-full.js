// llms-full.txt: the full text of every case study, for AI assistants and agents.
// Case studies open as dialogs on the homepage, which agents can't open, so llms.txt only has
// one line per project. This file is generated from src/data/projects/ on every build
// (after prerender.js), so it always matches the site. Uses the prerender build in dist-ssr/.
import { writeFile } from "node:fs/promises";
import { projects, renderText } from "../dist-ssr/entry-server.js";

const file = "dist/client/llms-full.txt";

function caseStudy({ caseStudy: study, tagline }) {
  const lines = [
    `## ${study.title}`,
    "",
    `> ${tagline}`,
    "",
    `- Role: ${study.roles}`,
    `- Industry: ${study.industry}`,
    `- Website: [${study.website}](https://${study.website})`,
  ];
  if (study.duration) lines.push(`- Duration: ${study.duration}`);
  lines.push(
    `- ${study.pillsTitle.replace(/:$/, "")}: ${study.pills.join(", ")}`,
    "",
    renderText(study.intro),
    "",
    "### The challenge",
    "",
    renderText(study.challenge),
    "",
    "### The approach",
    "",
    ...study.approach.map((step) => `- **${step.lead}** ${renderText(step.text)}`),
    "",
    "### The result",
    "",
    renderText(study.result),
  );
  return lines.join("\n");
}

const text = `# Eleazar Madera (Ele): Case Studies

> The full text of the five case studies on https://uxele.dev, where they open as dialogs from the Projects section. Summary of the site: [llms.txt](https://uxele.dev/llms.txt).

${projects.map(caseStudy).join("\n\n")}
`;

await writeFile(file, text);
console.log(`Wrote ${file} (${projects.length} case studies)`);
