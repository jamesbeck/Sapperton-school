/**
 * Integration check against a disposable, empty local PostgreSQL database.
 * CLUBS_TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:55484/sapperton_clubs_test node --import tsx scripts/verify-clubs.ts
 * Leaves fixtures in that database for browser verification; never uses DATABASE_URL from .env.
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { getPayload, createLocalReq } from "payload";
import { sql } from "@payloadcms/db-postgres";

const testURL = process.env.CLUBS_TEST_DATABASE_URL;
if (!testURL)
  throw new Error(
    "Set CLUBS_TEST_DATABASE_URL to an empty disposable local database.",
  );
const target = new URL(testURL);
if (
  !["127.0.0.1", "localhost"].includes(target.hostname) ||
  !target.pathname.endsWith("/sapperton_clubs_test")
) {
  throw new Error(
    "This check only accepts the local sapperton_clubs_test database.",
  );
}
process.env.DATABASE_URL = testURL;
process.env.PAYLOAD_MIGRATING = "true";
const { default: config } = await import("../payload.config");
const payload = await getPayload({ config });
const db = payload.db.drizzle;
const req = await createLocalReq({}, payload);
const args = { db, payload, req };
const richText = {
  root: {
    type: "root",
    version: 1,
    format: "" as const,
    indent: 0,
    direction: "ltr" as const,
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
            text: "A friendly club for children to explore and learn together.",
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
    ],
  },
};
try {
  const tables = await db.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );
  assert.equal(
    tables.rows.length,
    0,
    "Use an empty database; this check does not reset existing data.",
  );
  const baseline = await import(
    "../src/migrations/20251202_115553_add_footer_menu_items"
  );
  const letters = await import(
    "../src/migrations/20260413_065748_add_letters_collection"
  );
  const clubsMigration = await import(
    "../src/migrations/20261011_164942_add_club_pages_and_sessions"
  );
  await baseline.up(args);
  await letters.up(args);
  // Existing clubs, including duplicate names, must survive migration.
  await db.execute(sql`INSERT INTO clubs (name, years, description) VALUES
    ('Chess Club', 'Years 3–6', ${JSON.stringify(richText)}::jsonb),
    ('Chess Club', 'Years 1–2', ${JSON.stringify(richText)}::jsonb)`);
  await db.execute(
    sql`INSERT INTO staff (name, slug, position, biography) VALUES ('Club Leader', 'club-leader', 'Teacher', ${JSON.stringify(richText)}::jsonb)`,
  );
  await db.execute(
    sql`INSERT INTO clubs_rels (parent_id, path, staff_id) VALUES (1, 'teachers', 1)`,
  );
  await clubsMigration.up(args);
  let existing = await payload.find({
    collection: "clubs",
    sort: "id",
    depth: 1,
  });
  assert.deepEqual(
    existing.docs.map(({ slug }) => slug),
    ["chess-club", "chess-club-2"],
  );
  assert.equal(
    typeof existing.docs[0].teachers?.[0],
    "object",
    "Existing staff assignment was preserved.",
  );
  await clubsMigration.down(args);
  await clubsMigration.up(args);
  existing = await payload.find({ collection: "clubs", sort: "id", depth: 1 });
  assert.equal(
    existing.docs.length,
    2,
    "Rollback preserved the original clubs.",
  );

  const chess = await payload.update({
    collection: "clubs",
    id: existing.docs[0].id,
    data: {
      name: "Chess and Games Club",
      slug: "attempted-url-change",
      sessions: [
        { day: "thursday", startTime: "15:15", endTime: "16:15" },
        { day: "monday", startTime: "12:00", endTime: "12:45" },
      ],
    },
  });
  assert.equal(
    chess.slug,
    "chess-club",
    "Renaming or manually submitting a slug cannot change existing links.",
  );
  const third = await payload.create({
    collection: "clubs",
    data: {
      name: "Chess Club",
      years: "All years",
      description: richText,
      otherTeachers: [1],
    },
  });
  assert.equal(third.slug, "chess-club-3");
  for (const sessions of [
    [{ day: "monday", startTime: "16:00", endTime: "15:00" }],
    [{ day: "monday", startTime: "25:00", endTime: "26:00" }],
    [
      { day: "monday", startTime: "15:00", endTime: "16:00" },
      { day: "monday", startTime: "15:00", endTime: "16:00" },
    ],
  ]) {
    await assert.rejects(
      payload.update({ collection: "clubs", id: chess.id, data: { sessions } }),
      /invalid|session|time/i,
    );
  }
  const schoolClass = await payload.create({
    collection: "classes",
    data: { name: "Test Class", years: "Years 3–6", description: richText },
  });
  const news = await payload.create({
    collection: "newsArticles",
    data: {
      headline: "Club tournament",
      date: "2026-10-11T12:00:00Z",
      body: richText,
      clubs: [chess.id],
      classes: [schoolClass.id],
    },
  });
  const clubNews = await payload.find({
    collection: "newsArticles",
    depth: 1,
    where: { clubs: { equals: chess.id } },
  });
  assert.equal(clubNews.docs[0].id, news.id);
  assert.equal(typeof clubNews.docs[0].classes?.[0], "object");
  assert.equal(typeof clubNews.docs[0].clubs?.[0], "object");
  const staffClubs = await payload.find({
    collection: "clubs",
    where: {
      or: [{ teachers: { equals: 1 } }, { otherTeachers: { equals: 1 } }],
    },
  });
  assert.equal(staffClubs.docs.length, 2);
  await payload.updateGlobal({
    slug: "hero-words",
    data: { words: [{ word: "Discover" }] },
  });
  await payload.updateGlobal({
    slug: "headteacher-welcome",
    data: {
      name: "Test Headteacher",
      jobTitle: "Headteacher",
      body: "Welcome to our test school.",
      quote: "Learning together.",
    },
  });
  await payload.create({
    collection: "users",
    data: {
      email: "clubs-test@example.test",
      password: "LocalClubsTest-2026!",
    },
  });
  console.log(
    "PASS: migration up/down, existing clubs/staff, slug backfill/collisions/stability, CMS schedule validation, class + club news, staff club lookup.",
  );
  console.log(
    "Fixtures: /clubs, /clubs/chess-club, /news/club-tournament, /our-school/staff/club-leader",
  );
} finally {
  await payload.destroy();
}
// Payload 3.42 leaves its connection pool open on destroy. This is a standalone check.
process.exit(0);
