import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_contact_info",
  title: "Get HydroBlaze contact info",
  description:
    "Return the ways to get in touch with HydroBlaze, including the lead form URL and social links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      website: "https://hydroblaze.com",
      leadForm: "https://hydroblaze.com/#contact",
      bookingNote:
        "Prospective clients can submit the contact form on the website to book a discovery call.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
