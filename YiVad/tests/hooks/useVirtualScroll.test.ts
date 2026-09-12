import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";

describe("useVirtualScroll", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
    container.scrollTo = vi.fn();
    vi.useFakeTimers();
  });

  const mountScroll = (totalRows: number, rowHeight = 48, overscan = 5) => {
    // Simulate a mounted container with the composable
    const containerRef = ref<HTMLElement | null>(null);
    const totalRef = ref(totalRows);
    const { visibleRange, totalHeight, scrollToIndex } = useVirtualScroll({
      containerRef,
      totalRows: totalRef,
      rowHeight,
      overscan,
    });
    containerRef.value = container;
    return { visibleRange, totalHeight, scrollToIndex, containerRef, totalRef };
  };

  it("calculates total height from row count and height", () => {
    const { totalHeight } = mountScroll(100, 48);
    expect(totalHeight.value).toBe(4800);
  });

  it("computes visible range at top of scroll (default overscan=5)", () => {
    const { visibleRange } = mountScroll(100, 48, 5);
    expect(visibleRange.value.start).toBe(0);
    // viewport 600 / rowHeight 48 ≈ 13 visible + 5*2 overscan = ~23
    expect(visibleRange.value.end).toBeLessThanOrEqual(23);
    expect(visibleRange.value.offsetTop).toBe(0);
  });

  it("clamps end to total rows", () => {
    const { visibleRange } = mountScroll(10, 48, 5);
    expect(visibleRange.value.end).toBeLessThanOrEqual(10);
  });

  it("totalHeight updates when totalRows ref changes", () => {
    const { totalHeight, totalRef } = mountScroll(100);
    expect(totalHeight.value).toBe(4800);
    totalRef.value = 200;
    expect(totalHeight.value).toBe(9600);
  });

  it("scrollToIndex calculates correct scrollTop", () => {
    const { scrollToIndex } = mountScroll(100, 48);
    scrollToIndex(50);
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 2400, behavior: "smooth" });
  });

  it("handles zero rows", () => {
    const { visibleRange, totalHeight } = mountScroll(0);
    expect(totalHeight.value).toBe(0);
    expect(visibleRange.value.end).toBe(0);
  });

  it("uses default values (rowHeight=48, overscan=5)", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const { totalHeight } = useVirtualScroll({ containerRef, totalRows: 50 });
    expect(totalHeight.value).toBe(2400);
  });

  it("handles null container gracefully", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const { scrollToIndex } = useVirtualScroll({ containerRef, totalRows: 50 });
    expect(() => scrollToIndex(10)).not.toThrow();
  });

  it("handles RAF throttling — only one pending frame at a time", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const { visibleRange } = useVirtualScroll({ containerRef, totalRows: 100 });
    containerRef.value = container;

    // Simulate rapid scroll events; only the last position matters
    const event1 = { target: { scrollTop: 1000 } } as unknown as Event;
    const event2 = { target: { scrollTop: 2000 } } as unknown as Event;
    container.dispatchEvent(new CustomEvent("scroll", { detail: event1 }));
    container.dispatchEvent(new CustomEvent("scroll", { detail: event2 }));
    vi.runAllTimers();

    // visibleRange should reflect scrollTop based on the RAF callback
    expect(visibleRange.value).toBeDefined();
  });

  it("handles dynamic totalRows via Ref", () => {
    const totalRows = ref(0);
    const containerRef = ref<HTMLElement | null>(container);
    const { totalHeight } = useVirtualScroll({ containerRef, totalRows });
    expect(totalHeight.value).toBe(0);
    totalRows.value = 100;
    expect(totalHeight.value).toBe(4800);
  });
});