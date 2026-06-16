import type { CollectionConfig, PayloadRequest } from "payload";

const schoolYearSuffixPattern = /(?:^|\s)(\d{4})-(\d{4})$/;

function splitFilename(filename: string) {
  const extensionIndex = filename.lastIndexOf(".");

  if (extensionIndex <= 0) {
    return {
      basename: filename,
      extension: "",
    };
  }

  return {
    basename: filename.slice(0, extensionIndex),
    extension: filename.slice(extensionIndex),
  };
}

async function mediaFilenameExists(req: PayloadRequest, filename: string) {
  const existingMedia = await req.payload.db.findOne({
    collection: "media",
    req,
    where: {
      filename: {
        equals: filename,
      },
    },
  });

  return Boolean(existingMedia);
}

export const Media: CollectionConfig = {
  slug: "media",
  folders: true,
  hooks: {
    beforeOperation: [
      async ({ operation, req }) => {
        if (operation !== "create" || !req.file?.name) {
          return;
        }

        const { basename, extension } = splitFilename(req.file.name);

        if (!schoolYearSuffixPattern.test(basename)) {
          return;
        }

        const filenameAlreadyExists = await mediaFilenameExists(
          req,
          req.file.name,
        );

        if (!filenameAlreadyExists) {
          return;
        }

        req.file.name = `${basename}-copy${extension}`;
      },
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      label: "Description",
      admin: {
        description: "Describe the image, this is used for accessibility.",
      },
      type: "text",
      required: false,
    },
  ],
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 200,
        height: 200,
      },
      {
        name: "small",
        width: 800,
        height: 450,
      },
      {
        name: "large",
        width: 1920,
        height: 1080,
      },
    ],
  },
};
