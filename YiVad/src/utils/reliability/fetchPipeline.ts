/**
 * FetchPipeline —— 专业版请求流水线编排。
 *
 * 对单个 stage 按顺序执行：
 *   1) 检查熔断器（circuit-open → 直接走缓存或 fallback）
 *   2) 查询本地持久化缓存：fresh 命中 → 返回 cached 并跳过网络；stale 命中 → 先回推 stale 给调用方继续使用，然后发起网络
 *   3) 带超时 + 指数退避重试执行 `run`
 *   4) 成功 → 刷新缓存、熔断器记录成功、metrics(success)、调用 onSuccess
 *   5) 失败 → 熔断器记录失败；若有 stale cache，则 metrics(degraded) + onSuccess(cached) + onFail 轻回调；否则 metrics(failed) + onFail
 *
 * runParallel(stages)：每个 stage 独立进度，每 stage 完成立即回调，不等全部完成（Partial Rendering）。
 */
import { withRetry, type RetryConfig } from "@/api/helper/retry";
import { DisposerBag } from "@/utils/disposer";
import { getCircuit, type CircuitBreaker } from "./circuitBreaker";
import {
  pushReliabilityEvent,
  classifyReliabilityError,
  type ReliabilityMetricPhase
} from "./reliabilityMetrics";
import { typedGet, typedSet } from "./pdCache";

export type StageStatus = "success" | "failed" | "degraded" | "cached" | "circuit-open";

export interface PipelineStage<T> {
  key: string;
  phase: ReliabilityMetricPhase;
  endpoint: string; // 熔断器 + 缓存用的 key（如 `issues:yipot`）
  projectKey: string;
  /** 超时（毫秒）。建议 spec 约定：Project 8s / Knowledge 18s / Issues 12s / Modules 10s */
  timeoutMs: number;
  /** 缓存 TTL（毫秒）。传 0 或 undefined 表示不缓存 */
  ttlMs?: number;
  /** 重试配置；默认 2 次（总共 3 次） */
  retryConfig?: RetryConfig;
  /** 请求实现；signal 会传入以便上层取消 */
  run: (ctrl: { signal: AbortSignal }) => Promise<T>;
  /** 当获取到「可用数据」（success / cached / degraded）时立即调用 —— 支持 Partial Rendering */
  onSuccess?: (value: T, info: { stale: boolean; status: Exclude<StageStatus, "failed" | "circuit-open"> }) => void;
  /** 失败或熔断器打开且无缓存时回调 */
  onFail?: (reason: { status: "failed" | "circuit-open"; error: unknown; cachedValue?: T }) => void;
  /** fallback：当网络失败且无 cache 时返回 */
  fallback?: () => T;
}

export interface StageOutcome<T> {
  key: string;
  status: StageStatus;
  value?: T;
  durationMs: number;
  retryCount: number;
  error?: unknown;
}

async function runStageWithTimeout<T>(
  fn: (ctrl: { signal: AbortSignal }) => Promise<T>,
  timeoutMs: number,
  disposer: DisposerBag
): Promise<T> {
  const ctrl = new AbortController();
  disposer.addAbort(ctrl);
  let cleanup: (() => void) | null = null;
  try {
    const timer = setTimeout(() => {
      if (!ctrl.signal.aborted) ctrl.abort(new DOMException(`Timeout after ${timeoutMs}ms`, "AbortError"));
    }, timeoutMs);
    disposer.addTimer(timer);
    cleanup = () => {
      try { clearTimeout(timer); } catch { /* noop */ }
    };
    return await fn({ signal: ctrl.signal });
  } finally {
    cleanup?.();
  }
}

function cachedKey(s: PipelineStage<any>): string {
  return `stage:${s.endpoint}`;
}

