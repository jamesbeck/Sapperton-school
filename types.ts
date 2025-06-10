export interface GroupedMenuItem {
  id: number;
  title: string;
  href: string;
  children: GroupedMenuItem[];
}
