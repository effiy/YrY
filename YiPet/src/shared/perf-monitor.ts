/**
 * Content Script Performance Monitor — YP-09-10.
 *
 * Zero-overhead performance budget tracking for long-running content scripts.
 * Uses Performance Observer for Long Task detection + self-reporting markers
 * for critical paths (injection, MO callback, route changes).
 */
import { logger } from '@/utils/log';

interface PerfBudget {
  name: string;
  maxMs: number;
  current: number;
  violations: number;
}

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
}

const BUDGETS: PerfBudget[] = [
  { name: 'sync-execution', maxMs: 50, current: 0, violations: 0 },
  { name: 'mutation-observer', maxMs: 5, current: 0, violations: 0 },
  { name: 'route-change', maxMs: 30, current: 0, violations: 0 },
];

const MEMORY_BASELINE_KB = 50;
const MEMORY_WARN_MULTIPLIER = 2;
const MEMORY_SNAPSHOT_INTERVAL_MS = 60_000;

class PerfMonitor {
  private _snapshots: MemorySnapshot[] = [];
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _observer: PerformanceObserver | null = null;

  start() {
    this._startLongTaskObserver();
    this._startMemoryMonitoring();
    logger?.info?.('[PerfMonitor] Started');
  }

  stop() {
    this._stopLongTaskObserver();
    this._stopMemoryMonitoring();
    logger?.info?.('[PerfMonitor] Stopped');
  }

  /** Measure a named code block. */
  measure(name: string, fn: () => void) {
    const mark = `yipet:${name}:start`;
    performance.mark(mark);
    fn();
    const endMark = `yipet:${name}:end`;
    performance.mark(endMark);
    try {
      performance.measure(`yipet:${name}`, mark, endMark);
      const entries = performance.getEntriesByName(`yipet:${name}`);
      const duration = entries[entries.length - 1]?.duration ?? 0;
      this._checkBudget(name, duration);
    } catch {
      // performance.measure throws on duplicate names — safe to ignore
    }
    performance.clearMarks(mark);
    performance.clearMarks(endMark);
  }

  /** Get memory trend data for leak detection. */
  getMemoryTrend(): { snapshots: MemorySnapshot[]; trend: 'stable' | 'growing' | 'unknown' } {
    if (this._snapshots.length < 3) return { snapshots: this._snapshots, trend: 'unknown' };
    const first = this._snapshots[0].usedJSHeapSize;
    const last = this._snapshots[this._snapshots.length - 1].usedJSHeapSize;
    const ratio = last / (first || 1);
    return {
      snapshots: this._snapshots,
      trend: ratio > MEMORY_WARN_MULTIPLIER ? 'growing' : 'stable',
    };
  }

  getBudgetReport() {
    return BUDGETS.map((b) => ({ ...b }));
  }

  private _checkBudget(name: string, duration: number) {
    const budget = BUDGETS.find((b) => b.name === name);
    if (!budget) return;
    budget.current = duration;
    if (duration > budget.maxMs) {
      budget.violations++;
      logger?.warn?.(
        `[PerfMonitor] Budget violation: ${name} took ${duration.toFixed(1)}ms (max ${budget.maxMs}ms) — violation #${budget.violations}`,
      );
    }
  }

  private _startLongTaskObserver() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      this._observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            logger?.warn?.(`[PerfMonitor] Long task detected: ${entry.duration.toFixed(1)}ms`);
          }
        }
      });
      this._observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Long Task API not available in all contexts
    }
  }

  private _stopLongTaskObserver() {
    this._observer?.disconnect();
    this._observer = null;
  }

  private _startMemoryMonitoring() {
    this._takeMemorySnapshot();
    this._intervalId = setInterval(() => this._takeMemorySnapshot(), MEMORY_SNAPSHOT_INTERVAL_MS);
  }

  private _stopMemoryMonitoring() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  private _takeMemorySnapshot() {
    const mem = (performance as any).memory;
    if (!mem) return;
    const snap: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: mem.usedJSHeapSize || 0,
      totalJSHeapSize: mem.totalJSHeapSize || 0,
    };
    this._snapshots.push(snap);
    if (this._snapshots.length > 120) this._snapshots.shift();

    const usedKB = snap.usedJSHeapSize / 1024;
    if (usedKB > MEMORY_BASELINE_KB * MEMORY_WARN_MULTIPLIER) {
      logger?.warn?.(`[PerfMonitor] Memory warning: ${usedKB.toFixed(0)}KB used (baseline ${MEMORY_BASELINE_KB}KB)`);
    }
  }
}

export const perfMonitor = new PerfMonitor();