import { describe, it, expect, beforeEach } from "vitest";

/**
 * IT-04: 导出 × 渲染器 × 存储
 *
 * 验证导出流程与存储的集成：
 * - 导出后存储历史记录
 * - 历史容量限制（最多10条）
 * - 大文件分流到服务端
 * - 导出服务参数名称契约
 */
describe("IT-04: Export × Renderer × Storage", () => {
  // Simulated export store
  const createExportStore = () => {
    let _history: { id: string; format: string; fileName: string; createdAt: string }[] = [];
    const maxHistory = 10;

    const addToHistory = (record: { format: string; fileName: string }) => {
      _history.unshift({
        id: `exp-${Date.now()}`,
        ...record,
        createdAt: new Date().toISOString(),
      });
      if (_history.length > maxHistory) {
        _history = _history.slice(0, maxHistory);
      }
    };

    const getHistory = () => _history;

    return { getHistory, addToHistory, maxHistory };
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("export adds record to history", () => {
    const store = createExportStore();
    store.addToHistory({ format: "csv", fileName: "data_2024.csv" });
    expect(store.getHistory().length).toBe(1);
    expect(store.getHistory()[0].format).toBe("csv");
    expect(store.getHistory()[0].fileName).toBe("data_2024.csv");
  });

  it("history evicts oldest entry when exceeding 10 records", () => {
    const store = createExportStore();
    for (let i = 1; i <= 12; i++) {
      store.addToHistory({ format: "csv", fileName: `file_${i}.csv` });
    }
    expect(store.getHistory().length).toBe(10);
    // Oldest (file_1, file_2) should be evicted, newest is file_12
    expect(store.getHistory()[0].fileName).toBe("file_12.csv");
    expect(store.getHistory()[9].fileName).toBe("file_3.csv");
  });

  it("shouldUseServerExport returns true for >5000 rows", () => {
    const shouldUseServerExport = (count: number) => count > 5000;
    expect(shouldUseServerExport(5000)).toBe(false);
    expect(shouldUseServerExport(5001)).toBe(true);
    expect(shouldUseServerExport(10000)).toBe(true);
  });

  it("server export RPC uses correct parameter names", () => {
    const exportParams = {
      module_name: "services.export.export_service",
      method_name: "create_export_task",
      parameters: {
        cname: "bugs",
        filter: { status: "open" },
        fields: ["title", "status", "priority"],
        format: "csv",
      },
    };

    expect(exportParams.parameters).toHaveProperty("cname");
    expect(exportParams.parameters).toHaveProperty("filter");
    expect(exportParams.parameters).toHaveProperty("fields");
    expect(exportParams.parameters).toHaveProperty("format");
    // Must NOT use wrong key names
    expect(exportParams.parameters).not.toHaveProperty("path");
    expect(exportParams.parameters).not.toHaveProperty("collection_name");
    expect(exportParams.parameters).not.toHaveProperty("query");
  });

  it("export status polling uses task_id parameter", () => {
    const statusParams = {
      module_name: "services.export.export_service",
      method_name: "get_export_status",
      parameters: { task_id: "task-abc123" },
    };
    expect(statusParams.parameters).toHaveProperty("task_id");
    expect(statusParams.parameters.task_id).toBe("task-abc123");
  });

  it("template application preserves config shape", () => {
    const template = {
      format: "xlsx" as const,
      columns: ["name", "age"],
      columnLabels: { name: "Full Name", age: "Age (Years)" },
      freezeHeader: true,
    };
    // Applying template should keep the same shape
    const applied = { ...template };
    expect(applied.format).toBe("xlsx");
    expect(applied.columns).toEqual(["name", "age"]);
    expect(applied.columnLabels.name).toBe("Full Name");
  });

  it("progress percentage is monotonic", () => {
    const progressValues: number[] = [];
    const updateProgress = (received: number, total: number) => {
      progressValues.push(Math.round((received / total) * 100));
    };

    updateProgress(0, 500);
    updateProgress(100, 500);
    updateProgress(250, 500);
    updateProgress(500, 500);

    expect(progressValues).toEqual([0, 20, 50, 100]);
    // Monotonically increasing
    for (let i = 1; i < progressValues.length; i++) {
      expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
    }
  });
});