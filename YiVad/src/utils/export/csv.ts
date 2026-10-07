import Papa from "papaparse";
import type { ExportColumn } from "./types";
import { triggerDownload, generateFileName } from "./types";

export function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function renderCSV(data: Record<string, any>[], columns: ExportColumn[]): string {
  const BOM = "\uFEFF";
  const fieldLabels = columns.map(c => c.label);
  const rows = data.map(row => {
    const r: Record<string, string> = {};
    columns.forEach(c => { r[c.label] = String(row[c.key] ?? ""); });
    return r;
  });
  if (rows.length === 0) return BOM + fieldLabels.join(",");
  return BOM + Papa.unparse(rows, { fields: fieldLabels } as any).replace(/[\r\n]+$/, "");
}

export function exportCSV(data: Record<string, any>[], columns: ExportColumn[], fileName?: string) {
  const csv = renderCSV(data, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, fileName ?? generateFileName("export", "csv"));
}
