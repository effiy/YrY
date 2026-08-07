/**
 * Shared date/time formatting helpers used across list and detail views.
 */

/** Resolve any timestamp-like input to epoch ms (or NaN for invalid input). */
function toMs(ts: number | string | Date | undefined | null): number {
  if (ts == null || ts === "") return NaN;
  if (typeof ts === "number") return ts;
  if (ts instanceof Date) return ts.getTime();
  return Date.parse(ts);
}

/** Locale string fallback for invalid or out-of-range relative formatting. */
function fallback(ts: number | string | Date | undefined | null): string {
  if (ts == null || ts === "") return "—";
  try {
    return new Date(ts as any).toLocaleString();
  } catch {
    return String(ts);
  }
}

/**
 * Compact relative-time formatter for list views: "just now", "5m ago", "3h ago",
 * "2d ago", "1w ago". Beyond a week, falls back to a locale date string.
 *
 * @param ts epoch ms, ISO string, or Date
 * @returns relative-time label
 */
export function formatRelativeTime(ts: number | string | Date | undefined | null): string {
  const n = toMs(ts);
  if (isNaN(n)) return fallback(ts);
  const diff = Date.now() - n;
  if (diff < 0) return fallback(ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return fallback(ts);
}

/** Absolute timestamp formatter — locale string, or "—" for empty input. */
export function formatAbsolute(ts: number | string | Date | undefined | null): string {
  if (ts == null || ts === "") return "—";
  try {
    return new Date(ts as any).toLocaleString();
  } catch {
    return String(ts);
  }
}
