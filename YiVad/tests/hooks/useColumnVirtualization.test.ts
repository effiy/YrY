import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useColumnVirtualization } from "@/hooks/useColumnVirtualization";

describe("useColumnVirtualization", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
    container.scrollTo = vi.fn();
    vi.useFakeTimers();
  });

  const mountScroll = (totalColumns: number, columnWidth = 120, overscan = 2) => {
    const containerRef = ref<HTMLElement | null>(null);
    const totalRef = ref(totalColumns);
    const { visibleColumnRange, totalWidth, scrollToColumn } = useColumnVirtualization({
      containerRef,
      totalColumns: totalRef,
      columnWidth,
      overscan
    });
    containerRef.value = container;
    return { visibleColumnRange, totalWidth, scrollToColumn, containerRef, totalRef };
  };

  it("calculates total width from column count and width", () => {
    const { totalWidth } = mountScroll(50, 120);
    expect(totalWidth.value).toBe(6000);
  });

  it("computes visible column range at start", () => {
    const { visibleColumnRange } = mountScroll(50, 120, 2);
    expect(visibleColumnRange.value.start).toBe(0);
    // viewport 800 / 120 ≈ 7 + 2*2 overscan = ~11
    expect(visibleColumnRange.value.end).toBeLessThanOrEqual(11);
    expect(visibleColumnRange.value.offsetLeft).toBe(0);
  });

  it("clamps end to total columns", () => {
    const { visibleColumnRange } = mountScroll(5, 120, 2);
    expect(visibleColumnRange.value.end).toBeLessThanOrEqual(5);
  });

  it("totalWidth updates when totalColumns ref changes", () => {
    const { totalWidth, totalRef } = mountScroll(50);
    expect(totalWidth.value).toBe(6000);
    totalRef.value = 100;
    expect(totalWidth.value).toBe(12000);
  });

  it("scrollToColumn calculates correct scrollLeft", () => {
    const { scrollToColumn } = mountScroll(50, 120);
    scrollToColumn(10);
    expect(container.scrollTo).toHaveBeenCalledWith({ left: 1200, behavior: "smooth" });
  });

  it("handles zero columns", () => {
    const { visibleColumnRange, totalWidth } = mountScroll(0);
    expect(totalWidth.value).toBe(0);
    expect(visibleColumnRange.value.end).toBe(0);
  });

  it("uses default values (columnWidth=120, overscan=2)", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const { totalWidth } = useColumnVirtualization({ containerRef, totalColumns: 20 });
    expect(totalWidth.value).toBe(2400);
  });

  it("handles null container gracefully", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const { scrollToColumn } = useColumnVirtualization({ containerRef, totalColumns: 50 });
    expect(() => scrollToColumn(10)).not.toThrow();
  });

  it("handles dynamic totalColumns via Ref", () => {
    const totalColumns = ref(0);
    const containerRef = ref<HTMLElement | null>(container);
    const { totalWidth } = useColumnVirtualization({ containerRef, totalColumns });
    expect(totalWidth.value).toBe(0);
    totalColumns.value = 30;
    expect(totalWidth.value).toBe(3600);
  });

  it("handles 200 columns — visible range stays bounded", () => {
    const { visibleColumnRange } = mountScroll(200, 100, 3);
    // viewport 800 / 100 = 8 + 3*2 = 14, clamped to 200
    expect(visibleColumnRange.value.end).toBeLessThanOrEqual(200);
    expect(visibleColumnRange.value.start).toBe(0);
  });
});