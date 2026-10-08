/**
 * Reliability 领域事件 & 指标桥接适配器。
 *
 * MetricsRecorder 是通用 name/value/tags 记录器（独立可测）。
 * 本模块：
 *   1) 定义 spec 要求的强类型 ReliabilityMetricEvent；
 *   2) 提供 pushReliabilityEvent() 把强类型事件映射到 MetricsRecorder.name/value/tags + 同步桥接到现有的 metricsStore（性能收集 bufferMetric）；
 *   3) 提供进程内全局 emitter（mitt 风格接口），未来可接企业微信 IM / 告警。
 */
import { MetricsRecorder, type MetricEvent } from "./metricsRecorder";
import { bufferMetric } from "@/utils/performance/metricsStore";

export type ReliabilityMetricPhase =
  | "P1-project"
  | "P2-knowledge"
  | "P2-issues"
  | "P2-modules"
  | "P3-derive"
  | "P4-readme";

export type ReliabilityMetricStatus = "success" | "failed" | "degraded" | "cached" | "circuit-open";

export type ReliabilityErrorType = "timeout" | "network" | "business" | "aborted" | "circuit" | "unknown";

export interface ReliabilityMetricEvent {
  id: string;
  projectKey: string;
  phase: ReliabilityMetricPhase;
  status: ReliabilityMetricStatus;
  durationMs: number;
  retryCount: number;
  errorType?: ReliabilityErrorType;
  errorMessage?: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface RollingStats {
  total: number;
  success: number;
  failed: number;
  degraded: number;
  cached: number;
  circuitOpen: number;
  timeoutRate: number;
  cacheHitRate: number;
  byPhase: Record<string, { total: number; p50: number; p95: number; p99: number }>;
}

// ── 进程内 emitter（mitt 风格最简实现，不新增依赖） ──
type Handler = (ev: ReliabilityMetricEvent) => void;
type TransitionHandler = (from: string, to: string, key: string) => void;
const handlers = new Set<Handler>();
const transitionHandlers = new Set<TransitionHandler>();

export const reliabilityEmitter = {
  onEvent(h: Handler): () => void {
    handlers.add(h);
    return () => handlers.delete(h);
  },
  onTransition(h: TransitionHandler): () => void {
    transitionHandlers.add(h);
    return () => transitionHandlers.delete(h);
  }
};

// ── 环形缓冲区（强类型事件，保留 2000 条） ──
const CAPACITY = 2000;
const events: ReliabilityMetricEvent[] = [];
const metricsRecorder = new MetricsRecorder(CAPACITY);

function pushToBridge(ev: ReliabilityMetricEvent) {
  // 1) MetricsRecorder：使用 phase/status 构造聚合 key
  metricsRecorder.push(`pd-${ev.phase}-duration`, ev.durationMs, {
    status: ev.status,
    project: ev.projectKey,
    ...(ev.errorType ? { errorType: ev.errorType } : {})
  });
  // 2) 现有性能指标桥接：bufferMetric（不阻塞）
  try {
    bufferMetric(`yivad.pd.${ev.phase}.${ev.status}`, ev.durationMs);
  } catch {
    /* 不允许桥接失败影响主流程 */
  }
  // 3) 进程内广播
  for (const h of handlers) {
    try { h(ev); } catch { /* noop */ }
  }
}

export function pushReliabilityEvent(ev: Omit<ReliabilityMetricEvent, "id" | "timestamp">): ReliabilityMetricEvent {
  const final: ReliabilityMetricEvent = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...ev
  };
  if (events.length >= CAPACITY) events.shift();
  events.push(final);
  pushToBridge(final);
  return final;
}

export function reportCircuitTransition(from: string, to: string, key: string): void {
  for (const h of transitionHandlers) {
    try { h(from, to, key); } catch { /* noop */ }
  }
}

export function getReliabilityEvents(): readonly ReliabilityMetricEvent[] {
  return events;
}

export function clearReliabilityEvents(): void {
  events.length = 0;
  metricsRecorder.clear();
}

export function getRollingReliabilityStats(windowMs = 300_000): RollingStats {
  const now = Date.now();
  const slice = events.filter(e => now - e.timestamp <= windowMs);
  const total = slice.length || 0;
  let success = 0, failed = 0, degraded = 0, cached = 0, circuitOpen = 0, timeouts = 0, cacheHits = 0;
  const byPhase = new Map<string, number[]>();
  for (const e of slice) {
    switch (e.status) {
      case "success": success++; break;
      case "failed": failed++; break;
      case "degraded": degraded++; break;
      case "cached": cached++; cacheHits++; break;
      case "circuit-open": circuitOpen++; break;
    }
    if (e.status === "success" || e.status === "cached") cacheHits++;
    if (e.errorType === "timeout") timeouts++;
    if (!byPhase.has(e.phase)) byPhase.set(e.phase, []);
    byPhase.get(e.phase)!.push(e.durationMs);
  }
  const byPhaseOut: RollingStats["byPhase"] = {};
  for (const [phase, arr] of byPhase) {
    const s = [...arr].sort((a, b) => a - b);
    byPhaseOut[phase] = {
      total: arr.length,
      p50: percentile(s, 50),
      p95: percentile(s, 95),
      p99: percentile(s, 99)
    };
  }
  return {
    total,
    success,
    failed,
    degraded,
    cached,
    circuitOpen,
    timeoutRate: total ? timeouts / total : 0,
    cacheHitRate: total ? cacheHits / total : 0,
    byPhase: byPhaseOut
  };
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const idx = (p / 100) * (sortedAsc.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const w = idx - lo;
  return sortedAsc[lo] * (1 - w) + sortedAsc[hi] * w;
}

// 把 ReliabilityError 分类（供上层调用）
export function classifyReliabilityError(e: unknown): ReliabilityErrorType {
  if (!e) return "unknown";
  const msg = String((e as any).message ?? (e as any).code ?? "");
  const name = String((e as any).name ?? "");
  if ((e as any).code === "CIRCUIT_OPEN") return "circuit";
  if (/AbortError|aborted/i.test(msg) || name === "AbortError") return "aborted";
  if (/timeout|超时|timed out|ETIMEDOUT|ECONNRESET/i.test(msg)) return "timeout";
  if (/NetworkError|Failed to fetch|net::|ECONN|ENOTFOUND|NETWORK/i.test(msg) || name === "NetworkError") return "network";
  const st = (e as any).status ?? (e as any).response?.status;
  if (typeof st === "number" && st >= 400) return "business";
  if (/business|BUSINESS/i.test(msg)) return "business";
  return "unknown";
}

// 直接暴露底层 recorder 聚合，方便调试
export function getMetricsRecorderAggregates(name?: string): ReturnType<MetricsRecorder["aggregate"]> {
  return metricsRecorder.aggregate(name);
}

export type { MetricEvent };
