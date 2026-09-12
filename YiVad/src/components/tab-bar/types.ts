export interface TabPage {
  id: string;
  title: string;
  path: string;
  icon?: string;
  closable?: boolean;
  pinned?: boolean;
  dirty?: boolean;
  createdAt: number;
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: TabPage[];
  activeId: string | null;
}