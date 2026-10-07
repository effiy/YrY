/**
 * File parser for import operations — backed by PapaParse for robust CSV/TSV parsing.
 * Supports CSV, TSV, and JSON formats.
 */
import Papa from "papaparse";

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  rawText: string;
  detectedFormat: "csv" | "tsv" | "json" | "unknown";
}

export function detectFormat(text: string, fileName?: string): "csv" | "tsv" | "json" | "unknown" {
  if (fileName?.endsWith(".json")) return "json";
  if (fileName?.endsWith(".tsv") || fileName?.endsWith(".tab")) return "tsv";
  if (fileName?.endsWith(".csv")) return "csv";

  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";

  const firstLine = trimmed.split("\n")[0] || "";
  if (firstLine.includes("\t")) return "tsv";
  if (firstLine.includes(",")) return "csv";

  return "unknown";
}

export function parseCSV(text: string): ParsedData {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  if (result.data.length === 0 || result.errors.length === result.data.length) {
    return { headers: [], rows: [], rawText: text, detectedFormat: "csv" };
  }

  const headers = result.data[0];
  const rows = result.data.slice(1).map(line => {
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = line[i] || "";
    });
    return record;
  });

  return {
    headers,
    rows,
    rawText: text,
    detectedFormat: text.includes("\t") ? "tsv" : "csv",
  };
}

export function parseJSON(text: string): ParsedData {
  const data = JSON.parse(text);
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return { headers: [], rows: [], rawText: text, detectedFormat: "json" };

  const headers = Object.keys(items[0]);
  const rows = items.map((item: any) => {
    const record: Record<string, string> = {};
    for (const h of headers) {
      record[h] = item[h] !== null && item[h] !== undefined ? String(item[h]) : "";
    }
    return record;
  });

  return { headers, rows, rawText: text, detectedFormat: "json" };
}

export async function parseFile(file: File): Promise<ParsedData> {
  const text = await file.text();
  const format = detectFormat(text, file.name);

  switch (format) {
    case "json":
      return parseJSON(text);
    case "csv":
    case "tsv":
      return parseCSV(text);
    default:
      return { headers: [], rows: [], rawText: text, detectedFormat: "unknown" };
  }
}