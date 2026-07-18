import { defineMcp } from "@lovable.dev/mcp-js";
import listServicesTool from "./tools/list-services";
import getPricingTool from "./tools/get-pricing";
import contactInfoTool from "./tools/contact-info";

export default defineMcp({
  name: "hydroblaze-mcp",
  title: "HydroBlaze MCP",
  version: "0.1.0",
  instructions:
    "Public information about HydroBlaze, a performance-marketing agency. Use `list_services` to see offerings, `get_pricing` for tier details, and `get_contact_info` for how prospects can reach the team.",
  tools: [listServicesTool, getPricingTool, contactInfoTool],
});
