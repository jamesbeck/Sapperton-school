// storage-adapter-import-placeholder
import { s3Storage } from "@payloadcms/storage-s3";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Staff } from "./collections/Staff";
import { Classes } from "./collections/Classes";
import { Clubs } from "./collections/Clubs";
import { Events } from "./collections/Events";
import { Pages } from "./collections/Pages";
import { MenuItems } from "./collections/MenuItems";
import { NewsArticles } from "./collections/NewsArticles";
import slugify from "slugify";
import { HeroWords } from "./globals/heroWords";
import { HeadteacherWelcome } from "./globals/headteacherWelcome";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  folders: {
    browseByFolder: false,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "Sapperton School",
    },
    components: {
      graphics: {
        Logo: {
          path: "/components/logo",
        },

        // Icon: Icon,
      },
    },
  },
  collections: [
    MenuItems,
    Pages,
    Staff,
    Classes,
    Clubs,
    Events,
    NewsArticles,
    Media,
    Users,
  ],
  globals: [HeroWords, HeadteacherWelcome],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    nestedDocsPlugin({
      collections: ["menuItems"],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) =>
        docs.reduce((url, doc) => {
          return `${url}/${slugify(doc.title as string, { lower: true, strict: true })}`;
        }, ""),
    }),

    s3Storage({
      clientUploads: true,
      acl: "public-read",
      // signedDownloads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          disableLocalStorage: true,
          // signedDownloads: true,
        },
        // "media-with-prefix": {
        //   prefix,
        // },
        // "media-with-presigned-downloads": {
        // Filter only mp4 files
        // signedDownloads: {
        //   shouldUseSignedURL: ({ collection, filename, req }) => {
        //     return filename.endsWith(".mp4");
        //   },
        // },
        // },
      },
      bucket: process.env.S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
        region: process.env.S3_REGION || "",
        endpoint: process.env.S3_ENDPOINT || "",

        // ... Other S3 configuration
      },
    }),
  ],
});
