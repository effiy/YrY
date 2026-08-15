// ═══════════════════════════════════════════════════════════════════
// OKR 推荐任务字段的展示格式化 — 纯函数，无 Vue 依赖
//
// 把字段原始值映射为标签色 / 展示文案，供 OkrRecommendPanel 与 fields/
// 下的字段级组件共享，避免三视图（表格 / 列表 / 卡片）各自重复实现。
// ═══════════════════════════════════════════════════════════════════
import dayjs from "dayjs";
import { skills } from "@/views/knowledge/skills/constants";
import { LIST_TYPES, type OkrListType, type OkrPriority } from "./okrRecommend";

export type TagType = "primary" | "success" | "danger" | "warning" | "info";

/** 优先级 → el-tag 类型。 */
export function priorityType(p: OkrPriority): TagType {
  return p === "P0" ? "danger" : p === "P1" ? "warning" : p === "P2" ? "primary" : "info";
}

/** 技能 id → 展示标题（取 skills/constants.ts 的 title，未知则原样显示 id）。 */
export function skillLabel(skillId: string): string {
  return skills.find(s => s.id === skillId)?.title ?? skillId;
}

/** MCP 服务器 → 标签色：github 蓝、yiai 绿、无需则灰。 */
export function mcpTagType(mcp: string): TagType {
  return mcp === "github" ? "primary" : mcp === "yiai" ? "success" : "info";
}

export function mcpLabel(mcp: string): string {
  return mcp || "—";
}

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const d = dayjs(dueDate);
  return d.isValid() && d.isBefore(dayjs().startOf("day"));
}

const CATEGORY_TAG: Record<OkrListType, TagType> = {
  daily: "primary",
  weekly: "success",
  risk: "danger",
  sprint: "warning"
};

export function categoryTagType(key: OkrListType): TagType {
  return CATEGORY_TAG[key];
}

export function categoryIcon(key: OkrListType): string {
  return LIST_TYPES.find(l => l.key === key)!.icon;
}
