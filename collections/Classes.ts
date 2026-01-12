import type { CollectionConfig } from "payload";
import slugify from "slugify";

export const Classes: CollectionConfig = {
  slug: "classes",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description:
          "Used to order classes in menus and lists. Lower numbers appear first.",
      },
    },
    {
      name: "name",
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
            return slugify(data?.name, { lower: true, strict: true });
          },
        ],
      },
      index: true,
      label: "Slug",
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
      name: "primaryTeachers",
      type: "relationship",
      relationTo: "staff",
      hasMany: true,
    },
    {
      name: "otherTeachers",
      type: "relationship",
      relationTo: "staff",
      hasMany: true,
    },
    {
      name: "image",
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
