import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MetricsRecorder, MetricEvent } from "@/utils/reliability/metricsRecorder";

describe("MetricsRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("TR-3.1 push 4 条事件并聚合", () => {
    it("should push 4 events and keep them in buffer", () => {
      const rec = new MetricsRecorder();
      const t0 = Date.now();

      rec.push("latency", 100);
      vi.advanceTimersByTime(1);
      rec.push("latency", 150);
      vi.advanceTimersByTime(1);
      rec.push("latency", 200);
      vi.advanceTimersByTime(1);
      rec.push("latency", 120);

      const buf = rec.getBuffer();
      expect(buf.length).toBe(4);
      expect(buf[0].name).toBe("latency");
      expect(buf[0].value).toBe(100);
      expect(buf[0].timestamp).toBeGreaterThanOrEqual(t0);
      expect(buf[3].value).toBe(120);
    });

    it("should aggregate 4 same-named events with correct count/sum/avg/min/max", () => {
      const rec = new MetricsRecorder();

      rec.push("latency", 100);
      rec.push("latency", 150);
      rec.push("latency", 200);
      rec.push("latency", 120);

      const aggs = rec.aggregate("latency");
      expect(aggs.length).toBe(1);
      const agg = aggs[0];

      expect(agg.name).toBe("latency");
      expect(agg.count).toBe(4);
      expect(agg.sum).toBe(100 + 150 + 200 + 120);
      expect(agg.avg).toBe((100 + 150 + 200 + 120) / 4);
      expect(agg.min).toBe(100);
      expect(agg.max).toBe(200);
    });

    it("should compute percentiles p50/p95/p99 for 4 events", () => {
      const rec = new MetricsRecorder();

      rec.push("latency", 10);
      rec.push("latency", 20);
      rec.push("latency", 30);
      rec.push("latency", 40);

      const agg = rec.aggregate("latency")[0];
      expect(agg.p50).toBeCloseTo(25, 5);
      expect(agg.p95).toBeDefined();
      expect(agg.p99).toBeDefined();
      expect(agg.p95!).toBeGreaterThanOrEqual(30);
      expect(agg.p99!).toBeGreaterThanOrEqual(30);
    });

    it("should push 4 events with tags and aggregate separately by tag groups", () => {
      const rec = new MetricsRecorder();

      rec.push("req", 10, { route: "/a" });
      rec.push("req", 20, { route: "/a" });
      rec.push("req", 100, { route: "/b" });
      rec.push("req", 200, { route: "/b" });

      const aggs = rec.aggregate("req");
      expect(aggs.length).toBe(2);

      const byRoute = new Map(aggs.map((a) => [a.tags!.route, a]));
      expect(byRoute.get("/a")!.count).toBe(2);
      expect(byRoute.get("/a")!.sum).toBe(30);
      expect(byRoute.get("/b")!.count).toBe(2);
      expect(byRoute.get("/b")!.sum).toBe(300);
    });

    it("should push 4 events with different names and aggregate() without filter returns all groups", () => {
      const rec = new MetricsRecorder();

      rec.push("cpu", 50);
      rec.push("cpu", 70);
      rec.push("mem", 1024);
      rec.push("mem", 2048);

      const aggs = rec.aggregate();
      const names = aggs.map((a) => a.name).sort();
      expect(names).toEqual(["cpu", "mem"]);

      const cpu = aggs.find((a) => a.name === "cpu")!;
      expect(cpu.count).toBe(2);
      expect(cpu.avg).toBe(60);

      const mem = aggs.find((a) => a.name === "mem")!;
      expect(mem.count).toBe(2);
      expect(mem.avg).toBe(1536);
    });

    it("should have firstTimestamp <= lastTimestamp for 4 events", () => {
      const rec = new MetricsRecorder();

      rec.push("x", 1);
      vi.advanceTimersByTime(10);
      rec.push("x", 2);
      vi.advanceTimersByTime(10);
      rec.push("x", 3);
      vi.advanceTimersByTime(10);
      rec.push("x", 4);

      const agg = rec.aggregate("x")[0];
      expect(agg.firstTimestamp).toBeLessThan(agg.lastTimestamp);
    });

    it("size should match pushed count after 4 pushes", () => {
      const rec = new MetricsRecorder();
      expect(rec.size).toBe(0);
      rec.push("a", 1);
      rec.push("a", 2);
      rec.push("a", 3);
      rec.push("a", 4);
      expect(rec.size).toBe(4);
    });
  });

  describe("TR-3.2 环形缓冲区上限 2000", () => {
    it("should report capacity of 2000 by default", () => {
      const rec = new MetricsRecorder();
      expect(rec.getCapacity()).toBe(2000);
    });

    it("should accept custom capacity", () => {
      const rec = new MetricsRecorder(100);
      expect(rec.getCapacity()).toBe(100);
    });

    it("should not drop events within 2000 capacity", () => {
      const rec = new MetricsRecorder(2000);
      for (let i = 1; i <= 2000; i++) {
        rec.push("e", i);
      }
      expect(rec.size).toBe(2000);
      const buf = rec.getBuffer();
      expect(buf[0].value).toBe(1);
      expect(buf[1999].value).toBe(2000);
    });

    it("should evict oldest events when pushing beyond 2000 (ring buffer behavior)", () => {
      const rec = new MetricsRecorder(2000);
      for (let i = 1; i <= 2000; i++) {
        rec.push("e", i);
      }
      expect(rec.size).toBe(2000);
      expect(rec.getBuffer()[0].value).toBe(1);

      rec.push("e", 2001);
      expect(rec.size).toBe(2000);
      expect(rec.getBuffer()[0].value).toBe(2);
      expect(rec.getBuffer()[1999].value).toBe(2001);
    });

    it("should drop N oldest after pushing 2500 events into 2000 capacity", () => {
      const rec = new MetricsRecorder(2000);
      for (let i = 1; i <= 2500; i++) {
        rec.push("e", i);
      }
      expect(rec.size).toBe(2000);
      const buf = rec.getBuffer();
      expect(buf[0].value).toBe(501);
      expect(buf[1999].value).toBe(2500);
    });

    it("aggregate should still work correctly after ring buffer evictions", () => {
      const rec = new MetricsRecorder(2000);
      for (let i = 1; i <= 2500; i++) {
        rec.push("v", i);
      }
      const agg = rec.aggregate("v")[0];
      expect(agg.count).toBe(2000);
      expect(agg.min).toBe(501);
      expect(agg.max).toBe(2500);
      expect(agg.sum).toBe((501 + 2500) * 2000 / 2);
    });

    it("clear() should reset size to 0", () => {
      const rec = new MetricsRecorder(2000);
      for (let i = 0; i < 100; i++) rec.push("e", i);
      expect(rec.size).toBe(100);
      rec.clear();
      expect(rec.size).toBe(0);
      expect(rec.getBuffer().length).toBe(0);
    });
  });
});
