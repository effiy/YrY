/**
 * Theme Tokens — YiVad 设计系统的单一颜色 token 来源。
 *
 * ## 模块说明
 * 每个主题（light / inverted / dark）是一组 CSS 变量键值对，
 * 由 `useTheme` hook 注入到 `document.documentElement`。
 *
 * ## Token 命名
 * - 不使用数字后缀；按用途命名（`menu-bg`、`menu-text`、`menu-hover-bg`）
 * - Element Plus 变量直接转发，便于定制（如 `--el-color-primary-light-3`）
 * - 设计 tokens 集中存放在 `tokens.ts`，便于 SCSS 消费
 *
 * ## 主题家族
 * - `light`     — 默认浅色主题
 * - `inverted`  — 暗色导航 + 浅色内容（顶部/侧边反色）
 * - `dark`      — 全暗主题
 */

import type { Theme } from "@/hooks/interface";
import { DEFAULT_PRIMARY } from "@/config";
import { lighten as colorLighten, darken as colorDarken, withAlpha as colorWithAlpha } from "@/utils/color";

export type { Theme };

/** 设计常量：Element Plus 默认 EP 色阶（不依赖 --el-color-* 运行时 CSS 变量，
 *  否则当通过 style.setProperty 写入 setProperty("x", "var(--y)") 这种 var 引用链
 *  若与 setProperty 的写入顺序存在竞争，会出现 CSS 自定义属性读取空串的异常，
 *  直接导致 SRE 装饰条、Priority 色块、Status 条等关键视觉失效。
 *
 *  此处以 Element Plus 默认主题（非自定义主色时）为基线。
 *  当用户通过 changePrimary 切换主色时，useTheme.applyBrand 会用新主色覆盖
 *  --el-color-primary 等主色变量，但 warning/success/danger/info 保持恒定；
 *  为兼顾页面语义色与 EP 内部组件一致性，此处统一补齐 warning/success/danger/info 的
 *  base 色 + 三级浅衬色（light-3 / light-5 / light-9），避免首页 Pill、
 *  OKR 推荐面板、AI 对话气泡、表单状态、PetMessage 等 9 个 SCSS 文件里的
 *  var(--el-color-warning/success/danger) 解算为空串。 */
const EP_WARNING = "#e6a23c";
const EP_SUCCESS = "#67c23a";
const EP_DANGER  = "#f56c6c";
const EP_INFO    = "#909399";
/* 语义浅衬色：分别对应 EP 色阶 -3 / -5 / -9。采用 colord 的 lighten，
   与 useTheme.applyBrand 保持一致算法；fallback 为历史近似调色板。 */
const EP_WARNING_L3 = colorLighten(EP_WARNING, 0.3) ?? "#faecd8";
const EP_WARNING_L5 = colorLighten(EP_WARNING, 0.5) ?? "#fdf6ec";
const EP_WARNING_L9 = colorLighten(EP_WARNING, 0.9) ?? "#fdf6ec";
const EP_SUCCESS_L3 = colorLighten(EP_SUCCESS, 0.3) ?? "#e1f3d8";
const EP_SUCCESS_L5 = colorLighten(EP_SUCCESS, 0.5) ?? "#f0f9eb";
const EP_SUCCESS_L9 = colorLighten(EP_SUCCESS, 0.9) ?? "#f0f9eb";
const EP_DANGER_L3  = colorLighten(EP_DANGER,  0.3) ?? "#fde2e2";
const EP_DANGER_L5  = colorLighten(EP_DANGER,  0.5) ?? "#fef0f0";
const EP_DANGER_L9  = colorLighten(EP_DANGER,  0.9) ?? "#fef0f0";
const EP_INFO_L3    = colorLighten(EP_INFO,    0.3) ?? "#e9e9eb";
const EP_INFO_L5    = colorLighten(EP_INFO,    0.5) ?? "#f4f4f5";
const EP_INFO_L9    = colorLighten(EP_INFO,    0.9) ?? "#f4f4f5";
const EP_TEXT_PRIMARY     = "#303133";
const EP_TEXT_REGULAR     = "#606266";
const EP_TEXT_SECONDARY   = "#909399";
const EP_TEXT_PLACEHOLDER = "#a8abb2";
const EP_BORDER           = "#dcdfe6";
const EP_BORDER_LIGHT     = "#e4e7ed";
const EP_BORDER_LIGHTER   = "#ebeef5";
const EP_BORDER_EXTRA_LIGHT = "#f2f6fc";
const EP_FILL             = "#f0f2f5";
const EP_FILL_LIGHT       = "#f5f7fa";
const EP_FILL_LIGHTER     = "#fafafa";
const EP_BG            = "#ffffff";
const EP_BG_PAGE       = "#f2f3f5";
const EP_BG_OVERLAY    = "#ffffff";

