import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
LOCK TABLE pages, pages_rels, _pages_v, _pages_v_rels, menu_items, menu_items_breadcrumbs IN SHARE ROW EXCLUSIVE MODE;

-- Copy content and every historical version. Leave menus in place until deployment
-- is verified; the cleanup command removes them using the archived navigation.
CREATE TEMP TABLE curriculum_mapping ON COMMIT DROP AS
SELECT m.page_id, m.id AS menu_id, m.title AS menu_title,
  row_number() OVER (ORDER BY m."order" ASC NULLS LAST, m.created_at DESC, m.id) AS menu_order,
  (SELECT b.url FROM menu_items_breadcrumbs b WHERE b._parent_id=m.id ORDER BY b._order DESC LIMIT 1) AS path,
  (SELECT jsonb_agg(jsonb_build_object('label', b.label, 'url', b.url) ORDER BY b._order) FROM menu_items_breadcrumbs b WHERE b._parent_id=m.id) AS breadcrumbs,
  jsonb_build_object('item', to_jsonb(m), 'root', to_jsonb(root),
    'pageUpdatedAt', (SELECT p.updated_at FROM pages p WHERE p.id=m.page_id),
    'breadcrumbs', (SELECT jsonb_agg(to_jsonb(b) ORDER BY b._order) FROM menu_items_breadcrumbs b WHERE b._parent_id=m.id),
    'rootBreadcrumbs', (SELECT jsonb_agg(to_jsonb(b) ORDER BY b._order) FROM menu_items_breadcrumbs b WHERE b._parent_id=root.id)) AS navigation
FROM menu_items m JOIN menu_items root ON root.id=m.parent_id
WHERE root.slug='curriculum' AND root.parent_id IS NULL;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM menu_items WHERE slug='curriculum' AND parent_id IS NULL AND (page_id IS NOT NULL OR nullif(url,'') IS NOT NULL)) THEN
    RAISE EXCEPTION 'Curriculum has an overview destination; preserve it before migration.';
  END IF;
  IF EXISTS (SELECT 1 FROM curriculum_mapping WHERE page_id IS NULL OR path IS NULL OR path !~ '^/curriculum/[^/?#]+$')
    OR EXISTS (SELECT 1 FROM curriculum_mapping GROUP BY page_id HAVING count(*)>1)
    OR EXISTS (SELECT 1 FROM curriculum_mapping GROUP BY path HAVING count(*)>1)
    OR EXISTS (SELECT 1 FROM menu_items WHERE parent_id IN (SELECT menu_id FROM curriculum_mapping))
    OR EXISTS (SELECT 1 FROM menu_items m JOIN curriculum_mapping x ON x.menu_id=m.id WHERE nullif(m.url,'') IS NOT NULL)
  THEN RAISE EXCEPTION 'Ambiguous curriculum mapping. No records have been migrated.'; END IF;
END $$;

-- Migration is rerunnable without overwriting subsequent subject edits.
DELETE FROM curriculum_mapping m USING curriculum_subjects s WHERE s.legacy_page_id=m.page_id;

INSERT INTO curriculum_subjects (title, body, banner_id, path, legacy_page_id, legacy_menu_title,
  legacy_menu_order, legacy_breadcrumbs, legacy_navigation, created_at, updated_at, _status)
SELECT p.title, p.body, p.banner_id, m.path, p.id, m.menu_title, m.menu_order, m.breadcrumbs, m.navigation,
  p.created_at, p.updated_at, p._status::text::enum_curriculum_subjects_status
FROM curriculum_mapping m JOIN pages p ON p.id=m.page_id;

INSERT INTO curriculum_subjects_rels ("order", parent_id, path, media_id)
SELECT r."order", s.id, r.path, r.media_id FROM pages_rels r
JOIN curriculum_mapping m ON m.page_id=r.parent_id JOIN curriculum_subjects s ON s.legacy_page_id=m.page_id;

CREATE TEMP TABLE curriculum_version_mapping ON COMMIT DROP AS
SELECT v.id AS old_id, nextval('_curriculum_subjects_v_id_seq')::integer AS new_id, s.id AS subject_id
FROM _pages_v v JOIN curriculum_mapping m ON m.page_id=v.parent_id JOIN curriculum_subjects s ON s.legacy_page_id=m.page_id;

INSERT INTO _curriculum_subjects_v (id, parent_id, version_title, version_body, version_banner_id,
  version_path, version_legacy_page_id, version_legacy_menu_title, version_legacy_menu_order,
  version_legacy_breadcrumbs, version_legacy_navigation, version_created_at, version_updated_at,
  version__status, created_at, updated_at, latest)
SELECT x.new_id, x.subject_id, v.version_title, v.version_body, v.version_banner_id,
  s.path, s.legacy_page_id, s.legacy_menu_title, s.legacy_menu_order, s.legacy_breadcrumbs, s.legacy_navigation,
  v.version_created_at, v.version_updated_at, v.version__status::text::enum__curriculum_subjects_v_version_status,
  v.created_at, v.updated_at, v.latest
FROM curriculum_version_mapping x JOIN _pages_v v ON v.id=x.old_id JOIN curriculum_subjects s ON s.id=x.subject_id;

INSERT INTO _curriculum_subjects_v_rels ("order", parent_id, path, media_id)
SELECT r."order", x.new_id, r.path, r.media_id FROM _pages_v_rels r JOIN curriculum_version_mapping x ON x.old_id=r.parent_id;

UPDATE pages p SET migrated_to_curriculum_subject_id=s.id FROM curriculum_subjects s
WHERE p.id=s.legacy_page_id AND p.id IN (SELECT page_id FROM curriculum_mapping);
-- Preserve the archive marker if someone inspects an original page's draft.
UPDATE _pages_v v SET version_migrated_to_curriculum_subject_id=s.id FROM curriculum_subjects s
WHERE v.parent_id=s.legacy_page_id AND v.parent_id IN (SELECT page_id FROM curriculum_mapping);
`);
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error(
    "Curriculum conversion preserves originals. Restore archived menus with the cleanup script's --restore option and roll back application code; do not discard subject edits or news tags.",
  );
}
