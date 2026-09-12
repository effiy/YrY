import { describe, it, expect } from "vitest";
import { confirmationAnswerFor } from "@/utils/confirmationAnswer";

describe("confirmationAnswerFor", () => {
  describe("approve bare", () => {
    const approves = ["yes", "y", "ok", "okay", "sure", "yeah", "yep", "yup",
      "好", "行", "可以", "同意", "批准", "确认", "对", "是", "中", "执行"];
    for (const word of approves) {
      it(`"${word}" → approve, bare`, () => {
        expect(confirmationAnswerFor(word)).toEqual({ action: "approve", bare: true });
      });
    }
  });

  describe("reject bare", () => {
    const rejects = ["no", "n", "nah", "nope",
      "不", "别", "不行", "不要", "拒绝", "不同意", "取消", "否", "停", "不可以"];
    for (const word of rejects) {
      it(`"${word}" → reject, bare`, () => {
        expect(confirmationAnswerFor(word)).toEqual({ action: "reject", bare: true });
      });
    }
  });

  describe("approve prefix (non-bare)", () => {
    it("zh approve prefixes with extra text", () => {
      expect(confirmationAnswerFor("好的，请执行")).toEqual({ action: "approve", bare: false });
      expect(confirmationAnswerFor("可以执行 创建菜单")).toEqual({ action: "approve", bare: false });
    });

    it("en approve prefixes with extra text", () => {
      expect(confirmationAnswerFor("go ahead and create it")).toEqual({ action: "approve", bare: false });
      expect(confirmationAnswerFor("do it now")).toEqual({ action: "approve", bare: false });
    });
  });

  describe("reject prefix (non-bare)", () => {
    it("zh reject prefixes with correction", () => {
      expect(confirmationAnswerFor("不要删除，改成更新")).toEqual({ action: "reject", bare: false });
      expect(confirmationAnswerFor("不行，换个方式")).toEqual({ action: "reject", bare: false });
    });

    it("en reject prefixes with correction", () => {
      expect(confirmationAnswerFor("don't delete it")).toEqual({ action: "reject", bare: false });
      expect(confirmationAnswerFor("stop and do X instead")).toEqual({ action: "reject", bare: false });
    });
  });

  describe("non-answer", () => {
    it("task text is not an answer", () => {
      expect(confirmationAnswerFor("创建 3 个菜单")).toBeNull();
      expect(confirmationAnswerFor("create a menu")).toBeNull();
      expect(confirmationAnswerFor("what is the status?")).toBeNull();
    });

    it("empty/whitespace is not an answer", () => {
      expect(confirmationAnswerFor("")).toBeNull();
      expect(confirmationAnswerFor("   ")).toBeNull();
    });

    it("ambiguous single words are not answers", () => {
      expect(confirmationAnswerFor("now")).toBeNull();
      expect(confirmationAnswerFor("not")).toBeNull();
    });
  });

  describe("case-insensitive", () => {
    it("uppercase bare words", () => {
      expect(confirmationAnswerFor("YES")).toEqual({ action: "approve", bare: true });
      expect(confirmationAnswerFor("NO")).toEqual({ action: "reject", bare: true });
    });
  });
});