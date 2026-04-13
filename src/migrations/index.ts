import * as migration_20251202_115553_add_footer_menu_items from './20251202_115553_add_footer_menu_items';
import * as migration_20260413_065748_add_letters_collection from './20260413_065748_add_letters_collection';

export const migrations = [
  {
    up: migration_20251202_115553_add_footer_menu_items.up,
    down: migration_20251202_115553_add_footer_menu_items.down,
    name: '20251202_115553_add_footer_menu_items',
  },
  {
    up: migration_20260413_065748_add_letters_collection.up,
    down: migration_20260413_065748_add_letters_collection.down,
    name: '20260413_065748_add_letters_collection'
  },
];
