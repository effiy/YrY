import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import { useInlineEdit, type ColumnEditConfig } from "@/hooks/useInlineEdit";

describe("useInlineEdit", () => {
  const makeCols = () => ref<ColumnEditConfig[]>([
    { key: "name", editable: true },
    { key: "email", editable: true },
    { key: "id", editable: false },
  ]);

  it("initial state has no active edit", () => {
    const { editingCell } = useInlineEdit(makeCols());
    expect(editingCell.value).toBeNull();
  });

  it("startEdit sets editingCell", () => {
    const { editingCell, startEdit } = useInlineEdit(makeCols());
    startEdit("row1", "name", "Alice");
    expect(editingCell.value?.rowId).toBe("row1");
    expect(editingCell.value?.columnKey).toBe("name");
    expect(editingCell.value?.originalValue).toBe("Alice");
    expect(editingCell.value?.currentValue).toBe("Alice");
  });

  it("startEdit ignores non-editable columns", () => {
    const { editingCell, startEdit } = useInlineEdit(makeCols());
    startEdit("row1", "id", "001");
    expect(editingCell.value).toBeNull();
  });

  it("cancelEdit clears editingCell", () => {
    const { editingCell, startEdit, cancelEdit, getEditState } = useInlineEdit(makeCols());
    startEdit("row1", "name", "Alice");
    cancelEdit();
    expect(editingCell.value).toBeNull();
    expect(getEditState("row1", "name")).toBeNull();
  });

  it("commitEdit calls onCommit and marks row dirty", async () => {
    const onCommit = vi.fn().mockResolvedValue(undefined);
    const cols = makeCols();
    const { editingCell, startEdit, commitEdit, isDirty } = useInlineEdit(cols, onCommit);
    startEdit("row1", "name", "Alice");
    editingCell.value!.currentValue = "Bob";
    await commitEdit();
    expect(onCommit).toHaveBeenCalled();
    // Row should be marked dirty after value change
    expect(isDirty("row1")).toBe(true);
  });

  it("commitEdit does not mark dirty when value unchanged", async () => {
    const cols = makeCols();
    const { startEdit, commitEdit, isDirty } = useInlineEdit(cols);
    startEdit("row1", "name", "Alice");
    // submit without changing value
    await commitEdit();
    expect(isDirty("row1")).toBe(false);
  });

  it("commitEdit blocks on validation failure", async () => {
    const cols = ref<ColumnEditConfig[]>([
      { key: "name", editable: true, validate: (v) => (!v ? "必填" : true) },
    ]);
    const { editingCell, startEdit, commitEdit } = useInlineEdit(cols);
    startEdit("row1", "name", "Alice");
    editingCell.value!.currentValue = "";
    const result = await commitEdit();
    expect(result).toBe("必填");
    expect(editingCell.value).not.toBeNull(); // edit stays open
  });

  it("isEditing checks current editing cell", () => {
    const { isEditing, startEdit } = useInlineEdit(makeCols());
    expect(isEditing("row1", "name")).toBe(false);
    startEdit("row1", "name", "Alice");
    expect(isEditing("row1", "name")).toBe(true);
    expect(isEditing("row2", "name")).toBe(false);
  });

  it("getEditState survives virtual scroll DOM recycling", () => {
    const { startEdit, getEditState } = useInlineEdit(makeCols());
    startEdit("row1", "name", "Alice");
    const state = getEditState("row1", "name");
    expect(state?.originalValue).toBe("Alice");
  });

  it("isDirty reflects rows modified via commitEdit", async () => {
    const cols = makeCols();
    const { startEdit, commitEdit, isDirty, editingCell } = useInlineEdit(cols);
    expect(isDirty("row1")).toBe(false);
    startEdit("row1", "name", "Alice");
    editingCell.value!.currentValue = "Changed";
    await commitEdit();
    expect(isDirty("row1")).toBe(true);
  });

  it("clearDirty clears all dirty marks", async () => {
    const cols = makeCols();
    const { startEdit, commitEdit, editingCell, isDirty, clearDirty } = useInlineEdit(cols);
    startEdit("row1", "name", "Alice");
    editingCell.value!.currentValue = "Changed";
    await commitEdit();
    expect(isDirty("row1")).toBe(true);
    clearDirty();
    expect(isDirty("row1")).toBe(false);
  });

  it("moveToNextCell navigates to next column in same row", () => {
    const cols = ref<ColumnEditConfig[]>([
      { key: "a", editable: true },
      { key: "b", editable: true },
    ]);
    const rows = [{ id: "r1", a: "v1", b: "v2" }];
    const { editingCell, startEdit, moveToNextCell } = useInlineEdit(cols);
    startEdit("r1", "a", "v1");
    moveToNextCell(rows, "id");
    expect(editingCell.value?.columnKey).toBe("b");
  });
});