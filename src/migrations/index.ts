import * as retire_club_sessions from "./20261014_131521_retire_club_weekly_sessions";
import * as migration_20251202_115553_add_footer_menu_items from "./20251202_115553_add_footer_menu_items";
import * as migration_20260413_065748_add_letters_collection from "./20260413_065748_add_letters_collection";
import * as migration_20261011_164942_add_club_pages_and_sessions from "./20261011_164942_add_club_pages_and_sessions";
import * as migration_20261014_131520_add_club_term_blocks from "./20261014_131520_add_club_term_blocks";

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
    up: retire_club_sessions.up,
    down: retire_club_sessions.down,
    name: "20261014_131521_retire_club_weekly_sessions",
  },
];
