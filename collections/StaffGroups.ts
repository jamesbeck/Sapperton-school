import type { CollectionConfig } from "payload";

export const StaffGroups: CollectionConfig = {
  slug: "staffGroups",
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
      name: "order",
      type: "number",
      required: true,
    },
  ],
};
