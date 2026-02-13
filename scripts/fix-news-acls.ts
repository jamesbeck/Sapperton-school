import "dotenv/config";
import { S3Client, PutObjectAclCommand } from "@aws-sdk/client-s3";
import { getPayload } from "payload";
import config from "../payload.config";
import type { Media } from "../payload-types";

async function main() {
  const payload = await getPayload({ config });

  const s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
  });

  const bucket = process.env.S3_BUCKET;

  // Fetch all news articles with their media relations
  const articles = await payload.find({
    collection: "newsArticles",
    limit: 0,
    depth: 2,
  });

  const mediaKeys = new Set<string>();

  for (const article of articles.docs) {
    // Collect banner and its resized variants
    const banner = article.banner as Media | null;
    if (banner?.filename) {
      mediaKeys.add(banner.filename);
      if (banner.sizes) {
        for (const size of Object.values(banner.sizes)) {
          if (size?.filename) mediaKeys.add(size.filename);
        }
      }
    }

    // Collect gallery images and their resized variants
    if (article.gallery) {
      for (const item of article.gallery) {
        const img = item as Media;
        if (img?.filename) {
          mediaKeys.add(img.filename);
          if (img.sizes) {
            for (const size of Object.values(img.sizes)) {
              if (size?.filename) mediaKeys.add(size.filename);
            }
          }
        }
      }
    }
  }

  console.log(
    `Found ${articles.docs.length} news articles with ${mediaKeys.size} media files to fix.\n`,
  );

  let success = 0;
  let failed = 0;

  for (const filename of mediaKeys) {
    try {
      await s3.send(
        new PutObjectAclCommand({
          Bucket: bucket,
          Key: filename,
          ACL: "public-read",
        }),
      );
      console.log(`✓ public-read: ${filename}`);
      success++;
    } catch (err: any) {
      console.error(`✗ Failed: ${filename} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
