export interface MenuMeta {
  icon?: string;
  title: string;
  isLink?: string;
  isHide?: boolean;
  isFull?: boolean;
  isAffix?: boolean;
  isKeepAlive?: boolean;
}

export interface MenuDocument {
  key: string;
  path: string;
  name: string;
  component?: string;
  redirect?: string;
  meta: MenuMeta;
  parent?: string | null;
  order?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface DepartmentDocument {
  key: string;
  id: string;
  name: string;
  parentId?: string | null;
  children?: DepartmentDocument[];
  createdAt?: number;
  updatedAt?: number;
}

export interface RoleDocument {
  key: string;
  id: string;
  name: string;
  code?: string;
  description?: string;
  permissions?: string[];
  parentId?: string | null;
  children?: RoleDocument[];
  createdAt?: number;
  updatedAt?: number;
}

export interface DictDocument {
  key: string;
  dictName: string;
  label: string;
  value: string | number;
  sort?: number;
  status?: number;
  createdAt?: number;
  updatedAt?: number;
}

/** Scheduler status (read-only system snapshot) */
export interface SchedulerStatusDocument {
  status: string;
  interval?: number;
  sourceCount?: number;
  nextRun?: string;
  lastRun?: string;
  logLevel?: string;
  database?: string;
  server?: string;
  uptime?: string;
  rssScheduler?: string;
}