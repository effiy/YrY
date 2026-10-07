/**
 * chrome.storage quota monitoring — graceful degradation on quota exhaustion.
 */
const WARN_THRESHOLD = 0.7;

export interface QuotaStatus {
  usedBytes: number;
  quotaBytes: number;
  pct: number;
  level: 'ok' | 'warn';
}

export async function checkStorageQuota(): Promise<QuotaStatus | null> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local?.getBytesInUse) return null;
  try {
    const used = await chrome.storage.local.getBytesInUse();
    const quota = chrome.storage.local.QUOTA_BYTES;
    const pct = quota > 0 ? used / quota : 0;
    return { usedBytes: used, quotaBytes: quota, pct, level: pct > WARN_THRESHOLD ? 'warn' : 'ok' };
  } catch {
    return null;
  }
}

export async function warnIfQuotaLow(onWarn: (pct: number) => void): Promise<void> {
  const status = await checkStorageQuota();
  if (status && status.level === 'warn') {
    onWarn(Math.round(status.pct * 100));
  }
}