/**
 * SRE SLO metrics calculator — pure functions with stable interfaces so the
 * exact same computation can be reused across:
 *   - bug list SLO strip + OKR + Analytics (index.vue)
 *   - bug detail SLA countdown + Overview SRE card (detail.vue)
 *   - unit tests under tests/api/bug.test.ts
 *
 * Key decisions (industrial SRE grade):
 *   1. Percentile uses linear interpolation (idx = p/100 * (n-1)), NOT the
 *      nearest-rank shortcut. See spec AC-R1.
 *   2. Sliding windows use strict closed-interval ≥ (now − windowMs) on the
 *      "participation anchor" of each bug — see spec NFR-2.2.
 *   3. MTTR p95 **includes TTD (Time-To-Detect = now − createdAt)** for bugs
 *      that are still open / in_progress / reopened. Including them prevents
 *      the classic "we only measure bugs we already fixed" SRE pitfall that
 *      makes MTTR look artificially good when a 80h tail is rotting.
 *   4. Critical-SLA counts reopened bugs as NOT OK — the resolution did not
 *      actually hold. See spec AC-R3.
 */
import type { BugDocument, BugSeverity, BugStatus } from "@/api/modules/bug";
import { BUG_SLA_HOURS } from "@/stores/modules/bug";

// ── Types ──────────────────────────────────────────────────────────────────

export type SloWindowKey = "24h" | "7d" | "30d" | "90d" | "all";
export interface SloWindowOption { key: SloWindowKey; label: string; days: number | null; }

export const SLO_WINDOWS: SloWindowOption[] = [
  { key: "24h",  label: "24h",  days: 1     },
  { key: "7d",   label: "7d",   days: 7     },
  { key: "30d",  label: "30d",  days: 30    },
  { key: "90d",  label: "90d",  days: 90    },
  { key: "all",  label: "All",  days: null  },
];

export const SLO_WINDOW_DEFAULT: SloWindowKey = "30d";

/** Milliseconds for a given window key. `null` for "All" = unrestricted. */
export function sloWindowMs(k: SloWindowKey): number | null {
  const o = SLO_WINDOWS.find(w => w.key === k) ?? SLO_WINDOWS[2];
  return o.days === null ? null : o.days * 86_400_000;
}

export type SloStatus = "ok" | "warn" | "fail" | "na";

export interface SloNumericResult { status: SloStatus; value: number; /** raw sample size for display */ sample: number; }

export interface SloMetricsResult {
  /** MTTR p95 in hours — includes TTD for non-done bugs. */
  mttrP95: SloNumericResult;
  /** Percentage of critical-severity bugs that respect SLA (reopened = fail). */
  criticalSlaPct: SloNumericResult;
  /** Percentage of bugs reopened at least once. */
  reopenRatePct: SloNumericResult;
  /** Percentage of bugs in any done status (resolved / closed). */
  resolveRatePct: SloNumericResult;
  openCount: number;
  /** Count of bugs currently visible within the window (anchor within window). */
  windowSize: number;
  mttrSampleSize: number;
}

/** SPC-style control limits returned by calcControlLimits. */
export interface ControlLimits {
  mean: number;
  ucl: number;
  lcl: number;
  mRbar: number;   // mean moving range, useful for display
  outliers: Array<{ idx: number; value: number; key?: string; date?: string }>;
}

/** Simple bug-row MTTR result, reused for list CSV export. */
export interface BugPerf {
  mttrHours: number | null;       // null if status != done
  ttdHours: number;               // now - createdAt  (for non-done)
  slaOk: boolean | null;          // null if still open and age < SLA limit
  reopenCount: number;            // guaranteed number (not undefined)
  windowAnchorTs: number;         // millis (the participation anchor)
}

const DONE_STATUSES: ReadonlySet<BugStatus> = new Set(["resolved", "closed"] as BugStatus[]);
// rejected bugs should be excluded from MTTR samples. Spec says "rejected 不计入样本".
const REJECTED: BugStatus = "rejected" as BugStatus;

