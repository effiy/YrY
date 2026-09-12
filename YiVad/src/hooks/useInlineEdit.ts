import { ref, type Ref } from "vue";

export interface EditingCell {
  rowId: string;
  columnKey: string;
  originalValue: any;
  currentValue: any;
}

export type EditorType = "text" | "number" | "select" | "date" | "datetime" | "tag" | "user" | "boolean" | "textarea" | "color";

export interface ColumnEditConfig {
  key: string;
  editorType?: EditorType;
  editable?: boolean;
  options?: { label: string; value: any }[];
  validate?: (value: any) => string | true;
}

export function useInlineEdit(
  columns: Ref<ColumnEditConfig[]>,
  onCommit?: (cell: EditingCell) => Promise<void>,
) {
  const editingCell = ref<EditingCell | null>(null);
  const dirtyRows = ref<Set<string>>(new Set());
  // Map key: `${rowId}:${columnKey}` — survives virtual scroll DOM recycling
  const editStateMap = new Map<string, EditingCell>();

  const editableColumns = computed(() => {
    const map = new Map<string, ColumnEditConfig>();
    columns.value.filter((c) => c.editable !== false).forEach((c) => map.set(c.key, c));
    return map;
  });

  const isEditing = (rowId: string, columnKey: string) =>
    editingCell.value?.rowId === rowId && editingCell.value?.columnKey === columnKey;

  const getEditState = (rowId: string, columnKey: string) =>
    editStateMap.get(`${rowId}:${columnKey}`) ?? null;

  const startEdit = (rowId: string, columnKey: string, currentValue: any) => {
    const col = editableColumns.value.get(columnKey);
    if (!col) return;
    const cell: EditingCell = { rowId, columnKey, originalValue: currentValue, currentValue };
    editingCell.value = cell;
    editStateMap.set(`${rowId}:${columnKey}`, cell);
  };

  const cancelEdit = () => {
    if (!editingCell.value) return;
    const key = `${editingCell.value.rowId}:${editingCell.value.columnKey}`;
    editStateMap.delete(key);
    editingCell.value = null;
  };

  const commitEdit = async () => {
    if (!editingCell.value) return;
    const col = editableColumns.value.get(editingCell.value.columnKey);
    if (col?.validate) {
      const result = col.validate(editingCell.value.currentValue);
      if (result !== true) return result;
    }
    if (editingCell.value.currentValue !== editingCell.value.originalValue) {
      dirtyRows.value.add(editingCell.value.rowId);
    }
    await onCommit?.(editingCell.value);
    const key = `${editingCell.value.rowId}:${editingCell.value.columnKey}`;
    editStateMap.delete(key);
    editingCell.value = null;
  };

  const moveToNextCell = (rows: Record<string, any>[], rowKey: string) => {
    if (!editingCell.value) return;
    const { rowId, columnKey } = editingCell.value;
    const colKeys = Array.from(editableColumns.value.keys());
    const colIdx = colKeys.indexOf(columnKey);
    const nextCol = colKeys[colIdx + 1];
    if (nextCol) {
      const row = rows.find((r) => r[rowKey] === rowId);
      startEdit(rowId, nextCol, row?.[nextCol]);
    } else {
      const rowIdx = rows.findIndex((r) => r[rowKey] === rowId);
      const nextRow = rows[rowIdx + 1];
      if (nextRow) {
        startEdit(nextRow[rowKey], colKeys[0], nextRow[colKeys[0]]);
      } else {
        cancelEdit();
      }
    }
  };

  const isDirty = (rowId: string) => dirtyRows.value.has(rowId);
  const clearDirty = (rowId?: string) => {
    if (rowId) dirtyRows.value.delete(rowId);
    else dirtyRows.value.clear();
  };

  return { editingCell, isEditing, getEditState, startEdit, cancelEdit, commitEdit, moveToNextCell, isDirty, clearDirty };
}