export async function runStage<T>(
  stage: PipelineStage<T>,
  disposer: DisposerBag,
  seq: { current: number }
): Promise<StageOutcome<T>> {
  const started = performance.now();
  const t0 = Date.now();
  const cacheKey = cachedKey(stage);
  const circuit: CircuitBreaker = getCircuit(stage.endpoint, {
    failureThreshold: 3,
    resetTimeoutMs: 20_000 // cool-down 20s 后 half-open
  });

  // 先查缓存（即便 circuit open 也能用 stale cache）
  const cache = typedGet<T>(cacheKey);
  let retryCount = 0;
  const retryCfg: RetryConfig = {
    maxRetries: stage.retryConfig?.maxRetries ?? 2,
    retryDelay: stage.retryConfig?.retryDelay ?? 600,
    backoffMultiplier: stage.retryConfig?.backoffMultiplier ?? 1.6,
    onRetry: (attempt: number) => { retryCount = attempt; }
  };

  function record(
    status: StageStatus,
    durationMs: number,
    errType = classifyReliabilityError(undefined as unknown),
    errMsg?: string
  ) {
    pushReliabilityEvent({
      projectKey: stage.projectKey,
      phase: stage.phase,
      status: status as any,
      durationMs: Math.max(0, Math.round(durationMs)),
      retryCount,
      errorType: errType,
      errorMessage: errMsg
    });
  }

  // 1) fresh cache 命中 → 跳过网络
  if (stage.ttlMs && cache.hit && !cache.stale) {
    const dur = performance.now() - started;
    stage.onSuccess?.(cache.value!, { stale: false, status: "cached" });
    record("cached", dur);
    return { key: stage.key, status: "cached", value: cache.value, durationMs: Math.round(dur), retryCount };
  }

  // 2) 先推 stale cache（若有）给 UI 用，不等网络
  if (cache.hit && cache.stale) {
    stage.onSuccess?.(cache.value!, { stale: true, status: "degraded" });
  }

  // 3) 熔断判断
  if (!circuit.canExecute()) {
    const dur = performance.now() - started;
    if (cache.hit) {
      // 有 stale 直接当 degraded
      record("degraded", dur, "circuit");
      return { key: stage.key, status: "degraded", value: cache.value, durationMs: Math.round(dur), retryCount };
    }
    // 无 cache，按 fallback
    let fb: T | undefined;
    try { fb = stage.fallback?.(); } catch { /* noop */ }
    if (fb !== undefined) {
      stage.onSuccess?.(fb, { stale: false, status: "degraded" });
      record("degraded", dur, "circuit");
      return { key: stage.key, status: "degraded", value: fb, durationMs: Math.round(dur), retryCount };
    }
    stage.onFail?.({ status: "circuit-open", error: new Error("CIRCUIT_OPEN"), cachedValue: undefined });
    record("circuit-open", dur, "circuit");
    return { key: stage.key, status: "circuit-open", durationMs: Math.round(dur), retryCount };
  }

  // 4) 网络请求（重试 + 超时）
  try {
    const value = await withRetry(
      () => runStageWithTimeout(stage.run, stage.timeoutMs, disposer),
      retryCfg
    );
    // 检查 seq 是否过期（旧请求不要写响应式数据）
    const dur = performance.now() - started;
    circuit.recordSuccess();
    if (stage.ttlMs && stage.ttlMs > 0) typedSet(cacheKey, value, stage.ttlMs);
    stage.onSuccess?.(value, { stale: false, status: "success" });
    record("success", dur);
    return { key: stage.key, status: "success", value, durationMs: Math.round(dur), retryCount };
  } catch (err: unknown) {
    const dur = performance.now() - started;
    circuit.recordFailure();
    const errType = classifyReliabilityError(err);
    const errMsg = String((err as any)?.message ?? "");
    // 有 stale cache → 不触发 onFail，维持 degraded
    if (cache.hit) {
      record("degraded", dur, errType, errMsg);
      return { key: stage.key, status: "degraded", value: cache.value, durationMs: Math.round(dur), retryCount, error: err };
    }
    // 无 stale cache → 尝试 fallback
    let fb: T | undefined;
    try { fb = stage.fallback?.(); } catch { /* noop */ }
    if (fb !== undefined) {
      stage.onSuccess?.(fb, { stale: false, status: "degraded" });
      record("degraded", dur, errType, errMsg);
      return { key: stage.key, status: "degraded", value: fb, durationMs: Math.round(dur), retryCount, error: err };
    }
    stage.onFail?.({ status: "failed", error: err, cachedValue: undefined });
    record("failed", dur, errType, errMsg);
    return { key: stage.key, status: "failed", durationMs: Math.round(dur), retryCount, error: err };
  }
  // note: seq.current 过期 check 实际上由上层 useProjectDetail 决定；runStage 只管产出结果
}

/**
 * 并行执行一组 stages；每 stage 完成立即 onSuccess/onFail。
 * 返回所有 outcome；绝不 reject（所有错误都被包装为 outcome）。
 */
export function runParallelStages<T>(
  stages: Array<PipelineStage<T>>,
  disposer: DisposerBag
): Promise<Array<StageOutcome<T>>> {
  const seq = { current: Math.random() };
  return Promise.all(stages.map(s => runStage(s as any, disposer, seq)) as any);
}

export type { ReliabilityMetricPhase };