// ── Core pure helpers ──────────────────────────────────────────────────────

/**
 * Linear-interpolation percentile (the SRE industry default, matches NumPy's
 * `method='linear'` and is what p95 "should" mean). idx = p/100 * (n-1).
 * Sample spec AC-R1: calcPercentile([3,6,7,8,50], 95) === 41.6 .
 */
export function calcPercentile(sorted: number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0] ?? 0;
  const idx = (p / 100) * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(n - 1, lo + 1);
  const frac = idx - lo;
  const vLo = sorted[lo] ?? 0;
  const vHi = sorted[hi] ?? 0;
  return vLo + frac * (vHi - vLo);
}

/** Count of reopen events for a bug. Uses three-tier fallback so legacy bugs
 *  without `reopenCount` still produce a reliable integer ≥ 0 (spec AC-R4). */
export function calcBugReopenCount(b: BugDocument): number {
  // 1. Explicit number on document
  if (typeof b.reopenCount === "number" && Number.isFinite(b.reopenCount) && b.reopenCount >= 0) {
    return Math.floor(b.reopenCount);
  }
  // 2. Count from timeline (most precise, added by T1 enrich)
  if (Array.isArray(b.timeline) && b.timeline.length) {
    const c = b.timeline.filter(e => e && e.kind === "reopen").length;
    if (c > 0) return c;
  }
  // 3. Heuristic: status==='reopened' + has resolvedAt ⇒ at least one reopen
  if (b.status === ("reopened" as BugStatus) && b.resolvedAt != null && b.resolvedAt > 0) {
    return 1;
  }
  return 0;
}

/** Latest reopen timestamp, used as a TTD reset anchor. 0 if no reopen. */
function _latestReopenTs(b: BugDocument): number {
  let latest = 0;
  if (Array.isArray(b.timeline)) {
    for (const e of b.timeline) {
      if (e && e.kind === "reopen" && typeof e.ts === "number" && e.ts > latest) latest = e.ts;
    }
  }
  return latest;
}

/** Per-bug SLO-window participation anchor: the most recent lifecycle event.
 *  Closed-interval anchor ≥ (now − windowMs) decides if the bug counts in the
 *  currently selected sliding window. */
export function calcBugWindowAnchor(b: BugDocument): number {
  return Math.max(
    b.createdAt || 0,
    _latestReopenTs(b),
    b.updatedAt || 0,
    b.resolvedAt || 0,
    b.closedAt || 0,
  );
}

/**
 * Compute the most relevant duration for the bug (used as MTTR sample).
 * - If resolved/closed → TTR = resolvedAt - anchor (anchor = latestReopenTs ∨ createdAt)
 * - If rejected → null (不计入样本, spec T2)
 * - If open / in_progress / reopened → TTD = now - anchor
 * Rejected bugs are NOT sampled for MTTR — see T2 AC "rejected 不计入样本".
 */
export function calcBugDurationMs(b: BugDocument, now: number): { kind: "ttr" | "ttd"; ms: number } | null {
  if (b.status === REJECTED) return null;
  const anchor = Math.max(b.createdAt || 0, _latestReopenTs(b));
  if (DONE_STATUSES.has(b.status)) {
    const end = b.closedAt && b.closedAt > 0 ? b.closedAt : (b.resolvedAt ?? 0);
    if (!end || end <= anchor) return null;
    return { kind: "ttr", ms: end - anchor };
  }
  // open / in_progress / reopened: TTD
  const ms = now - anchor;
  return { kind: "ttd", ms: ms > 0 ? ms : 0 };
}

/**
 * Tri-state SLA result:
 *   true  = inside SLA
 *   false = SLA breached (or reopened)
 *   null  = non-done bug still under its SLA age (undecided)
 * Reopened bugs always return false per spec AC-R3.
 */
