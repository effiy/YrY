import { describe, it, expect } from "vitest";
import { isContinuationMessage } from "@/utils/continuation";

describe("isContinuationMessage", () => {
  it("returns true for bare zh continuations", () => {
    expect(isContinuationMessage("继续")).toBe(true);
    expect(isContinuationMessage("继续完成")).toBe(true);
    expect(isContinuationMessage("继续吧")).toBe(true);
    expect(isContinuationMessage("接着来")).toBe(true);
    expect(isContinuationMessage("接着")).toBe(true);
  });

  it("returns true for bare en continuations", () => {
    expect(isContinuationMessage("continue")).toBe(true);
    expect(isContinuationMessage("go on")).toBe(true);
    expect(isContinuationMessage("keep going")).toBe(true);
  });

  it("returns true for zh prefixed continuations", () => {
    expect(isContinuationMessage("继续完成剩余任务")).toBe(true);
    expect(isContinuationMessage("接着做")).toBe(true);
  });

  it("returns true for en prefixed continuations", () => {
    expect(isContinuationMessage("continue the task")).toBe(true);
  });

  it("returns false for new task messages", () => {
    expect(isContinuationMessage("创建 3 个菜单")).toBe(false);
    expect(isContinuationMessage("create a menu")).toBe(false);
    expect(isContinuationMessage("help me debug this")).toBe(false);
  });

  it("returns false for empty/whitespace", () => {
    expect(isContinuationMessage("")).toBe(false);
    expect(isContinuationMessage("   ")).toBe(false);
  });

  it("is case-insensitive for en", () => {
    expect(isContinuationMessage("CONTINUE")).toBe(true);
    expect(isContinuationMessage("Go On")).toBe(true);
  });
});