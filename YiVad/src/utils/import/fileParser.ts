/**
 * File parser for import operations.
 * Supports CSV, TSV, JSON, and Excel-like formats.
 */
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
  const lines = text.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [], rawText: text, detectedFormat: "csv" };

  const delimiter = detectDelimiter(text);
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === delimiter && !inQuotes) { result.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => { record[h] = values[i] || ""; });
    return record;
  });

  return { headers, rows, rawText: text, detectedFormat: delimiter === "\t" ? "tsv" : "csv" };
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

function detectDelimiter(text: string): string {
  const firstLine = text.split("\n")[0] || "";
  const counts = { ",": 0, "\t": 0, "|": 0 };
  for (const ch of firstLine) {
    if (ch in counts) counts[ch as keyof typeof counts]++;
  }
  const max = Math.max(...Object.values(counts));
  if (max === 0) return ",";
  return (Object.entries(counts).find(([, v]) => v === max) as [string, number])[0];
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