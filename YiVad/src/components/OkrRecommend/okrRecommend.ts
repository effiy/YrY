// ═══════════════════════════════════════════════════════════════════
// OKR 推荐任务 — 主入口（barrel re-export）
//
// 拆分后各文件职责：
//   okrTypes.ts   — 类型定义 + 常量
//   okrUtils.ts   — 评分 / 序列化 / 知识库持久化
//   okrApi.ts     — AI 提示语 + 输出解析
//   okrRecommend.ts — 本文件（向后兼容的统一入口）
// ═══════════════════════════════════════════════════════════════════

// Types & constants
export {
  LIST_TYPES,
  VALID_EFFORT,
  VALID_LEVEL,
  VALID_PRIORITY,
  type KeyResult,
  type GoalItem,
  type MetricItem,
  type DailyRoleData,
  type WeeklyItem,
  type WeeklyRoleData,
  type RoleMeta,
  type OkrMetadataContext,
  type OkrListType,
  type OkrScope,
  type OkrPriority,
  type OkrLevel,
  type OkrTaskItem,
  type OkrRecommendResult,
  type OkrListMeta,
  type OkrActionItem,
  type ApiExampleTask
} from "./okrTypes";

// Utility functions
export {
  rd,
  gd,
  md,
  amm,
  gmm,
  rdd,
  rwd,
  getGoalMetrics,
  clampLevel,
  urgencyFromDue,
  scoreTask,
  priorityFromScore,
  clampPriority,
  clampEffort,
  resolveMetric,
  roleMeta,
  metricToMeta,
  metricFromMeta,
  toNumber,
  taskToMeta,
  taskFromMeta,
  actionItemFromMeta,
  exampleTaskToActionItem
} from "./okrUtils";

// AI prompt & parsing
export {
  OKR_SYSTEM_PROMPT,
  buildSingleItemPrompt,
  buildActionItemPrompt,
  buildListPrompt,
  parseRecommendation,
  parseActionItem
} from "./okrApi";