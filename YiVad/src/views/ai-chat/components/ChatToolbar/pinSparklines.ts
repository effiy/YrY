/**
 * Pin sparkline math utilities — pure functions for latency trajectory visualization.
 * Extracted from useSkillsMcp for reuse and independent testability.
 */

export const PIN_SPARK_W = 40;
export const PIN_SPARK_H = 8;
export const PIN_SPARK_PAD = 1;

export function sparkPathFromDurations(durations: number[]): string {
  if (durations.length < 2) return "";
  const max = Math.max(...durations, 1);
  const min = Math.min(...durations, 0);
  const range = max - min || 1;
  const n = durations.length;
  const points = durations.map((v, i) => {
    const x = PIN_SPARK_PAD + (i / (n - 1)) * (PIN_SPARK_W - 2 * PIN_SPARK_PAD);
    const y = PIN_SPARK_H - PIN_SPARK_PAD - ((v - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")}`;
}

export function sparkPointsFromDurations(
  durations: number[]
): { cx: number; cy: number; ms: number; idx: number }[] {
  if (durations.length < 2) return [];
  const max = Math.max(...durations, 1);
  const min = Math.min(...durations, 0);
  const range = max - min || 1;
  const n = durations.length;
  return durations.map((v, i) => ({
    cx: PIN_SPARK_PAD + (i / (n - 1)) * (PIN_SPARK_W - 2 * PIN_SPARK_PAD),
    cy: PIN_SPARK_H - PIN_SPARK_PAD - ((v - min) / range) * (PIN_SPARK_H - 2 * PIN_SPARK_PAD),
    ms: v,
    idx: i + 1
  }));
}

export function medianDuration(durations: number[] | undefined): number | null {
  if (!durations || durations.length < 2) return null;
  const s = [...durations].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export function formatStuckSummary(indices: number[], ds: number[]): string {
  if (!indices.length) return "";
  const parts = indices.slice(0, 3).map(idx => `call ${idx} (${ds[idx - 1]}ms)`);
  if (indices.length > 3) parts.push(`+${indices.length - 3} more`);
  return parts.join(", ");
}

export function hitWidth(n: number): number {
  if (n < 2) return 5;
  return Math.max(2, Math.min(5, PIN_SPARK_W / n - 1));
}

export function hitWidths(pts: { cx: number }[]): number[] {
  if (pts.length < 2) return [];
  return pts.map((p, i) => {
    const left = i > 0 ? p.cx - pts[i - 1].cx : PIN_SPARK_W;
    const right = i < pts.length - 1 ? pts[i + 1].cx - p.cx : PIN_SPARK_W;
    return Math.max(2, Math.min(5, Math.min(left, right) / 2 - 0.5));
  });
}