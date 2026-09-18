import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import { useRowSelection } from "@/hooks/useRowSelection";

describe("IT-01: VirtualScroll × RowSelection", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
    container.scrollTo = vi.fn();
    vi.useFakeTimers();
  });

  it("selected row stays selected after scrolling out and back", () => {
    const containerRef = ref<HTMLElement | null>(container);
    const totalRows = ref(100);
    const { scrollToIndex } = useVirtualScroll({
      containerRef,
      totalRows,
      rowHeight: 48,
      overscan: 5
    });
    const { selectedIds, toggleRow } = useRowSelection();

    // Select row 10
    toggleRow("row-10");
    expect(selectedIds.value.has("row-10")).toBe(true);

    // Scroll row 10 out of view by setting scrollTop manually
    const scrollEvent = new Event("scroll");
    Object.defineProperty(container, "scrollTop", { value: 3000, configurable: true });
    container.dispatchEvent(scrollEvent);
    vi.runAllTimers();

    // Row 10 still selected despite being out of view
    expect(selectedIds.value.has("row-10")).toBe(true);
  });

  it("full selection persists through scrolling", () => {
    const containerRef = ref<HTMLElement | null>(container);
    const totalRows = ref(100);
    const { scrollToIndex } = useVirtualScroll({ containerRef, totalRows });
    const { selectedIds, selectAll } = useRowSelection();

    // Select many rows at once
    const ids = Array.from({ length: 50 }, (_, i) => `row-${i}`);
    const rows = ids.map(id => ({ id }));
    selectAll(ids, rows);
    expect(selectedIds.value.size).toBe(50);

    // Scroll to end
    scrollToIndex(90);
    // Selection count unchanged
    expect(selectedIds.value.size).toBe(50);
  });

  it("clear selection removes all selected ids", () => {
    const { selectedIds, toggleRow, clearSelection } = useRowSelection();
    toggleRow("row-1");
    toggleRow("row-2");
    toggleRow("row-3");

    clearSelection();
    expect(selectedIds.value.size).toBe(0);
  });

  it("deselect toggles row off", () => {
    const { selectedIds, toggleRow } = useRowSelection();
    toggleRow("row-5");
    expect(selectedIds.value.has("row-5")).toBe(true);
    toggleRow("row-5");
    expect(selectedIds.value.has("row-5")).toBe(false);
  });
});