import { describe, it, expect, beforeEach } from "vitest";
import {
  loadBool, saveBool,
  loadNum, saveNum,
  loadStr, saveStr,
  loadJson, saveJson,
} from "@/utils/storage";

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
});