import { revalidatePath } from "next/cache";
import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: (doc) => {
        return `/preview/${doc.data.slug}?key=${process.env.PREVIEW_KEY}`;
      },
    },
    defaultColumns: ["title", "banner", "status"],
  },
  versions: {
    drafts: {
      autosave: false,
    },
  },
  hooks: {
    afterChange: [
      //when a page is saved, regenerate the path
      async ({ doc, req: { payload } }) => {
        const menuItems = await payload.find({
          collection: "menuItems",
          where: {
            "page.id": {
              equals: doc.id,
            },
          },
          depth: 1,
          // id: "507f1f77bcf86cd799439011",
        });

        menuItems.docs.forEach((item) => {
          const path = item.breadcrumbs?.[item.breadcrumbs.length - 1].url;
          if (path) revalidatePath(path);
        });
      },
    ],
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
      name: "galleryImages",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "files",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
  ],
};
