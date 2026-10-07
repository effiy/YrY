import { useStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";

// Shared slow-tool-call threshold. Singleton via module-level useStorage —
// all callers share one reactive source of truth, persisted automatically.
export const SLOW_THRESHOLD_PRESETS = [200, 500, 1000, 3000, 10000];
const DEFAULT_SLOW_THRESHOLD_MS = 1000;

const slowThresholdMs: RemovableRef<number> = useStorage("yivad.aichat.slowThresholdMs", DEFAULT_SLOW_THRESHOLD_MS);

export function setSlowThreshold(v: number): void {
  if (!Number.isFinite(v) || v <= 0) return;
  slowThresholdMs.value = v;
}

export function formatSlowThreshold(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (Number.isInteger(s)) return `${s}s`;
  return `${s.toFixed(1)}s`;
}

export function useSlowThreshold(): { slowThresholdMs: RemovableRef<number> } {
  return { slowThresholdMs };
}