import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import { useInlineEdit, type ColumnEditConfig } from "@/hooks/useInlineEdit";

describe("IT-08: InlineEdit × VirtualScroll", () => {
  let container: HTMLElement;
  const columns = ref<ColumnEditConfig[]>([
    { key: "name", editorType: "text", editable: true },
    { key: "age", editorType: "number", editable: true },
    { key: "email", editorType: "text", editable: true },
  ]);

  beforeEach(() => {
    container = document.createElement("div");
    Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
    container.scrollTo = vi.fn();
    vi.useFakeTimers();
  });

  it("edit state survives row being recycled by virtual scroll", () => {
    const containerRef = ref<HTMLElement | null>(container);
    const totalRows = ref(100);
    const { visibleRange } = useVirtualScroll({
      containerRef,
      totalRows,
      rowHeight: 48,
      overscan: 5
    });
    const onCommit = vi.fn();
    const { startEdit, getEditState, editingCell } = useInlineEdit(columns, onCommit);

    // Start editing row 5, column "name"
    startEdit("row-5", "name", "Alice");
    expect(editingCell.value?.rowId).toBe("row-5");
    expect(editingCell.value?.columnKey).toBe("name");
    expect(editingCell.value?.currentValue).toBe("Alice");

    // Simulate row scrolling out of view
    // editStateMap preserves the state even if DOM is recycled
    const state = getEditState("row-5", "name");
    expect(state).not.toBeNull();
    expect(state?.currentValue).toBe("Alice");
  });

  it("multiple cells can be edited concurrently — state map keys do not collide", () => {
    const onCommit = vi.fn();
    const { startEdit, getEditState } = useInlineEdit(columns, onCommit);

    startEdit("row-1", "name", "Alice");
    startEdit("row-1", "age", 30);
    startEdit("row-2", "name", "Bob");

    // All three edit states exist independently
    expect(getEditState("row-1", "name")?.currentValue).toBe("Alice");
    expect(getEditState("row-1", "age")?.currentValue).toBe(30);
    expect(getEditState("row-2", "name")?.currentValue).toBe("Bob");
  });

  it("cancelEdit clears edit state without committing", async () => {
    const onCommit = vi.fn();
    const { startEdit, cancelEdit, getEditState, editingCell } = useInlineEdit(columns, onCommit);

    startEdit("row-3", "name", "Charlie");
    cancelEdit();

    expect(editingCell.value).toBeNull();
    expect(getEditState("row-3", "name")).toBeNull();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commitEdit marks dirty when value changes and calls onCommit", async () => {
    const onCommit = vi.fn();
    const { startEdit, commitEdit, isDirty, editingCell } = useInlineEdit(columns, onCommit);

    startEdit("row-7", "name", "Old");
    // Change the value
    editingCell.value!.currentValue = "New";

    await commitEdit();
    expect(isDirty("row-7")).toBe(true);
    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: "row-7", columnKey: "name", currentValue: "New" })
    );
  });

  it("commitEdit does not mark dirty if value unchanged", async () => {
    const onCommit = vi.fn();
    const { startEdit, commitEdit, isDirty } = useInlineEdit(columns, onCommit);

    startEdit("row-7", "name", "Same");
    await commitEdit();
    expect(isDirty("row-7")).toBe(false);
  });

  it("moveToNextCell navigates to next editable column", () => {
    const onCommit = vi.fn();
    const rows = [{ id: "row-5", name: "Alice", age: 30, email: "a@b.com" }];
    const { startEdit, moveToNextCell, editingCell } = useInlineEdit(columns, onCommit);

    startEdit("row-5", "name", "Alice");
    moveToNextCell(rows, "id");

    expect(editingCell.value?.columnKey).toBe("age");
    expect(editingCell.value?.rowId).toBe("row-5");
  });

  it("non-editable columns are skipped", () => {
    const restrictedColumns = ref<ColumnEditConfig[]>([
      { key: "name", editable: true },
      { key: "secret", editable: false },
    ]);
    const onCommit = vi.fn();
    const { startEdit, editingCell } = useInlineEdit(restrictedColumns, onCommit);

    startEdit("row-1", "secret", "hidden");
    // Should not start editing non-editable column
    expect(editingCell.value).toBeNull();
  });
});