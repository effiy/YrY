import { describe, it, expect, beforeEach } from "vitest";
import { setSlowThreshold, formatSlowThreshold, useSlowThreshold, SLOW_THRESHOLD_PRESETS } from "@/hooks/useSlowThreshold";

describe("useSlowThreshold", () => {
  beforeEach(() => { setSlowThreshold(1000); });

  it("default threshold is 1000ms", () => {
    const { slowThresholdMs } = useSlowThreshold();
    expect(slowThresholdMs.value).toBe(1000);
  });

  it("setSlowThreshold updates value", () => {
    setSlowThreshold(500);
    const { slowThresholdMs } = useSlowThreshold();
    expect(slowThresholdMs.value).toBe(500);
  });

  it("setSlowThreshold ignores invalid values", () => {
    setSlowThreshold(-1);
    const { slowThresholdMs } = useSlowThreshold();
    expect(slowThresholdMs.value).toBeGreaterThan(0);
  });

  describe("formatSlowThreshold", () => {
    it("formats ms", () => { expect(formatSlowThreshold(500)).toBe("500ms"); });
    it("formats seconds", () => { expect(formatSlowThreshold(2000)).toBe("2s"); });
    it("formats partial seconds", () => { expect(formatSlowThreshold(1500)).toBe("1.5s"); });
  });

  describe("SLOW_THRESHOLD_PRESETS", () => {
    it("has 5 presets", () => { expect(SLOW_THRESHOLD_PRESETS).toHaveLength(5); });
    it("all presets are positive", () => { SLOW_THRESHOLD_PRESETS.forEach(p => expect(p).toBeGreaterThan(0)); });
  });
});
