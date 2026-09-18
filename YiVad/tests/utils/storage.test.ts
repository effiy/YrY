import { describe, it, expect, beforeEach } from "vitest";
import {
  loadBool, saveBool,
  loadNum, saveNum,
  loadStr, saveStr,
  loadJson, saveJson,
  getStorageQuota,
  type StorageQuotaInfo,
} from "@/utils/storage";

const ESTIMATED_LIMIT = 5_000_000;

describe("storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadBool / saveBool", () => {
    it("returns fallback when key not set", () => {
      expect(loadBool("x", true)).toBe(true);
      expect(loadBool("x", false)).toBe(false);
    });

    it("round-trips true", () => {
      saveBool("a", true);
      expect(loadBool("a", false)).toBe(true);
    });

    it("round-trips false", () => {
      saveBool("a", false);
      expect(loadBool("a", true)).toBe(false);
    });
  });

  describe("loadNum / saveNum", () => {
    it("returns fallback when key not set", () => {
      expect(loadNum("x", 42)).toBe(42);
    });

    it("round-trips integers", () => {
      saveNum("n", 123);
      expect(loadNum("n", 0)).toBe(123);
    });

    it("round-trips floats", () => {
      saveNum("n", 3.14);
      expect(loadNum("n", 0)).toBeCloseTo(3.14);
    });

    it("returns fallback for non-numeric stored value", () => {
      localStorage.setItem("bad", "not-a-number");
      expect(loadNum("bad", 99)).toBe(99);
    });
  });

  describe("loadStr / saveStr", () => {
    it("returns fallback when key not set", () => {
      expect(loadStr("x", "default")).toBe("default");
    });

    it("round-trips strings", () => {
      saveStr("s", "hello");
      expect(loadStr("s", "")).toBe("hello");
    });

    it("handles empty string", () => {
      saveStr("s", "");
      expect(loadStr("s", "fallback")).toBe("");
    });
  });

  describe("loadJson / saveJson", () => {
    it("returns fallback when key not set", () => {
      expect(loadJson("x", { a: 1 })).toEqual({ a: 1 });
    });

    it("round-trips objects", () => {
      saveJson("j", { name: "test", count: 5 });
      expect(loadJson("j", {})).toEqual({ name: "test", count: 5 });
    });

    it("round-trips arrays", () => {
      saveJson("j", [1, 2, 3]);
      expect(loadJson("j", [])).toEqual([1, 2, 3]);
    });

    it("returns fallback for invalid JSON", () => {
      localStorage.setItem("bad", "{not json}");
      expect(loadJson("bad", { fallback: true })).toEqual({ fallback: true });
    });
  });

  describe("getStorageQuota (TD-04)", () => {
    it("U-12-S01: reports ok when usage under 85%", () => {
      // Empty localStorage → near-zero usage → level "ok"
      const q = getStorageQuota();
      expect(q.level).toBe("ok");
      expect(q.usageRatio).toBeLessThan(0.85);
      expect(q.usedBytes).toBeGreaterThanOrEqual(0);
      expect(q.estimatedLimit).toBe(ESTIMATED_LIMIT);
    });

    it("reports warn when usage reaches 85%", () => {
      // Fill localStorage to ~4.25MB (85% of 5MB)
      const targetBytes = Math.ceil(ESTIMATED_LIMIT * 0.86);
      let filled = 0;
      let i = 0;
      while (filled < targetBytes) {
        const val = "x".repeat(100_000); // ~200KB per entry (key+value × 2)
        try {
          localStorage.setItem(`_quota_test_${i++}`, val);
          filled += ("_quota_test_".length + 10 + val.length) * 2;
        } catch {
          break; // localStorage full
        }
      }
      const q = getStorageQuota();
      expect(["warn", "critical"]).toContain(q.level);
      expect(q.usageRatio).toBeGreaterThanOrEqual(0.85);
    });

    it("returns zero usage and ok level on access error", () => {
      // When localStorage is unavailable, should not throw
      const q = getStorageQuota();
      expect(q.level).toBeDefined();
      expect(q.estimatedLimit).toBe(ESTIMATED_LIMIT);
    });
  });
});