/** 基于 base + light 色阶生成 EP 语义语义原色字典（light / inverted 共用一套，
 *  dark 会在其后独立重写）。 */
const EP_SEMANTIC_BASE = {
  "--el-color-warning": EP_WARNING,
  "--el-color-warning-light-3": EP_WARNING_L3,
  "--el-color-warning-light-5": EP_WARNING_L5,
  "--el-color-warning-light-9": EP_WARNING_L9,
  "--el-color-success": EP_SUCCESS,
  "--el-color-success-light-3": EP_SUCCESS_L3,
  "--el-color-success-light-5": EP_SUCCESS_L5,
  "--el-color-success-light-9": EP_SUCCESS_L9,
  "--el-color-danger":  EP_DANGER,
  "--el-color-danger-light-3":  EP_DANGER_L3,
  "--el-color-danger-light-5":  EP_DANGER_L5,
  "--el-color-danger-light-9":  EP_DANGER_L9,
  "--el-color-info":    EP_INFO,
  "--el-color-info-light-3":    EP_INFO_L3,
  "--el-color-info-light-5":    EP_INFO_L5,
  "--el-color-info-light-9":    EP_INFO_L9,
};

/** Element Plus 通用语义化文本 / 边框 / 填充 / 背景色（light 主题）。
 *  此前 YiVad 依赖 EP 默认 theme-chalk 的样式表注入，但在特定构建环境下
 *  这些变量不会被注入到 documentElement（仅注入到组件内部节点），导致
 *  var(--el-text-color-primary) 等在页面级 CSS 上回退为空串。
 *  此处补齐即充当 SSOT：无论 EP 是否输出这些变量，页面都有稳定取值。 */
const EP_COMMON_LIGHT = {
  "--el-text-color-primary":     EP_TEXT_PRIMARY,
  "--el-text-color-regular":     EP_TEXT_REGULAR,
  "--el-text-color-secondary":   EP_TEXT_SECONDARY,
  "--el-text-color-placeholder": EP_TEXT_PLACEHOLDER,
  "--el-border-color":           EP_BORDER,
  "--el-border-color-light":     EP_BORDER_LIGHT,
  "--el-border-color-lighter":   EP_BORDER_LIGHTER,
  "--el-border-color-extra-light": EP_BORDER_EXTRA_LIGHT,
  "--el-fill-color":             EP_FILL,
  "--el-fill-color-light":       EP_FILL_LIGHT,
  "--el-fill-color-lighter":     EP_FILL_LIGHTER,
  "--el-bg-color":               EP_BG,
  "--el-bg-color-page":          EP_BG_PAGE,
  "--el-bg-color-overlay":       EP_BG_OVERLAY,
};

/** 深色主题下的公共 EP 变量（来自 theme-chalk dark 调色板）。 */
const EP_BG_DARK         = "#141414";
const EP_BG_PAGE_DARK    = "#0a0a0a";
const EP_TEXT_PRIMARY_DARK   = "#e5eaf3";
const EP_TEXT_REGULAR_DARK   = "#cfd3dc";
const EP_TEXT_SECONDARY_DARK = "#a3a6ad";
const EP_TEXT_PLACEHOLDER_DARK = "#8d9095";
const EP_BORDER_DARK         = "#414243";
const EP_BORDER_LIGHT_DARK   = "#363637";
const EP_BORDER_LIGHTER_DARK = "#303030";
const EP_BORDER_EXTRA_LIGHT_DARK = "#262727";
const EP_FILL_DARK           = "#1d1e1f";
const EP_FILL_LIGHT_DARK     = "#19191a";
const EP_FILL_LIGHTER_DARK   = "#181818";
const EP_COMMON_DARK = {
  "--el-text-color-primary":     EP_TEXT_PRIMARY_DARK,
  "--el-text-color-regular":     EP_TEXT_REGULAR_DARK,
  "--el-text-color-secondary":   EP_TEXT_SECONDARY_DARK,
  "--el-text-color-placeholder": EP_TEXT_PLACEHOLDER_DARK,
  "--el-border-color":           EP_BORDER_DARK,
  "--el-border-color-light":     EP_BORDER_LIGHT_DARK,
  "--el-border-color-lighter":   EP_BORDER_LIGHTER_DARK,
  "--el-border-color-extra-light": EP_BORDER_EXTRA_LIGHT_DARK,
  "--el-fill-color":             EP_FILL_DARK,
  "--el-fill-color-light":       EP_FILL_LIGHT_DARK,
  "--el-fill-color-lighter":     EP_FILL_LIGHTER_DARK,
  "--el-bg-color":               EP_BG_DARK,
  "--el-bg-color-page":          EP_BG_PAGE_DARK,
  "--el-bg-color-overlay":       "#1b1b1c",
};

/** Theme token 字典（CSS 变量名 → 颜色值）。 */
export type ThemeTokens = Readonly<Record<string, string>>;

