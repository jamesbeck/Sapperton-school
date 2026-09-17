export const NAVIGATE_TO_CONTENT_TOOL = "navigateToContent";

export const navigateToContentDefinition = {
  name: NAVIGATE_TO_CONTENT_TOOL,
  description:
    "Navigate the visitor to relevant content on the Sapperton School website. Whenever your answer includes or recommends a link to a Sapperton page that this tool can open, proactively offer to take the visitor there. Do not navigate merely because you presented a link: wait until the visitor accepts the offer or explicitly asks to go there, then call this tool. Offer only once per destination and do not offer again after navigation succeeds. Use a specific content destination and include its identifier for an article, event, class, staff member, or content page. Content-page identifiers may include nested path segments, for example 'our-school/curriculum'.",
  inputSchema: {
    type: "object",
    properties: {
      destination: {
        type: "string",
        enum: [
          "home",
          "content_page",
          "news_index",
          "news_article",
          "events_index",
          "event",
          "classes_index",
          "class",
          "staff_index",
          "staff_member",
          "letters",
          "term_dates",
          "contact",
        ],
      },
      identifier: {
        type: "string",
        description:
          "The article slug, event ID, class slug, staff slug, or content-page path. Required only for a specific content item.",
        minLength: 1,
        maxLength: 200,
        pattern: "^[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*$",
      },
    },
    required: ["destination"],
    additionalProperties: false,
  },
  requiresConfirmation: false,
} as const;

export const allowedVoxdClientTools = [navigateToContentDefinition];
