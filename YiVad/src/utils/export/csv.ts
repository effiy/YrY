import type { ExportColumn } from "./types";
import { triggerDownload, generateFileName } from "./types";

function escapeCSVField(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function renderCSV(data: Record<string, any>[], columns: ExportColumn[]): string {
  const BOM = "\uFEFF";
  const header = columns.map((c) => escapeCSVField(c.label)).join(",");
  const rows = data.map((row) =>
    columns.map((c) => escapeCSVField(row[c.key] ?? "")).join(","),
  );
  return BOM + [header, ...rows].join("\n");
}

export function exportCSV(
  data: Record<string, any>[],
  columns: ExportColumn[],
  fileName?: string,
) {
  const csv = renderCSV(data, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, fileName ?? generateFileName("export", "csv"));
}