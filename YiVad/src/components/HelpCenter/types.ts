/**
 * ============================================================
 *  YiVad HelpOS — Type Contract (Gold Copy, YV-09-70 v2.0)
 * ============================================================
 *
 *  ⚠️ 本文件为 PRD §6.1 的权威 Gold Copy 实现。
 *  任何字段变更必须同时修改：
 *    1) PRD §6.1 类型契约
 *    2) YiKnowledge/projects/yivad/devs/2026-09/35-prd-task-快捷键参考与帮助中心.md §3
 *    3) HelpOS SDK 主版本号（SemVer MAJOR）
 *
 *  禁止：任何与 PRD §6.1 不一致的字段扩展、改名。
 *  CI 门禁：scripts/ci/check-help-types-goldcopy.mjs 会与 PRD 文本 diff 对比。
 */

import type { ShortcutCategory, ShortcutScope } from "@/shortcuts/registry";

/* ── Tab & State ──────────────────────────────────────────────── */
export type HelpTabId =
  | "page-help"
  | "shortcuts"
  | "faq"
  | "changelog"
  | "feedback";

/* ── Shortcut reference (view-model of registry snapshot) ─────── */
export interface ShortcutReference {
  /** 对应 ShortcutRegistry.id */
  readonly id: string;
  /** "Ctrl+S" 形式，已按平台本地化后的展示字符串（见 formatPlatformKeys()） */
  readonly keys: string;
  readonly description: string;
  readonly category: ShortcutCategory;
  readonly scope: ShortcutScope;
  readonly enabled: boolean;
  /** 用户自定义重绑定后非空；优先级高于 keys 展示 */
  readonly overriddenKeys?: string;
  /** 序列快捷键（如 G I 两键） */
  readonly sequence?: readonly string[];
  /** 执行函数，引用 registry 中 handler（scope 合法时调用；scope 非法仅展示） */
  readonly handler?: (event: KeyboardEvent) => void;
}

/* ── Page Help ────────────────────────────────────────────────── */
export interface PageHelpSection {
  readonly heading: string;
  /** Markdown（渲染须通过 SafeMarkdown 白名单） */
  readonly content: string;
  /** 角色过滤（不填 = 全员可见） */
  readonly roleFilter?: ReadonlyArray<"admin" | "member" | "guest">;
}

export interface PageHelpContent {
  /** 路由匹配模式，支持 :param 通配 */
  readonly routePattern: string;
  readonly title: string;
  readonly sections: readonly PageHelpSection[];
  /** 关联 ShortcutRegistry id 列表 */
  readonly relatedShortcutIds: readonly string[];
  readonly relatedLinks: readonly { label: string; route: string }[];
  readonly proTips?: readonly string[];
  readonly locale: "zh" | "en";
}

/* ── FAQ ──────────────────────────────────────────────────────── */
export interface FAQItem {
  readonly id: string;
  readonly question: string;
  /** Markdown（安全渲染） */
  readonly answer: string;
  readonly tags: readonly string[];
  readonly relatedRoutes: readonly string[];
  /** 0-100，越大越靠前 */
  readonly popularity: number;
  readonly updatedAt: string;
}

/* ── Changelog ────────────────────────────────────────────────── */
export type ChangelogSectionType =
  | "feat"
  | "fix"
  | "docs"
  | "refactor"
  | "perf"
  | "chore"
  | "security"
  | "breaking";

export interface ChangelogSection {
  readonly type: ChangelogSectionType;
  readonly description: string;
  readonly prUrl?: string;
  readonly scope?: string;
}

export interface ChangelogEntry {
  /** semver，如 "1.8.3" */
  readonly version: string;
  readonly date: string;
  readonly summary: string;
  readonly sections: readonly ChangelogSection[];
  /** false = Unreleased */
  readonly released: boolean;
}

/* ── Feedback ─────────────────────────────────────────────────── */
export type FeedbackType = "bug" | "feature" | "question" | "other";

export interface FeedbackPayload {
  readonly type: FeedbackType;
  readonly title: string;
  readonly description: string;
  /** 已脱敏：仅保留白名单 Query，删除 fragment；Token 等被 *** 替换 */
  readonly sanitizedUrl: string;
  readonly ua: string;
  readonly screen: { w: number; h: number; dpr: number };
  readonly appVersion: string;
  readonly locale: string;
  readonly yiAiBaseUrl: string;
  /** 可选 base64 PNG/JPEG；≤ 2MB；通过截图打码处理后才允许包含 */
  readonly screenshotDataUrl?: string;
}

export interface FeedbackTicket {
  readonly ticketId: string;
  readonly slaDeadline: string;
  readonly ghUrl?: string;
}

/* ── Search ───────────────────────────────────────────────────── */
export interface HelpSearchResult {
  readonly id: string;
  readonly tab: HelpTabId;
  readonly title: string;
  /** 高亮片段（已注入 <mark>，需 v-html 通过 SafeMarkdown 渲染） */
  readonly snippet: string;
  readonly score: number;
  /** 点击动作：打开对应 Tab 并执行选中（如展开 FAQ、高亮行） */
  readonly open: () => void;
}

/* ── Panel State ──────────────────────────────────────────────── */
export type HelpOSError =
  | { readonly kind: "faq_timeout"; readonly message: string }
  | { readonly kind: "feedback_rejected"; readonly reason: "rate_limited" | "payload_invalid" | "too_large" }
  | { readonly kind: "registry_unavailable" };

export interface HelpOSState {
  readonly open: boolean;
  readonly activeTab: HelpTabId;
  readonly query: string;
  readonly searchSeed?: string;
  readonly feedbackDraft?: Partial<FeedbackPayload>;
  readonly error: HelpOSError | null;
}

/* ── Service / Composable options（YiVad 全局硬参数）─────────── */
export interface HelpRequestOptions {
  /** 毫秒级超时；缺省从 TIMEOUT_CONFIG 推断 */
  readonly timeout?: number;
  /** AbortSignal，联合内部去重控制器（必须 AbortSignal.any([...]) 联合，禁止覆盖） */
  readonly signal?: AbortSignal;
}
