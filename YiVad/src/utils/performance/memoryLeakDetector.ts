interface MemorySample {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

const samples: MemorySample[] = [];
const MAX_SAMPLES = 60;
const SAMPLE_INTERVAL = 30000;
const LEAK_THRESHOLD = 0.5;
const LEAK_WINDOW = 10;

let sampleTimer: ReturnType<typeof setInterval> | null = null;

export function startMemoryMonitoring(): void {
  if (!import.meta.env.DEV) return;
  if (!("memory" in performance)) return;

  sampleTimer = setInterval(collectSample, SAMPLE_INTERVAL);
  collectSample();
}

function collectSample(): void {
  const memory = (performance as any).memory;
  if (!memory) return;

  samples.push({
    timestamp: Date.now(),
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  });
  if (samples.length > MAX_SAMPLES) samples.shift();

  const alert = detectLeak();
  if (alert) {
    console.warn(`[MemoryLeakDetector] ${alert.severity.toUpperCase()}: ${alert.message}`);
    console.warn(`  Current: ${(alert.currentSize / 1024 / 1024).toFixed(2)}MB`);
    console.warn(`  Growth: ${(alert.growthRate * 100).toFixed(1)}%`);
  }
}

interface MemoryLeakAlert {
  severity: "warning" | "critical";
  message: string;
  currentSize: number;
  baselineSize: number;
  growthRate: number;
}

function detectLeak(): MemoryLeakAlert | null {
  if (samples.length < LEAK_WINDOW) return null;
  const recent = samples.slice(-LEAK_WINDOW);
  const baseline = recent[0].usedJSHeapSize;
  const current = recent[recent.length - 1].usedJSHeapSize;
  if (baseline === 0) return null;
  const growthRate = (current - baseline) / baseline;
  if (growthRate > LEAK_THRESHOLD) {
    return {
      severity: growthRate > 1.0 ? "critical" : "warning",
      message: `Memory growth detected: ${(growthRate * 100).toFixed(1)}% increase`,
      currentSize: current,
      baselineSize: baseline,
      growthRate,
    };
  }
  return null;
}

export function stopMemoryMonitoring(): void {
  if (sampleTimer) { clearInterval(sampleTimer); sampleTimer = null; }
}

export function getMemorySamples(): MemorySample[] {
  return [...samples];
}