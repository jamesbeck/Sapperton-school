import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
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
      name: "date",
      type: "date",
      required: true,
    },
    {
      name: "endDate",
      type: "date",
      required: true,
      admin: {
        condition: (data) => {
          console.log(data);
          if (data.Type === "other") return true;
          return false;
        },
      },
      label: "End Date",
    },
    {
      name: "type",
      type: "select",
      options: [
        {
          label: "Term Date",
          value: "term-date",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      required: true,
    },
    {
      name: "description",
      type: "richText",
      required: true,
    },
  ],
};
