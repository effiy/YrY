/**
 * UTC-first datetime helpers and locale-aware formatters.
 *
 * Rule: ALWAYS store timestamps as ISO 8601 UTC strings.
 * Only convert to local timezone for display.
 */

/* ── UTC Storage ───────────────────────────────────────────────────────── */

/** Get the current instant as an ISO 8601 UTC string. */
export function nowUTC(): string {
  return new Date().toISOString(); // → "2026-07-26T09:30:00.000Z"
}

/** Check if a string is a valid ISO 8601 UTC timestamp. */
export function isValidUTC(iso: string): boolean {
  const d = new Date(iso);
  return !isNaN(d.getTime()) && iso.endsWith('Z');
}

/* ── Display Formatting ────────────────────────────────────────────────── */

/**
 * Format a UTC timestamp for display in the user's locale and timezone.
 */
export function formatDateTime(
  utcISO: string,
  locale: string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(utcISO);
  if (isNaN(date.getTime())) return utcISO; // fallback for invalid dates

  // If custom options are provided, use them instead of dateStyle/timeStyle
  const hasCustom = options && (options.year || options.month || options.day ||
    options.hour || options.minute || options.second);
  const baseOptions: Intl.DateTimeFormatOptions = hasCustom
    ? { timeZone, ...options }
    : { timeZone, dateStyle: 'medium', timeStyle: 'short', ...options };

  return new Intl.DateTimeFormat(locale.replace('_', '-'), baseOptions).format(date);
}

/**
 * Format a UTC timestamp as a relative time string (e.g. "3 minutes ago").
 * Uses Intl.RelativeTimeFormat for locale-aware output.
 */
export function formatRelativeTime(utcISO: string, locale: string): string {
  const now = Date.now();
  const then = new Date(utcISO).getTime();
  if (isNaN(then)) return utcISO;

  const diffMs = now - then;
  const diffSec = Math.round(diffMs / 1000);
  if (!isFinite(diffSec)) return utcISO;

  const rtf = new Intl.RelativeTimeFormat(locale.replace('_', '-'), { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second');
  if (Math.abs(diffSec) < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute');
  if (Math.abs(diffSec) < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour');
  if (Math.abs(diffSec) < 2592000) return rtf.format(-Math.round(diffSec / 86400), 'day');
  return rtf.format(-Math.round(diffSec / 2592000), 'month');
}

/**
 * Format a UTC timestamp as a simple date string (no time).
 */
export function formatDate(
  utcISO: string,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale.replace('_', '-'), {
    timeZone,
    dateStyle: 'long',
  }).format(new Date(utcISO));
}

/**
 * Format a UTC timestamp as a simple time string (no date).
 */
export function formatTime(
  utcISO: string,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale.replace('_', '-'), {
    timeZone,
    timeStyle: 'short',
  }).format(new Date(utcISO));
}

/**
 * Get the timezone abbreviation for display (e.g. "JST", "PST").
 */
export function getTimezoneAbbr(timeZone: string, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale.replace('_', '-'), {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(new Date());
  return parts.find(p => p.type === 'timeZoneName')?.value || timeZone;
}
