import type { CollectionConfig } from "payload";
import slugify from "slugify";

export const Staff: CollectionConfig = {
  slug: "staff",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "staffGroup",
      type: "relationship",
      relationTo: "staffGroups",
      required: true,
      hasMany: true,
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
            return slugify(data?.name, { lower: true, strict: true });
          },
        ],
      },
      index: true,
      label: "Slug",
    },
    {
      name: "position",
      type: "text",
      required: true,
    },
    {
      name: "biography",
      type: "richText",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
  ],
};
