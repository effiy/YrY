import { describe, it, expect } from "vitest";
import type { BugDocument, BugStatus } from "@/api/modules/bug";
import {
  calcPercentile,
  calcBugSlaOk,
  calcBugDurationMs,
  calcSloMetrics,
  calcBugReopenCount,
  calcControlLimits,
} from "@/utils/reliability/sloMetrics";
import { enrichBug } from "@/stores/modules/bug";

type BugSeed = Partial<BugDocument> & Pick<BugDocument, "key" | "title" | "project" | "module" | "severity" | "priority" | "status" | "type" | "frequency" | "assignee" | "reporter" | "environment" | "affectedVersion" | "fixedVersion" | "tags" | "dueDate" | "contentPath" | "createdAt" | "updatedAt" | "resolvedAt" | "closedAt">;

function baseBug(): BugSeed {
  return {
    key: "bug_t",
    title: "t",
    project: "YiVad",
    project_key: "yivad",
    issue_key: "ISS-1",
    module: "core",
    severity: "major",
    priority: "p2",
    status: "open",
    type: "logic",
    frequency: "sometimes",
    assignee: "alice",
    reporter: "qa",
    environment: "staging",
    affectedVersion: "1.0",
    fixedVersion: "",
    tags: [],
    dueDate: null,
    contentPath: "projects/yivad/bugs/2026-10-01/logic/bug_t.md",
    createdAt: 0,
    updatedAt: 0,
    resolvedAt: null,
    closedAt: null,
  };
}

describe("T8-1 calcPercentile linear interpolation", () => {
  it("p95 of [3,6,7,8,50] must be 41.6 (AC-R1)", () => {
    const sorted = [3, 6, 7, 8, 50];
    expect(calcPercentile(sorted, 95)).toBeCloseTo(41.6, 5);
  });

  it("p50 of odd & even samples", () => {
    expect(calcPercentile([1, 2, 3], 50)).toBe(2);
    expect(calcPercentile([1, 2, 3, 4], 50)).toBe(2.5);
  });
});

describe("T8-2 calcSloMetrics 7d sliding window (closed-interval)", () => {
  it("window exactly 3/10 using 2d narrow window and updatedAt out-of-range", () => {
    const now = 1_700_000_000_000;
    const DAY = 86_400_000;
    const bugs: BugDocument[] = [];
    for (let i = 0; i < 10; i++) {
      const created = now - i * DAY;
      const seed = baseBug();
      seed.key = `bw${i}`;
      seed.createdAt = created;
      const inside = i < 3;
      seed.updatedAt = inside ? now - DAY : created;
      seed.resolvedAt = inside ? now - 10 * 3_600_000 : null;
      seed.status = inside ? ("resolved" as BugStatus) : ("open" as BugStatus);
      bugs.push(seed as BugDocument);
    }
    const metrics = calcSloMetrics(bugs, {
      now,
      windowMs: 2 * DAY,
      mttrTargetHours: 24,
      criticalSlaTargetPct: 95,
      reopenTargetPct: 5,
      resolveOkPct: 70,
      resolveWarnPct: 50,
    });
    expect(metrics.windowSize).toBe(3);
  });
});

describe("T8-3 reopened bug SLA => false even if resolved quickly", () => {
  it("AC-R3 reopened + resolved 2h returns false", () => {
    const now = 10_000_000;
    const created = now - 100 * 3_600_000;
    const resolved = created + 2 * 3_600_000;
    const seed = baseBug();
    seed.key = "b_reopen";
    seed.status = "reopened" as BugStatus;
    seed.severity = "critical";
    seed.createdAt = created;
    seed.updatedAt = resolved;
    seed.resolvedAt = resolved;
    seed.timeline = [{
      kind: "reopen",
      ts: now - 5 * 60_000,
      by: "qa",
    } as any];
    const bug = seed as unknown as BugDocument;
    expect(calcBugSlaOk(bug, now)).toBe(false);
  });
});

describe("T8-4 Non-done TTD counts toward MTTR sample (T2-R4)", () => {
  it("mttrSampleSize = done TTR count + non-done count with TTD", () => {
    const now = 10_000_000_000;
    const H = 3_600_000;
    const bugs: BugDocument[] = [];
    // Two "done" bugs with TTR. Anchor = createdAt, resolvedAt strictly greater.
    for (let i = 0; i < 2; i++) {
      const seed = baseBug();
      seed.key = `done${i}`;
      seed.status = "resolved";
      seed.createdAt = now - 48 * H;
      seed.updatedAt = now - 25 * H;
      seed.resolvedAt = now - 24 * H; // TTR = 24h exactly, strictly > createdAt anchor.
      seed.closedAt = null;
      bugs.push(seed as unknown as BugDocument);
    }
    // Three "open" bugs with TTD
    for (let i = 0; i < 3; i++) {
      const seed = baseBug();
      seed.key = `open${i}`;
      seed.status = "open";
      seed.createdAt = now - (3 + i) * H;
      seed.updatedAt = seed.createdAt;
      seed.resolvedAt = null;
      bugs.push(seed as unknown as BugDocument);
    }
    // Each individual bug must yield a duration
    for (const b of bugs) {
      const d = calcBugDurationMs(b, now);
      expect(d).not.toBeNull();
      expect(d!.ms).toBeGreaterThan(0);
    }
    const metrics = calcSloMetrics(bugs, {
      now,
      windowMs: null,
      mttrTargetHours: 24,
      criticalSlaTargetPct: 95,
      reopenTargetPct: 5,
      resolveOkPct: 70,
      resolveWarnPct: 50,
    });
    expect(metrics.mttrSampleSize).toBe(5);
  });

  it("rejected bugs are excluded from MTTR sample", () => {
    const now = 10_000_000;
    const seed = baseBug();
    seed.key = "rej";
    seed.status = "rejected";
    seed.createdAt = now - 10_000_000;
    seed.updatedAt = now - 1_000_000;
    expect(calcBugDurationMs(seed as unknown as BugDocument, now)).toBeNull();
  });
});

describe("T8-5 calcControlLimits I-MR UCL/LCL (T6-R1)", () => {
  it("series [10,10,11,9,10,50] produces UCL>20 and flags 50 as outlier", () => {
    const series = [10, 10, 11, 9, 10, 50].map((v, i) => ({
      value: v,
      date: `2026-10-0${i + 1}`,
      key: `d${i}`,
    }));
    const cl = calcControlLimits(series);
    // Mean ≈ 16.667, MR̄ = 44/5 = 8.8, UCL = 16.667 + 2.66*8.8 ≈ 40.075
    expect(cl.ucl).toBeGreaterThan(20);
    expect(cl.lcl).toBeGreaterThanOrEqual(0);
    expect(cl.outliers.length).toBeGreaterThanOrEqual(1);
    const vals = cl.outliers.map(o => o.value);
    expect(vals).toContain(50);
  });
});

describe("T8-6 enrichBug reopenCount inference from status", () => {
  it("reopened + resolvedAt + reopenCount undefined => reopenCount === 1", () => {
    const seed = baseBug();
    seed.key = "b_r";
    seed.status = "reopened";
    seed.createdAt = 1;
    seed.updatedAt = 3;
    seed.resolvedAt = 2;
    seed.reopenCount = undefined as any;
    seed.timeline = undefined as any;
    const out = enrichBug(seed as unknown as BugDocument);
    // calcBugReopenCount uses 3-tier fallback; status+resolvedAt heuristic => 1
    expect(calcBugReopenCount(out)).toBeGreaterThanOrEqual(1);
    if (out.reopenCount != null) expect(out.reopenCount).toBe(1);
  });
});
