import { GlobalConfig } from "payload";

export const HeroWords: GlobalConfig = {
  slug: "hero-words",
  fields: [
    {
      name: "words",
      admin: {
        description:
          "These are the words that are cycled through on the front page hero section.",
      },
      type: "array",
      required: true,
      fields: [
        {
          name: "word",
          type: "text",
          label: "Word",
          required: true,
        },
      ],
    },
  ],
};
