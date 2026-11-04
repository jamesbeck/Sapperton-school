import 'dotenv/config';
import pg from 'pg';
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
try {
  await c.query('BEGIN READ ONLY');
  console.log(JSON.stringify((await c.query(`SELECT m.id AS menu_id, m.page_id, m.title AS menu_title, p.title, p._status,
    (SELECT url FROM menu_items_breadcrumbs WHERE _parent_id=m.id ORDER BY _order DESC LIMIT 1) AS path,
    (SELECT count(*) FROM _pages_v WHERE parent_id=p.id) AS versions,
    (SELECT count(*) FROM pages_rels WHERE parent_id=p.id) AS media_relationships
    FROM menu_items m JOIN menu_items root ON root.id=m.parent_id JOIN pages p ON p.id=m.page_id
    WHERE root.slug='curriculum' ORDER BY m."order", m.id`)).rows, null, 2));
  for (const table of ['pages_rels','_pages_v_rels']) {
    console.log(table, (await c.query(`SELECT DISTINCT path FROM ${table}`)).rows);
  }
  console.log('Internal page references', (await c.query(`SELECT id, title FROM pages WHERE body::text LIKE '%"relationTo": "pages"%'`)).rows);
} finally { await c.query('ROLLBACK'); await c.end(); }
