import type { CollectionConfig } from "payload";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

export const CurriculumSubjects: CollectionConfig = {
  slug: "curriculumSubjects",
  labels: { singular: "Curriculum Subject", plural: "Curriculum Subjects" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "path", "_status"],
    livePreview: {
      url: ({ data }) => `/preview${data.path}?key=${process.env.PREVIEW_KEY}`,
    },
  },
  versions: { drafts: { autosave: false } },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data;
        if (
          originalDoc?.title &&
          data.title &&
          data.title !== originalDoc.title
        ) {
          data.legacyMenuTitle = data.title;
          if (Array.isArray(originalDoc.legacyBreadcrumbs)) {
            data.legacyBreadcrumbs = (
              originalDoc.legacyBreadcrumbs as {
                label?: string;
                url?: string | null;
              }[]
            ).map((crumb, index, crumbs) =>
              index === crumbs.length - 1
                ? { ...crumb, label: data.title }
                : crumb,
            );
          }
        }
        if (originalDoc?.path) {
          data.path = originalDoc.path;
        } else if (!data.path) {
          const base = `/curriculum/${slugify(data.title || "subject", { lower: true, strict: true })}`;
          let candidate = base;
          let suffix = 2;
          while (
            (
              await req.payload.find({
                collection: "curriculumSubjects",
                req,
                depth: 0,
                limit: 1,
                where: { path: { equals: candidate } },
              })
            ).docs.length
          ) {
            candidate = `${base}-${suffix++}`;
          }
          data.path = candidate;
        }
        return data;
      },
    ],
    afterChange: [
      ({ req }) => {
        if (!req.context.skipRevalidation) revalidatePath("/", "layout");
      },
    ],
    afterDelete: [
      ({ req }) => {
        if (!req.context.skipRevalidation) revalidatePath("/", "layout");
      },
    ],
  },
  fields: [
    { name: "title", label: "Subject title", type: "text", required: true },
    {
      name: "body",
      label: "Subject content",
      type: "richText",
      required: true,
    },
    { name: "banner", type: "upload", relationTo: "media" },
    {
      name: "galleryImages",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    { name: "files", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "path",
      label: "Website URL",
      type: "text",
      required: true,
      unique: true,
      validate: (value: unknown) =>
        (typeof value === "string" && /^\/curriculum\/[^/?#]+$/.test(value)) ||
        "Use a path such as /curriculum/maths.",
      admin: {
        readOnly: true,
        description: "Preserved when the subject is renamed.",
      },
    },
    {
      name: "legacyPageId",
      type: "number",
      unique: true,
      admin: { hidden: true },
    },
    { name: "legacyMenuTitle", type: "text", admin: { hidden: true } },
    { name: "legacyMenuOrder", type: "number", admin: { hidden: true } },
    { name: "legacyNavigation", type: "json", admin: { hidden: true } },
    { name: "legacyBreadcrumbs", type: "json", admin: { hidden: true } },
  ],
};
