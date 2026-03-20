import "dotenv/config";
import { getPayload } from "payload";
import config from "../payload.config";

async function main() {
  const payload = await getPayload({ config });

  // Check if page 27 still exists
  try {
    const existing = await payload.findByID({
      collection: "pages",
      id: 27,
    });
    if (existing) {
      console.log("Page 27 already exists:", existing.title);
      console.log("Aborting to avoid duplicate.");
      process.exit(0);
    }
  } catch {
    console.log("Page 27 not found — proceeding with recovery.");
  }

  // Create the Letters to Parents page with data from the backup
  const page = await payload.create({
    collection: "pages",
    data: {
      title: "Letters to Parents",
      body: {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              children: [
                {
                  mode: "normal",
                  text: "Please see the letters below that have been sent to parents this academic year and get in touch, should you have any queries.",
                  type: "text",
                  style: "",
                  detail: 0,
                  format: 0,
                  version: 1,
                },
              ],
              direction: "ltr",
              textStyle: "",
              textFormat: 0,
            },
          ],
          direction: "ltr",
        },
      },
      // File media IDs from the backup: 172, 173, 174, 457, 496, 524, 649, 653
      files: [172, 173, 174, 457, 496, 524, 649, 653],
      _status: "published",
    },
  });

  console.log(`Created page: "${page.title}" with ID ${page.id}`);

  // Now update the menu item (ID 36) to point to the new page
  // First check if menu item 36 still exists
  try {
    const menuItem = await payload.findByID({
      collection: "menuItems",
      id: 36,
    });
    if (menuItem) {
      console.log(
        `Menu item 36 exists: "${menuItem.title}", updating page reference...`,
      );
      await payload.update({
        collection: "menuItems",
        id: 36,
        data: {
          page: page.id,
        },
      });
      console.log("Menu item updated to point to new page.");
    }
  } catch {
    console.log(
      "Menu item 36 not found. You may need to recreate it manually in the admin panel.",
    );
    console.log(
      "It should be under 'Parents' with slug 'letters' pointing to this page.",
    );
  }

  console.log("\nRecovery complete!");
  console.log(`New page ID: ${page.id}`);
  console.log(
    "If the menu item was also deleted, recreate it in the admin panel:",
  );
  console.log("  - Parent: Parents");
  console.log("  - Title: Letters");
  console.log("  - Slug: letters");
  console.log(`  - Page: ${page.id}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Recovery failed:", err);
  process.exit(1);
});
