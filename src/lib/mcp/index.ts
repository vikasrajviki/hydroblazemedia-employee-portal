import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listServicesTool from "./tools/list-services";
import getPricingTool from "./tools/get-pricing";
import contactInfoTool from "./tools/contact-info";

// Build the OAuth issuer from the project ref (Vite inlines this at build time,
// so it stays import-safe). Fallback keeps the string well-formed during the
// manifest-extract eval where no token is verified.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hydroblaze-mcp",
  title: "HydroBlaze MCP",
  version: "0.1.0",
  instructions:
    "Public information about HydroBlaze, a performance-marketing agency. Use `list_services` to see offerings, `get_pricing` for tier details, and `get_contact_info` for how prospects can reach the team.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listServicesTool, getPricingTool, contactInfoTool],
});
