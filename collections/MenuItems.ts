import { revalidatePath } from "next/cache";
import type { CollectionConfig } from "payload";
import slugify from "slugify";

export const MenuItems: CollectionConfig = {
  slug: "menuItems",
  labels: {
    singular: "Main Menu Item",
    plural: "Main Menu Items",
  },
  admin: { useAsTitle: "title" },
  hooks: {
    afterChange: [
      //when a menu item is saved, regenerate the whole site so top level menu also updates
      async () => {
        revalidatePath("/", "layout");
      },
    ],
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
            return slugify(data?.title, { lower: true, strict: true });
          },
        ],
      },
      index: true,
      label: "Slug",
    },

    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
    },
    {
      name: "url",
      type: "text",
    },
    {
      name: "order",
      type: "number",
    },
  ],
};
