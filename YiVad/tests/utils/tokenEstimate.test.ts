import { describe, it, expect } from "vitest";
import { estimateTokens } from "@/utils/tokenEstimate";

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates Latin text at ~0.25 tokens per char", () => {
    const result = estimateTokens("hello world");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });

  it("estimates CJK text at ~1.5 tokens per char", () => {
    const result = estimateTokens("你好世界");
    expect(result).toBeGreaterThan(0);
    // 4 CJK chars * 1.5 = 6
    expect(result).toBe(6);
  });

  it("handles mixed CJK + Latin", () => {
    const result = estimateTokens("你好world");
    // 2 CJK * 1.5 = 3, 5 Latin * 0.25 = 1.25, total = ceil(4.25) = 5
    expect(result).toBe(5);
  });

  it("handles Japanese kana", () => {
    const result = estimateTokens("こんにちは");
    expect(result).toBeGreaterThan(0);
  });

  it("handles Korean Hangul", () => {
    const result = estimateTokens("안녕하세요");
    expect(result).toBeGreaterThan(0);
  });

  it("is monotonic (more chars → more tokens)", () => {
    const short = estimateTokens("a");
    const long = estimateTokens("a".repeat(100));
    expect(long).toBeGreaterThan(short);
  });
});