// ── 浅色主题 ─────────────────────────────────────────────────────────────

const lightTokens: ThemeTokens = {
  /* ── Brand（用户主色，由 useTheme.changePrimary 覆盖） ── */
  "--el-color-primary": DEFAULT_PRIMARY,
  "--el-color-primary-dark-2": colorDarken(DEFAULT_PRIMARY, 0.2) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-1": colorLighten(DEFAULT_PRIMARY, 0.1) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-3": colorLighten(DEFAULT_PRIMARY, 0.3) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-5": colorLighten(DEFAULT_PRIMARY, 0.5) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-7": colorLighten(DEFAULT_PRIMARY, 0.7) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-8": colorLighten(DEFAULT_PRIMARY, 0.8) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-9": colorLighten(DEFAULT_PRIMARY, 0.9) ?? DEFAULT_PRIMARY,

  /* ── Element Plus 语义原色（warning/success/danger/info + text/border/fill/bg）
   *   补齐原因：EP 默认样式并不保证这些变量被写入 documentElement，
   *   当 YiVad 页面级 SCSS 消费 var(--el-color-warning) 等时会出现空串解算，
   *   使 Pill、气泡、表单验证、状态色失效。统一写在 tokens 里作为 SSOT。*/
  ...(EP_SEMANTIC_BASE as ThemeTokens),
  ...(EP_COMMON_LIGHT as ThemeTokens),

  /* ── YiVad Semantic Layer（单一 SSOT，跨页面共享；首页/OKR/Bug 等都从此派生） ──
   *  命名：<domain>-<role>-<variant>，一律语义化，禁止数字后缀。
   */
  // Status 4 色（SRE 灯带、RAG 红绿灯、Severity 分级通用）
  "--ho-status-danger":  colorWithAlpha("#ef4444", 1) ?? "#ef4444",
  "--ho-status-major":   colorWithAlpha("#ea580c", 1) ?? "#ea580c",
  "--ho-status-warn":    colorWithAlpha(EP_WARNING, 1) ?? EP_WARNING,
  "--ho-status-clear":   colorWithAlpha("#10b981", 1) ?? "#10b981",
  // Status 背景衬色（卡片/表格/横幅用）
  "--ho-bg-danger":      colorWithAlpha("#ef4444", 0.05) ?? "#fef2f2",
  "--ho-bg-major":       colorWithAlpha("#ea580c", 0.05) ?? "#fff7ed",
  "--ho-bg-warn":        EP_WARNING_L9,
  "--ho-bg-clear":       colorWithAlpha("#10b981", 0.06) ?? "#ecfdf5",
  // Issue 状态色（与 Element Plus 典型状态色对齐，但独立 SSOT 便于日后微调）
  "--ho-st-todo":        EP_TEXT_SECONDARY,
  "--ho-st-wip":         colorWithAlpha("#5ab1ef", 1) ?? "#5ab1ef",
  "--ho-st-review":      colorWithAlpha(EP_WARNING, 1) ?? EP_WARNING,
  "--ho-st-done":        colorWithAlpha(EP_SUCCESS, 1) ?? EP_SUCCESS,
  "--ho-st-backlog":     colorWithAlpha("#9a60b4", 1) ?? "#9a60b4",
  "--ho-st-cancel":      colorWithAlpha("#ee6666", 1) ?? "#ee6666",
  // Priority P0-P4 色块（优先级条、标签、Heatmap 通用）
  "--ho-pri-p0":         colorWithAlpha(EP_DANGER, 1) ?? EP_DANGER,
  "--ho-pri-p1":         colorWithAlpha(EP_WARNING, 1) ?? EP_WARNING,
  "--ho-pri-p2":         "var(--el-color-primary)",
  "--ho-pri-p3":         EP_TEXT_SECONDARY,
  "--ho-pri-p4":         EP_TEXT_PLACEHOLDER,
  // OKR 强调色（进度/表头）与底色
  "--ho-okr-active":     colorWithAlpha("#2563eb", 1) ?? "#2563eb",
  "--ho-okr-active-bg":  colorWithAlpha("#2563eb", 0.06) ?? "#eff6ff",
  // 首页 Focus 紫色系（OKR/Focus 卡片的强调色、标签背景、装饰边）
  "--ho-accent-focus":   colorWithAlpha("#6366f1", 1) ?? "#6366f1",
  "--ho-accent-focus-bg":colorWithAlpha("#6366f1", 0.06) ?? "#eef2ff",
  "--ho-accent-focus-strong":  colorWithAlpha("#4338ca", 1) ?? "#4338ca",
  "--ho-accent-focus-soft":    colorWithAlpha("#8b5cf6", 1) ?? "#8b5cf6",
  "--ho-accent-focus-soft-bg": colorWithAlpha("#8b5cf6", 0.08) ?? "#ede9fe",
  // 专业分类色（角色/团队卡片，每类一对「主色 + 浅衬色」）
  "--ho-cat-exec-fg": "var(--ho-okr-active)",
  "--ho-cat-exec-bg": "var(--ho-okr-active-bg)",
  "--ho-cat-lead-fg":    colorWithAlpha("#6d28d9", 1) ?? "#6d28d9",
  "--ho-cat-lead-bg":    colorWithAlpha("#6d28d9", 0.08) ?? "#ede9fe",
  "--ho-cat-eng-fg":     colorWithAlpha("#1d4ed8", 1) ?? "#1d4ed8",
  "--ho-cat-eng-bg":     colorWithAlpha("#1d4ed8", 0.08) ?? "#dbeafe",
  "--ho-cat-sre-fg":     "var(--ho-status-warn)",
  "--ho-cat-sre-bg":     "var(--ho-bg-warn)",
  "--ho-cat-ai-fg":      colorWithAlpha("#15803d", 1) ?? "#15803d",
  "--ho-cat-ai-bg":      colorWithAlpha("#15803d", 0.08) ?? "#dcfce7",
  "--ho-cat-prod-fg":    colorWithAlpha("#b91c1c", 1) ?? "#b91c1c",
  "--ho-cat-prod-bg":    colorWithAlpha("#b91c1c", 0.08) ?? "#fee2e2",
  "--ho-cat-curator-fg": colorWithAlpha("#92400e", 1) ?? "#92400e",
  "--ho-cat-curator-bg": colorWithAlpha("#92400e", 0.08) ?? "#fef3c7",
  // 信号/决策/红线 色
  "--ho-sem-signal-fg":  "var(--ho-accent-focus-soft)",
  "--ho-sem-signal-bg":  "var(--ho-accent-focus-soft-bg)",
  "--ho-sem-decision-fg":colorWithAlpha("#0284c7", 1) ?? "#0284c7",
  "--ho-sem-decision-bg":colorWithAlpha("#0284c7", 0.08) ?? "#dbeafe",
  "--ho-sem-redline-fg": "var(--ho-status-danger)",
  "--ho-sem-redline-bg": "var(--ho-bg-danger)",
  // Activity icon 系列色（.ho-activity__icon 的 is-col-* 与 pill 的 is-col-* 共享的语义 token）
  "--ho-col-cross-fg":   colorWithAlpha("#8b5cf6", 1) ?? "#8b5cf6",
  "--ho-col-cross-bg":   colorWithAlpha("#8b5cf6", 0.08) ?? "#ede9fe",
  "--ho-col-perf-fg":    colorWithAlpha("#0891b2", 1) ?? "#0891b2",
  "--ho-col-perf-bg":    colorWithAlpha("#0891b2", 0.08) ?? "#cffafe",
  "--ho-col-kb-fg":      colorWithAlpha("#0d9488", 1) ?? "#0d9488",
  "--ho-col-kb-bg":      colorWithAlpha("#0d9488", 0.08) ?? "#ccfbf1",
  "--ho-col-okr-fg":     colorWithAlpha("#0284c7", 1) ?? "#0284c7",
  "--ho-col-okr-bg":     colorWithAlpha("#0284c7", 0.08) ?? "#e0f2fe",
  "--ho-col-rd-fg":      colorWithAlpha("#dc2626", 1) ?? "#dc2626",
  "--ho-col-rd-bg":      colorWithAlpha("#dc2626", 0.08) ?? "#fee2e2",
  "--ho-col-focus-fg":   "var(--ho-accent-focus-strong)",
  "--ho-col-focus-bg":   "var(--ho-accent-focus-bg)",
  "--ho-col-risk-fg":    colorWithAlpha("#ea580c", 1) ?? "#ea580c",
  "--ho-col-risk-bg":    colorWithAlpha("#ea580c", 0.08) ?? "#fff7ed",
  "--ho-col-action-fg":  colorWithAlpha("#2563eb", 1) ?? "#2563eb",
  "--ho-col-action-bg":  colorWithAlpha("#2563eb", 0.08) ?? "#dbeafe",
  "--ho-col-score-fg":   colorWithAlpha("#7c3aed", 1) ?? "#7c3aed",
  "--ho-col-score-bg":   colorWithAlpha("#7c3aed", 0.08) ?? "#ede9fe",
  // 语义化「状态/质量」辅助色（pill 的 is-col-quality 与 is-col-func）
  "--ho-quality-fg":     colorWithAlpha("#047857", 1) ?? "#047857",
  "--ho-quality-bg":     "var(--ho-bg-clear)",
  "--ho-interface-fg":   colorWithAlpha("#1d4ed8", 1) ?? "#1d4ed8",
  "--ho-interface-bg":   colorWithAlpha("#1d4ed8", 0.08) ?? "#dbeafe",
  "--ho-perf-fg":        colorWithAlpha("#155e75", 1) ?? "#155e75",
  "--ho-perf-bg":        colorWithAlpha("#0891b2", 0.08) ?? "#cffafe",
  "--ho-quality-pill-fg":colorWithAlpha("#047857", 1) ?? "#047857",
  // 退化/降级提示色
  "--ho-muted-fg":       colorWithAlpha("#94a3b8", 1) ?? "#94a3b8",
  "--ho-muted-bg":       colorWithAlpha("#94a3b8", 0.08) ?? "#f1f5f9",
  // 通用 surface（卡片悬浮阴影底、头像色、表格 header 等）
  "--ho-surface-hover":  EP_FILL_LIGHT,
  "--ho-shadow-card":    "0 4px 14px rgb(0 0 0 / 5%)",
  "--ho-shadow-soft":    "0 2px 6px rgb(0 0 0 / 4%)",
  // Surface 背景：知识区卡片底色
  "--ho-surface-kb-bg":  colorWithAlpha("#6366f1", 0.04) ?? "#fafbff",

  /* ── Menu ── */
  "--el-menu-bg-color": "#ffffff",
  "--el-menu-hover-bg-color": "#f5f7fa",
  "--el-menu-active-bg-color": "var(--el-color-primary-light-9)",
  "--el-menu-text-color": "#303133",
  "--el-menu-active-color": "var(--el-color-primary)",
  "--el-menu-hover-text-color": "#409eff",
  "--el-menu-horizontal-sub-item-height": "50px",

  /* ── Aside ── */
  "--el-aside-logo-text-color": "#303133",
  "--el-aside-border-color": "#e4e7ed",

  /* ── Header ── */
  "--el-header-logo-text-color": "#303133",
  "--el-header-bg-color": "#ffffff",
  "--el-header-text-color": "#303133",
  "--el-header-text-color-regular": "#606266",
  "--el-header-border-color": "#e4e7ed",
};

