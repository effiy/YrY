import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { materializeTrendReportFromManifest } from "./trend-report.mjs";

const REPORT_DIR = "docs/趋势报告";
const MANIFEST_FILE = join(REPORT_DIR, "reports.json");

function readManifest() {
  if (!existsSync(MANIFEST_FILE)) return [];
  try {
    const data = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normalizeDate(s) {
  const str = String(s || "").trim();
  const m = str.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : "";
}

function normalizeEntry(entry) {
  const src = entry?.source || "all";
  const date = normalizeDate(entry?.date || entry?.time || entry?.file || "");
  const normalized = { ...entry, source: src };
  if (date) normalized.date = date;
  if (date) normalized.file = `trend-${src}-${date}.html`;
  return normalized;
}

function fileExistsInReportDir(file) {
  if (!file) return false;
  return existsSync(join(REPORT_DIR, file));
}

if (!existsSync(REPORT_DIR)) {
  mkdirSync(REPORT_DIR, { recursive: true });
}

const raw = readManifest();
const manifest = raw.map(normalizeEntry).filter((e) => e && e.date && e.file);
writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf-8");

let created = 0;
let skipped = 0;
const force = process.argv.includes("--force");

for (const entry of manifest) {
  const file = entry.file;
  if (!force && fileExistsInReportDir(file)) {
    skipped++;
    continue;
  }
  materializeTrendReportFromManifest(entry);
  created++;
}

console.log(`[rui-trends] materialize: created=${created} skipped=${skipped} total=${manifest.length}`);
