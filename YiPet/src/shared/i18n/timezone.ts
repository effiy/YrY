/**
 * Timezone detection and user preference management.
 *
 * Resolution order: user override (chrome.storage) → system timezone (Intl).
 */

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
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const val = result[STORAGE_KEY] as string | undefined;
  if (val && typeof val === 'string') return val;
  return null;
}

export async function setUserTimezone(tz: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: tz });
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