// ── 反色主题（侧边/顶部使用深色，主体保持浅色） ─────────────────────────
const invertedTokens: ThemeTokens = {
  /* ── Brand ── */
  "--el-color-primary": DEFAULT_PRIMARY,
  "--el-color-primary-dark-2": colorDarken(DEFAULT_PRIMARY, 0.15) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-1": colorLighten(DEFAULT_PRIMARY, 0.1) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-3": colorLighten(DEFAULT_PRIMARY, 0.3) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-5": colorLighten(DEFAULT_PRIMARY, 0.5) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-7": colorLighten(DEFAULT_PRIMARY, 0.7) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-8": colorLighten(DEFAULT_PRIMARY, 0.8) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-9": colorLighten(DEFAULT_PRIMARY, 0.9) ?? DEFAULT_PRIMARY,

  /* ── Element Plus 语义原色（与 light 保持同套 EP 默认色阶，
   *   因为 inverted 仅导航是深色，正文仍为浅色内容区）。*/
  ...(EP_SEMANTIC_BASE as ThemeTokens),
  ...(EP_COMMON_LIGHT as ThemeTokens),

  /* ── YiVad Semantic Layer（反色主题下，语义色保持与 light 一致，用于首页/知识页） ── */
  "--ho-status-danger":  colorWithAlpha("#ef4444", 1) ?? "#ef4444",
  "--ho-status-major":   colorWithAlpha("#ea580c", 1) ?? "#ea580c",
  "--ho-status-warn":    colorWithAlpha(EP_WARNING, 1) ?? EP_WARNING,
  "--ho-status-clear":   colorWithAlpha("#10b981", 1) ?? "#10b981",
  "--ho-bg-danger":      colorWithAlpha("#ef4444", 0.06) ?? "#fef2f2",
  "--ho-bg-major":       colorWithAlpha("#ea580c", 0.06) ?? "#fff7ed",
  "--ho-bg-warn":        EP_WARNING_L9,
  "--ho-bg-clear":       colorWithAlpha("#10b981", 0.07) ?? "#ecfdf5",
  "--ho-st-todo":        EP_TEXT_SECONDARY,
  "--ho-st-wip":         colorWithAlpha("#5ab1ef", 1) ?? "#5ab1ef",
  "--ho-st-review":      colorWithAlpha(EP_WARNING, 1) ?? EP_WARNING,
  "--ho-st-done":        colorWithAlpha(EP_SUCCESS, 1) ?? EP_SUCCESS,
  "--ho-st-backlog":     colorWithAlpha("#9a60b4", 1) ?? "#9a60b4",
  "--ho-st-cancel":      colorWithAlpha("#ee6666", 1) ?? "#ee6666",
  "--ho-pri-p0":         colorWithAlpha(EP_DANGER, 1) ?? EP_DANGER,
  "--ho-pri-p1":         colorWithAlpha(EP_WARNING, 1) ?? EP_WARNING,
  "--ho-pri-p2":         "var(--el-color-primary)",
  "--ho-pri-p3":         EP_TEXT_SECONDARY,
  "--ho-pri-p4":         EP_TEXT_PLACEHOLDER,
  "--ho-okr-active":     colorWithAlpha("#3b82f6", 1) ?? "#3b82f6",
  "--ho-okr-active-bg":  colorWithAlpha("#3b82f6", 0.08) ?? "#eff6ff",
  "--ho-accent-focus":   colorWithAlpha("#6366f1", 1) ?? "#6366f1",
  "--ho-accent-focus-bg":colorWithAlpha("#6366f1", 0.08) ?? "#eef2ff",
  "--ho-accent-focus-strong":  colorWithAlpha("#4338ca", 1) ?? "#4338ca",
  "--ho-accent-focus-soft":    colorWithAlpha("#8b5cf6", 1) ?? "#8b5cf6",
  "--ho-accent-focus-soft-bg": colorWithAlpha("#8b5cf6", 0.1) ?? "#ede9fe",
  "--ho-cat-exec-fg": "var(--ho-okr-active)",
  "--ho-cat-exec-bg": "var(--ho-okr-active-bg)",
  "--ho-cat-lead-fg":    colorWithAlpha("#7c3aed", 1) ?? "#7c3aed",
  "--ho-cat-lead-bg":    colorWithAlpha("#7c3aed", 0.1) ?? "#ede9fe",
  "--ho-cat-eng-fg":     colorWithAlpha("#2563eb", 1) ?? "#2563eb",
  "--ho-cat-eng-bg":     colorWithAlpha("#2563eb", 0.1) ?? "#dbeafe",
  "--ho-cat-sre-fg":     "var(--ho-status-warn)",
  "--ho-cat-sre-bg":     "var(--ho-bg-warn)",
  "--ho-cat-ai-fg":      colorWithAlpha("#16a34a", 1) ?? "#16a34a",
  "--ho-cat-ai-bg":      colorWithAlpha("#16a34a", 0.1) ?? "#dcfce7",
  "--ho-cat-prod-fg":    colorWithAlpha("#dc2626", 1) ?? "#dc2626",
  "--ho-cat-prod-bg":    colorWithAlpha("#dc2626", 0.1) ?? "#fee2e2",
  "--ho-cat-curator-fg": colorWithAlpha("#b45309", 1) ?? "#b45309",
  "--ho-cat-curator-bg": colorWithAlpha("#b45309", 0.1) ?? "#fef3c7",
  "--ho-sem-signal-fg":  "var(--ho-accent-focus-soft)",
  "--ho-sem-signal-bg":  "var(--ho-accent-focus-soft-bg)",
  "--ho-sem-decision-fg":colorWithAlpha("#0284c7", 1) ?? "#0284c7",
  "--ho-sem-decision-bg":colorWithAlpha("#0284c7", 0.1) ?? "#dbeafe",
  "--ho-sem-redline-fg": "var(--ho-status-danger)",
  "--ho-sem-redline-bg": "var(--ho-bg-danger)",
  // Activity icon 系列色（inverted 下仍采用浅衬底/深前景；与 light 的 SSOT 保持同命名）
  "--ho-col-cross-fg":   colorWithAlpha("#8b5cf6", 1) ?? "#8b5cf6",
  "--ho-col-cross-bg":   colorWithAlpha("#8b5cf6", 0.1) ?? "#ede9fe",
  "--ho-col-perf-fg":    colorWithAlpha("#0891b2", 1) ?? "#0891b2",
  "--ho-col-perf-bg":    colorWithAlpha("#0891b2", 0.1) ?? "#cffafe",
  "--ho-col-kb-fg":      colorWithAlpha("#0d9488", 1) ?? "#0d9488",
  "--ho-col-kb-bg":      colorWithAlpha("#0d9488", 0.1) ?? "#ccfbf1",
  "--ho-col-okr-fg":     colorWithAlpha("#0284c7", 1) ?? "#0284c7",
  "--ho-col-okr-bg":     colorWithAlpha("#0284c7", 0.1) ?? "#e0f2fe",
  "--ho-col-rd-fg":      colorWithAlpha("#dc2626", 1) ?? "#dc2626",
  "--ho-col-rd-bg":      colorWithAlpha("#dc2626", 0.1) ?? "#fee2e2",
  "--ho-col-focus-fg":   "var(--ho-accent-focus-strong)",
  "--ho-col-focus-bg":   "var(--ho-accent-focus-bg)",
  "--ho-col-risk-fg":    colorWithAlpha("#ea580c", 1) ?? "#ea580c",
  "--ho-col-risk-bg":    colorWithAlpha("#ea580c", 0.1) ?? "#fff7ed",
  "--ho-col-action-fg":  colorWithAlpha("#2563eb", 1) ?? "#2563eb",
  "--ho-col-action-bg":  colorWithAlpha("#2563eb", 0.1) ?? "#dbeafe",
  "--ho-col-score-fg":   colorWithAlpha("#7c3aed", 1) ?? "#7c3aed",
  "--ho-col-score-bg":   colorWithAlpha("#7c3aed", 0.1) ?? "#ede9fe",
  // 语义化「状态/质量」辅助色（pill 的 is-col-quality 与 is-col-func）
  "--ho-quality-fg":     colorWithAlpha("#047857", 1) ?? "#047857",
  "--ho-quality-bg":     "var(--ho-bg-clear)",
  "--ho-interface-fg":   colorWithAlpha("#1d4ed8", 1) ?? "#1d4ed8",
  "--ho-interface-bg":   colorWithAlpha("#1d4ed8", 0.1) ?? "#dbeafe",
  "--ho-perf-fg":        colorWithAlpha("#155e75", 1) ?? "#155e75",
  "--ho-perf-bg":        colorWithAlpha("#0891b2", 0.1) ?? "#cffafe",
  "--ho-muted-fg":       colorWithAlpha("#94a3b8", 1) ?? "#94a3b8",
  "--ho-muted-bg":       colorWithAlpha("#94a3b8", 0.1) ?? "#f1f5f9",
  "--ho-surface-hover":  EP_FILL_LIGHT,
  "--ho-shadow-card":    "0 4px 14px rgb(0 0 0 / 8%)",
  "--ho-shadow-soft":    "0 2px 6px rgb(0 0 0 / 6%)",
  "--ho-surface-kb-bg":  colorWithAlpha("#6366f1", 0.06) ?? "#fafbff",

  /* ── Menu（深色） ── */
  "--el-menu-bg-color": "#191a20",
  "--el-menu-hover-bg-color": "#000000",
  "--el-menu-active-bg-color": "#000000",
  "--el-menu-text-color": "#bdbdc0",
  "--el-menu-active-color": "#ffffff",
  "--el-menu-hover-text-color": "#ffffff",
  "--el-menu-horizontal-sub-item-height": "50px",

  /* ── Aside ── */
  "--el-aside-logo-text-color": "#dadada",
  "--el-aside-border-color": "#414243",

  /* ── Header（深色） ── */
  "--el-header-logo-text-color": "#dadada",
  "--el-header-bg-color": "#191a20",
  "--el-header-text-color": "#e5eaf3",
  "--el-header-text-color-regular": "#cfd3dc",
  "--el-header-border-color": "#414243",
};

