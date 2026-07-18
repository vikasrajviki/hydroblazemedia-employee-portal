import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 1500,
    currency: "USD",
    bestFor: "Early-stage brands validating paid channels",
    includes: ["1 paid channel", "Basic creative refresh", "Bi-weekly reporting"],
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 3500,
    currency: "USD",
    bestFor: "Scaling brands ready to compound performance",
    includes: ["Up to 3 channels", "Full creative production", "Weekly reporting & strategy"],
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 7500,
    currency: "USD",
    bestFor: "Established brands needing an embedded growth team",
    includes: ["Unlimited channels", "Dedicated growth lead", "Custom analytics dashboards"],
  },
];

export default defineTool({
  name: "get_pricing",
  title: "Get HydroBlaze pricing",
  description:
    "Return HydroBlaze pricing tiers. Optionally filter to a single tier by id (starter, growth, premium).",
  inputSchema: {
    tier: z
      .enum(["starter", "growth", "premium"])
      .optional()
      .describe("Optional tier id to return only that pricing tier."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ tier }) => {
    const result = tier ? TIERS.filter((t) => t.id === tier) : TIERS;
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: { tiers: result },
    };
  },
});
