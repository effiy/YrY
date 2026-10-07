/** Gantt chart types */

export interface GanttTask {
  id: string;
  key: string;
  title: string;
  start_date: string;
  end_date: string;
  durationDays: number;
  progress: number;
  status: string;
  overdue: boolean;
  isMilestone: boolean;
  assignee?: string;
  dependencies: string[];
  color?: string;
  parentId?: string;
  category: string;
}

export interface GanttDependency {
  from: string;
  to: string;
}

export interface GanttViewOptions {
  viewMode: "day" | "week" | "month";
  showWeekends: boolean;
  showCriticalPath: boolean;
  showToday: boolean;
  groupBy: "none" | "assignee" | "type";
}

export interface GanttTimeRange {
  start: Date;
  end: Date;
}

export interface CriticalPathResult {
  path: string[];
  totalDays: number;
}