// ── 全暗主题 ─────────────────────────────────────────────────────────────

const darkTokens: ThemeTokens = {
  /* ── Brand（暗背景下保持主色饱和度，提升亮度） ── */
  "--el-color-primary": colorLighten(DEFAULT_PRIMARY, 0.15) ?? DEFAULT_PRIMARY,
  "--el-color-primary-dark-2": colorLighten(DEFAULT_PRIMARY, 0.05) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-1": colorLighten(DEFAULT_PRIMARY, 0.2) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-3": colorLighten(DEFAULT_PRIMARY, 0.4) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-5": colorLighten(DEFAULT_PRIMARY, 0.55) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-7": colorLighten(DEFAULT_PRIMARY, 0.7) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-8": colorLighten(DEFAULT_PRIMARY, 0.8) ?? DEFAULT_PRIMARY,
  "--el-color-primary-light-9": colorLighten(DEFAULT_PRIMARY, 0.9) ?? DEFAULT_PRIMARY,

  /* ── Element Plus 语义原色 + 公共色（dark 版） ──
   *   注意：深色下 warning/success/danger/info 的 base 与 light-3/5/9 仍然保持与
   *   light 相同，因为语义色（红绿灯）的识别度来源于色相而非亮度；只有 text/border/
   *   fill/bg 改为 EP 的 dark 调色板（即 EP_COMMON_DARK + EP_SEMANTIC_BASE）。*/
  ...(EP_SEMANTIC_BASE as ThemeTokens),
  ...(EP_COMMON_DARK as ThemeTokens),

  /* ── Menu（全暗） ── */
  "--el-menu-bg-color": "#141414",
  "--el-menu-hover-bg-color": "#000000",
  "--el-menu-active-bg-color": "#000000",
  "--el-menu-text-color": "#bdbdc0",
  "--el-menu-active-color": "#ffffff",
  "--el-menu-hover-text-color": "#ffffff",
  "--el-menu-horizontal-sub-item-height": "50px",

  /* ── Aside ── */
  "--el-aside-logo-text-color": "#dadada",
  "--el-aside-border-color": "#414243",

  /* ── Header ── */
  "--el-header-logo-text-color": "#dadada",
  "--el-header-bg-color": "#141414",
  "--el-header-text-color": "#e5eaf3",
  "--el-header-text-color-regular": "#cfd3dc",
  "--el-header-border-color": "#414243",
};

