import type { CollectionConfig } from "payload";

export const NewsArticles: CollectionConfig = {
  slug: "newsArticles",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "headline",
  },
  fields: [
    {
      name: "headline",
      type: "text",
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
    },
    {
      name: "body",
      type: "richText",
      required: true,
    },
    {
      name: "banner",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "gallery",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "classes",
      type: "relationship",
      relationTo: "classes",
      hasMany: true,
    },
  ],
};
