export function loadBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === "true" : fallback;
  } catch {
    return fallback;
  }
}
export function saveBool(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}
export function loadNum(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}
export function saveNum(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}
export function loadStr(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch {
    return fallback;
  }
}
export function saveStr(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function saveJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/**
 * Estimate localStorage usage and check against the ~5MB browser limit.
 * Returns usage stats for monitoring and early-warning of TD-04 trigger.
 *
 * The 5MB limit is per-origin per the Web Storage spec. When storage is full,
 * `setItem` throws QuotaExceededError — this monitor provides an early warning
 * at 85% capacity so the system can switch to IndexedDB before hitting errors.
 */
const STORAGE_QUOTA_WARN = 0.85;
const STORAGE_QUOTA_CRIT = 0.95;
const ESTIMATED_LIMIT = 5_000_000; // 5MB typical browser limit

export interface StorageQuotaInfo {
  usedBytes: number;
  estimatedLimit: number;
  usageRatio: number;
  level: "ok" | "warn" | "critical";
}

export function getStorageQuota(): StorageQuotaInfo {
  let usedBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        usedBytes += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2; // UTF-16
      }
    }
  } catch {
    return { usedBytes: 0, estimatedLimit: ESTIMATED_LIMIT, usageRatio: 0, level: "ok" };
  }

  const ratio = usedBytes / ESTIMATED_LIMIT;
  const level = ratio >= STORAGE_QUOTA_CRIT ? "critical" : ratio >= STORAGE_QUOTA_WARN ? "warn" : "ok";

  return { usedBytes, estimatedLimit: ESTIMATED_LIMIT, usageRatio: ratio, level };
}
