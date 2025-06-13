import type { CollectionConfig } from "payload";

export const Clubs: CollectionConfig = {
  slug: "clubs",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "years",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
      required: true,
    },
    {
      name: "banner",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "teachers",
      type: "relationship",
      relationTo: "staff",
      hasMany: true,
    },
  ],
};
