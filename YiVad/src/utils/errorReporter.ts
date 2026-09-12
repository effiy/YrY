import type { ErrorContext } from "./errorHandler";

interface ReportOptions {
  sample?: number;
  immediate?: boolean;
}

interface ErrorRecord {
  count: number;
  firstSeen: number;
  lastSeen: number;
}

const ERROR_QUEUE: ErrorContext[] = [];
const ERROR_DEDUP_MAP = new Map<string, ErrorRecord>();
const BATCH_INTERVAL = 30000;
const MAX_QUEUE_SIZE = 100;
const DEDUP_WINDOW = 300000; // 5 minutes

let batchTimer: ReturnType<typeof setInterval> | null = null;

function getErrorFingerprint(ctx: ErrorContext): string {
  return `${ctx.type}:${ctx.error.message}:${ctx.componentName || ""}`;
}

function cleanupDedupMap(): void {
  const now = Date.now();
  for (const [key, record] of ERROR_DEDUP_MAP) {
    if (now - record.lastSeen > DEDUP_WINDOW * 2) {
      ERROR_DEDUP_MAP.delete(key);
    }
  }
}

export function reportError(ctx: ErrorContext, options: ReportOptions = {}): void {
  const { sample = 1, immediate = false } = options;

  if (Math.random() > sample) return;

  const fingerprint = getErrorFingerprint(ctx);
  const existing = ERROR_DEDUP_MAP.get(fingerprint);
  if (existing) {
    existing.count++;
    if (Date.now() - existing.lastSeen < DEDUP_WINDOW) return;
    existing.lastSeen = Date.now();
  } else {
    ERROR_DEDUP_MAP.set(fingerprint, {
      count: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    });
  }

  // Periodic cleanup of stale dedup entries
  if (ERROR_DEDUP_MAP.size > 500) {
    cleanupDedupMap();
  }

  if (import.meta.env.DEV) {
    console.group(`[ErrorReporter] ${ctx.type}`);
    console.error(ctx.error);
    console.groupEnd();
    return;
  }

  ERROR_QUEUE.push(ctx);

  if (ERROR_QUEUE.length > MAX_QUEUE_SIZE) {
    ERROR_QUEUE.shift();
  }

  if (immediate || ctx.type === "SCRIPT") {
    flushErrors();
  }

  if (!batchTimer) {
    batchTimer = setInterval(flushErrors, BATCH_INTERVAL);
  }
}

function flushErrors(): void {
  if (ERROR_QUEUE.length === 0) return;

  const batch = ERROR_QUEUE.splice(0, ERROR_QUEUE.length);

  const payload = JSON.stringify({
    errors: batch.map((ctx) => ({
      type: ctx.type,
      message: ctx.error.message,
      stack: ctx.error.stack,
      componentName: ctx.componentName,
      url: ctx.url,
      timestamp: ctx.timestamp,
    })),
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: Date.now(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/error-report", payload);
  } else {
    fetch("/api/error-report", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      // Silent fail - cannot report the reporter
    });
  }
}

window.addEventListener("beforeunload", () => {
  flushErrors();
});