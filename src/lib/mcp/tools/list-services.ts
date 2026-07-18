import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SERVICES = [
  {
    name: "Hydro Strategy",
    tagline: "Data-driven paid media & performance marketing",
    includes: [
      "Meta & Google Ads management",
      "Conversion tracking & attribution",
      "Landing page CRO",
      "Weekly performance reporting",
    ],
  },
  {
    name: "Blaze Creative",
    tagline: "High-converting creative production",
    includes: [
      "Ad creative (static & video)",
      "Brand identity systems",
      "Content production",
      "Creative testing frameworks",
    ],
  },
  {
    name: "Full Growth Partnership",
    tagline: "Strategy + creative as an embedded team",
    includes: [
      "Everything in Hydro Strategy",
      "Everything in Blaze Creative",
      "Dedicated growth lead",
      "Monthly strategy sessions",
    ],
  },
];

export default defineTool({
  name: "list_services",
  title: "List HydroBlaze services",
  description:
    "Return the list of marketing services HydroBlaze offers with taglines and what each includes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(SERVICES, null, 2) }],
    structuredContent: { services: SERVICES },
  }),
});
