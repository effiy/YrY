import { ref } from "vue";

interface ImportFieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
}

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface UseFormExportOptions {
  /** RPC-based submit API for imported data */
  importApi?: (data: Record<string, any>) => Promise<any>;
}

export const useFormExport = (options?: UseFormExportOptions) => {
  const { importApi } = options || {};

  const isExporting = ref(false);
  const isImporting = ref(false);
  const importResult = ref<ImportResult | null>(null);

  /**
   * Parse CSV/TSV/JSON file content and return structured rows
   */
  async function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
    const text = await file.text();

    if (file.name.endsWith(".json")) {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      const headers = items.length > 0 ? Object.keys(items[0]) : [];
      return { headers, rows: items };
    }

    // CSV/TSV
    const delimiter = file.name.endsWith(".tsv") ? "\t" : ",";
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === delimiter && !inQuotes) { result.push(current.trim()); current = ""; }
        else { current += ch; }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseLine(line);
      const record: Record<string, any> = {};
      headers.forEach((h, i) => { record[h] = values[i] || ""; });
      return record;
    });

    return { headers, rows };
  }

  /**
   * Map parsed rows to target form fields
   */
  function mapFields(rows: Record<string, any>[], mappings: ImportFieldMapping[]): Record<string, any>[] {
    return rows.map((row) => {
      const mapped: Record<string, any> = {};
      for (const mapping of mappings) {
        const value = row[mapping.sourceField];
        mapped[mapping.targetField] = mapping.transform ? mapping.transform(value) : value;
      }
      return mapped;
    });
  }

  /**
   * Execute import with progress tracking
   */
  async function executeImport(data: Record<string, any>[]): Promise<ImportResult> {
    if (!importApi) {
      return { success: true, total: data.length, imported: data.length, skipped: 0, errors: [] };
    }

    isImporting.value = true;
    const result: ImportResult = { success: true, total: data.length, imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        await importApi(data[i]);
        result.imported++;
      } catch (error: unknown) {
        result.errors.push({ row: i + 1, message: error instanceof Error ? error.message : "导入失败" });
        result.skipped++;
        result.success = false;
      }
    }

    isImporting.value = false;
    importResult.value = result;
    return result;
  }

  /**
   * Export data to CSV and trigger download
   */
  function exportCSV(data: Record<string, any>[], filename: string, columns?: { key: string; title: string }[]) {
    isExporting.value = true;
    try {
      const cols = columns || Object.keys(data[0] || {}).map((k) => ({ key: k, title: k }));
      const header = cols.map((c) => c.title).join(",");
      const rows = data.map((row) => cols.map((c) => {
        const val = row[c.key];
        // Escape CSV values
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(","));
      const csv = [header, ...rows].join("\n");
      downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8");
    } finally {
      isExporting.value = false;
    }
  }

  /**
   * Export data to JSON and trigger download
   */
  function exportJSON(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2);
    downloadBlob(json, `${filename}.json`, "application/json");
  }

  function downloadBlob(content: string, filename: string, mimeType: string) {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    isExporting,
    isImporting,
    importResult,
    parseFile,
    mapFields,
    executeImport,
    exportCSV,
    exportJSON,
  };
};