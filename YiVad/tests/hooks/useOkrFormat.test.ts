import { describe, it, expect } from "vitest";
import { stageIcon, stageLabel, scoreTagType, statusTagType, trendIcon, isResolvedRisk, STAGES, STAGE_KEYS } from "@/hooks/useOkrFormat";

describe("useOkrFormat", () => {
  describe("stageIcon", () => {
    it("returns icon for known stage", () => { expect(stageIcon("code-review")).toBe("🔍"); });
    it("returns dot for unknown stage", () => { expect(stageIcon("unknown")).toBe("·"); });
  });

  describe("stageLabel", () => {
    it("returns label for known stage", () => { expect(stageLabel("deployment")).toBe("部署"); });
    it("returns key for unknown stage", () => { expect(stageLabel("unknown")).toBe("unknown"); });
  });

  describe("scoreTagType", () => {
    it("score >= 60 is danger", () => { expect(scoreTagType(80)).toBe("danger"); });
    it("score 35-59 is warning", () => { expect(scoreTagType(50)).toBe("warning"); });
    it("score 15-34 is primary", () => { expect(scoreTagType(20)).toBe("primary"); });
    it("score < 15 is info", () => { expect(scoreTagType(5)).toBe("info"); });
  });

  describe("statusTagType", () => {
    it('"Done" is success', () => { expect(statusTagType("Done")).toBe("success"); });
    it('"At Risk" is danger', () => { expect(statusTagType("At Risk")).toBe("danger"); });
    it('"In Progress" is warning', () => { expect(statusTagType("In Progress")).toBe("warning"); });
    it("unknown is info", () => { expect(statusTagType("Unknown")).toBe("info"); });
  });

  describe("trendIcon", () => {
    it("up → ↑", () => { expect(trendIcon("up")).toBe("↑"); });
    it("down → ↓", () => { expect(trendIcon("down")).toBe("↓"); });
    it("other → →", () => { expect(trendIcon("flat")).toBe("→"); });
  });

  describe("isResolvedRisk", () => {
    it("resolved risk returns true", () => {
      expect(isResolvedRisk({ listType: "risk", kind: "action", status: "Done" })).toBe(true);
    });
    it("unresolved risk returns false", () => {
      expect(isResolvedRisk({ listType: "risk", kind: "action", status: "Todo" })).toBe(false);
    });
    it("non-risk item returns false", () => {
      expect(isResolvedRisk({ listType: "issue", kind: "action", status: "Done" })).toBe(false);
    });
  });

  describe("STAGES", () => {
    it("has 8 stages", () => { expect(STAGES).toHaveLength(8); });
    it("all stages have key/icon/label", () => {
      STAGES.forEach(s => { expect(s.key).toBeTruthy(); expect(s.icon).toBeTruthy(); expect(s.label).toBeTruthy(); });
    });
    it("STAGE_KEYS matches STAGES length", () => { expect(STAGE_KEYS).toHaveLength(STAGES.length); });
  });
});
