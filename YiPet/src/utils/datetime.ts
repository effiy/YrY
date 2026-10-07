import dayjs from "dayjs";

/**
 * UTC-first datetime helpers and locale-aware formatters.
 *
 * Rule: ALWAYS store timestamps as ISO 8601 UTC strings.
 * Only convert to local timezone for display.
 *
 * Two families of formatters:
 *   1. formatDateTime / formatDate / formatTime — UTC ISO string input (locale-aware, Intl-backed)
 *   2. formatDateTimeFromTs / formatDateFromTs / formatTimeFromTs — numeric timestamp input (dayjs-backed)
 */

/* ── UTC Storage ───────────────────────────────────────────────────────── */

/** Get the current instant as an ISO 8601 UTC string. */
export function nowUTC(): string {
  return dayjs().toISOString();
}

/** Check if a string is a valid ISO 8601 UTC timestamp. */
export function isValidUTC(iso: string): boolean {
  return iso.endsWith('Z') && dayjs(iso).isValid();
}

/* ── UTC ISO String Formatters (locale-aware, timezone-respecting, Intl-backed) ─────── */

/**
 * Format a UTC ISO timestamp for display in the user's locale and timezone.
 */
export function formatDateTime(
  utcISO: string,
  locale: string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = dayjs(utcISO);
  if (!date.isValid()) return utcISO;

  const hasCustom =
    options &&
    (options.year ||
      options.month ||
      options.day ||
      options.hour ||
      options.minute ||
      options.second);
  const baseOptions: Intl.DateTimeFormatOptions = hasCustom
    ? { timeZone, ...options }
    : { timeZone, dateStyle: "medium", timeStyle: "short", ...options };

  return new Intl.DateTimeFormat(locale.replace("_", "-"), baseOptions).format(date.toDate());
}

/**
 * Format a UTC ISO timestamp as a simple date string (no time component).
 */
export function formatDate(utcISO: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale.replace("_", "-"), {
    timeZone,
    dateStyle: "long",
  }).format(dayjs(utcISO).toDate());
}

/**
 * Format a UTC ISO timestamp as a simple time string (no date component).
 */
export function formatTime(utcISO: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale.replace("_", "-"), {
    timeZone,
    timeStyle: "short",
  }).format(dayjs(utcISO).toDate());
}

/**
 * Format a UTC timestamp as a relative time string (e.g. "3 minutes ago").
 */
export function formatRelativeTime(utcISO: string, locale: string): string {
  const utc = dayjs(utcISO);
  if (!utc.isValid()) return utcISO;

  const diffSec = Math.round((Date.now() - utc.valueOf()) / 1000);
  if (!Number.isFinite(diffSec)) return utcISO;

  const rtf = new Intl.RelativeTimeFormat(locale.replace("_", "-"), { numeric: "auto" });

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, "second");
  if (Math.abs(diffSec) < 3600) return rtf.format(-Math.round(diffSec / 60), "minute");
  if (Math.abs(diffSec) < 86400) return rtf.format(-Math.round(diffSec / 3600), "hour");
  if (Math.abs(diffSec) < 2592000) return rtf.format(-Math.round(diffSec / 86400), "day");
  return rtf.format(-Math.round(diffSec / 2592000), "month");
}

/**
 * Get the timezone abbreviation for display (e.g. "JST", "PST").
 */
export function getTimezoneAbbr(timeZone: string, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale.replace("_", "-"), {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(new Date());
  return parts.find(p => p.type === "timeZoneName")?.value || timeZone;
}

/* ── Numeric Timestamp Formatters (dayjs-backed) ──────────────── */

/**
 * Format a numeric timestamp as a short datetime string.
 * Used by chat components for message/session timestamps.
 */
export function formatDateTimeFromTs(ts: number, locale: string = "zh-CN"): string {
  if (!ts) return "";
  return dayjs(ts).format(locale.startsWith("zh") ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD HH:mm");
}

/**
 * Format a numeric timestamp as a short date string.
 */
export function formatDateFromTs(ts: number, locale: string = "zh-CN"): string {
  if (!ts) return "";
  return dayjs(ts).format(locale.startsWith("zh") ? "YYYY/MM/DD" : "YYYY-MM-DD");
}
