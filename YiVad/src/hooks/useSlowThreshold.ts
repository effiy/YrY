import { ref, type Ref } from "vue";

// Shared slow-tool-call threshold (Pi-inspired: per-tool latency slow/stuck
// detection). Single source of truth across SessionStatusBar (filter chip +
// preset popover) and MessageBubble (slow badge on individual tool cards).
// Module-level state makes it a singleton — all callers share one ref.

const SLOW_THRESHOLD_LS_KEY = "yivad.aichat.slowThresholdMs";
export const SLOW_THRESHOLD_PRESETS = [200, 500, 1000, 3000, 10000];
const DEFAULT_SLOW_THRESHOLD_MS = 1000;

function loadSlowThreshold(): number {
  try {
    const raw = localStorage.getItem(SLOW_THRESHOLD_LS_KEY);
    if (!raw) return DEFAULT_SLOW_THRESHOLD_MS;
    const v = parseInt(raw, 10);
    return Number.isFinite(v) && v > 0 ? v : DEFAULT_SLOW_THRESHOLD_MS;
  } catch {
    return DEFAULT_SLOW_THRESHOLD_MS;
  }
}

const slowThresholdMs: Ref<number> = ref(loadSlowThreshold());

function persistSlowThreshold(): void {
  try {
    localStorage.setItem(SLOW_THRESHOLD_LS_KEY, String(slowThresholdMs.value));
  } catch {
    /* ignore */
  }
}

export function setSlowThreshold(v: number): void {
  if (!Number.isFinite(v) || v <= 0) return;
  slowThresholdMs.value = v;
  persistSlowThreshold();
}

export function formatSlowThreshold(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (Number.isInteger(s)) return `${s}s`;
  return `${s.toFixed(1)}s`;
}

export function useSlowThreshold(): { slowThresholdMs: Ref<number> } {
  return { slowThresholdMs };
}
