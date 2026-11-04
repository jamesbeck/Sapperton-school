/** Read-only verification. Prints counts and paths, never page bodies or credentials. */
import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN READ ONLY");
  const result =
    await client.query(`SELECT p.id,p.title,p.updated_at,p.body,p.banner_id,p._status,m.id AS menu_id,
    (SELECT b.url FROM menu_items_breadcrumbs b WHERE b._parent_id=m.id ORDER BY b._order DESC LIMIT 1) AS path
    FROM pages p JOIN menu_items m ON m.page_id=p.id JOIN menu_items root ON root.id=m.parent_id
    WHERE root.slug='curriculum' AND root.parent_id IS NULL ORDER BY m.id`);
  if (process.argv.includes("--preflight")) {
    assert.equal(
      result.rows.length,
      15,
      "Expected the 15 audited curriculum subjects.",
    );
    for (const page of result.rows) {
      const response = await fetch(
        `https://www.sappertonschool.org/api/pages/${page.id}?depth=0`,
      );
      assert.equal(response.status, 200);
      const publicPage = await response.json();
      assert.equal(publicPage.title, page.title);
      assert.equal(publicPage.updatedAt, page.updated_at.toISOString());
      assert.deepEqual(publicPage.body, page.body);
      assert.equal(publicPage.banner ?? null, page.banner_id);
      assert.equal(publicPage._status, page._status);
      const rendered = await fetch(
        `https://www.sappertonschool.org${page.path}`,
      );
      assert.equal(rendered.status, 200);
    }
    console.log(
      `PASS: all ${result.rows.length} published curriculum pages and exact paths match the configured database and live website.`,
    );
  } else {
    const { rows: subjects } = await client.query(
      "SELECT id,path,legacy_page_id FROM curriculum_subjects WHERE legacy_page_id IS NOT NULL ORDER BY id",
    );
    assert.equal(subjects.length, 15);
    const mismatches =
      await client.query(`SELECT s.id FROM curriculum_subjects s JOIN pages p ON p.id=s.legacy_page_id
      WHERE s.title IS DISTINCT FROM p.title OR s.body IS DISTINCT FROM p.body OR s.banner_id IS DISTINCT FROM p.banner_id
      OR s.created_at IS DISTINCT FROM p.created_at OR s.updated_at IS DISTINCT FROM p.updated_at OR s._status::text IS DISTINCT FROM p._status::text
      OR p.migrated_to_curriculum_subject_id IS DISTINCT FROM s.id
      OR s.path IS DISTINCT FROM s.legacy_navigation->'breadcrumbs'->-1->>'url'
      OR (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM pages_rels r WHERE r.parent_id=p.id)
      IS DISTINCT FROM (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM curriculum_subjects_rels r WHERE r.parent_id=s.id)`);
    assert.equal(
      mismatches.rows.length,
      0,
      "Published content, paths or attachments differ.",
    );
    const historyMismatch =
      await client.query(`SELECT s.id FROM curriculum_subjects s WHERE
      (SELECT jsonb_agg(jsonb_build_object('title',v.version_title,'body',v.version_body,'banner',v.version_banner_id,'status',v.version__status::text,'latest',v.latest,'created',v.created_at,'updated',v.updated_at,'contentCreated',v.version_created_at,'contentUpdated',v.version_updated_at,'media',
        (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM _pages_v_rels r WHERE r.parent_id=v.id)) ORDER BY v.created_at,v.id) FROM _pages_v v WHERE v.parent_id=s.legacy_page_id)
      IS DISTINCT FROM
      (SELECT jsonb_agg(jsonb_build_object('title',v.version_title,'body',v.version_body,'banner',v.version_banner_id,'status',v.version__status::text,'latest',v.latest,'created',v.created_at,'updated',v.updated_at,'contentCreated',v.version_created_at,'contentUpdated',v.version_updated_at,'media',
        (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM _curriculum_subjects_v_rels r WHERE r.parent_id=v.id)) ORDER BY v.created_at,v.id) FROM _curriculum_subjects_v v WHERE v.parent_id=s.id)`);
    assert.equal(
      historyMismatch.rows.length,
      0,
      "Historical content or attachments differ.",
    );
    console.log(
      "PASS: 15 subjects match every original content field, timestamp, URL and ordered attachment; every revision and historical attachment matches.",
    );
    console.log(
      (
        await client.query(
          `SELECT (SELECT count(*) FROM _curriculum_subjects_v) AS revisions, (SELECT count(*) FROM curriculum_subjects_rels) AS media_links, (SELECT count(*) FROM _curriculum_subjects_v_rels) AS historical_media_links`,
        )
      ).rows[0],
    );
    console.log(subjects.map((s) => s.path));
  }
} finally {
  await client.query("ROLLBACK");
  await client.end();
}
