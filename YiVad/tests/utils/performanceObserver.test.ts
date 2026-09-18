import { describe, it, expect, beforeEach } from "vitest";
import { markTiming, measureTiming, getUserMeasures } from "@/utils/performance/performanceObserver";

describe("performanceObserver", () => {
  beforeEach(() => {
    // Clear user measures between tests
    const existing = getUserMeasures();
    existing.length = 0;
  });

  it("markTiming creates a named mark", () => {
    markTiming("test-component", { render: true });
    const result = measureTiming("test-component");
    expect(result).not.toBeNull();
    expect(typeof result).toBe("number");
  });

  it("measureTiming returns null for unknown mark", () => {
    const result = measureTiming("nonexistent");
    expect(result).toBeNull();
  });

  it("getUserMeasures returns completed measurements", () => {
    markTiming("api-call");
    measureTiming("api-call");
    const measures = getUserMeasures();
    const apiMeasure = measures.find(m => m.name === "api-call");
    expect(apiMeasure).toBeDefined();
    expect(apiMeasure?.duration).toBeGreaterThanOrEqual(0);
  });

  it("markTiming stores metadata", () => {
    markTiming("render", { phase: "mount" });
    measureTiming("render");
    const measures = getUserMeasures();
    const found = measures.find(m => m.name === "render");
    expect(found?.metadata).toEqual({ phase: "mount" });
  });

  it("duration is a positive number", () => {
    markTiming("quick-op");
    const duration = measureTiming("quick-op");
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});
