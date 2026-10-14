import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_clubs_blocks_sessions_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_clubs_blocks_booking_method" AS ENUM('parentpay', 'external', 'contact');
  CREATE TYPE "public"."enum_clubs_blocks_booking_status" AS ENUM('unspecified', 'open', 'full', 'closed');
  CREATE TABLE IF NOT EXISTS "clubs_blocks_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_clubs_blocks_sessions_day" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "clubs_blocks_excluded_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "clubs_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"total_price" numeric,
  	"capacity" numeric,
  	"show_session_price" boolean,
  	"booking_method" "enum_clubs_blocks_booking_method" NOT NULL,
  	"booking_u_r_l" varchar,
  	"booking_status" "enum_clubs_blocks_booking_status" DEFAULT 'unspecified',
  	"external_leader" varchar,
  	"snack_provided" boolean,
  	"what_to_bring" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "club_information" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"booking_policy" varchar,
  	"payment_plan_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "clubs" ALTER COLUMN "description" DROP NOT NULL;
  DO $$ BEGIN
   ALTER TABLE "clubs_blocks_sessions" ADD CONSTRAINT "clubs_blocks_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clubs_blocks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "clubs_blocks_excluded_dates" ADD CONSTRAINT "clubs_blocks_excluded_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clubs_blocks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "clubs_blocks" ADD CONSTRAINT "clubs_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "clubs_blocks_sessions_order_idx" ON "clubs_blocks_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "clubs_blocks_sessions_parent_id_idx" ON "clubs_blocks_sessions" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "clubs_blocks_excluded_dates_order_idx" ON "clubs_blocks_excluded_dates" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "clubs_blocks_excluded_dates_parent_id_idx" ON "clubs_blocks_excluded_dates" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "clubs_blocks_order_idx" ON "clubs_blocks" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "clubs_blocks_parent_id_idx" ON "clubs_blocks" USING btree ("_parent_id");
`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE clubs_blocks_sessions;
    DROP TABLE clubs_blocks_excluded_dates;
    DROP TABLE clubs_blocks;
    DROP TABLE club_information;
    DROP TYPE enum_clubs_blocks_sessions_day;
    DROP TYPE enum_clubs_blocks_booking_method;
    DROP TYPE enum_clubs_blocks_booking_status;
  `);
}
