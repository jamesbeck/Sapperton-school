import type { CollectionConfig } from "payload";
import slugify from "slugify";
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
    { name: "description", type: "richText", required: true },
    {
      name: "sessions",
      type: "array",
      label: "Weekly sessions",
      validate: validateClubSessions,
      admin: {
        description:
          "Add one row per weekly session. Times are local school times; each session starts and ends on the selected day.",
      },
      fields: [
        { name: "day", type: "select", required: true, options: clubWeekdays },
        {
          type: "row",
          fields: [
            {
              name: "startTime",
              type: "text",
              required: true,
              label: "Start time",
              validate: (value: unknown) =>
                isClubTime(value) || "Use 24-hour HH:mm format, e.g. 15:15.",
              admin: { width: "50%", placeholder: "15:15" },
            },
            {
              name: "endTime",
              type: "text",
              required: true,
              label: "End time",
              validate: (value: unknown) =>
                isClubTime(value) || "Use 24-hour HH:mm format, e.g. 16:15.",
              admin: { width: "50%", placeholder: "16:15" },
            },
          ],
        },
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
