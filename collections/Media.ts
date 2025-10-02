import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  folders: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      label: "Description",
      admin: {
        description: "Describe the image, this is used for accessibility.",
      },
      type: "text",
      required: false,
    },
  ],
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 200,
        height: 200,
      },
      {
        name: "small",
        width: 800,
        height: 450,
      },
      {
        name: "large",
        width: 1920,
        height: 1080,
      },
    ],
  },
};
