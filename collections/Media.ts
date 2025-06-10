import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",

  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    imageSizes: [
      {
        name: "large",
        width: 1920,
        height: 1080,
      },
      {
        name: "small",
        width: 800,
        height: 450,
      },
    ],
  },
};
