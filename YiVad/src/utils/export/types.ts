export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

export interface ExportColumn {
  key: string;
  label: string;
}

export interface ExportOptions {
  data: Record<string, any>[];
  columns: ExportColumn[];
  format: ExportFormat;
  fileName?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  entityType: string;
  format: ExportFormat;
  columns: ExportColumn[];
  filter?: Record<string, any>;
  sort?: Record<string, number>;
  createdAt: string;
}

export interface ExportHistoryItem {
  id: string;
  fileName: string;
  format: ExportFormat;
  entityType: string;
  rowCount: number;
  fileSize?: number;
  exportedAt: string;
  expired: boolean;
}

import { filesize } from "filesize";

export function formatFileSize(bytes: number): string {
  return String(filesize(bytes));
}

export function generateFileName(prefix: string, format: ExportFormat): string {
  const date = new Date().toISOString().slice(0, 10);
  const ext = format === "xlsx" ? "xlsx" : format;
  return `${prefix}_${date}.${ext}`;
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
