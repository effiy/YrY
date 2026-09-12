interface VitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  timestamp: number;
}

const metricsHistory: VitalMetric[] = [];
const MAX_HISTORY = 100;

const thresholds: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  INP: [100, 300],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const [good, poor] = thresholds[name] || [0, Infinity];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

let lastValue: Record<string, number> = {};

function recordMetric(name: string, value: number): void {
  const delta = lastValue[name] !== undefined ? value - lastValue[name] : value;
  lastValue[name] = value;

  const record: VitalMetric = { name, value, rating: getRating(name, value), delta, timestamp: Date.now() };
  metricsHistory.push(record);
  if (metricsHistory.length > MAX_HISTORY) metricsHistory.shift();

  if (import.meta.env.DEV) {
    const emoji = record.rating === "good" ? "🟢" : record.rating === "needs-improvement" ? "🟡" : "🔴";
    console.log(`[WebVitals] ${emoji} ${name}: ${value.toFixed(2)} (${record.rating})`);
  }
}

let lcpValue = 0;

function observeLCP(): void {
  const po = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    if (entries.length > 0) lcpValue = entries[entries.length - 1].startTime;
  });
  try { po.observe({ type: "largest-contentful-paint", buffered: true }); } catch { return; }

  const finalize = () => {
    if (lcpValue > 0) { recordMetric("LCP", lcpValue); lcpValue = 0; }
    po.disconnect();
  };
  ["pointerdown", "keydown", "scroll"].forEach((evt) =>
    addEventListener(evt, finalize, { once: true, capture: true })
  );
  document.addEventListener("visibilitychange", () => { if (document.hidden) finalize(); }, { once: true });
}

function observeFCP(): void {
  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") {
        recordMetric("FCP", entry.startTime);
        po.disconnect();
        return;
      }
    }
  });
  try { po.observe({ type: "paint", buffered: true }); } catch { /* not supported */ }
}

let clsValue = 0;

function observeCLS(): void {
  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!e.hadRecentInput) clsValue += e.value;
    }
  });
  try { po.observe({ type: "layout-shift", buffered: true }); } catch { return; }
  document.addEventListener("visibilitychange", () => { if (document.hidden && clsValue > 0) recordMetric("CLS", clsValue); });
  addEventListener("pagehide", () => { if (clsValue > 0) recordMetric("CLS", clsValue); });
}

function observeTTFB(): void {
  const report = () => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (!nav || nav.responseStart <= 0) return;
    recordMetric("TTFB", nav.responseStart - nav.requestStart);
  };
  if (performance.getEntriesByType("navigation").length > 0) {
    report();
  } else {
    const po = new PerformanceObserver((list) => {
      if (list.getEntriesByType("navigation").length > 0) { report(); po.disconnect(); }
    });
    po.observe({ type: "navigation", buffered: true });
  }
}

function observeINP(): void {
  let inpMaxDuration = 0;
  const interactionMap = new Map<number, number>();
  try {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const evt = entry as PerformanceEventTiming;
        if (evt.interactionId === 0) continue;
        const cur = interactionMap.get(evt.interactionId) || 0;
        if (evt.duration > cur) {
          interactionMap.set(evt.interactionId, evt.duration);
          if (evt.duration > inpMaxDuration) inpMaxDuration = evt.duration;
        }
      }
    });
    po.observe({ type: "event", buffered: true, durationThreshold: 0 });
  } catch {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEventTiming;
        recordMetric("INP", e.processingStart - e.startTime);
        po.disconnect();
      }
    });
    po.observe({ type: "first-input", buffered: true });
    return;
  }
  const report = () => { if (inpMaxDuration > 0) recordMetric("INP", inpMaxDuration); };
  document.addEventListener("visibilitychange", () => { if (document.hidden) report(); });
  addEventListener("pagehide", report);
}

function handleBfcacheRestore(): void {
  addEventListener("pageshow", (event) => {
    if (event.persisted) {
      lcpValue = 0; clsValue = 0;
      interactionMap.clear(); lastValue = {};
      observeLCP(); observeCLS(); observeINP();
    }
  });
}
const interactionMap = new Map<number, number>();

export function initWebVitals(): void {
  if (typeof window === "undefined") return;
  observeLCP(); observeFCP(); observeCLS(); observeTTFB(); observeINP();
  handleBfcacheRestore();
}

export function getPerformanceScore(): {
  score: number; grade: "A" | "B" | "C" | "D" | "F"; breakdown: Record<string, number>;
} {
  const latest = getLatestMetrics();
  const weights: Record<string, number> = { LCP: 0.25, INP: 0.25, CLS: 0.20, FCP: 0.15, TTFB: 0.15 };
  let totalScore = 0;
  const breakdown: Record<string, number> = {};

  for (const [name, weight] of Object.entries(weights)) {
    const metric = latest[name];
    if (!metric) continue;
    const [good, poor] = thresholds[name] || [0, Infinity];
    const sub = poor > good
      ? Math.max(0, Math.min(100, 100 - ((metric.value - good) / (poor - good)) * 100))
      : 100;
    breakdown[name] = Math.round(sub);
    totalScore += sub * weight;
  }

  const score = Math.round(totalScore);
  const grade: "A" | "B" | "C" | "D" | "F" =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  return { score, grade, breakdown };
}

export function getMetricsHistory(): VitalMetric[] { return [...metricsHistory]; }

export function getLatestMetrics(): Record<string, VitalMetric | undefined> {
  const latest: Record<string, VitalMetric> = {};
  for (const m of metricsHistory) latest[m.name] = m;
  return latest;
}