/** Run only after deploying and verifying the subject routes. Dry-run by default.
 * --apply removes only unchanged archived curriculum menu records.
 * --restore --apply restores their exact original rows without removing subject data.
 */
import "dotenv/config";
import pg from "pg";
import { pathToFileURL } from "node:url";

export async function cleanupCurriculumMenu(
  client,
  { apply = false, restore = false } = {},
) {
  await client.query("BEGIN");
  try {
    await client.query(
      "LOCK TABLE menu_items, menu_items_breadcrumbs IN SHARE ROW EXCLUSIVE MODE",
    );
    const { rows: subjects } = await client.query(
      "SELECT id, path, legacy_navigation FROM curriculum_subjects WHERE legacy_navigation IS NOT NULL",
    );
    if (!subjects.length)
      throw new Error("No migrated subject navigation archives found.");
    const changedPages =
      await client.query(`SELECT p.id FROM pages p JOIN curriculum_subjects s ON s.legacy_page_id=p.id
      WHERE s.legacy_navigation IS NOT NULL AND to_jsonb(p.updated_at) IS DISTINCT FROM s.legacy_navigation->'pageUpdatedAt'`);
    if (changedPages.rows.length && !restore)
      throw new Error(
        "Original pages changed after conversion. Reconcile those edits before removing menus.",
      );
    const items = new Map();
    const crumbs = new Map();
    for (const subject of subjects) {
      const archive = subject.legacy_navigation;
      if (!archive?.item?.id || !archive?.root?.id)
        throw new Error("Incomplete navigation archive.");
      if (subject.path !== archive.breadcrumbs?.at(-1)?.url)
        throw new Error("Subject URL differs from archived URL.");
      items.set(archive.root.id, archive.root);
      items.set(archive.item.id, archive.item);
      for (const crumb of [
        ...(archive.rootBreadcrumbs || []),
        ...(archive.breadcrumbs || []),
      ])
        crumbs.set(crumb.id, crumb);
    }
    for (const item of items.values()) {
      const existing = await client.query(
        "SELECT to_jsonb(m) = $2::jsonb AS matches FROM menu_items m WHERE id=$1",
        [item.id, JSON.stringify(item)],
      );
      if (existing.rows.length && !existing.rows[0].matches)
        throw new Error(
          `Menu ${item.id} changed since migration; refusing to overwrite or remove it.`,
        );
    }
    const extraChildren = await client.query(
      "SELECT id FROM menu_items WHERE parent_id=ANY($1::int[]) AND NOT(id=ANY($1::int[]))",
      [[...items.keys()]],
    );
    if (extraChildren.rows.length)
      throw new Error(
        "New menu children exist; refusing to remove their parent.",
      );
    for (const crumb of crumbs.values()) {
      const existing = await client.query(
        "SELECT to_jsonb(b) = $2::jsonb AS matches FROM menu_items_breadcrumbs b WHERE id=$1",
        [crumb.id, JSON.stringify(crumb)],
      );
      if (existing.rows.length && !existing.rows[0].matches)
        throw new Error(`Breadcrumb ${crumb.id} changed since migration.`);
    }
    const extraCrumbs = await client.query(
      "SELECT id FROM menu_items_breadcrumbs WHERE _parent_id=ANY($1::int[]) AND NOT(id=ANY($2::varchar[]))",
      [[...items.keys()], [...crumbs.keys()]],
    );
    if (extraCrumbs.rows.length)
      throw new Error("Unexpected breadcrumbs exist; refusing to remove them.");
    if (restore) {
      // Parents first, so foreign keys remain valid.
      for (const item of [...items.values()].sort(
        (a, b) => Number(!!a.parent_id) - Number(!!b.parent_id),
      )) {
        await client.query(
          "INSERT INTO menu_items SELECT * FROM jsonb_populate_record(NULL::menu_items, $1::jsonb) ON CONFLICT (id) DO NOTHING",
          [JSON.stringify(item)],
        );
      }
      for (const crumb of crumbs.values())
        await client.query(
          "INSERT INTO menu_items_breadcrumbs SELECT * FROM jsonb_populate_record(NULL::menu_items_breadcrumbs, $1::jsonb) ON CONFLICT (id) DO NOTHING",
          [JSON.stringify(crumb)],
        );
    } else {
      await client.query("DELETE FROM menu_items WHERE id=ANY($1::int[])", [
        [...items.keys()],
      ]);
    }
    await client.query(apply ? "COMMIT" : "ROLLBACK");
    return {
      mode: apply ? "applied" : "dry-run",
      action: restore ? "restore" : "remove",
      menuRecords: items.size,
      subjects: subjects.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log(
      await cleanupCurriculumMenu(client, {
        apply: process.argv.includes("--apply"),
        restore: process.argv.includes("--restore"),
      }),
    );
  } finally {
    await client.end();
  }
}
