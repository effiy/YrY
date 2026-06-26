/**
 * bot-health-filesize — File size analysis: byte-level tracking, distribution,
 * per-extension breakdown, growth tracking, and size hotspots.
 *
 * Usage:
 *   import { getFileSizeAnalysis } from './bot-health-filesize.mjs';
 *   const fsInfo = getFileSizeAnalysis(projectRoot);
 */

import { join } from "node:path";
import { existsSync, statSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

import { scoreIcon, clampScore } from "./bot-health-analysis.mjs";

const SIZE_BUCKETS = [
  { max: 1024, label: "< 1 KB" },
  { max: 4096, label: "1-4 KB" },
  { max: 16384, label: "4-16 KB" },
  { max: 65536, label: "16-64 KB" },
  { max: 262144, label: "64-256 KB" },
  { max: 1048576, label: "256 KB-1 MB" },
  { max: Infinity, label: "> 1 MB" },
];

const SIZE_WARN_BYTES = 100 * 1024;    // 100 KB
const SIZE_CRIT_BYTES = 500 * 1024;    // 500 KB

const SOURCE_EXT = new Set([
  "js", "mjs", "cjs", "ts", "tsx", "jsx", "py", "rb", "go", "rs",
  "java", "kt", "scala", "sh", "bash", "zsh", "md", "json", "yml", "yaml",
  "html", "css", "scss", "vue", "svelte",
]);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getPreviousFileSizes() {
  try {
    const trendPath = ".memory/health-trend.jsonl";
    if (!existsSync(trendPath)) return null;
    const lines = readFileSync(trendPath, "utf-8").trim().split("\n").filter(Boolean);
    if (lines.length === 0) return null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const entry = JSON.parse(lines[i]);
      if (entry.fileSizeData) return entry.fileSizeData;
    }
    return null;
  } catch { return null; }
}

export function getFileSizeAnalysis(projectRoot) {
  const files = [];           // { path, bytes, lines, ext, dir }
  const extSizes = new Map(); // ext → { count, totalBytes, totalLines }
  const dirSizes = new Map(); // dir → { count, totalBytes, totalLines }
  const bucketCounts = new Map(SIZE_BUCKETS.map((b) => [b.label, 0]));

  try {
    const tracked = execSync("git ls-files --cached --others --exclude-standard", {
      cwd: projectRoot, encoding: "utf-8", timeout: 8000,
    }).trim().split("\n").filter(Boolean);

    for (const rel of tracked) {
      if (rel.startsWith(".git/") || rel.startsWith("node_modules/") ||
          rel.startsWith(".memory/") || rel.startsWith("dist/") ||
          rel.startsWith("build/") || rel.startsWith("coverage/") ||
          rel.startsWith("cdn/") || rel.startsWith("docs/")) continue;

      const dot = rel.lastIndexOf(".");
      const ext = dot > 0 ? rel.slice(dot + 1).toLowerCase() : "";
      if (!SOURCE_EXT.has(ext)) continue;

      const abs = join(projectRoot, rel);
      let bytes = 0;
      try { bytes = statSync(abs).size; } catch { continue; }
      if (bytes === 0) continue;

      const dir = rel.includes("/") ? rel.split("/")[0] : "(root)";

      files.push({ path: rel, bytes, lines: 0, ext, dir });

      // Extension aggregation
      const es = extSizes.get(ext) || { count: 0, totalBytes: 0, totalLines: 0 };
      es.count++;
      es.totalBytes += bytes;
      extSizes.set(ext, es);

      // Directory aggregation
      const ds = dirSizes.get(dir) || { count: 0, totalBytes: 0, totalLines: 0 };
      ds.count++;
      ds.totalBytes += bytes;
      dirSizes.set(dir, ds);

      // Bucket
      for (const b of SIZE_BUCKETS) {
        if (bytes <= b.max) { bucketCounts.set(b.label, (bucketCounts.get(b.label) || 0) + 1); break; }
      }
    }
  } catch (err) {
    return { files: [], extSizes: [], dirSizes: [], bucketCounts: [], totalBytes: 0, totalFiles: 0,
      largestFiles: [], score: 0, summary: `分析失败: ${err.message?.slice(0, 40) || "unknown"}`, icon: "❌" };
  }

  // Sort files by bytes descending
  files.sort((a, b) => b.bytes - a.bytes);

  const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
  const totalFiles = files.length;
  const largestFiles = files.slice(0, 20);
  const warnFiles = files.filter((f) => f.bytes >= SIZE_WARN_BYTES && f.bytes < SIZE_CRIT_BYTES).length;
  const critFiles = files.filter((f) => f.bytes >= SIZE_CRIT_BYTES).length;

  // Extension breakdown (sorted by total bytes)
  const extSizesArr = [...extSizes.entries()]
    .map(([ext, data]) => ({ ext, ...data, pct: totalBytes > 0 ? (data.totalBytes / totalBytes * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

  // Directory breakdown (sorted by total bytes)
  const dirSizesArr = [...dirSizes.entries()]
    .map(([dir, data]) => ({ dir, ...data, pct: totalBytes > 0 ? (data.totalBytes / totalBytes * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

  // Bucket distribution
  const bucketArr = [...bucketCounts.entries()].map(([label, count]) => ({ label, count }));

  // Growth tracking
  const prev = getPreviousFileSizes();
  let growthPct = null;
  if (prev && prev.totalBytes > 0) {
    growthPct = Number(((totalBytes - prev.totalBytes) / prev.totalBytes * 100).toFixed(1));
  }

  // Scoring
  let score = 100;
  score -= critFiles * 10;
  score -= warnFiles * 2;
  const avgFileSize = totalFiles > 0 ? totalBytes / totalFiles : 0;
  if (avgFileSize > 100 * 1024) score -= 15;
  else if (avgFileSize > 50 * 1024) score -= 8;
  score = clampScore(score);

  const icon = scoreIcon(score);
  const summary = `${totalFiles} 文件 · ${formatBytes(totalBytes)}` +
    (largestFiles.length > 0 ? ` · 最大 ${formatBytes(largestFiles[0]?.bytes || 0)}` : "") +
    (critFiles > 0 ? ` · ≥500KB: ${critFiles}` : "") +
    (growthPct !== null ? ` · ${growthPct > 0 ? "+" : ""}${growthPct}%` : "");

  return {
    files, extSizes: extSizesArr, dirSizes: dirSizesArr,
    bucketCounts: bucketArr, totalBytes, totalFiles,
    largestFiles, warnFileCount: warnFiles, critFileCount: critFiles,
    avgFileSize, growthPct, score, summary, icon,
  };
}