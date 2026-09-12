/** Milestone types */

export interface Milestone {
  key: string;
  title: string;
  project_key: string;
  description: string;
  target_date: string;
  start_date: string;
  progress: number;
  health: "normal" | "at_risk" | "delayed";
  status: "planned" | "in_progress" | "completed" | "cancelled";
  linked_issues: string[];
  dependencies: string[];
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface MilestoneFormData {
  title?: string;
  description?: string;
  target_date?: string;
  start_date?: string;
  status?: string;
  linked_issues?: string[];
  dependencies?: string[];
  owner?: string;
  project_key?: string;
}

export const MILESTONE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  planned: { label: "计划中", color: "#909399" },
  in_progress: { label: "进行中", color: "#409eff" },
  completed: { label: "已完成", color: "#67c23a" },
  cancelled: { label: "已取消", color: "#e6a23c" },
};

export const MILESTONE_HEALTH_MAP: Record<string, { label: string; color: string }> = {
  normal: { label: "正常", color: "#67c23a" },
  at_risk: { label: "有风险", color: "#e6a23c" },
  delayed: { label: "延迟", color: "#f56c6c" },
};