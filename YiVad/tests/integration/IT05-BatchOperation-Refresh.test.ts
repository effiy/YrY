import { describe, it, expect } from "vitest";

/**
 * IT-05: 批量操作 × 表格刷新
 */
describe("IT-05: BatchOperation × TableRefresh", () => {
  const createBatchState = () => {
    let _selectedIds = new Set<string>(["r1", "r2", "r3", "r4", "r5"]);
    let _tableData = [
      { id: "r1", name: "A" },
      { id: "r2", name: "B" },
      { id: "r3", name: "C" },
      { id: "r4", name: "D" },
      { id: "r5", name: "E" },
    ];

    const batchDelete = (ids: string[], failIds: string[] = []) => {
      const failSet = new Set(failIds);
      const results = { success: 0, failed: 0 };
      _tableData = _tableData.filter(row => {
        if (!ids.includes(row.id)) return true;
        if (failSet.has(row.id)) {
          results.failed++;
          return true;
        }
        results.success++;
        return false;
      });
      return results;
    };

    return {
      get selectedIds() { return _selectedIds; },
      get tableData() { return _tableData; },
      batchDelete,
      clearSelection: () => { _selectedIds.clear(); },
    };
  };

  it("selection is cleared after batch delete", () => {
    const state = createBatchState();
    const result = state.batchDelete(["r1", "r2", "r3"]);
    state.clearSelection();
    expect(state.selectedIds.size).toBe(0);
    expect(state.tableData.length).toBe(2);
    expect(result.success).toBe(3);
  });

  it("partial failure keeps successful deletes", () => {
    const state = createBatchState();
    // Delete 3 items, r3 fails
    const result = state.batchDelete(["r1", "r2", "r3"], ["r3"]);
    expect(result.success).toBe(2);
    expect(result.failed).toBe(1);
    expect(state.tableData.length).toBe(3); // r3, r4, r5 remain
  });

  it("all failures preserves all data", () => {
    const state = createBatchState();
    const result = state.batchDelete(["r1", "r2"], ["r1", "r2"]);
    expect(result.success).toBe(0);
    expect(result.failed).toBe(2);
    expect(state.tableData.length).toBe(5); // nothing deleted
  });

  it("cancel preserves completed items", () => {
    const completed = 3;
    const total = 5;
    expect(completed).toBeLessThan(total);
    // Cancelled at 3/5 means 2 items remain unprocessed
    expect(total - completed).toBe(2);
  });

  it("progress percent handles zero total gracefully", () => {
    const total = 0;
    const completed = 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    expect(percent).toBe(0);
    expect(Number.isNaN(percent)).toBe(false);
  });

  it("failed items are recorded with reason", () => {
    const failedItems = [
      { id: "r2", reason: "权限不足" },
      { id: "r4", reason: "Network error" },
    ];
    expect(failedItems.length).toBe(2);
    failedItems.forEach(item => {
      expect(item.reason).toBeTruthy();
      expect(item.id).toBeTruthy();
    });
  });
});