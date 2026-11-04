import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    baseListFilter: () => ({ migratedToCurriculumSubject: { exists: false } }),
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

  access: {
    read: () => true,
    update: ({ req }) =>
      req.user ? { migratedToCurriculumSubject: { exists: false } } : false,
    delete: ({ req }) =>
      req.user ? { migratedToCurriculumSubject: { exists: false } } : false,
  },
  fields: [
    {
      name: "migratedToCurriculumSubject",
      type: "relationship",
      relationTo: "curriculumSubjects",
      admin: {
        readOnly: true,
        description:
          "Archived original. Edit the linked Curriculum Subject instead.",
      },
    },
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
