import { revalidatePath } from "next/cache";
import type { CollectionConfig } from "payload";
import slugify from "slugify";

export const FooterMenuItems: CollectionConfig = {
  slug: "footerMenuItems",
  labels: {
    singular: "Footer Menu Item",
    plural: "Footer Menu Items",
  },
  admin: { useAsTitle: "title" },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only run breadcrumb logic on update, not create
        if (
          operation === "update" &&
          data?.breadcrumbs &&
          Array.isArray(data.breadcrumbs)
        ) {
          for (const crumb of data.breadcrumbs) {
            if (crumb.doc) {
              try {
                const docId =
                  typeof crumb.doc === "number" ? crumb.doc : crumb.doc.id;

                const menuItem = await req.payload.findByID({
                  collection: "footerMenuItems",
                  id: docId,
                  depth: 0,
                });

                // Set url to null if no page and no manual url
                if (!menuItem.page && !menuItem.url) {
                  crumb.url = null;
                }
              } catch (error) {
                // Item may not exist yet, skip
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
      name: "parent",
      type: "relationship",
      relationTo: "footerMenuItems",
    },
    {
      name: "order",
      type: "number",
    },
  ],
};
