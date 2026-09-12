import { describe, it, expect } from "vitest";
import { useRowSelection } from "@/hooks/useRowSelection";

describe("useRowSelection", () => {
  it("initial state is not selected", () => {
    const { isSelected, selectedCount, selectedList } = useRowSelection();
    expect(isSelected.value).toBe(false);
    expect(selectedCount.value).toBe(0);
    expect(selectedList.value).toEqual([]);
  });

  it("toggles row selection on and off", () => {
    const { selectedIds, selectedCount, toggleRow } = useRowSelection("id");
    toggleRow("a", { id: "a", name: "Alice" });
    expect(selectedIds.value.has("a")).toBe(true);
    expect(selectedCount.value).toBe(1);

    toggleRow("a");
    expect(selectedIds.value.has("a")).toBe(false);
    expect(selectedCount.value).toBe(0);
  });

  it("single selection mode clears previous selection", () => {
    const { selectedIds, toggleRow } = useRowSelection("id");
    const sel = useRowSelection("id");
    sel.selectionMode.value = "single";
    sel.toggleRow("a", { id: "a" });
    sel.toggleRow("b", { id: "b" });
    expect(sel.selectedIds.value.has("a")).toBe(false);
    expect(sel.selectedIds.value.has("b")).toBe(true);
    expect(sel.selectedCount.value).toBe(1);
  });

  it("selectRange adds multiple rows", () => {
    const { selectedIds, selectedCount, selectRange } = useRowSelection("id");
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    selectRange(["a", "b", "c"], rows);
    expect(selectedCount.value).toBe(3);
    expect(selectedIds.value.has("a")).toBe(true);
    expect(selectedIds.value.has("b")).toBe(true);
    expect(selectedIds.value.has("c")).toBe(true);
  });

  it("selectAll replaces all selections", () => {
    const { selectedIds, selectedList, toggleRow, selectAll } = useRowSelection("id");
    toggleRow("x", { id: "x" });
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    selectAll(["a", "b", "c"], rows);
    expect(selectedIds.value.size).toBe(3);
    expect(selectedList.value).toHaveLength(3);
    expect(selectedIds.value.has("x")).toBe(false);
  });

  it("clearSelection resets all state", () => {
    const { selectedIds, selectedList, selectedCount, toggleRow, clearSelection } = useRowSelection("id");
    toggleRow("a", { id: "a" });
    toggleRow("b", { id: "b" });
    clearSelection();
    expect(selectedIds.value.size).toBe(0);
    expect(selectedList.value).toEqual([]);
    expect(selectedCount.value).toBe(0);
  });

  it("selectionChange replaces selection entirely", () => {
    const { selectedIds, selectedList, toggleRow, selectionChange } = useRowSelection("id");
    toggleRow("old", { id: "old" });
    selectionChange([{ id: "new1" }, { id: "new2" }]);
    expect(selectedIds.value.size).toBe(2);
    expect(selectedList.value).toHaveLength(2);
    expect(selectedIds.value.has("old")).toBe(false);
  });

  it("uses custom rowKey", () => {
    const { selectedListIds, selectionChange } = useRowSelection("key");
    selectionChange([{ key: "x" }, { key: "y" }]);
    expect(selectedListIds.value).toEqual(["x", "y"]);
  });

  it("default rowKey is 'id'", () => {
    const { selectedListIds, selectionChange } = useRowSelection();
    selectionChange([{ id: "p" }, { id: "q" }]);
    expect(selectedListIds.value).toEqual(["p", "q"]);
  });

  it("isIndeterminate is true when any rows are selected", () => {
    const { isIndeterminate, toggleRow } = useRowSelection();
    expect(isIndeterminate.value).toBe(false);
    toggleRow("a", { id: "a" });
    expect(isIndeterminate.value).toBe(true);
  });
});