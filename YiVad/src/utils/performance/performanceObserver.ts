import type { Router } from "vue-router";

interface RouteTiming {
  from: string;
  to: string;
  duration: number;
  timestamp: number;
}

const routeTimings: RouteTiming[] = [];
const MAX_RECORDS = 50;

export function observeRoutePerformance(router: Router): void {
  let navigationStart = 0;

  router.beforeEach(() => {
    navigationStart = performance.now();
  });

  router.afterEach((to, from) => {
    const duration = performance.now() - navigationStart;
    routeTimings.push({
      from: from.fullPath,
      to: to.fullPath,
      duration: Math.round(duration),
      timestamp: Date.now(),
    });
    if (routeTimings.length > MAX_RECORDS) routeTimings.shift();

    if (import.meta.env.DEV && duration > 100) {
      console.warn(`[Performance] Slow route: ${from.fullPath} → ${to.fullPath} (${Math.round(duration)}ms)`);
    }
  });
}

export function getRouteTimings(): RouteTiming[] {
  return [...routeTimings];
}

interface UserMark {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

const userMarks = new Map<string, UserMark>();
const userMeasures: UserMark[] = [];
const MAX_USER_MARKS = 30;

export function markTiming(name: string, metadata?: Record<string, unknown>): void {
  performance.mark(`${name}-start`);
  userMarks.set(name, { name, startTime: performance.now(), metadata });
}

export function measureTiming(name: string): number | null {
  const mark = userMarks.get(name);
  if (!mark) return null;

  performance.mark(`${name}-end`);
  try { performance.measure(name, `${name}-start`, `${name}-end`); } catch { /* ignore */ }

  const duration = performance.now() - mark.startTime;
  mark.duration = Math.round(duration);
  userMeasures.push(mark);
  if (userMeasures.length > MAX_USER_MARKS) userMeasures.shift();
  userMarks.delete(name);

  if (import.meta.env.DEV) {
    const emoji = duration < 100 ? "⚡" : duration < 500 ? "⏱️" : "🐢";
    console.log(`[Timing] ${emoji} ${name}: ${Math.round(duration)}ms`);
  }
  return Math.round(duration);
}

export function getUserMeasures(): UserMark[] {
  return [...userMeasures];
}