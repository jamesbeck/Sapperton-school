import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_events_type" ADD VALUE 'extracurricular' BEFORE 'open-day';
  CREATE TABLE IF NOT EXISTS "letters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"document_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "letters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"classes_id" integer
  );
  
  ALTER TABLE "classes" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "letters_id" integer;
  DO $$ BEGIN
   ALTER TABLE "letters" ADD CONSTRAINT "letters_document_id_media_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "letters_rels" ADD CONSTRAINT "letters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."letters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "letters_rels" ADD CONSTRAINT "letters_rels_classes_fk" FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "letters_document_idx" ON "letters" USING btree ("document_id");
  CREATE INDEX IF NOT EXISTS "letters_updated_at_idx" ON "letters" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "letters_created_at_idx" ON "letters" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "letters_rels_order_idx" ON "letters_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "letters_rels_parent_idx" ON "letters_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "letters_rels_path_idx" ON "letters_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "letters_rels_classes_id_idx" ON "letters_rels" USING btree ("classes_id");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_letters_fk" FOREIGN KEY ("letters_id") REFERENCES "public"."letters"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_letters_id_idx" ON "payload_locked_documents_rels" USING btree ("letters_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "letters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "letters_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "letters" CASCADE;
  DROP TABLE "letters_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_letters_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_letters_id_idx";
  ALTER TABLE "classes" DROP COLUMN IF EXISTS "order";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "letters_id";
  ALTER TABLE "public"."events" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_type";
  CREATE TYPE "public"."enum_events_type" AS ENUM('term-date', 'event', 'open-day', 'other');
  ALTER TABLE "public"."events" ALTER COLUMN "type" SET DATA TYPE "public"."enum_events_type" USING "type"::"public"."enum_events_type";`)
}
