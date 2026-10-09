/**
 * CommandPalette 共享类型（v2 Gold Copy）。
 *
 * v1 历史：
 *   types.ts 定义的 SearchResult 与后端 unified_search v1、useCommandSearch 离线索引、/search 页返回
 *   的 UnifiedSearchItem 三个 schema 漂移，Jaccard 相似性实测仅 0.31。这是「命令面板搜得到的，
 *   /search 页搜不到」的底层根因之一。
 *
 * v2 原则：
 *   1) 所有搜索（面板 & /search 页 & ⌘. AiSnippet）一律走 UnifiedSearchItem（src/api/modules/searchService.ts）；
 *   2) 本文件只暴露「CommandPalette 渲染时需要额外补充的字段」，不再定义自己的 item schema。
 */

import type { UnifiedSearchItem } from "@/api/modules/searchService";
import type { LinkResolveResult } from "@/utils/linkFactory";

/* ── 渲染层 item ───────────────────────────────────────────────────────────── */
export interface PaletteItem extends UnifiedSearchItem {
  /** 0-based 的当前列表 index（供 ArrowUp/Down 激活高亮） */
  _idx: number;
  /** Gate A resolve 结果（非 ok 时灰卡 + 禁点 + tooltip） */
  _gateA: LinkResolveResult;
  /**
   * Gate B HEAD 预检结果（用户 hover/键盘聚焦时异步 fill）：
   *   undefined = 未测；true = 资源存在；false = 资源不存在
   * B 闸门关闭（gateB 配置项 false）时本字段永远 undefined。
   */
  _gateB?: boolean;
}

/* ── 分组显示 ─────────────────────────────────────────────────────────────── */
export interface PaletteItemGroup {
  /** 组 type key（= backend unified_search 返回的 singular 字典值） */
  type: string;
  /** 展示用的中文分组名（与 /search 页一致） */
  label: string;
  icon: any;       // 兼容 @element-plus/icons-vue 的 Vue Component
  color: string;   // 背景色（与 /search 页 group 配色对齐）
  items: PaletteItem[];
}

/* ── Quick Actions（面板未输入时显示）─────────────────────────────────────── */
export interface QuickAction {
  id: string;
  title: string;
  /** 用户可读的快捷键描述（"⌘⇧N"） */
  shortcut: string;
  /** 点击 action 时会过 Gate A：resolve 的路由 URL */
  route: string;
  icon: any;
  color: string;
  /** 执行操作（默认 router.push）；返回 false 表示执行失败，UI 会 toast 提示 */
  run?: () => void | boolean | Promise<void | boolean>;
}

/* ── 计算器 snippet（直接输入 "100 km to mi" 时直接显示结果）─────────────── */
export interface CalculatorSnippet {
  kind: "calculator";
  expr: string;
  value: number;
  display: string;
}

/* ── Ai Snippet 开关模式（直接输入 "? xxxxx" 走 ai 摘要）─────────────────── */
export interface AiAskSnippet {
  kind: "ai-ask";
  query: string;
}

export type InlineSnippet = CalculatorSnippet | AiAskSnippet;
