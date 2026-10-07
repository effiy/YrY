/**
 * Shared time formatting utilities.
 *
 * Single source of truth for all relative-time and date formatting in YiVad.
 * Components should import from here instead of defining local formatTime/timeAgo.
 *
 * Usage:
 *   import { timeAgo, formatDate, formatDateTime } from "@/utils/time";
 *   timeAgo(someTimestamp)          // "3m ago"
 *   formatDate("2026-09-23")        // "Sep 23, 2026"
 *   formatDateTime(isoString)       // "Sep 23, 2026 14:31"
 */
import { useI18n } from "vue-i18n";

/** Relative-time thresholds in milliseconds */
const MS = {
  SECOND: 1000,
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
  WEEK: 604_800_000,
  MONTH: 2_592_000_000,
} as const;

/**
 * Parse a timestamp into a Date object. Handles ISO strings, numeric
 * timestamps (ms), and Date objects. Returns null on parse failure.
 */
export function parseTime(value: string | number | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    // Detect second-based Unix timestamps (< 1e10)
    const ms = value < 1e10 ? value * 1000 : value;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string") {
    // Handle "YYYY-MM-DD HH:MM:SS" (space instead of T)
    const d = new Date(value.replace(" ", "T"));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Return a human-readable relative time string.
 *
 * @param value — ISO string, numeric timestamp (ms), or Date
 * @param locale — "en" | "zh" (defaults to "en" if not using i18n)
 *
 * Examples:
 *   timeAgo(Date.now() - 3000)       → "just now" / "刚刚"
 *   timeAgo(Date.now() - 120_000)    → "2m ago" / "2 分钟前"
 *   timeAgo(Date.now() - 7_200_000)  → "2h ago" / "2 小时前"
 *   timeAgo(Date.now() - 172_800_000) → "2d ago" / "2 天前"
 */
export function timeAgo(value: string | number | Date | null | undefined, locale: "en" | "zh" = "en"): string {
  const d = parseTime(value);
  if (!d) return "";

  const diff = Date.now() - d.getTime();

  // Future dates
  if (diff < 0) {
    return locale === "zh" ? "刚刚" : "just now";
  }

  const seconds = Math.floor(diff / MS.SECOND);
  if (seconds < 60) {
    return locale === "zh" ? "刚刚" : "just now";
  }

  const minutes = Math.floor(diff / MS.MINUTE);
  if (minutes < 60) {
    return locale === "zh" ? `${minutes} 分钟前` : `${minutes}m ago`;
  }

  const hours = Math.floor(diff / MS.HOUR);
  if (hours < 24) {
    return locale === "zh" ? `${hours} 小时前` : `${hours}h ago`;
  }

  const days = Math.floor(diff / MS.DAY);
  if (days < 30) {
    return locale === "zh" ? `${days} 天前` : `${days}d ago`;
  }

  // Fallback to formatted date for old items
  return formatDate(d, locale);
}

/**
 * Format a date as a short human-readable string (no time).
 *
 * Examples:
 *   formatDate("2026-09-23") → "Sep 23, 2026" / "2026年9月23日"
 */
export function formatDate(value: string | number | Date | null | undefined, locale: "en" | "zh" = "en"): string {
  const d = parseTime(value);
  if (!d) return "—";

  if (locale === "zh") {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Format a date with time.
 *
 * Examples:
 *   formatDateTime("2026-09-23T14:31:00") → "Sep 23, 2026 14:31"
 */
export function formatDateTime(value: string | number | Date | null | undefined, locale: "en" | "zh" = "en"): string {
  const d = parseTime(value);
  if (!d) return "—";

  const date = formatDate(d, locale);
  const time = d.toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${date} ${time}`;
}

/**
 * Format a duration in milliseconds to human-readable form.
 *
 * Examples:
 *   formatDuration(65000)  → "1m 5s"
 *   formatDuration(3600000) → "1h 0m"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  if (mins < 60) return remainSecs > 0 ? `${mins}m ${remainSecs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}