import * as migrateCurriculumPages from "./20261104_055255_migrate_curriculum_pages";
import * as migration_20251202_115553_add_footer_menu_items from "./20251202_115553_add_footer_menu_items";
import * as migration_20260413_065748_add_letters_collection from "./20260413_065748_add_letters_collection";
import * as migration_20261011_164942_add_club_pages_and_sessions from "./20261011_164942_add_club_pages_and_sessions";
import * as migration_20261014_131520_add_club_term_blocks from "./20261014_131520_add_club_term_blocks";
import * as migration_20261014_131521_retire_club_weekly_sessions from "./20261014_131521_retire_club_weekly_sessions";
import * as migration_20261104_055254_curriculum_subjects from "./20261104_055254_curriculum_subjects";

export const migrations = [
  {
    up: migration_20251202_115553_add_footer_menu_items.up,
    down: migration_20251202_115553_add_footer_menu_items.down,
    name: "20251202_115553_add_footer_menu_items",
  },
  {
    up: migration_20260413_065748_add_letters_collection.up,
    down: migration_20260413_065748_add_letters_collection.down,
    name: "20260413_065748_add_letters_collection",
  },
  {
    up: migration_20261011_164942_add_club_pages_and_sessions.up,
    down: migration_20261011_164942_add_club_pages_and_sessions.down,
    name: "20261011_164942_add_club_pages_and_sessions",
  },
  {
    up: migration_20261014_131520_add_club_term_blocks.up,
    down: migration_20261014_131520_add_club_term_blocks.down,
    name: "20261014_131520_add_club_term_blocks",
  },
  {
    up: migration_20261014_131521_retire_club_weekly_sessions.up,
    down: migration_20261014_131521_retire_club_weekly_sessions.down,
    name: "20261014_131521_retire_club_weekly_sessions",
  },
  {
    up: migration_20261104_055254_curriculum_subjects.up,
    down: migration_20261104_055254_curriculum_subjects.down,
    name: "20261104_055254_curriculum_subjects",
  },
  {
    up: migrateCurriculumPages.up,
    down: migrateCurriculumPages.down,
    name: "20261104_055255_migrate_curriculum_pages",
  },
];
