/**
 * Timezone detection and user preference management.
 *
 * Resolution order: user override (chrome.storage) → system timezone (Intl).
 */

import { readStringKV, writeKV } from '../storage/kv';

const STORAGE_KEY = 'user_timezone';

/* ── Detection ─────────────────────────────────────────────────────────── */

/** Detect the user's system timezone (IANA name, e.g. "Asia/Tokyo"). */
export function getSystemTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/* ── User Preference ───────────────────────────────────────────────────── */

export async function getUserTimezone(): Promise<string | null> {
  return readStringKV(STORAGE_KEY, null);
}

export async function setUserTimezone(tz: string): Promise<void> {
  await writeKV<string>(STORAGE_KEY, tz);
}

/* ── Combined Resolution ───────────────────────────────────────────────── */

/**
 * Resolve the effective timezone.
 * Call once per surface mount.
 */
export async function resolveTimezone(): Promise<{
  timeZone: string;
  isUserOverride: boolean;
}> {
  const userTz = await getUserTimezone();
  if (userTz) {
    return { timeZone: userTz, isUserOverride: true };
  }
  return { timeZone: getSystemTimezone(), isUserOverride: false };
}
