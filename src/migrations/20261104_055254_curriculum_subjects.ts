import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_curriculum_subjects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__curriculum_subjects_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE IF NOT EXISTS "curriculum_subjects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"banner_id" integer,
  	"path" varchar,
  	"legacy_page_id" numeric,
  	"legacy_menu_title" varchar,
  	"legacy_menu_order" numeric,
  	"legacy_navigation" jsonb,
  	"legacy_breadcrumbs" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_curriculum_subjects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "curriculum_subjects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_curriculum_subjects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_banner_id" integer,
  	"version_path" varchar,
  	"version_legacy_page_id" numeric,
  	"version_legacy_menu_title" varchar,
  	"version_legacy_menu_order" numeric,
  	"version_legacy_navigation" jsonb,
  	"version_legacy_breadcrumbs" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__curriculum_subjects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_curriculum_subjects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "pages" ADD COLUMN "migrated_to_curriculum_subject_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_migrated_to_curriculum_subject_id" integer;
  ALTER TABLE "news_articles_rels" ADD COLUMN "curriculum_subjects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "curriculum_subjects_id" integer;
  DO $$ BEGIN
   ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "curriculum_subjects_rels" ADD CONSTRAINT "curriculum_subjects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."curriculum_subjects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "curriculum_subjects_rels" ADD CONSTRAINT "curriculum_subjects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_curriculum_subjects_v" ADD CONSTRAINT "_curriculum_subjects_v_parent_id_curriculum_subjects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."curriculum_subjects"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_curriculum_subjects_v" ADD CONSTRAINT "_curriculum_subjects_v_version_banner_id_media_id_fk" FOREIGN KEY ("version_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_curriculum_subjects_v_rels" ADD CONSTRAINT "_curriculum_subjects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_curriculum_subjects_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_curriculum_subjects_v_rels" ADD CONSTRAINT "_curriculum_subjects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_banner_idx" ON "curriculum_subjects" USING btree ("banner_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_subjects_path_idx" ON "curriculum_subjects" USING btree ("path");
  CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_subjects_legacy_page_id_idx" ON "curriculum_subjects" USING btree ("legacy_page_id");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_updated_at_idx" ON "curriculum_subjects" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_created_at_idx" ON "curriculum_subjects" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects__status_idx" ON "curriculum_subjects" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_rels_order_idx" ON "curriculum_subjects_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_rels_parent_idx" ON "curriculum_subjects_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_rels_path_idx" ON "curriculum_subjects_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "curriculum_subjects_rels_media_id_idx" ON "curriculum_subjects_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_parent_idx" ON "_curriculum_subjects_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_version_version_banner_idx" ON "_curriculum_subjects_v" USING btree ("version_banner_id");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_version_version_path_idx" ON "_curriculum_subjects_v" USING btree ("version_path");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_version_version_legacy_page_id_idx" ON "_curriculum_subjects_v" USING btree ("version_legacy_page_id");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_version_version_updated_at_idx" ON "_curriculum_subjects_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_version_version_created_at_idx" ON "_curriculum_subjects_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_version_version__status_idx" ON "_curriculum_subjects_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_created_at_idx" ON "_curriculum_subjects_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_updated_at_idx" ON "_curriculum_subjects_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_latest_idx" ON "_curriculum_subjects_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_rels_order_idx" ON "_curriculum_subjects_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_rels_parent_idx" ON "_curriculum_subjects_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_rels_path_idx" ON "_curriculum_subjects_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_curriculum_subjects_v_rels_media_id_idx" ON "_curriculum_subjects_v_rels" USING btree ("media_id");
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_migrated_to_curriculum_subject_id_curriculum_subjects_id_fk" FOREIGN KEY ("migrated_to_curriculum_subject_id") REFERENCES "public"."curriculum_subjects"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_migrated_to_curriculum_subject_id_curriculum_subjects_id_fk" FOREIGN KEY ("version_migrated_to_curriculum_subject_id") REFERENCES "public"."curriculum_subjects"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles_rels" ADD CONSTRAINT "news_articles_rels_curriculum_subjects_fk" FOREIGN KEY ("curriculum_subjects_id") REFERENCES "public"."curriculum_subjects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_curriculum_subjects_fk" FOREIGN KEY ("curriculum_subjects_id") REFERENCES "public"."curriculum_subjects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_migrated_to_curriculum_subject_idx" ON "pages" USING btree ("migrated_to_curriculum_subject_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_migrated_to_curriculum_subject_idx" ON "_pages_v" USING btree ("version_migrated_to_curriculum_subject_id");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_curriculum_subjects_id_idx" ON "news_articles_rels" USING btree ("curriculum_subjects_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_curriculum_subjects_id_idx" ON "payload_locked_documents_rels" USING btree ("curriculum_subjects_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const subjects = await db.execute(
    sql`SELECT id FROM curriculum_subjects LIMIT 1`,
  );
  if (subjects.rows.length)
    throw new Error(
      "Refusing to drop curriculum data. Roll back application code and restore archived menus instead.",
    );
  await db.execute(sql`
    ALTER TABLE pages DROP COLUMN migrated_to_curriculum_subject_id;
    ALTER TABLE _pages_v DROP COLUMN version_migrated_to_curriculum_subject_id;
    ALTER TABLE news_articles_rels DROP COLUMN curriculum_subjects_id;
    ALTER TABLE payload_locked_documents_rels DROP COLUMN curriculum_subjects_id;
    DROP TABLE _curriculum_subjects_v_rels, _curriculum_subjects_v, curriculum_subjects_rels, curriculum_subjects;
    DROP TYPE enum_curriculum_subjects_status, enum__curriculum_subjects_v_version_status;
  `);
}
