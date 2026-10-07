import { computed, type Ref, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";

/**
 * Shared formatting/comparison helpers used across all RSS manager sections.
 * Pure utility functions that don't own reactive state.
 */
export function useFormatting() {
  const { t, locale } = useI18n();
  const localeTag = computed(() => (locale.value === "zh" ? "zh-CN" : "en-US"));

  function errorMessage(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
  }

  function formatDate(raw?: string): string {
    if (!raw) return "-";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw.slice(0, 10);
      return d.toLocaleDateString(localeTag.value, { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return raw.slice(0, 10);
    }
  }

  function formatRelativeTime(raw?: string): string {
    if (!raw) return "-";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw.slice(0, 10);
      const diff = Date.now() - d.getTime();
      if (diff < 60000) return t("rss.manager.time.justNow");
      if (diff < 3600000) return t("rss.manager.time.minutesAgo", { n: Math.round(diff / 60000) });
      if (diff < 86400000) return t("rss.manager.time.hoursAgo", { n: Math.round(diff / 3600000) });
      if (diff < 604800000) return t("rss.manager.time.daysAgo", { n: Math.round(diff / 86400000) });
      return d.toLocaleDateString(localeTag.value, { month: "2-digit", day: "2-digit" });
    } catch {
      return raw.slice(0, 10);
    }
  }

  function formatTime(d: Date): string {
    return d.toLocaleString(localeTag.value, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function formatTimeAgo(ts?: number): string {
    if (!ts) return "-";
    const diff = Date.now() - ts;
    if (diff < 60000) return t("rss.manager.time.justNow");
    if (diff < 3600000) return t("rss.manager.time.minutesAgo", { n: Math.round(diff / 60000) });
    if (diff < 86400000) return t("rss.manager.time.hoursAgo", { n: Math.round(diff / 3600000) });
    return t("rss.manager.time.daysAgo", { n: Math.round(diff / 86400000) });
  }

  function formatInterval(seconds: number): string {
    if (!seconds || seconds <= 0) return "-";
    if (seconds < 120) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  }

  function stripHtml(html: string): string {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  function trimSummary(summary: string): string {
    const text = stripHtml(summary);
    return text.length > 120 ? text.slice(0, 120) + "\u2026" : text;
  }

  function subCategory(cat?: string): string {
    if (!cat) return "";
    const idx = cat.indexOf("/");
    return idx >= 0 ? cat.slice(idx + 1) : "";
  }

  function roleFromCategory(cat?: string): string {
    if (!cat) return "";
    return cat.split("/")[0] || "";
  }

  return {
    t,
    localeTag,
    errorMessage,
    formatDate,
    formatRelativeTime,
    formatTime,
    formatTimeAgo,
    formatInterval,
    stripHtml,
    trimSummary,
    subCategory,
    roleFromCategory
  };
}