import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatFileSize, generateFileName, triggerDownload } from "@/utils/export/types";
import { renderCSV, exportCSV } from "@/utils/export/csv";
import { exportJSON } from "@/utils/export/json";

describe("export utilities", () => {
  describe("formatFileSize", () => {
    it("formats bytes", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("formats kilobytes", () => {
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("formats megabytes", () => {
      expect(formatFileSize(1048576)).toBe("1.0 MB");
      expect(formatFileSize(2097152)).toBe("2.0 MB");
    });
  });

  describe("generateFileName", () => {
    it("generates CSV file name", () => {
      const name = generateFileName("export", "csv");
      expect(name).toMatch(/^export_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it("generates XLSX file name with correct extension", () => {
      const name = generateFileName("data", "xlsx");
      expect(name).toMatch(/^data_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it("generates JSON file name", () => {
      const name = generateFileName("report", "json");
      expect(name).toMatch(/^report_\d{4}-\d{2}-\d{2}\.json$/);
    });

    it("generates PDF file name", () => {
      const name = generateFileName("table", "pdf");
      expect(name).toMatch(/^table_\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe("triggerDownload", () => {
    it("creates and revokes download URL", () => {
      const createObjectURL = vi.fn(() => "blob:test");
      const revokeObjectURL = vi.fn();
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;

      const blob = new Blob(["test"], { type: "text/plain" });
      triggerDownload(blob, "test.csv");

      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });

  describe("renderCSV", () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
    ];

    it("starts with UTF-8 BOM", () => {
      const csv = renderCSV([{ name: "Alice", age: 30 }], columns);
      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });

    it("renders header and data rows", () => {
      const csv = renderCSV(
        [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }],
        columns
      );
      const lines = csv.split("\n");
      expect(lines[0]).toBe("\uFEFFName,Age");
      expect(lines[1]).toBe("Alice,30");
      expect(lines[2]).toBe("Bob,25");
    });

    it("escapes commas in values", () => {
      const csv = renderCSV([{ name: "Smith, John", age: 30 }], columns);
      expect(csv).toContain('"Smith, John"');
    });

    it("escapes double quotes", () => {
      const csv = renderCSV([{ name: 'He said "hello"', age: 30 }], columns);
      expect(csv).toContain('"He said ""hello"""');
    });

    it("escapes newlines in values", () => {
      const csv = renderCSV([{ name: "Line1\nLine2", age: 30 }], columns);
      expect(csv).toContain('"Line1\nLine2"');
    });

    it("escapes carriage returns in values", () => {
      const csv = renderCSV([{ name: "A\rB", age: 30 }], columns);
      expect(csv).toContain('"A\rB"');
    });

    it("handles null values as empty string", () => {
      const csv = renderCSV([{ name: null, age: 30 }], columns);
      expect(csv).toContain(",30");
    });

    it("handles undefined values as empty string", () => {
      const csv = renderCSV([{ name: undefined, age: 30 }], columns);
      expect(csv).toContain(",30");
    });

    it("handles empty data — only header", () => {
      const csv = renderCSV([], columns);
      expect(csv).toBe("\uFEFFName,Age");
    });

    it("handles columns with special characters in label", () => {
      const specialColumns = [{ key: "val", label: 'Price, "USD"' }];
      const csv = renderCSV([{ val: 100 }], specialColumns);
      expect(csv).toContain('"Price, ""USD"""');
      expect(csv).toContain("100");
    });

    it("handles numeric and boolean values", () => {
      const numColumns = [{ key: "active", label: "Active" }];
      const csv = renderCSV([{ active: true }, { active: false }], numColumns);
      expect(csv).toContain("true");
      expect(csv).toContain("false");
    });
  });

  describe("exportCSV", () => {
    const columns = [{ key: "name", label: "Name" }];

    it("generates UTF-8 BOM prefixed content", () => {
      const csv = renderCSV([{ name: "Alice" }], columns);
      const bytes = new TextEncoder().encode(csv);
      expect(bytes[0]).toBe(0xef);
      expect(bytes[1]).toBe(0xbb);
      expect(bytes[2]).toBe(0xbf);
    });

    it("calls triggerDownload with correct MIME type", () => {
      const spy = vi.spyOn(document.body, "appendChild");
      exportCSV([{ name: "Alice" }], columns, "test.csv");
      const anchor = spy.mock.calls[0]?.[0] as HTMLAnchorElement;
      if (anchor) {
        expect(anchor.download).toBe("test.csv");
      }
      spy.mockRestore();
    });
  });

  describe("exportJSON", () => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "age", label: "Age" },
    ];

    it("calls triggerDownload and creates anchor", () => {
      const spy = vi.spyOn(document.body, "appendChild");
      exportJSON([{ name: "Alice", age: 30 }], columns, "test.json");
      expect(spy).toHaveBeenCalled();
      const anchor = spy.mock.calls[0]?.[0] as HTMLAnchorElement;
      if (anchor) {
        expect(anchor.download).toBe("test.json");
      }
      spy.mockRestore();
    });

    it("filters only specified columns", () => {
      const createObjectURL = vi.fn(() => "blob:test");
      URL.createObjectURL = createObjectURL;

      exportJSON(
        [{ name: "Alice", age: 30, extra: "secret" }],
        columns,
        "test.json"
      );
      expect(createObjectURL).toHaveBeenCalled();
      const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
      // Verify blob type
      expect(blob.type).toBe("application/json;charset=utf-8;");
    });

    it("handles null values", () => {
      const spy = vi.spyOn(document.body, "appendChild");
      exportJSON([{ name: null, age: 30 }], columns, "test.json");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("handles empty data", () => {
      const spy = vi.spyOn(document.body, "appendChild");
      exportJSON([], columns, "test.json");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});