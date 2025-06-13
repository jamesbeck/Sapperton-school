import type { CollectionConfig } from "payload";

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
      name: "name",
      type: "text",
      required: true,
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
  ],
};
