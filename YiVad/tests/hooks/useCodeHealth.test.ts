import { describe, it, expect } from "vitest";
import { useCodeHealth } from "@/hooks/useCodeHealth";

describe("useCodeHealth — pure helpers", () => {
  const { getLevel, fmtPct } = useCodeHealth({ value: "test" } as any);

  describe("getLevel", () => {
    it("normal: below warn is good", () => {
      expect(getLevel(5, [10, 20])).toBe("good");
    });
    it("normal: between warn and danger is warn", () => {
      expect(getLevel(15, [10, 20])).toBe("warn");
    });
    it("normal: above danger is danger", () => {
      expect(getLevel(25, [10, 20])).toBe("danger");
    });
    it("inverted: above warn is good", () => {
      expect(getLevel(0.9, [0.7, 0.5], true)).toBe("good");
    });
    it("inverted: between warn and danger is warn", () => {
      expect(getLevel(0.6, [0.7, 0.5], true)).toBe("warn");
    });
    it("inverted: below danger is danger", () => {
      expect(getLevel(0.4, [0.7, 0.5], true)).toBe("danger");
    });
  });

  describe("fmtPct", () => {
    it("formats percentage", () => { expect(fmtPct(0.856)).toBe("85.6%"); });
    it("formats 0", () => { expect(fmtPct(0)).toBe("0.0%"); });
    it("formats 1", () => { expect(fmtPct(1)).toBe("100.0%"); });
  });
});