/** 主题 token 表。键名与 Theme.ThemeType 严格对应。 */
export const themeTokens: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: lightTokens,
  inverted: invertedTokens,
  dark: darkTokens,
};

// ── 旧菜单/侧边/顶部分文件（保留以兼容外部导入） ─────────────────────────

/**
 * @deprecated 使用 `themeTokens` 统一管理；该常量保留以便渐进迁移。
 */
export const menuTheme: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: {
    "--el-menu-bg-color": lightTokens["--el-menu-bg-color"]!,
    "--el-menu-hover-bg-color": lightTokens["--el-menu-hover-bg-color"]!,
    "--el-menu-active-bg-color": lightTokens["--el-menu-active-bg-color"]!,
    "--el-menu-text-color": lightTokens["--el-menu-text-color"]!,
    "--el-menu-active-color": lightTokens["--el-menu-active-color"]!,
    "--el-menu-hover-text-color": lightTokens["--el-menu-hover-text-color"]!,
    "--el-menu-horizontal-sub-item-height":
      lightTokens["--el-menu-horizontal-sub-item-height"]!,
  },
  inverted: {
    "--el-menu-bg-color": invertedTokens["--el-menu-bg-color"]!,
    "--el-menu-hover-bg-color": invertedTokens["--el-menu-hover-bg-color"]!,
    "--el-menu-active-bg-color": invertedTokens["--el-menu-active-bg-color"]!,
    "--el-menu-text-color": invertedTokens["--el-menu-text-color"]!,
    "--el-menu-active-color": invertedTokens["--el-menu-active-color"]!,
    "--el-menu-hover-text-color": invertedTokens["--el-menu-hover-text-color"]!,
    "--el-menu-horizontal-sub-item-height":
      invertedTokens["--el-menu-horizontal-sub-item-height"]!,
  },
  dark: {
    "--el-menu-bg-color": darkTokens["--el-menu-bg-color"]!,
    "--el-menu-hover-bg-color": darkTokens["--el-menu-hover-bg-color"]!,
    "--el-menu-active-bg-color": darkTokens["--el-menu-active-bg-color"]!,
    "--el-menu-text-color": darkTokens["--el-menu-text-color"]!,
    "--el-menu-active-color": darkTokens["--el-menu-active-color"]!,
    "--el-menu-hover-text-color": darkTokens["--el-menu-hover-text-color"]!,
    "--el-menu-horizontal-sub-item-height":
      darkTokens["--el-menu-horizontal-sub-item-height"]!,
  },
};

