/** Requires an empty schema-only local database. Never connects to .env's database. */
import "dotenv/config";
import assert from "node:assert/strict";
import pg from "pg";
import { getPayload, createLocalReq } from "payload";
import { sql } from "@payloadcms/db-postgres";
import { up as schemaUp } from "../src/migrations/20261104_055254_curriculum_subjects";
import { up as dataUp } from "../src/migrations/20261104_055255_migrate_curriculum_pages";
import { cleanupCurriculumMenu } from "./cleanup-curriculum-menu.mjs";
const url = process.env.CURRICULUM_TEST_DATABASE_URL;
if (!url)
  throw new Error(
    "Set CURRICULUM_TEST_DATABASE_URL to a disposable local database.",
  );
const target = new URL(url);
if (
  !["localhost", "127.0.0.1"].includes(target.hostname) ||
  target.pathname !== "/sapperton_curriculum_test"
)
  throw new Error(
    "Only the local sapperton_curriculum_test database is allowed.",
  );
process.env.DATABASE_URL = url;
process.env.PAYLOAD_MIGRATING = "true";
const { default: config } = await import("../payload.config");
const payload = await getPayload({ config });
const c = new pg.Client({ connectionString: url });
await c.connect();
const req = await createLocalReq(
  { context: { skipRevalidation: true } },
  payload,
);
const args = { db: payload.db.drizzle, payload, req };
const richText = (text: string) => ({
  root: {
    type: "root",
    version: 1,
    format: "",
    indent: 0,
    direction: "ltr",
    children: [
      {
        type: "paragraph",
        version: 1,
        format: "",
        indent: 0,
        direction: "ltr",
        children: [
          {
            type: "text",
            version: 1,
            text,
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
    ],
  },
});
try {
  assert.equal(
    (await c.query("SELECT count(*) FROM pages")).rows[0].count,
    "0",
    "Start with an empty schema-only database.",
  );
  await schemaUp(args);
  await c.query(
    `INSERT INTO media(id, alt, filename, url) VALUES (1, 'Test image', 'test.svg', '/logo.svg'), (2, 'Test document', 'example.pdf', '/example.pdf')`,
  );
  await c.query(
    `INSERT INTO menu_items(id, title, slug, "order") VALUES (1, 'Curriculum', 'curriculum', 10), (100, 'Unrelated', 'unrelated', 1)`,
  );
  const names = [
    ["Art and Design", "Art & Design", "art-and-design"],
    ["RE", "Religious Education", "religious-education"],
    ["Early Years Foundation Stage", "EYFS", "eyfs"],
    ["Maths", "Maths", "maths"],
  ];
  for (const [i, [title, label, slug]] of names.entries()) {
    const id = i + 10;
    await c.query(
      `INSERT INTO pages(id,title,body,banner_id,_status) VALUES ($1,$2,$3,1,'published')`,
      [id, title, richText(`${title} published content`)],
    );
    await c.query(
      `INSERT INTO pages_rels("order",parent_id,path,media_id) VALUES (2,$1,'galleryImages',1),(1,$1,'files',2)`,
      [id],
    );
    await c.query(
      `INSERT INTO menu_items(id,title,slug,parent_id,page_id) VALUES($1,$2,$3,1,$1)`,
      [id, label, slug],
    );
    await c.query(
      `INSERT INTO menu_items_breadcrumbs(_order,_parent_id,id,doc_id,url,label) VALUES(1,$1,$2,1,NULL,'Curriculum'),(2,$1,$3,$1,$4,$5)`,
      [id, `root-${id}`, `subject-${id}`, `/curriculum/${slug}`, label],
    );
    for (let n = 0; n < 2; n++) {
      const result = await c.query(
        `INSERT INTO _pages_v(parent_id,version_title,version_body,version_banner_id,version__status,latest,version_created_at,version_updated_at) VALUES($1,$2,$3,1,$4,$5,now(),now()) RETURNING id`,
        [
          id,
          title,
          richText(
            n ? `${title} unpublished revision` : `${title} published content`,
          ),
          n ? "draft" : "published",
          !!n,
        ],
      );
      await c.query(
        `INSERT INTO _pages_v_rels("order",parent_id,path,media_id) VALUES(1,$1,'version.files',2),(2,$1,'version.galleryImages',1)`,
        [result.rows[0].id],
      );
    }
  }
  await c.query(
    `INSERT INTO menu_items_breadcrumbs(_order,_parent_id,id,doc_id,url,label) VALUES(1,1,'root',1,'/curriculum','Curriculum')`,
  );
  // Invoke the real data migration in a transaction, as Payload does in production.
  async function migrate() {
    const transactionID = await payload.db.beginTransaction();
    const transaction = payload.db.sessions[transactionID!];
    try {
      await dataUp({ ...args, db: transaction.db });
      await payload.db.commitTransaction(transactionID!);
    } catch (e) {
      await payload.db.rollbackTransaction(transactionID!);
      throw e;
    }
  }
  const originalSiblingOrder = await payload.find({
    collection: "menuItems",
    depth: 0,
    pagination: false,
    sort: "order",
    where: { parent: { equals: 1 } },
  });
  await migrate();
  const migratedSiblingOrder = await payload.find({
    collection: "curriculumSubjects",
    depth: 0,
    pagination: false,
    sort: "legacyMenuOrder",
  });
  assert.deepEqual(
    migratedSiblingOrder.docs.map((s) => s.legacyPageId),
    originalSiblingOrder.docs.map((m) => m.page),
    "Preserve existing More from Curriculum ordering, including Payload's createdAt fallback.",
  );
  assert.equal(
    (await c.query("SELECT count(*) FROM curriculum_subjects")).rows[0].count,
    "4",
  );
  assert.equal(
    (await c.query("SELECT count(*) FROM _curriculum_subjects_v")).rows[0]
      .count,
    "8",
  );
  const mismatch =
    await c.query(`SELECT s.id FROM curriculum_subjects s JOIN pages p ON p.id=s.legacy_page_id
    WHERE s.title IS DISTINCT FROM p.title OR s.body IS DISTINCT FROM p.body OR s.banner_id IS DISTINCT FROM p.banner_id OR s.created_at IS DISTINCT FROM p.created_at OR s.updated_at IS DISTINCT FROM p.updated_at OR s._status::text IS DISTINCT FROM p._status::text`);
  assert.equal(mismatch.rows.length, 0);
  const attachmentMismatch =
    await c.query(`SELECT s.id FROM curriculum_subjects s WHERE
    (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM pages_rels r WHERE r.parent_id=s.legacy_page_id)
    IS DISTINCT FROM
    (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM curriculum_subjects_rels r WHERE r.parent_id=s.id)`);
  assert.equal(
    attachmentMismatch.rows.length,
    0,
    "Every media reference and its order is preserved.",
  );
  const versionMismatch =
    await c.query(`SELECT s.id FROM curriculum_subjects s WHERE
    (SELECT jsonb_agg(jsonb_build_object('title',v.version_title,'body',v.version_body,'banner',v.version_banner_id,'status',v.version__status::text,'latest',v.latest,'created',v.created_at,'updated',v.updated_at,'contentCreated',v.version_created_at,'contentUpdated',v.version_updated_at,'media',
      (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM _pages_v_rels r WHERE r.parent_id=v.id)) ORDER BY v.created_at,v.id) FROM _pages_v v WHERE v.parent_id=s.legacy_page_id)
    IS DISTINCT FROM
    (SELECT jsonb_agg(jsonb_build_object('title',v.version_title,'body',v.version_body,'banner',v.version_banner_id,'status',v.version__status::text,'latest',v.latest,'created',v.created_at,'updated',v.updated_at,'contentCreated',v.version_created_at,'contentUpdated',v.version_updated_at,'media',
      (SELECT jsonb_agg(jsonb_build_array(r."order",r.path,r.media_id) ORDER BY r.path,r."order") FROM _curriculum_subjects_v_rels r WHERE r.parent_id=v.id)) ORDER BY v.created_at,v.id) FROM _curriculum_subjects_v v WHERE v.parent_id=s.id)`);
  assert.equal(
    versionMismatch.rows.length,
    0,
    "Every historical field, timestamp and attachment is preserved.",
  );
  const subjects = await payload.find({
    collection: "curriculumSubjects",
    depth: 1,
    pagination: false,
  });
  assert.equal(subjects.docs.length, 4);
  const subject = subjects.docs.find(
    (s) => s.path === "/curriculum/art-and-design",
  )!;
  assert.equal(subject.title, "Art and Design");
  assert.equal(subject.files?.length, 1);
  assert.equal(subject.galleryImages?.length, 1);
  const draft = await payload.findByID({
    collection: "curriculumSubjects",
    id: subject.id,
    draft: true,
  });
  assert.match(JSON.stringify(draft.body), /unpublished revision/);
  assert.match(JSON.stringify(subject.body), /published content/);
  await migrate();
  assert.equal(
    (await c.query("SELECT count(*) FROM _curriculum_subjects_v")).rows[0]
      .count,
    "8",
    "Reruns must not duplicate versions.",
  );
  assert.equal(
    (await c.query("SELECT count(*) FROM pages")).rows[0].count,
    "4",
    "Original pages retained.",
  );
  const beforeMenus = (await c.query("SELECT * FROM menu_items ORDER BY id"))
    .rows;
  const beforeCrumbs = (
    await c.query("SELECT * FROM menu_items_breadcrumbs ORDER BY id")
  ).rows;
  await cleanupCurriculumMenu(c);
  assert.deepEqual(
    (await c.query("SELECT * FROM menu_items ORDER BY id")).rows,
    beforeMenus,
    "Dry run changes nothing.",
  );
  await cleanupCurriculumMenu(c, { apply: true });
  assert.deepEqual((await c.query("SELECT id FROM menu_items")).rows, [
    { id: 100 },
  ]);
  await cleanupCurriculumMenu(c, { apply: true, restore: true });
  assert.deepEqual(
    (await c.query("SELECT * FROM menu_items ORDER BY id")).rows,
    beforeMenus,
  );
  assert.deepEqual(
    (await c.query("SELECT * FROM menu_items_breadcrumbs ORDER BY id")).rows,
    beforeCrumbs,
  );
  await c.query(
    `UPDATE menu_items SET title='Changed since conversion' WHERE id=10`,
  );
  await assert.rejects(
    () => cleanupCurriculumMenu(c, { apply: true }),
    /changed since migration/,
  );
  await c.query(`UPDATE menu_items SET title='Art & Design' WHERE id=10`);
  await cleanupCurriculumMenu(c, { apply: true });
  const article = await payload.create({
    collection: "newsArticles",
    data: {
      headline: "Curriculum integration test",
      date: "2026-11-04T00:00:00Z",
      body: richText("Testing subject tags") as never,
      curriculumSubjects: [subject.id, subjects.docs[1].id],
    },
  });
  const related = await payload.find({
    collection: "newsArticles",
    where: { curriculumSubjects: { equals: subject.id } },
    depth: 2,
  });
  assert.equal(related.docs[0].id, article.id);
  assert.equal(related.docs[0].curriculumSubjects?.length, 2);
  await payload.update({
    collection: "curriculumSubjects",
    id: subject.id,
    data: { title: "Renamed art subject", _status: "published" },
    context: { skipRevalidation: true },
  });
  assert.equal(
    (
      await payload.findByID({
        collection: "curriculumSubjects",
        id: subject.id,
      })
    ).path,
    subject.path,
    "Renaming must not change URLs.",
  );
  await payload.update({
    collection: "curriculumSubjects",
    id: subject.id,
    data: { title: subject.title, body: subject.body, _status: "published" },
    context: { skipRevalidation: true },
  });
  const newDraft = await payload.create({
    collection: "curriculumSubjects",
    draft: true,
    data: { title: "Draft-only subject", body: richText("Draft") as never },
    context: { skipRevalidation: true },
  });
  const publicSubjects = await payload.find({
    collection: "curriculumSubjects",
    overrideAccess: false,
    pagination: false,
  });
  assert.ok(
    !publicSubjects.docs.some((s) => s.id === newDraft.id),
    "Public reads exclude unpublished subjects.",
  );
  await assert.rejects(() =>
    payload.update({
      collection: "pages",
      id: 10,
      overrideAccess: false,
      data: { title: "Do not modify archive" },
    }),
  );
  // Supply minimal unrelated globals so this disposable database can also build the site.
  await payload.updateGlobal({
    slug: "headteacher-welcome",
    data: {
      name: "Test Headteacher",
      jobTitle: "Headteacher",
      body: "Synthetic welcome for build verification.",
      quote: "Synthetic test quote",
      image: 1,
    },
  });
  await payload.updateGlobal({
    slug: "hero-words",
    data: { words: [{ word: "curious" }] },
  });
  console.log(
    "PASS: exact URLs/content, archived originals, drafts, media, all versions, idempotence, menu cleanup/restore/conflict guards, two-way tags, stable renames and public access.",
  );
} finally {
  await c.end();
  await payload.destroy();
}
process.exit(0);
