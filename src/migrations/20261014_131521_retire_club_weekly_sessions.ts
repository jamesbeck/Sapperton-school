import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";

// Run after term-block data is saved and the new website has been promoted.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const missing = await db.execute(sql`
    SELECT DISTINCT s._parent_id FROM clubs_sessions s
    WHERE NOT EXISTS (
      SELECT 1 FROM clubs_blocks b JOIN clubs_blocks_sessions bs ON bs._parent_id = b.id
      WHERE b._parent_id = s._parent_id AND bs.day::text = s.day::text
        AND bs.start_time = s.start_time AND bs.end_time = s.end_time
    )
  `);
  if (missing.rows.length)
    throw new Error(
      "Migrate every legacy timetable into a term block before retiring weekly sessions.",
    );
  await db.execute(
    sql`DROP TABLE clubs_sessions; DROP TYPE enum_clubs_sessions_day;`,
  );
}
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE enum_clubs_sessions_day AS ENUM ('monday','tuesday','wednesday','thursday','friday','saturday','sunday');
    CREATE TABLE clubs_sessions (
      _order integer NOT NULL, _parent_id integer NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      id varchar PRIMARY KEY NOT NULL, day enum_clubs_sessions_day NOT NULL, start_time varchar NOT NULL, end_time varchar NOT NULL
    );
    CREATE INDEX clubs_sessions_order_idx ON clubs_sessions(_order);
    CREATE INDEX clubs_sessions_parent_id_idx ON clubs_sessions(_parent_id);
    INSERT INTO clubs_sessions (_order, _parent_id, id, day, start_time, end_time)
    SELECT s._order, b._parent_id, s.id, s.day::text::enum_clubs_sessions_day, s.start_time, s.end_time
    FROM clubs_blocks_sessions s JOIN clubs_blocks b ON b.id = s._parent_id
    WHERE b.id = (SELECT latest.id FROM clubs_blocks latest WHERE latest._parent_id = b._parent_id ORDER BY latest.start_date DESC, latest._order LIMIT 1);
  `);
}