export function calcBugSlaOk(b: BugDocument, now: number): boolean | null {
  const reopenN = calcBugReopenCount(b);
  if (reopenN >= 1) return false;
  const sev = (b.severity || "trivial") as BugSeverity;
  const limitMs = (BUG_SLA_HOURS[sev] ?? 168) * 3_600_000;
  const anchor = Math.max(b.createdAt || 0, _latestReopenTs(b));
  if (DONE_STATUSES.has(b.status)) {
    const end = b.closedAt && b.closedAt > 0 ? b.closedAt : (b.resolvedAt ?? 0);
    if (!end) return null;
    return end - anchor <= limitMs;
  }
  const age = now - anchor;
  if (age > limitMs) return false;
  return null;
}

function _thresholdStatus(
  value: number,
  sample: number,
  okPct: number,
  warnPct: number,
  higherIsBetter: boolean,
): SloNumericResult {
  if (!sample) return { status: "na", value, sample };
  const better = higherIsBetter ? (a: number, b: number) => a >= b : (a: number, b: number) => a <= b;
  if (better(value, okPct)) return { status: "ok", value, sample };
  if (better(value, warnPct)) return { status: "warn", value, sample };
  return { status: "fail", value, sample };
}

// ── Aggregated SLO metrics entry point ─────────────────────────────────────

export interface CalcSloOptions {
  now: number;
  /** Window duration in ms; `null` for unrestricted (All). */
  windowMs: number | null;
  mttrTargetHours: number;
  /** Lower bound for "ok" — for % metrics this is in 0..100. */
  criticalSlaTargetPct: number;
  /** Upper bound for "ok" — reopen rate should be ≤ target. */
  reopenTargetPct: number;
  /** "ok" threshold for resolve-rate %. */
  resolveOkPct: number;
  /** "warn" threshold for resolve-rate % (below this = fail). */
  resolveWarnPct: number;
}

/**
 * Single entry point used by index.vue SLO strip. Guarantees every
 * result field is a NumericResult so templates don't need guards.
 */
export function calcSloMetrics(bugs: BugDocument[], opts: CalcSloOptions): SloMetricsResult {
  const { now, windowMs } = opts;
  const inWindow = windowMs == null
    ? bugs.slice()
    : bugs.filter(b => calcBugWindowAnchor(b) >= now - windowMs);

  // --- MTTR p95 ---
  const mttrHours: number[] = [];
  for (const b of inWindow) {
    const d = calcBugDurationMs(b, now);
    if (!d) continue;
    const h = d.ms / 3_600_000;
    if (h >= 0 && Number.isFinite(h)) mttrHours.push(h);
  }
  mttrHours.sort((a, c) => a - c);
  const p95Raw = calcPercentile(mttrHours, 95);
  // MTTR: lower is better. Target = mttrTargetHours; warn band = target * 1.25
  const mttrP95 = _thresholdStatus(p95Raw, mttrHours.length, opts.mttrTargetHours, opts.mttrTargetHours * 1.25, false);

  // --- Critical SLA % ---
  const critical = inWindow.filter(b => (b.severity || "trivial") === "critical");
  let slaGood = 0;
  for (const b of critical) {
    const s = calcBugSlaOk(b, now);
    // true = OK; null = non-done + still under SLA (count as OK per spec); false = breach
    if (s !== false) slaGood++;
  }
  const criticalSlaPctNum = critical.length ? (slaGood / critical.length) * 100 : 0;
  const criticalSlaPct = _thresholdStatus(
    Math.round(criticalSlaPctNum * 100) / 100,
    critical.length,
    opts.criticalSlaTargetPct,
    opts.criticalSlaTargetPct - 5,
    true,
  );

  // --- Reopen rate % ---
  const reopenedN = inWindow.filter(b => calcBugReopenCount(b) >= 1).length;
  const reopenRateNum = inWindow.length ? (reopenedN / inWindow.length) * 100 : 0;
  const reopenRatePct = _thresholdStatus(
    Math.round(reopenRateNum * 100) / 100,
    inWindow.length,
    opts.reopenTargetPct,
    Math.min(100, opts.reopenTargetPct + 3),
    false,
  );

  // --- Resolve rate % ---
  const resolvedN = inWindow.filter(b => DONE_STATUSES.has(b.status)).length;
  const resolveNum = inWindow.length ? (resolvedN / inWindow.length) * 100 : 0;
  const resolveRatePct = _thresholdStatus(
    Math.round(resolveNum * 100) / 100,
    inWindow.length,
    opts.resolveOkPct,
    opts.resolveWarnPct,
    true,
  );

  return {
    mttrP95,
    criticalSlaPct,
    reopenRatePct,
    resolveRatePct,
    openCount: inWindow.filter(b => !DONE_STATUSES.has(b.status) && b.status !== REJECTED).length,
    windowSize: inWindow.length,
    mttrSampleSize: mttrHours.length,
  };
}

