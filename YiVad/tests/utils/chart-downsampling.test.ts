import { describe, it, expect } from "vitest";
import { lttb, shouldDownsample, getThreshold } from "@/utils/chart/downsampling";

describe("LTTB downsampling", () => {
  const generateData = (n: number): [number, number][] =>
    Array.from({ length: n }, (_, i) => [i, Math.sin(i * 0.1) * 100 + Math.random() * 10]);

  it("returns original data when threshold >= data length", () => {
    const data: [number, number][] = [[0, 0], [1, 1], [2, 2]];
    const result = lttb(data, 5);
    expect(result).toHaveLength(3);
  });

  it("returns original data when data too small", () => {
    const data: [number, number][] = [[0, 0], [1, 1]];
    const result = lttb(data, 5);
    expect(result).toHaveLength(2);
  });

  it("reduces data to threshold", () => {
    const data = generateData(1000);
    const result = lttb(data, 100);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result.length).toBeGreaterThan(0);
  });

  it("preserves first and last data points", () => {
    const data = generateData(500);
    const result = lttb(data, 50);
    expect(result[0][0]).toBe(data[0][0]);
    expect(result[result.length - 1][0]).toBe(data[data.length - 1][0]);
  });

  it("shouldDownsample returns true for large datasets", () => {
    expect(shouldDownsample(10000, 800)).toBe(true);
  });

  it("shouldDownsample returns false for small datasets", () => {
    expect(shouldDownsample(50, 800)).toBe(false);
  });

  it("getThreshold scales with viewport", () => {
    expect(getThreshold(10000, 1200)).toBeGreaterThan(getThreshold(10000, 400));
  });

  it("handles edge case of minimum threshold", () => {
    const data: [number, number][] = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]];
    // threshold <= 2 returns original data; use 3 for minimum valid downsampling
    const result = lttb(data, 3);
    expect(result).toHaveLength(3);
    expect(result[0][0]).toBe(data[0][0]);
    expect(result[result.length - 1][0]).toBe(data[4][0]);
  });
});
