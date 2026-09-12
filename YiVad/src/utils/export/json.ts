import type { ExportColumn } from "./types";
import { triggerDownload, generateFileName } from "./types";

export function exportJSON(
  data: Record<string, any>[],
  columns: ExportColumn[],
  fileName?: string,
) {
  const filtered = data.map((row) => {
    const r: Record<string, any> = {};
    columns.forEach((c) => (r[c.key] = row[c.key] ?? ""));
    return r;
  });

  const content = {
    exportedAt: new Date().toISOString(),
    totalCount: filtered.length,
    columns: columns.map((c) => c.key),
    data: filtered,
  };

  const json = JSON.stringify(content, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, fileName ?? generateFileName("export", "json"));
}