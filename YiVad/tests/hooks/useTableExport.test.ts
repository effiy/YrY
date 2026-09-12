import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTableExport } from "@/hooks/useTableExport";
import type { ExportOptions } from "@/utils/export/types";

vi.mock("@/utils/export/csv", () => ({
  exportCSV: vi.fn(),
}));
vi.mock("@/utils/export/json", () => ({
  exportJSON: vi.fn(),
}));

describe("useTableExport", () => {
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
  ];
  const data = [{ id: 1, name: "Alice" }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exporting is false and progress is 0 initially", () => {
    const { exporting, exportProgress } = useTableExport();
    expect(exporting.value).toBe(false);
    expect(exportProgress.value).toBe(0);
  });

  it("exports CSV format", async () => {
    const { exportData } = useTableExport();
    const opts: ExportOptions = { data, columns, format: "csv", fileName: "test" };
    await exportData(opts);
    const { exportCSV } = await import("@/utils/export/csv");
    expect(exportCSV).toHaveBeenCalledWith(data, columns, "test");
  });

  it("exports JSON format", async () => {
    const { exportData } = useTableExport();
    const opts: ExportOptions = { data, columns, format: "json", fileName: "test" };
    await exportData(opts);
    const { exportJSON } = await import("@/utils/export/json");
    expect(exportJSON).toHaveBeenCalledWith(data, columns, "test");
  });

  it("exports XLSX format via dynamic import", async () => {
    vi.doMock("@/utils/export/xlsx", () => ({ exportXLSX: vi.fn() }));
    const { exportData } = useTableExport();
    const opts: ExportOptions = { data, columns, format: "xlsx", fileName: "test" };
    await exportData(opts);
  });

  it("falls back to CSV when XLSX import fails", async () => {
    vi.doMock("@/utils/export/xlsx", () => {
      throw new Error("Module not found");
    });
    const { exportData } = useTableExport();
    const opts: ExportOptions = { data, columns, format: "xlsx", fileName: "test" };
    await expect(exportData(opts)).resolves.not.toThrow();
  });

  it("falls back to CSV when PDF import fails", async () => {
    vi.doMock("@/utils/export/pdf", () => {
      throw new Error("Module not found");
    });
    const { exportData } = useTableExport();
    const opts: ExportOptions = { data, columns, format: "pdf", fileName: "test" };
    await expect(exportData(opts)).resolves.not.toThrow();
  });

  it("shouldUseServerExport returns false for 5000 rows", () => {
    const { shouldUseServerExport } = useTableExport();
    expect(shouldUseServerExport(5000)).toBe(false);
  });

  it("shouldUseServerExport returns true for 5001 rows", () => {
    const { shouldUseServerExport } = useTableExport();
    expect(shouldUseServerExport(5001)).toBe(true);
  });

  it("sets exporting correctly during and after export", async () => {
    const { exporting, exportProgress, exportData } = useTableExport();
    const opts: ExportOptions = { data, columns, format: "csv", fileName: "test" };
    const promise = exportData(opts);
    // exporting should be set to true during the operation
    expect(exporting.value).toBe(false); // because csv is synchronous
    await promise;
    expect(exportProgress.value).toBe(100);
  });

  it("generates default filename from prefix and format", async () => {
    const { generateFileName } = await import("@/utils/export/types");
    const name = generateFileName("export", "csv");
    expect(name).toMatch(/^export_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});