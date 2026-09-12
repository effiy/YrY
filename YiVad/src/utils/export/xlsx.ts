import type { ExportColumn } from "./types";
import { triggerDownload, generateFileName } from "./types";

export async function exportXLSX(
  data: Record<string, any>[],
  columns: ExportColumn[],
  fileName?: string,
) {
  const XLSX = await import("xlsx");

  const rows = data.map((row) => {
    const r: Record<string, any> = {};
    columns.forEach((c) => (r[c.label] = row[c.key] ?? ""));
    return r;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const colWidths = columns.map((c) => ({ wch: Math.max(String(c.label).length, 15) }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  triggerDownload(blob, fileName ?? generateFileName("export", "xlsx"));
}