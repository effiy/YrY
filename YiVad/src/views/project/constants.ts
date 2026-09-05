export const STATUS_COLORS = {
  active: "#67c23a",
  archived: "#909399",
  planning: "#409eff",
  in_progress: "#e6a23c",
  done: "#67c23a",
  cancelled: "#f56c6c",
} as const;

export const PRIORITY_COLORS = {
  urgent: "#f56c6c",
  high: "#e6a23c",
  medium: "#409eff",
  low: "#909399",
  none: "#c0c4cc",
} as const;

export const RISK_COLORS = {
  overdue: "#f56c6c",
  stalled: "#e6a23c",
  unassigned: "#409eff",
  noActivity: "#909399",
} as const;

export const HEALTH_COLORS = {
  good: "#67c23a",
  warn: "#e6a23c",
  poor: "#f56c6c",
} as const;