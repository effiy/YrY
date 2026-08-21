import { describe, it, expect } from "vitest";
import { useSelection } from "@/hooks/useSelection";

describe("useSelection", () => {
  it("initial state is not selected", () => {
    const { isSelected, selectedList, selectedListIds } = useSelection();
    expect(isSelected.value).toBe(false);
    expect(selectedList.value).toEqual([]);
    expect(selectedListIds.value).toEqual([]);
  });

  it("selects rows and computes ids", () => {
    const { isSelected, selectedList, selectedListIds, selectionChange } = useSelection("key");
    selectionChange([{ key: "a" }, { key: "b" }]);
    expect(isSelected.value).toBe(true);
    expect(selectedList.value).toHaveLength(2);
    expect(selectedListIds.value).toEqual(["a", "b"]);
  });

  it("deselects when empty array", () => {
    const { isSelected, selectionChange } = useSelection("key");
    selectionChange([{ key: "a" }]);
    selectionChange([]);
    expect(isSelected.value).toBe(false);
  });

  it("uses custom rowKey", () => {
    const { selectedListIds, selectionChange } = useSelection("id");
    selectionChange([{ id: 1 }, { id: 2 }]);
    expect(selectedListIds.value).toEqual([1, 2]);
  });

  it("default rowKey is 'id'", () => {
    const { selectedListIds, selectionChange } = useSelection();
    selectionChange([{ id: "x" }, { id: "y" }]);
    expect(selectedListIds.value).toEqual(["x", "y"]);
  });
});