/** Per-bug metric, used by CSV export (AC-R7) and per-row computed. */
export function calcBugPerf(b: BugDocument, now: number): BugPerf {
  const sev = (b.severity || "trivial") as BugSeverity;
  const limitMs = (BUG_SLA_HOURS[sev] ?? 168) * 3_600_000;
  const d = calcBugDurationMs(b, now);
  const mttrHours = d && d.kind === "ttr" ? Math.round((d.ms / 3_600_000) * 100) / 100 : null;
  const ttdMs = d
    ? (d.kind === "ttr" ? 0 : d.ms)
    : Math.max(0, now - Math.max(b.createdAt, _latestReopenTs(b)));
  const ttdHours = Math.round((ttdMs / 3_600_000) * 100) / 100;
  const slaOk = calcBugSlaOk(b, now);
  const reopenCount = calcBugReopenCount(b);
  void limitMs;
  return {
    mttrHours,
    ttdHours,
    slaOk,
    reopenCount,
    windowAnchorTs: calcBugWindowAnchor(b),
  };
}

// ── SPC Control Limits ─────────────────────────────────────────────────────

type SpcSample = { idx: number; value: number; key?: string; date: string };

/** Compute I-MR control limits for a time series. `series` is the array of
 *  daily MTTR mean or p95 values — we treat each sample as an individual
 *  observation (I-chart). UCL / LCL = mean ± 2.66 * MR̄ (factor for n=2). */
export function calcControlLimits(
  series: Array<{ value: number | null; date: string; key?: string }>,
): ControlLimits {
  const valid: SpcSample[] = [];
  for (let i = 0; i < series.length; i++) {
    const s = series[i]!;
    if (typeof s.value === "number" && !Number.isNaN(s.value)) {
      valid.push({ idx: i, value: s.value, key: s.key, date: s.date });
    }
  }

  if (valid.length === 0) {
    return { mean: 0, ucl: 0, lcl: 0, mRbar: 0, outliers: [] };
  }

  let sum = 0;
  const vals: number[] = [];
  for (const v of valid) {
    sum += v.value;
    vals.push(v.value);
  }
  const mean = sum / valid.length;

  const mr: number[] = [];
  for (let i = 1; i < vals.length; i++) {
    const a = vals[i - 1]!;
    const c = vals[i]!;
    mr.push(Math.abs(c - a));
  }
  let mRbar = 0;
  if (mr.length) {
    let msum = 0;
    for (const v of mr) msum += v;
    mRbar = msum / mr.length;
  }
  const half = 2.66 * mRbar;
  const ucl = mean + half;
  const lcl = Math.max(0, mean - half);
  const outliers: ControlLimits["outliers"] = [];
  for (const v of valid) {
    if (v.value > ucl || v.value < lcl) {
      outliers.push({ idx: v.idx, value: v.value, key: v.key, date: v.date });
    }
  }
  return { mean, ucl, lcl, mRbar, outliers };
}

// ── Sliding window helper for SLO strip: validates a query-string value ────

export function parseSloWindow(raw: unknown): SloWindowKey {
  if (typeof raw !== "string") return SLO_WINDOW_DEFAULT;
  const hit = SLO_WINDOWS.find(w => w.key === raw);
  return hit ? hit.key : SLO_WINDOW_DEFAULT;
}
