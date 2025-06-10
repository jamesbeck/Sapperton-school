import type { CollectionConfig } from "payload";
import slugify from "slugify";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: (doc) => {
        return `/${doc.data.slug}`;
      },
    },
    defaultColumns: ["title", "slug", "banner", "status"],
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },

  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
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
            return data?.title
              ? slugify(data?.title, { lower: true, strict: true })
              : data?.id;
          },
        ],
      },
      index: true,
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
  ],
};
