import { describe, it, expect } from "vitest";
import { formatRelativeTime, formatAbsolute } from "@/utils/datetime";

describe("formatRelativeTime", () => {
  it('returns "just now" for very recent timestamps', () => {
    const now = Date.now();
    expect(formatRelativeTime(now)).toBe("just now");
    expect(formatRelativeTime(now - 30_000)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const ts = Date.now() - 5 * 60_000;
    expect(formatRelativeTime(ts)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const ts = Date.now() - 3 * 60 * 60_000;
    expect(formatRelativeTime(ts)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const ts = Date.now() - 2 * 24 * 60 * 60_000;
    expect(formatRelativeTime(ts)).toBe("2d ago");
  });

  it("returns locale string for older timestamps (>1 week)", () => {
    const ts = Date.now() - 14 * 24 * 60 * 60_000;
    const result = formatRelativeTime(ts);
    expect(result).not.toBe("—");
    expect(result).not.toContain("ago");
  });

  it("returns dash for null/undefined/empty", () => {
    expect(formatRelativeTime(null)).toBe("—");
    expect(formatRelativeTime(undefined)).toBe("—");
    expect(formatRelativeTime("")).toBe("—");
  });
});

describe("formatAbsolute", () => {
  it("returns locale string for valid timestamp", () => {
    const result = formatAbsolute(Date.now());
    expect(result).not.toBe("—");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns dash for null/undefined/empty", () => {
    expect(formatAbsolute(null)).toBe("—");
    expect(formatAbsolute(undefined)).toBe("—");
    expect(formatAbsolute("")).toBe("—");
  });
});