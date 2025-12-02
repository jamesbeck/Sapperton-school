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
    beforeChange: [
      async ({ data, req }) => {
        // Update breadcrumb URLs - set to null if the menu item has no page or manual url
        if (data?.breadcrumbs && Array.isArray(data.breadcrumbs)) {
          for (const crumb of data.breadcrumbs) {
            if (crumb.doc) {
              const docId =
                typeof crumb.doc === "number" ? crumb.doc : crumb.doc.id;

              const menuItem = await req.payload.findByID({
                collection: "menuItems",
                id: docId,
                depth: 0,
              });

              // Set url to null if no page and no manual url
              if (!menuItem.page && !menuItem.url) {
                crumb.url = null;
              }
            }
          }
        }
        return data;
      },
    ],
    afterChange: [
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
