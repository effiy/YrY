import type { Component } from "vue";
import {
  Setting, User, Cpu, Warning, Tickets, Folder,
  Collection, WarningFilled, Document, CircleCheck,
  Clock, Loading
} from "@element-plus/icons-vue";

/** Standard element-plus tag types */
export type TagType = "success" | "warning" | "info" | "primary" | "danger";

/** Severity to color mapping used in bug, issue, and kanban views */
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#f56c6c",
  major: "#e6a23c",
  minor: "#409eff",
  trivial: "#909399"
};

export function severityColor(s: string): string {
  return SEVERITY_COLORS[s] || "#909399";
}

/** Bug-specific tag types */
export function severityTagType(s: string): TagType {
  const m: Record<string, TagType> = { critical: "danger", major: "warning", minor: "info", trivial: "info" };
  return m[s] || "info";
}

export function priorityTagType(p: string): TagType {
  const m: Record<string, TagType> = { p0: "danger", p1: "warning", p2: "info", p3: "info", urgent: "danger", high: "warning", medium: "info", low: "info", none: "info" };
  return m[p] || "info";
}

export function statusTagType(s: string): TagType {
  const m: Record<string, TagType> = {
    open: "primary", in_progress: "warning", in_review: "warning",
    resolved: "success", closed: "info", rejected: "danger", reopened: "warning",
    done: "success", cancelled: "info", backlog: "info", todo: "primary",
    active: "success", archived: "info", planned: "info", completed: "success"
  };
  return m[s] || "info";
}

export function frequencyTagType(f: string): TagType {
  const m: Record<string, TagType> = {
    always: "danger", sometimes: "warning", rarely: "info", once: "primary", unable: "info"
  };
  return m[f] || "info";
}

/** Progress/quality bar color */
export function progressColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

/** Notification-specific icon and color helpers */
export const NOTIFICATION_ICONS: Record<string, Component> = {
  system: Setting, user_action: User, ai: Cpu, error: Warning
};

export const NOTIFICATION_COLORS: Record<string, string> = {
  system: "#409eff", user_action: "#67c23a", ai: "#e6a23c", error: "#f56c6c"
};

export function notificationIcon(type: string): Component {
  return NOTIFICATION_ICONS[type] || Setting;
}

export function notificationColor(type: string): string {
  return NOTIFICATION_COLORS[type] || "#909399";
}

/** Type icons for search/global use */
export const TYPE_ICONS: Record<string, Component> = {
  issue: Tickets, project: Folder, module: Collection,
  bug: WarningFilled, page: Document
};

export function typeIcon(type: string): Component {
  return TYPE_ICONS[type] || Document;
}

/** Format relative time */
export { timeAgo as formatRelativeTime } from "@/utils/time";

/** Truncate markdown-like text to plain text */
export function truncatePlainText(text: string, maxLen: number = 160): string {
  const plain = text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/>\s/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
}

/** Keyboard shortcut display helpers */
export const SHORTCUTS = {
  globalSearch: "⌘K",
  focusSearch: "/",
  newItem: "N",
  save: "⌘S",
  escape: "Esc"
} as const;