/**
 * @deprecated 使用 `themeTokens` 统一管理。
 */
export const asideTheme: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: {
    "--el-aside-logo-text-color": lightTokens["--el-aside-logo-text-color"]!,
    "--el-aside-border-color": lightTokens["--el-aside-border-color"]!,
  },
  inverted: {
    "--el-aside-logo-text-color": invertedTokens["--el-aside-logo-text-color"]!,
    "--el-aside-border-color": invertedTokens["--el-aside-border-color"]!,
  },
  dark: {
    "--el-aside-logo-text-color": darkTokens["--el-aside-logo-text-color"]!,
    "--el-aside-border-color": darkTokens["--el-aside-border-color"]!,
  },
};

/**
 * @deprecated 使用 `themeTokens` 统一管理。
 */
export const headerTheme: Readonly<Record<Theme.ThemeType, ThemeTokens>> = {
  light: {
    "--el-header-logo-text-color": lightTokens["--el-header-logo-text-color"]!,
    "--el-header-bg-color": lightTokens["--el-header-bg-color"]!,
    "--el-header-text-color": lightTokens["--el-header-text-color"]!,
    "--el-header-text-color-regular": lightTokens["--el-header-text-color-regular"]!,
    "--el-header-border-color": lightTokens["--el-header-border-color"]!,
  },
  inverted: {
    "--el-header-logo-text-color": invertedTokens["--el-header-logo-text-color"]!,
    "--el-header-bg-color": invertedTokens["--el-header-bg-color"]!,
    "--el-header-text-color": invertedTokens["--el-header-text-color"]!,
    "--el-header-text-color-regular": invertedTokens["--el-header-text-color-regular"]!,
    "--el-header-border-color": invertedTokens["--el-header-border-color"]!,
  },
  dark: {
    "--el-header-logo-text-color": darkTokens["--el-header-logo-text-color"]!,
    "--el-header-bg-color": darkTokens["--el-header-bg-color"]!,
    "--el-header-text-color": darkTokens["--el-header-text-color"]!,
    "--el-header-text-color-regular": darkTokens["--el-header-text-color-regular"]!,
    "--el-header-border-color": darkTokens["--el-header-border-color"]!,
  },
};

/** 重新导出颜色工具，便于主题模块独立使用。 */
export { colorLighten as lighten, colorDarken as darken, colorWithAlpha as withAlpha };