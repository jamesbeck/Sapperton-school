import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "classes" ADD COLUMN "pe_days_monday" boolean DEFAULT false;
  ALTER TABLE "classes" ADD COLUMN "pe_days_tuesday" boolean DEFAULT false;
  ALTER TABLE "classes" ADD COLUMN "pe_days_wednesday" boolean DEFAULT false;
  ALTER TABLE "classes" ADD COLUMN "pe_days_thursday" boolean DEFAULT false;
  ALTER TABLE "classes" ADD COLUMN "pe_days_friday" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "classes" DROP COLUMN IF EXISTS "pe_days_monday";
  ALTER TABLE "classes" DROP COLUMN IF EXISTS "pe_days_tuesday";
  ALTER TABLE "classes" DROP COLUMN IF EXISTS "pe_days_wednesday";
  ALTER TABLE "classes" DROP COLUMN IF EXISTS "pe_days_thursday";
  ALTER TABLE "classes" DROP COLUMN IF EXISTS "pe_days_friday";`)
}
