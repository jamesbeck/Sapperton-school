import slugify from "slugify";
import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_clubs_sessions_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TABLE IF NOT EXISTS "clubs_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_clubs_sessions_day" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL
  );
  
  ALTER TABLE "clubs" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "clubs" ADD COLUMN "slug" varchar;
  ALTER TABLE "clubs" ADD COLUMN "image_id" integer;
  ALTER TABLE "clubs_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "news_articles_rels" ADD COLUMN "clubs_id" integer;
  DO $$ BEGIN
   ALTER TABLE "clubs_sessions" ADD CONSTRAINT "clubs_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "clubs_sessions_order_idx" ON "clubs_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "clubs_sessions_parent_id_idx" ON "clubs_sessions" USING btree ("_parent_id");
  DO $$ BEGIN
   ALTER TABLE "clubs" ADD CONSTRAINT "clubs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "clubs_rels" ADD CONSTRAINT "clubs_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles_rels" ADD CONSTRAINT "news_articles_rels_clubs_fk" FOREIGN KEY ("clubs_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "clubs_image_idx" ON "clubs" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "clubs_rels_media_id_idx" ON "clubs_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_clubs_id_idx" ON "news_articles_rels" USING btree ("clubs_id");`);

  // Backfill before adding the required/unique constraints, including duplicate names.
  const existing = await db.execute<{ id: number; name: string }>(
    sql`SELECT id, name FROM clubs ORDER BY id`,
  );
  const used = new Set<string>();
  for (const club of existing.rows) {
    const base = slugify(club.name, { lower: true, strict: true }) || "club";
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    used.add(slug);
    await db.execute(
      sql`UPDATE clubs SET slug = ${slug} WHERE id = ${club.id}`,
    );
  }
  await db.execute(sql`
    ALTER TABLE clubs ALTER COLUMN slug SET NOT NULL;
    CREATE UNIQUE INDEX clubs_slug_idx ON clubs USING btree (slug);
  `);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "clubs_sessions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "clubs_sessions" CASCADE;
  ALTER TABLE "clubs" DROP CONSTRAINT "clubs_image_id_media_id_fk";
  
  ALTER TABLE "clubs_rels" DROP CONSTRAINT "clubs_rels_media_fk";
  
  ALTER TABLE "news_articles_rels" DROP CONSTRAINT "news_articles_rels_clubs_fk";
  
  DROP INDEX IF EXISTS "clubs_slug_idx";
  DROP INDEX IF EXISTS "clubs_image_idx";
  DROP INDEX IF EXISTS "clubs_rels_media_id_idx";
  DROP INDEX IF EXISTS "news_articles_rels_clubs_id_idx";
  ALTER TABLE "clubs" DROP COLUMN IF EXISTS "order";
  ALTER TABLE "clubs" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "clubs" DROP COLUMN IF EXISTS "image_id";
  ALTER TABLE "clubs_rels" DROP COLUMN IF EXISTS "media_id";
  ALTER TABLE "news_articles_rels" DROP COLUMN IF EXISTS "clubs_id";
  DROP TYPE "public"."enum_clubs_sessions_day";`);
}
