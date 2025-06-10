import type { CollectionConfig } from "payload";
import slugify from "slugify";

export const MenuItems: CollectionConfig = {
  slug: "menuItems",
  labels: {
    singular: "Main Menu Item",
    plural: "Main Menu Items",
  },
  admin: { useAsTitle: "title" },

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
            return slugify(data?.title, { lower: true, strict: true });
          },
        ],
      },
      index: true,
      label: "Slug",
    },

    {
      name: "Page",
      type: "relationship",
      relationTo: "pages",
    },
  ],
};
