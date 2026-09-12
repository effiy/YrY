const SESSION_ID = crypto.randomUUID();
const FLUSH_INTERVAL = 10000;
const MAX_BUFFER = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

interface PerformanceRecord {
  session_id: string;
  page: string;
  metrics: Record<string, number>;
  context: {
    userAgent: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  timestamp: number;
}

let buffer: PerformanceRecord[] = [];
let failedQueue: PerformanceRecord[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let retryCount = 0;

function getNetworkContext() {
  const conn = (navigator as any).connection;
  return {
    userAgent: navigator.userAgent,
    effectiveType: conn?.effectiveType,
    downlink: conn?.downlink,
    rtt: conn?.rtt,
  };
}

export function bufferMetric(name: string, value: number): void {
  buffer.push({
    session_id: SESSION_ID,
    page: window.location.pathname,
    metrics: { [name]: value },
    context: getNetworkContext(),
    timestamp: Date.now(),
  });
  if (buffer.length >= MAX_BUFFER) flush();
}

async function flush(): Promise<void> {
  if (buffer.length === 0 && failedQueue.length === 0) return;
  const batch = [...failedQueue, ...buffer];
  buffer = [];
  failedQueue = [];

  try {
    const { default: http } = await import("@/api/index");
    await http.post("/", {
      module_name: "services.performance.metrics_service",
      method_name: "batch_insert",
      parameters: { records: batch },
    });
    retryCount = 0;
  } catch {
    if (retryCount < MAX_RETRIES) {
      failedQueue.push(...batch.slice(-MAX_BUFFER));
      retryCount++;
      setTimeout(flush, RETRY_DELAY);
    } else {
      retryCount = 0;
    }
  }
}

export function startMetricsFlush(): void {
  if (import.meta.env.DEV) return;
  flushTimer = setInterval(flush, FLUSH_INTERVAL);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && (buffer.length > 0 || failedQueue.length > 0)) flush();
  });
  window.addEventListener("beforeunload", () => {
    const all = [...failedQueue, ...buffer];
    if (all.length > 0) {
      navigator.sendBeacon("/", JSON.stringify({
        module_name: "services.performance.metrics_service",
        method_name: "batch_insert",
        parameters: { records: all },
      }));
    }
  });
}

export function stopMetricsFlush(): void {
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
  flush();
}

export { SESSION_ID };