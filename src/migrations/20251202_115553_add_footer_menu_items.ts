import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_type" AS ENUM('term-date', 'event', 'open-day', 'other');
  CREATE TABLE IF NOT EXISTS "menu_items_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "menu_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"page_id" integer,
  	"url" varchar,
  	"order" numeric,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "footer_menu_items_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "footer_menu_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"page_id" integer,
  	"url" varchar,
  	"order" numeric,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"banner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_banner_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "staff" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"position" varchar NOT NULL,
  	"biography" jsonb NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "staff_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"staff_groups_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "staff_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"order" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "classes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"years" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"banner_id" integer,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "classes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"staff_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "clubs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"years" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"banner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "clubs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"staff_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar,
  	"end_date" timestamp(3) with time zone,
  	"end_time" varchar,
  	"type" "enum_events_type" NOT NULL,
  	"description" jsonb NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"classes_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "news_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"slug" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"author_id" integer,
  	"body" jsonb NOT NULL,
  	"banner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "news_articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"classes_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"menu_items_id" integer,
  	"footer_menu_items_id" integer,
  	"pages_id" integer,
  	"staff_id" integer,
  	"staff_groups_id" integer,
  	"classes_id" integer,
  	"clubs_id" integer,
  	"events_id" integer,
  	"news_articles_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "hero_words_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "hero_words" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "headteacher_welcome" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"job_title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"quote" varchar NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  DO $$ BEGIN
   ALTER TABLE "menu_items_breadcrumbs" ADD CONSTRAINT "menu_items_breadcrumbs_doc_id_menu_items_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."menu_items"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "menu_items_breadcrumbs" ADD CONSTRAINT "menu_items_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_menu_items_breadcrumbs" ADD CONSTRAINT "footer_menu_items_breadcrumbs_doc_id_footer_menu_items_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."footer_menu_items"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_menu_items_breadcrumbs" ADD CONSTRAINT "footer_menu_items_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_menu_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_menu_items" ADD CONSTRAINT "footer_menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "footer_menu_items" ADD CONSTRAINT "footer_menu_items_parent_id_footer_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer_menu_items"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_banner_id_media_id_fk" FOREIGN KEY ("version_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "staff" ADD CONSTRAINT "staff_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "staff_rels" ADD CONSTRAINT "staff_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "staff_rels" ADD CONSTRAINT "staff_rels_staff_groups_fk" FOREIGN KEY ("staff_groups_id") REFERENCES "public"."staff_groups"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "classes" ADD CONSTRAINT "classes_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "classes" ADD CONSTRAINT "classes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "classes_rels" ADD CONSTRAINT "classes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "classes_rels" ADD CONSTRAINT "classes_rels_staff_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "classes_rels" ADD CONSTRAINT "classes_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "clubs" ADD CONSTRAINT "clubs_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "clubs_rels" ADD CONSTRAINT "clubs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "clubs_rels" ADD CONSTRAINT "clubs_rels_staff_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_classes_fk" FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_staff_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles_rels" ADD CONSTRAINT "news_articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles_rels" ADD CONSTRAINT "news_articles_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "news_articles_rels" ADD CONSTRAINT "news_articles_rels_classes_fk" FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_footer_menu_items_fk" FOREIGN KEY ("footer_menu_items_id") REFERENCES "public"."footer_menu_items"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staff_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_staff_groups_fk" FOREIGN KEY ("staff_groups_id") REFERENCES "public"."staff_groups"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_classes_fk" FOREIGN KEY ("classes_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clubs_fk" FOREIGN KEY ("clubs_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_articles_fk" FOREIGN KEY ("news_articles_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "hero_words_words" ADD CONSTRAINT "hero_words_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_words"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "headteacher_welcome" ADD CONSTRAINT "headteacher_welcome_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "menu_items_breadcrumbs_order_idx" ON "menu_items_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "menu_items_breadcrumbs_parent_id_idx" ON "menu_items_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "menu_items_breadcrumbs_doc_idx" ON "menu_items_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX IF NOT EXISTS "menu_items_slug_idx" ON "menu_items" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "menu_items_page_idx" ON "menu_items" USING btree ("page_id");
  CREATE INDEX IF NOT EXISTS "menu_items_parent_idx" ON "menu_items" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "menu_items_updated_at_idx" ON "menu_items" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "menu_items_created_at_idx" ON "menu_items" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_breadcrumbs_order_idx" ON "footer_menu_items_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_breadcrumbs_parent_id_idx" ON "footer_menu_items_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_breadcrumbs_doc_idx" ON "footer_menu_items_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_slug_idx" ON "footer_menu_items" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_page_idx" ON "footer_menu_items" USING btree ("page_id");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_parent_idx" ON "footer_menu_items" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_updated_at_idx" ON "footer_menu_items" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "footer_menu_items_created_at_idx" ON "footer_menu_items" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "pages_banner_idx" ON "pages" USING btree ("banner_id");
  CREATE INDEX IF NOT EXISTS "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_banner_idx" ON "_pages_v" USING btree ("version_banner_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "staff_slug_idx" ON "staff" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "staff_image_idx" ON "staff" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "staff_updated_at_idx" ON "staff" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "staff_created_at_idx" ON "staff" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "staff_rels_order_idx" ON "staff_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "staff_rels_parent_idx" ON "staff_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "staff_rels_path_idx" ON "staff_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "staff_rels_staff_groups_id_idx" ON "staff_rels" USING btree ("staff_groups_id");
  CREATE INDEX IF NOT EXISTS "staff_groups_updated_at_idx" ON "staff_groups" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "staff_groups_created_at_idx" ON "staff_groups" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "classes_slug_idx" ON "classes" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "classes_banner_idx" ON "classes" USING btree ("banner_id");
  CREATE INDEX IF NOT EXISTS "classes_image_idx" ON "classes" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "classes_updated_at_idx" ON "classes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "classes_created_at_idx" ON "classes" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "classes_rels_order_idx" ON "classes_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "classes_rels_parent_idx" ON "classes_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "classes_rels_path_idx" ON "classes_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "classes_rels_staff_id_idx" ON "classes_rels" USING btree ("staff_id");
  CREATE INDEX IF NOT EXISTS "classes_rels_media_id_idx" ON "classes_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "clubs_banner_idx" ON "clubs" USING btree ("banner_id");
  CREATE INDEX IF NOT EXISTS "clubs_updated_at_idx" ON "clubs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "clubs_created_at_idx" ON "clubs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "clubs_rels_order_idx" ON "clubs_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "clubs_rels_parent_idx" ON "clubs_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "clubs_rels_path_idx" ON "clubs_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "clubs_rels_staff_id_idx" ON "clubs_rels" USING btree ("staff_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "events_rels_classes_id_idx" ON "events_rels" USING btree ("classes_id");
  CREATE INDEX IF NOT EXISTS "news_articles_slug_idx" ON "news_articles" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "news_articles_author_idx" ON "news_articles" USING btree ("author_id");
  CREATE INDEX IF NOT EXISTS "news_articles_banner_idx" ON "news_articles" USING btree ("banner_id");
  CREATE INDEX IF NOT EXISTS "news_articles_updated_at_idx" ON "news_articles" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "news_articles_created_at_idx" ON "news_articles" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_order_idx" ON "news_articles_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_parent_idx" ON "news_articles_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_path_idx" ON "news_articles_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_media_id_idx" ON "news_articles_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "news_articles_rels_classes_id_idx" ON "news_articles_rels" USING btree ("classes_id");
  CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX IF NOT EXISTS "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX IF NOT EXISTS "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_menu_items_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_items_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_footer_menu_items_id_idx" ON "payload_locked_documents_rels" USING btree ("footer_menu_items_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_staff_id_idx" ON "payload_locked_documents_rels" USING btree ("staff_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_staff_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("staff_groups_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_classes_id_idx" ON "payload_locked_documents_rels" USING btree ("classes_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_clubs_id_idx" ON "payload_locked_documents_rels" USING btree ("clubs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_news_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("news_articles_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "hero_words_words_order_idx" ON "hero_words_words" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "hero_words_words_parent_id_idx" ON "hero_words_words" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "headteacher_welcome_image_idx" ON "headteacher_welcome" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "menu_items_breadcrumbs" CASCADE;
  DROP TABLE "menu_items" CASCADE;
  DROP TABLE "footer_menu_items_breadcrumbs" CASCADE;
  DROP TABLE "footer_menu_items" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "staff" CASCADE;
  DROP TABLE "staff_rels" CASCADE;
  DROP TABLE "staff_groups" CASCADE;
  DROP TABLE "classes" CASCADE;
  DROP TABLE "classes_rels" CASCADE;
  DROP TABLE "clubs" CASCADE;
  DROP TABLE "clubs_rels" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "news_articles" CASCADE;
  DROP TABLE "news_articles_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "hero_words_words" CASCADE;
  DROP TABLE "hero_words" CASCADE;
  DROP TABLE "headteacher_welcome" CASCADE;
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_events_type";`)
}
