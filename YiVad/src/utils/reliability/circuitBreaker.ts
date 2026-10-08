export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  halfOpenMaxCalls?: number;
}

const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_RESET_TIMEOUT_MS = 120 * 1000;
const DEFAULT_HALF_OPEN_MAX_CALLS = 1;

type TransitionListener = (from: CircuitState, to: CircuitState) => void;

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private openedAt = 0;
  private halfOpenCalls = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenMaxCalls: number;
  private readonly listeners = new Set<TransitionListener>();

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
    this.resetTimeoutMs = options.resetTimeoutMs ?? DEFAULT_RESET_TIMEOUT_MS;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls ?? DEFAULT_HALF_OPEN_MAX_CALLS;
  }

  onTransition(fn: TransitionListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private transition(to: CircuitState): void {
    if (this.state === to) return;
    const from = this.state;
    this.state = to;
    for (const l of this.listeners) {
      try { l(from, to); } catch { /* noop */ }
    }
  }

  getState(): CircuitState {
    if (this.state === "open") {
      const now = Date.now();
      if (now - this.openedAt >= this.resetTimeoutMs) {
        this.transition("half-open");
        this.halfOpenCalls = 0;
      }
    }
    return this.state;
  }

  canExecute(): boolean {
    const state = this.getState();
    if (state === "open") return false;
    if (state === "half-open") {
      return this.halfOpenCalls < this.halfOpenMaxCalls;
    }
    return true;
  }

  recordSuccess(): void {
    const state = this.getState();
    if (state === "half-open") {
      this.transition("closed");
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenCalls = 0;
    } else if (state === "closed") {
      this.failureCount = 0;
      this.successCount++;
    }
  }

  recordFailure(): void {
    const state = this.getState();
    if (state === "half-open") {
      this.transition("open");
      this.openedAt = Date.now();
      this.halfOpenCalls = 0;
    } else if (state === "closed") {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.transition("open");
        this.openedAt = Date.now();
      }
    }
  }

  execute<T>(fn: () => T): T {
    if (!this.canExecute()) {
      throw new Error("CircuitBreaker: circuit is open");
    }
    const state = this.getState();
    if (state === "half-open") {
      this.halfOpenCalls++;
    }
    try {
      const result = fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  async executeAsync<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error("CircuitBreaker: circuit is open");
    }
    const state = this.getState();
    if (state === "half-open") {
      this.halfOpenCalls++;
    }
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getSuccessCount(): number {
    return this.successCount;
  }

  getOpenedAt(): number {
    return this.openedAt;
  }

  getResetTimeoutMs(): number {
    return this.resetTimeoutMs;
  }

  getFailureThreshold(): number {
    return this.failureThreshold;
  }

  forceClose(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.openedAt = 0;
  }

  forceOpen(): void {
    this.state = "open";
    this.openedAt = Date.now();
    this.halfOpenCalls = 0;
  }
}

const circuitRegistry = new Map<string, CircuitBreaker>();
const circuitRegistryCleanup = new Map<string, () => void>();

// 延迟引入，避免循环依赖
function reportTransitionToMetrics(from: string, to: string, key: string): void {
  try {
    import("./reliabilityMetrics")
      .then(m => m.reportCircuitTransition(from, to, key))
      .catch(() => {});
  } catch {
    /* 早期导入失败则静默，不影响熔断功能本身 */
  }
}

export function getCircuit(key: string, options?: CircuitBreakerOptions): CircuitBreaker {
  const existing = circuitRegistry.get(key);
  if (existing) return existing;
  const created = new CircuitBreaker(options);
  const off = created.onTransition((from, to) => reportTransitionToMetrics(from, to, key));
  circuitRegistry.set(key, created);
  circuitRegistryCleanup.set(key, off);
  return created;
}

export function clearCircuitRegistry(): void {
  for (const off of circuitRegistryCleanup.values()) {
    try { off(); } catch { /* noop */ }
  }
  circuitRegistryCleanup.clear();
  circuitRegistry.clear();
}
