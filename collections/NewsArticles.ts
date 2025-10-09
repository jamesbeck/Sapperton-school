import type { CollectionConfig } from "payload";
import slugify from "slugify";

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
      name: "slug",
      type: "text",
      access: {
        read: () => true,
        update: () => false,
        create: () => false,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            return slugify(data?.headline, { lower: true, strict: true });
          },
        ],
      },
      index: true,
      label: "Slug",
    },
    {
      name: "date",
      type: "date",
      required: true,
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "staff",
      required: false,
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
