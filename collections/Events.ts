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
      label: "Start Date",
      required: true,
      admin: {
        date: {
          displayFormat: "dd/MM/yyyy",
        },
      },
    },
    {
      name: "startTime",
      type: "text",
      required: false,
      label: "Start Time",
      admin: {
        description: "e.g., 09:00 or 2:30 PM",
      },
    },
    {
      name: "endDate",
      type: "date",
      required: false,
      label: "End Date",
      admin: {
        date: {
          displayFormat: "dd/MM/yyyy",
        },
      },
    },

    {
      name: "endTime",
      type: "text",
      required: false,
      label: "End Time",
      admin: {
        description: "e.g., 15:30 or 3:30 PM",
      },
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
          label: "Curriculum Events",
          value: "event",
        },
        {
          label: "Extracurricular Events",
          value: "extracurricular",
        },
        {
          label: "Open Day",
          value: "open-day",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      required: true,
    },
    {
      name: "classes",
      type: "relationship",
      relationTo: "classes",
      hasMany: true,
      admin: {
        description:
          "Only add classes if this event is specific to certain classes. Leave empty for whole-school events.",
      },
    },
    {
      name: "description",
      type: "richText",
      required: true,
    },
  ],
};
