import { describe, it, expect } from "vitest";
import { useLazyLoad } from "@/hooks/useLazyLoad";

describe("useLazyLoad", () => {
  it("starts as not visible", () => {
    const { visible } = useLazyLoad();
    expect(visible.value).toBe(false);
  });

  it("observes an element without throwing", () => {
    const { observe } = useLazyLoad();
    const el = document.createElement("div");
    expect(() => observe(el)).not.toThrow();
  });

  it("does not throw when observing null", () => {
    const { observe } = useLazyLoad();
    expect(() => observe(null)).not.toThrow();
  });
});