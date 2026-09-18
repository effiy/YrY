/** Web Worker for off-main-thread CSV/JSON export generation. */
import { escapeCSVField } from "./csv";

export interface WorkerMessage {
  id: string;
  type: "csv" | "json";
  data: Record<string, any>[];
  columns: { key: string; label: string }[];
}

export interface WorkerResponse {
  id: string;
  type: "result" | "error";
  content?: string;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { id, type, data, columns } = e.data;
  try {
    let content = "";
    if (type === "csv") {
      // Header
      content = "\uFEFF" + columns.map(c => escapeCSVField(c.label)).join(",") + "\n";
      // Rows
      for (const row of data) {
        const vals = columns.map(c => escapeCSVField(String(row[c.key] ?? "")));
        content += vals.join(",") + "\n";
      }
    } else if (type === "json") {
      content = JSON.stringify({ exportedAt: new Date().toISOString(), total: data.length, rows: data }, null, 2);
    }
    self.postMessage({ id, type: "result", content } satisfies WorkerResponse);
  } catch (err: any) {
    self.postMessage({ id, type: "error", error: err.message } satisfies WorkerResponse);
  }
};
