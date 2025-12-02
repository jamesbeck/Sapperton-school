import * as migration_20251202_115553_add_footer_menu_items from './20251202_115553_add_footer_menu_items';

export const migrations = [
  {
    up: migration_20251202_115553_add_footer_menu_items.up,
    down: migration_20251202_115553_add_footer_menu_items.down,
    name: '20251202_115553_add_footer_menu_items'
  },
];
