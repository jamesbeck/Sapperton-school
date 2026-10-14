import type { CollectionConfig } from "payload";
import slugify from "slugify";
import { validateClubBlocks, validateBookingURL } from "../utils/clubBlocks";
import {
  clubWeekdays,
  isClubTime,
  validateClubSessions,
} from "../utils/clubSessions";

export const Clubs: CollectionConfig = {
  slug: "clubs",
  access: { read: () => true },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "years", "order"],
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data;
        // Keep published links stable when a club is renamed.
        if (originalDoc?.slug) {
          data.slug = originalDoc.slug;
          return data;
        }
        const base =
          slugify(data.name || originalDoc?.name || "club", {
            lower: true,
            strict: true,
          }) || "club";
        let slug = base;
        let suffix = 2;
        while (
          (
            await req.payload.find({
              collection: "clubs",
              depth: 0,
              limit: 1,
              req,
              where: { slug: { equals: slug } },
            })
          ).docs.length > 0
        ) {
          slug = `${base}-${suffix++}`;
        }
        data.slug = slug;
        return data;
      },
    ],
  },
  fields: [
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { description: "Lower numbers appear first in menus and lists." },
    },
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          "Generated from the name when created; stays the same when renamed.",
      },
    },
    { name: "years", type: "text", required: true, label: "Year groups" },
    {
      name: "description",
      type: "richText",
      admin: {
        description:
          "Optional information about the activity. Keep dates, prices and booking details in term blocks.",
      },
    },
    {
      name: "blocks",
      type: "array",
      label: "Term blocks",
      validate: validateClubBlocks,
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Term / block name",
        },
        {
          type: "row",
          fields: [
            {
              name: "startDate",
              type: "date",
              required: true,
              admin: { date: { pickerAppearance: "dayOnly" }, width: "50%" },
            },
            {
              name: "endDate",
              type: "date",
              required: true,
              admin: { date: { pickerAppearance: "dayOnly" }, width: "50%" },
            },
          ],
        },
        {
          name: "sessions",
          type: "array",
          label: "Weekly sessions",
          minRows: 1,
          required: true,
          validate: validateClubSessions,
          admin: {
            description:
              "Local school times. Each session starts and ends on the selected weekday.",
          },
          fields: [
            {
              name: "day",
              type: "select",
              required: true,
              options: clubWeekdays,
            },
            {
              type: "row",
              fields: [
                {
                  name: "startTime",
                  type: "text",
                  required: true,
                  label: "Start time",
                  validate: (value: unknown) =>
                    isClubTime(value) ||
                    "Use 24-hour HH:mm format, e.g. 15:15.",
                  admin: { width: "50%", placeholder: "15:15" },
                },
                {
                  name: "endTime",
                  type: "text",
                  required: true,
                  label: "End time",
                  validate: (value: unknown) =>
                    isClubTime(value) ||
                    "Use 24-hour HH:mm format, e.g. 16:15.",
                  admin: { width: "50%", placeholder: "16:15" },
                },
              ],
            },
          ],
        },
        {
          name: "excludedDates",
          type: "array",
          label: "Dates with no session",
          fields: [
            {
              name: "date",
              type: "date",
              required: true,
              admin: { date: { pickerAppearance: "dayOnly" } },
            },
            { name: "reason", type: "text" },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "totalPrice",
              type: "number",
              min: 0,
              label: "Full block price (£)",
              admin: { width: "50%" },
            },
            {
              name: "capacity",
              type: "number",
              min: 1,
              label: "Maximum places",
              validate: (value: unknown) =>
                value == null ||
                Number.isInteger(value) ||
                "Enter a whole number.",
              admin: {
                width: "50%",
                description:
                  "Leave blank if unspecified. This is capacity, not remaining availability.",
              },
            },
          ],
        },
        {
          name: "showSessionPrice",
          type: "checkbox",
          label: "Also show price per session",
          admin: {
            description:
              "Calculated from the full price and scheduled session count.",
          },
        },
        {
          name: "bookingMethod",
          type: "select",
          required: true,
          options: [
            { label: "ParentPay", value: "parentpay" },
            { label: "External provider", value: "external" },
            { label: "Contact school", value: "contact" },
          ],
        },
        {
          name: "bookingURL",
          type: "text",
          label: "Booking link",
          validate: validateBookingURL,
        },
        {
          name: "bookingStatus",
          type: "select",
          defaultValue: "unspecified",
          options: [
            { label: "Not specified", value: "unspecified" },
            { label: "Open", value: "open" },
            { label: "Full", value: "full" },
            { label: "Closed", value: "closed" },
          ],
        },
        {
          name: "externalLeader",
          type: "text",
          label: "External leader",
          admin: {
            description: "For leaders who do not have a school staff profile.",
          },
        },
        { name: "snackProvided", type: "checkbox", label: "Snack provided" },
        { name: "whatToBring", type: "textarea", label: "What to bring" },
      ],
    },
    { name: "banner", type: "upload", relationTo: "media" },
    { name: "image", type: "upload", relationTo: "media", label: "Card photo" },
    {
      name: "galleryImages",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "teachers",
      type: "relationship",
      relationTo: "staff",
      hasMany: true,
      label: "Club leaders",
    },
    {
      name: "otherTeachers",
      type: "relationship",
      relationTo: "staff",
      hasMany: true,
      label: "Supporting staff",
    },
  ],
};
