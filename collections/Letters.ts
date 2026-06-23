import type { CollectionConfig } from "payload";

export const Letters: CollectionConfig = {
  slug: "letters",
  defaultSort: "-date",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "date", "classes"],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: {
          displayFormat: "dd/MM/yyyy",
        },
      },
    },
    {
      name: "classes",
      type: "relationship",
      relationTo: "classes",
      hasMany: true,
      admin: {
        description:
          "Select the classes this letter is relevant to. Leave empty if it applies to the whole school.",
      },
    },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Upload the letter as a PDF or Word document.",
      },
    },
  ],
};
