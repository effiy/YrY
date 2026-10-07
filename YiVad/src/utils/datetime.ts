/**
 * Shared date/time formatting helpers — dayjs-backed for consistent parsing
 * across browsers.
 */
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy",
  },
});

/** Resolve any timestamp-like input to epoch ms (or NaN for invalid input). */
function toMs(ts: number | string | Date | undefined | null): number {
  if (ts == null || ts === "") return NaN;
  if (ts instanceof Date) return ts.getTime();
  const d = dayjs(ts as any);
  return d.isValid() ? d.valueOf() : NaN;
}

/** Locale string fallback for invalid or out-of-range relative formatting. */
function fallback(ts: number | string | Date | undefined | null): string {
  if (ts == null || ts === "") return "—";
  const d = dayjs(ts as any);
  return d.isValid() ? d.format("L LTS") : String(ts);
}

/**
 * Compact relative-time formatter for list views — backed by dayjs's
 * relativeTime plugin. Falls back to locale date for timestamps older
 * than 7 days.
 */
export function formatRelativeTime(ts: number | string | Date | undefined | null, now?: number): string {
  const n = toMs(ts);
  if (isNaN(n)) return fallback(ts);
  const diff = (now ?? Date.now()) - n;
  if (diff < 0) return fallback(ts);
  if (diff > 7 * 86400000) return fallback(ts);
  return dayjs(n).fromNow();
}

/** Absolute timestamp formatter — locale string, or "—" for empty input. */
export function formatAbsolute(ts: number | string | Date | undefined | null): string {
  if (ts == null || ts === "") return "—";
  const d = dayjs(ts as any);
  return d.isValid() ? d.format("L LTS") : String(ts);
}

/**
 * Locale date formatter. Two variants:
 * - "full" (default): "2026 Aug 21"
 * - "short": "Aug 21"
 */
export function formatDate(iso: string | undefined | null, opts?: { fallback?: string; variant?: "full" | "short" }): string {
  const fb = opts?.fallback ?? "-";
  if (!iso) return fb;
  const d = dayjs(iso);
  if (!d.isValid()) return fb;
  if (opts?.variant === "short") return d.format("MMM DD");
  return d.format("YYYY MMM DD");
}
