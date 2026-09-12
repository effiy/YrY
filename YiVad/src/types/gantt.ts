/** Gantt chart types */

export interface GanttTask {
  id: string;
  key: string;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  assignee?: string;
  assigneeName?: string;
  dependencies: string[];
  color?: string;
  parentId?: string;
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
}

export interface GanttTimeRange {
  start: Date;
  end: Date;
}

export interface CriticalPathResult {
  path: string[];
  totalDays: number;
}