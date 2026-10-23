import { APIError, type CollectionConfig, type PayloadRequest } from "payload";

const minimumImageWidth = 800;
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
  admin: {
    description: "Images must be at least 800 pixels wide. Any height is allowed.",
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Payload has measured the uploaded file before this hook runs.
        // Only validate new files, so existing media descriptions remain editable.
        if (req.file && data?.mimeType?.startsWith("image/")) {
          if (
            typeof data.width !== "number" ||
            !Number.isFinite(data.width) ||
            data.width < minimumImageWidth
          ) {
            throw new APIError(
              `Images must be at least 800 pixels wide. ${
                typeof data.width === "number"
                  ? `This image is ${data.width} pixels wide.`
                  : "The width of this image could not be determined."
              } Any height is allowed.`,
              400,
            );
          }
        }

        return data;
      },
    ],
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
