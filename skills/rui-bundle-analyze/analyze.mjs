#!/usr/bin/env node
/**
 * rui-bundle-analyze — File size & dependency analysis
 *
 * Generates a self-contained HTML report with:
 *   - Treemap visualization (D3 zoomable, like webpack-bundle-analyzer)
 *   - Force-directed dependency graph
 *   - Statistics panels (largest files, most-depended-on, ext distribution)
 *
 * Usage:
 *   node skills/rui-bundle-analyze/analyze.mjs [--dir <path>] [--no-open] [--json] [--help]
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, relative, resolve, basename, extname, dirname } from "node:path";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { findProjectRoot } from "../../lib/fs.mjs";

// ── Version ──────────────────────────────────────────────────────────────────
const ANALYSIS_VERSION = "2.0";

// ── Constants ──────────────────────────────────────────────────────────────

/** Directories always excluded from analysis */
const EXCLUDE_DIRS = new Set([
  "node_modules", ".git", ".claude", ".memory", ".improvement",
  "dist", "build", ".next", ".nuxt", "coverage", "__pycache__",
  ".turbo", ".cache", ".yarn", ".pnpm",
]);

/** Directories excluded by default but overridable */
const EXCLUDE_DIRS_SOFT = new Set([
  ".vercel", ".netlify", ".serverless", "cdk.out", "terraform",
]);

/** File extensions analyzed for import/dependency parsing */
const DEP_PARSE_EXTS = new Set([
  ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte",
  ".css", ".scss", ".less", ".sass",
]);

/** File extensions counted in size analysis (source-ish files, skip binaries) */
const SOURCE_EXTS = new Set([
  ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".vue", ".svelte",
  ".css", ".scss", ".less", ".sass", ".html", ".md", ".mdx",
  ".json", ".yaml", ".yml", ".toml", ".xml", ".svg",
  ".py", ".rb", ".go", ".rs", ".java", ".kt", ".swift",
  ".graphql", ".gql", ".proto", ".sql", ".sh", ".bash",
  ".env", ".gitignore", ".dockerignore", "Dockerfile",
]);

/** Binary-ish extensions skipped entirely */
const SKIP_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".mp3", ".mp4", ".wav", ".ogg", ".webm",
  ".map", ".lock", ".sum",
]);

/** Max nodes in dependency graph (performance cap) */
const MAX_GRAPH_NODES = 500;

/** Min file size in bytes to include in dependency graph */
const MIN_DEP_FILE_SIZE = 0;

/** Output directory relative to project root */
const REPORT_DIR = "docs/bundle-reports";

/** Report file name prefix */
const REPORT_PREFIX = "bundle";

/** Max file size before warning (500 KB) */
const LARGE_FILE_THRESHOLD = 500_000;

/** Top-N entries for largest files / stats display */
const STATS_TOP_N = 20;

/** Top-N entries for dependency rankings */
const DEP_RANK_TOP_N = 10;

/** Max circular dependency chains to report */
const MAX_CIRCULAR_DEPS = 20;

/** Baseline file path (relative to project root) */
const BASELINE_FILE = ".memory/bundle-baseline.json";

/** Histogram buckets: [label, minBytes, maxBytes] */
const HISTOGRAM_BUCKETS = [
  ["0-1 KB", 0, 1_024],
  ["1-10 KB", 1_024, 10_240],
  ["10-100 KB", 10_240, 102_400],
  ["100-500 KB", 102_400, 512_000],
  ["500 KB-1 MB", 512_000, 1_048_576],
  [">1 MB", 1_048_576, Infinity],
];

/** Threshold for flagging significant file size change (20%) */
const SIGNIFICANT_CHANGE_PCT = 20;

/** Max depth for dependency graph traversal (0 = no limit) */
const DEFAULT_MAX_DEPTH = 0;

/** Minimum file size for duplicate detection (skip tiny config files) */
const DUPLICATE_MIN_SIZE = 100;

/** Max duplicate groups to report */
const MAX_DUPLICATE_GROUPS = 20;

/** Package metric: "zone of pain" threshold (D > 0.7 from main sequence) */
const ZONE_OF_PAIN_D = 0.7;

/** Package metric: "zone of uselessness" threshold (D > 0.7 with high abstractness) */
const ZONE_OF_USELESS_D = 0.7;

// ── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    dir: null,
    noOpen: false,
    json: false,
    scope: null,
    help: false,
    saveBaseline: false,
    diff: false,
    maxDepth: DEFAULT_MAX_DEPTH,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") { args.help = true; }
    else if (a === "--dir" && i + 1 < argv.length) { args.dir = argv[++i]; }
    else if (a === "--no-open") { args.noOpen = true; }
    else if (a === "--json") { args.json = true; }
    else if (a === "--scope" && i + 1 < argv.length) { args.scope = argv[++i]; }
    else if (a === "--save-baseline") { args.saveBaseline = true; }
    else if (a === "--diff") { args.diff = true; }
    else if (a === "--max-depth" && i + 1 < argv.length) { args.maxDepth = parseInt(argv[++i], 10) || 0; }
  }

  return args;
}

function printHelp() {
  // Delegate to help.mjs
  const help = `
rui-bundle-analyze v${ANALYSIS_VERSION} — File size & dependency analysis (like webpack-bundle-analyzer)

Usage:
  node skills/rui-bundle-analyze/analyze.mjs [options]

Analysis Options:
  --dir <path>       Analyze a specific directory (default: project root)
  --scope <glob>     Limit files to a glob pattern (e.g. "**/*.js")
  --max-depth <n>    Limit dependency graph node depth (0 = no limit, default: 0)

Output Options:
  --no-open          Don't open the report in browser
  --json             Output JSON to stdout instead of generating HTML
  --save-baseline    Save analysis as baseline for future --diff comparisons
  --diff             Compare with saved baseline and show changes
  --help, -h         Show this help

Examples:
  /rui-bundle-analyze
  /rui-bundle-analyze --dir src/
  /rui-bundle-analyze --json | jq .stats.largestFiles
  /rui-bundle-analyze --save-baseline
  /rui-bundle-analyze --diff
`;
  console.log(help);
}

// ── File system ────────────────────────────────────────────────────────────

/**
 * Check if a path should be excluded based on directory name patterns.
 */
function isExcludedDir(name) {
  return EXCLUDE_DIRS.has(name) || EXCLUDE_DIRS_SOFT.has(name);
}

/**
 * Check if a file extension should be skipped entirely.
 */
function isSkipExt(ext) {
  return SKIP_EXTS.has(ext.toLowerCase());
}

/**
 * Recursively walk a directory, collecting file info.
 * @returns {Array<{path: string, relPath: string, size: number, ext: string, dir: string}>}
 */
function walkDir(root, opts = {}) {
  const { scopeGlob } = opts;
  const files = [];

  function walk(currentPath) {
    let entries;
    try {
      entries = readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return; // skip unreadable dirs
    }

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (isExcludedDir(entry.name)) continue;
        if (entry.name.startsWith(".")) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (isSkipExt(ext)) continue;

        let size = 0;
        try {
          size = statSync(fullPath).size;
        } catch {
          continue;
        }

        const relPath = relative(root, fullPath);
        const dir = relative(root, dirname(fullPath)) || ".";

        files.push({ path: fullPath, relPath, size, ext, dir });
      }
    }
  }

  walk(root);
  return files;
}

// ── Import parsing ─────────────────────────────────────────────────────────

/**
 * Enhanced static import parser using regex.
 * Handles 9 import/export patterns:
 *   import { x } from '...' | import x from '...' | import '...'
 *   import('...') dynamic
 *   require('...')
 *   export { x } from '...' (re-export)
 *   export * from '...' (wildcard re-export)
 *   export { default } from '...'
 *   import type { T } from '...' (TypeScript)
 *   CSS @import url('...')
 * Returns array of imported module specifiers with type annotations.
 */
function parseImports(filePath) {
  const imports = [];
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return imports;
  }

  // Strip comments (simple approach — line comments + block comments)
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, " ")   // block comments
    .replace(/\/\/.*$/gm, " ");            // line comments

  // 1. Re-exports (must match before static imports):
  //    export { x, y } from '...' / export { default } from '...'
  const reExportPattern = /export\s+\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = reExportPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "re-export" });
  }

  // 2. Wildcard re-exports: export * from '...'
  const wildcardReExportPattern = /export\s+\*\s+from\s*['"]([^'"]+)['"]/g;
  while ((match = wildcardReExportPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "re-export-all" });
  }

  // 3. Static imports: import { x } from '...' / import x from '...' / import '...'
  //    Exclude 'import type' by using a negative lookahead
  const staticPattern = /import\s+(?!type\b)(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  while ((match = staticPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "import" });
  }

  // 4. TypeScript type-only imports: import type { T } from '...'
  const typeImportPattern = /import\s+type\s+\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/g;
  while ((match = typeImportPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "type-import" });
  }

  // 5. Dynamic imports: import('...')
  const dynamicPattern = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "dynamic" });
  }

  // 6. require('...')
  const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requirePattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "require" });
  }

  // 7. CSS @import url('...')
  const cssImportPattern = /@import\s+(?:url\s*\(\s*)?['"]([^'"]+)['"]/g;
  while ((match = cssImportPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "css-import" });
  }

  return imports;
}

// ── Line counting ────────────────────────────────────────────────────────────

/**
 * Count non-empty lines in a file efficiently using a read stream.
 * Falls back to full read for small files.
 */
function countLines(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    // Count non-empty lines (strip trailing newline, split)
    const lines = content.trimEnd().split("\n");
    // Filter to non-blank lines for a more meaningful count
    return lines.filter((l) => l.trim().length > 0).length;
  } catch {
    return 0;
  }
}

// ── Baseline management ──────────────────────────────────────────────────────

/**
 * Save analysis baseline to .memory/bundle-baseline.json
 */
function saveBaseline(projectRoot, baselineData) {
  const baselinePath = join(projectRoot, BASELINE_FILE);
  const dir = dirname(baselinePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(baselinePath, JSON.stringify(baselineData, null, 2), "utf-8");
  return baselinePath;
}

/**
 * Load previous analysis baseline.
 * @returns {object|null} baseline data or null if none exists
 */
function loadBaseline(projectRoot) {
  const baselinePath = join(projectRoot, BASELINE_FILE);
  if (!existsSync(baselinePath)) return null;
  try {
    return JSON.parse(readFileSync(baselinePath, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Compute diff between current analysis and baseline.
 */
function computeDiff(currentFiles, currentDeps, baseline) {
  if (!baseline) return { hasBaseline: false };

  const oldFileMap = new Map(baseline.files.map((f) => [f.path, f]));
  const newFileMap = new Map(currentFiles.map((f) => [f.relPath, f]));

  // New files (in current but not in baseline)
  const newFiles = [];
  for (const f of currentFiles) {
    if (!oldFileMap.has(f.relPath)) {
      newFiles.push({ path: f.relPath, size: f.size });
    }
  }

  // Deleted files (in baseline but not in current)
  const deletedFiles = [];
  for (const [path, f] of oldFileMap) {
    if (!newFileMap.has(path)) {
      deletedFiles.push({ path, size: f.size });
    }
  }

  // Changed files (> SIGNIFICANT_CHANGE_PCT % difference)
  const changedFiles = [];
  for (const f of currentFiles) {
    const old = oldFileMap.get(f.relPath);
    if (old && old.size > 0) {
      const delta = f.size - old.size;
      const deltaPct = Math.round((Math.abs(delta) / old.size) * 100);
      if (deltaPct >= SIGNIFICANT_CHANGE_PCT) {
        changedFiles.push({
          path: f.relPath,
          oldSize: old.size,
          newSize: f.size,
          delta,
          deltaPercent: deltaPct * (delta > 0 ? 1 : -1),
        });
      }
    }
  }
  changedFiles.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  // Dependency changes
  const oldEdgeSet = new Set((baseline.dependencies || []).map((e) => `${e.from}→${e.to}`));
  const newEdgeSet = new Set(currentDeps.map((e) => `${e.from}→${e.to}`));

  const newDeps = currentDeps.filter((e) => !oldEdgeSet.has(`${e.from}→${e.to}`));
  const removedDeps = (baseline.dependencies || []).filter((e) => !newEdgeSet.has(`${e.from}→${e.to}`));

  // Size delta
  const oldTotalSize = baseline.meta?.totalSize || 0;
  const newTotalSize = currentFiles.reduce((sum, f) => sum + f.size, 0);
  const sizeDelta = newTotalSize - oldTotalSize;
  const sizeDeltaPercent = oldTotalSize > 0 ? Math.round((sizeDelta / oldTotalSize) * 1000) / 10 : 0;

  return {
    hasBaseline: true,
    baselineDate: baseline.meta?.generatedAt || "unknown",
    sizeDelta,
    sizeDeltaPercent,
    newFiles,
    deletedFiles,
    changedFiles: changedFiles.slice(0, 20),  // top 20 changes
    newDeps: newDeps.slice(0, 20),
    removedDeps: removedDeps.slice(0, 20),
  };
}

// ── Advanced analysis ────────────────────────────────────────────────────────

/**
 * Detect orphan files: files that neither import anything nor are imported by anything.
 * Excludes well-known entry/root files that are expected to have no dependents.
 */
function detectOrphanFiles(files, depGraph) {
  const importedSet = new Set(depGraph.edges.map((e) => e.to));
  const importerSet = new Set(depGraph.edges.map((e) => e.from));

  // Also check files that have imports in the actual source (not just depGraph edges)
  const allNodeSet = new Set(depGraph.nodes.map((n) => n.path));

  // Known entry patterns that are expected to be "orphan" (not imported by others)
  const entryPatterns = [/^index\.(js|mjs|ts|jsx|tsx)$/, /^main\.(js|mjs|ts)$/, /^app\.(js|mjs|ts|jsx|tsx)$/, /\.config\.(js|mjs|ts)$/, /^cli\.(js|mjs|ts)$/];

  const isEntry = (relPath) => {
    const name = basename(relPath);
    return entryPatterns.some((p) => p.test(name));
  };

  // Only consider source-ish files for orphan detection
  const sourceFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext) || f.ext === ".html" || f.ext === ".md");

  return sourceFiles
    .filter((f) => {
      const inGraph = allNodeSet.has(f.relPath);
      const isImported = importedSet.has(f.relPath);
      // An orphan: in the graph but not imported by anyone, AND doesn't import anything
      // OR not in the graph at all (no imports, never parsed)
      if (!inGraph && !isEntry(f.relPath) && f.ext !== ".html" && f.ext !== ".md") {
        return true;
      }
      if (inGraph && !isImported && !importerSet.has(f.relPath) && !isEntry(f.relPath)) {
        return true;
      }
      return false;
    })
    .sort((a, b) => b.size - a.size)
    .slice(0, 30)
    .map((f) => ({ path: f.relPath, size: f.size, ext: f.ext }));
}

/**
 * Detect barrel files: files that primarily re-export from other modules.
 * A file is a barrel if >50% of its imports are re-exports and it has few own definitions.
 */
function detectBarrelFiles(files, projectRoot) {
  const barrels = [];
  const parsableFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext));

  for (const f of parsableFiles) {
    const rawImports = parseImports(f.path);
    if (rawImports.length === 0) continue;

    const reExports = rawImports.filter((imp) => imp.type === "re-export" || imp.type === "re-export-all");
    const reExportRatio = reExports.length / rawImports.length;

    // Barrel: at least 2 re-exports and >50% of imports are re-exports
    if (reExports.length >= 2 && reExportRatio > 0.5) {
      barrels.push({ path: f.relPath, size: f.size, reExportCount: reExports.length, totalImportCount: rawImports.length, ratio: Math.round(reExportRatio * 100) });
    }
  }

  return barrels.sort((a, b) => b.reExportCount - a.reExportCount).slice(0, 15);
}

/**
 * Compute size histogram (files bucketed by size range).
 */
function computeHistogram(files) {
  const histogram = {};
  for (const [label, min, max] of HISTOGRAM_BUCKETS) {
    histogram[label] = files.filter((f) => f.size >= min && f.size < max).length;
  }
  return histogram;
}

/**
 * Compute dependency chain depth for each node using topological longest-path.
 */
function computeDepths(depGraph) {
  const adj = {};
  const revAdj = {};
  for (const edge of depGraph.edges) {
    if (!adj[edge.from]) adj[edge.from] = [];
    adj[edge.from].push(edge.to);
    if (!revAdj[edge.to]) revAdj[edge.to] = [];
    revAdj[edge.to].push(edge.from);
  }

  // Find nodes with no incoming edges (roots)
  const allNodes = new Set([...Object.keys(adj), ...Object.keys(revAdj)]);
  const roots = [...allNodes].filter((n) => !revAdj[n] || revAdj[n].length === 0);

  // BFS to compute max depth from any root
  const depth = {};
  const queue = roots.map((r) => ({ node: r, d: 1 }));
  for (const { node, d } of queue) {
    if (!depth[node] || d > depth[node]) {
      depth[node] = d;
    }
    for (const neighbor of adj[node] || []) {
      queue.push({ node: neighbor, d: (depth[node] || d) + 1 });
    }
  }

  const maxDepth = Math.max(1, ...Object.values(depth));
  return { maxDepth, nodeDepths: depth };
}

// ── Content hashing & duplicate detection ────────────────────────────────────

/**
 * Compute MD5 hash of file content for duplicate detection.
 */
function hashContent(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash("md5").update(content).digest("hex");
  } catch {
    return null;
  }
}

/**
 * Detect files with identical content (byte-for-byte duplicates).
 * Groups files by content hash, reports groups with 2+ members.
 */
function detectDuplicates(files, projectRoot) {
  const hashMap = new Map(); // hash → [{path, size}]

  for (const f of files) {
    if (f.size < DUPLICATE_MIN_SIZE) continue;
    const hash = hashContent(f.path);
    if (!hash) continue;
    if (!hashMap.has(hash)) hashMap.set(hash, []);
    hashMap.get(hash).push({ path: f.relPath, size: f.size });
  }

  // Filter to groups with 2+ files
  const groups = [...hashMap.values()]
    .filter((g) => g.length >= 2)
    .sort((a, b) => b[0].size * b.length - a[0].size * a.length) // sort by wasted bytes
    .slice(0, MAX_DUPLICATE_GROUPS);

  return groups.map((g) => ({
    files: g.map((f) => f.path),
    size: g[0].size,
    wastedBytes: g[0].size * (g.length - 1),
    count: g.length,
  }));
}

// ── Package-level software engineering metrics ───────────────────────────────

/**
 * Compute Robert Martin's package-level metrics:
 *   Ce = Efferent coupling (fan-out: deps TO other packages)
 *   Ca = Afferent coupling (fan-in: deps FROM other packages)
 *   I  = Instability = Ce / (Ca + Ce)  [0=stable, 1=unstable]
 *   A  = Abstractness (approximated by ratio of "abstract-ish" files)
 *   D  = Distance from Main Sequence = |A + I - 1|
 *
 * "Package" = top-level directory or second-level directory for large projects.
 */
function computePackageMetrics(files, depGraph) {
  // Determine package depth: use 1st level if >5 dirs, else 2nd level
  const topDirs = new Set(files.map((f) => f.relPath.split("/")[0]));
  const useSecondLevel = topDirs.size <= 5;

  function getPackage(relPath) {
    const parts = relPath.split("/");
    // Root-level files go to "." (root package)
    if (parts.length === 1) return ".";
    // For deeper paths: use 1st level dir as package name
    // But if useSecondLevel and the first level has subdirectories, use 2 levels
    if (useSecondLevel && parts.length >= 3) return parts.slice(0, 2).join("/");
    return parts[0] || ".";
  }

  // Group files by package
  const pkgFiles = {}; // pkg → [relPath]
  for (const f of files) {
    const pkg = getPackage(f.relPath);
    if (!pkgFiles[pkg]) pkgFiles[pkg] = [];
    pkgFiles[pkg].push(f.relPath);
  }
  const packages = Object.keys(pkgFiles);

  // Build package-level dependency graph
  const pkgEdges = new Set(); // "pkgA→pkgB"
  for (const edge of depGraph.edges) {
    const fromPkg = getPackage(edge.from);
    const toPkg = getPackage(edge.to);
    if (fromPkg !== toPkg) {
      pkgEdges.add(`${fromPkg}→${toPkg}`);
    }
  }

  // Compute Ce (efferent) and Ca (afferent) per package
  const ce = {}; // fan-out per package
  const ca = {}; // fan-in per package
  for (const pkg of packages) { ce[pkg] = 0; ca[pkg] = 0; }
  for (const edge of pkgEdges) {
    const [from, to] = edge.split("→");
    if (ce[from] !== undefined) ce[from]++;
    if (ca[to] !== undefined) ca[to]++;
  }

  // Compute file-level Ce/Ca/I for per-file coupling
  const fileCe = {}; // fan-out per file
  const fileCa = {}; // fan-in per file
  const allNodes = new Set(depGraph.nodes.map((n) => n.path));
  for (const n of allNodes) { fileCe[n] = 0; fileCa[n] = 0; }
  for (const edge of depGraph.edges) {
    fileCe[edge.from] = (fileCe[edge.from] || 0) + 1;
    fileCa[edge.to] = (fileCa[edge.to] || 0) + 1;
  }

  // Approximate abstractness: files whose name starts with "I" (interface),
  // or are .d.ts, or are in an "interface"/"types"/"abstract" directory
  function isAbstractFile(relPath) {
    const name = basename(relPath);
    const dir = dirname(relPath).toLowerCase();
    return (
      /^[A-Z]/.test(name) && /\.(ts|d\.ts)$/.test(name) ||  // Capitalized .ts files (likely classes/interfaces)
      /\.d\.ts$/.test(name) ||                               // TypeScript declaration files
      /(^|\/)types?\//.test(dir) ||                           // in types/ directory
      /(^|\/)interfaces?\//.test(dir)                        // in interfaces/ directory
    );
  }

  // Compute per-package metrics
  const metrics = packages.map((pkg) => {
    const fileList = pkgFiles[pkg];
    const totalFiles = fileList.length;
    const abstractFiles = fileList.filter(isAbstractFile).length;
    const Ce = ce[pkg] || 0;
    const Ca = ca[pkg] || 0;
    const I = Ce + Ca > 0 ? +(Ce / (Ce + Ca)).toFixed(3) : 0;
    const A = totalFiles > 0 ? +(abstractFiles / totalFiles).toFixed(3) : 0;
    const D = +((Math.abs(A + I - 1))).toFixed(3);

    // Compute intra-package coupling (internal edges / total edges)
    let internalEdges = 0;
    let totalEdges = 0;
    for (const edge of depGraph.edges) {
      if (getPackage(edge.from) === pkg || getPackage(edge.to) === pkg) {
        totalEdges++;
        if (getPackage(edge.from) === pkg && getPackage(edge.to) === pkg) {
          internalEdges++;
        }
      }
    }
    const cohesion = totalEdges > 0 ? +(internalEdges / totalEdges).toFixed(3) : 0;

    // Zone classification
    let zone = "main-sequence";
    if (D > ZONE_OF_PAIN_D && I < 0.5) zone = "zone-of-pain";       // stable + concrete = painful to change
    else if (D > ZONE_OF_USELESS_D && I > 0.5) zone = "zone-of-uselessness"; // unstable + abstract = useless

    return {
      package: pkg,
      fileCount: totalFiles,
      abstractCount: abstractFiles,
      Ce, Ca, I, A, D,
      cohesion,
      zone,
    };
  });

  // Sort by D descending (most problematic first)
  metrics.sort((a, b) => b.D - a.D);

  // Per-file coupling: top files by instability
  const fileCoupling = [...allNodes]
    .filter((n) => (fileCe[n] || 0) + (fileCa[n] || 0) > 0)
    .map((n) => {
      const _Ce = fileCe[n] || 0;
      const _Ca = fileCa[n] || 0;
      const _I = _Ce + _Ca > 0 ? +(_Ce / (_Ce + _Ca)).toFixed(3) : 0;
      return { path: n, Ce: _Ce, Ca: _Ca, I: _I };
    })
    .sort((a, b) => b.I - a.I) // most unstable first
    .slice(0, 20);

  return { packages: metrics, fileCoupling, edgeCount: pkgEdges.size, packageCount: packages.length };
}

/**
 * Resolve an import specifier to a relative path within the project.
 * Handles relative imports (./foo, ../bar) and aliases.
 */
function resolveImport(specifier, fromFile, projectRoot, allFiles) {
  // Only resolve relative imports
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return null; // external package — skip
  }

  const fromDir = dirname(fromFile);
  let resolved = resolve(fromDir, specifier);

  // Make relative to project root
  resolved = relative(projectRoot, resolved);

  // If it already has an extension and exists, return it
  const candidates = allFiles.filter((f) => {
    const rel = f.relPath;
    return rel === resolved ||
      rel === resolved + ".js" ||
      rel === resolved + ".mjs" ||
      rel === resolved + ".ts" ||
      rel === resolved + ".jsx" ||
      rel === resolved + ".tsx" ||
      rel === resolved + "/index.js" ||
      rel === resolved + "/index.mjs" ||
      rel === resolved + "/index.ts" ||
      rel === resolved + ".vue" ||
      rel === resolved + ".css" ||
      rel === resolved + ".scss";
  });

  return candidates.length > 0 ? candidates[0].relPath : resolved;
}

// ── Dependency graph building ──────────────────────────────────────────────

/**
 * Build a directed dependency graph from file imports.
 */
function buildDepGraph(files, projectRoot) {
  const fileSet = new Set(files.map((f) => f.relPath));
  const edges = [];
  const nodeSet = new Set();

  // Only parse files with known extensions
  const parsableFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext));

  // If too many files, limit to largest ones
  const sortedForGraph = parsableFiles
    .filter((f) => f.size >= MIN_DEP_FILE_SIZE)
    .sort((a, b) => b.size - a.size)
    .slice(0, MAX_GRAPH_NODES);

  const graphFileSet = new Set(sortedForGraph.map((f) => f.relPath));

  for (const file of sortedForGraph) {
    const rawImports = parseImports(file.path);
    nodeSet.add(file.relPath);

    for (const imp of rawImports) {
      const resolved = resolveImport(imp.specifier, file.path, projectRoot, files);
      if (resolved && graphFileSet.has(resolved) && resolved !== file.relPath) {
        edges.push({ from: file.relPath, to: resolved, type: imp.type });
        nodeSet.add(resolved);
      }
    }
  }

  // Build node list with metadata
  const fileMap = new Map(files.map((f) => [f.relPath, f]));
  const nodes = [...nodeSet].map((relPath) => {
    const f = fileMap.get(relPath);
    return {
      path: relPath,
      size: f ? f.size : 0,
      ext: f ? f.ext : "",
    };
  });

  return { nodes, edges };
}

// ── Transitive dependency analysis ──────────────────────────────────────────

/**
 * Compute transitive closure of the dependency graph using BFS from each node.
 * Returns:
 *   - transitiveFanOut: for each node, the set of nodes reachable via any path
 *   - transitiveFanIn: for each node, the set of nodes that can reach it
 *   - bridgeModules: nodes whose removal disconnects the graph (articulation points, simplified)
 *   - indirectDeps: top nodes with the most indirect (non-direct) dependencies
 */
function computeTransitiveDeps(depGraph) {
  // Build adjacency list
  const adj = {};     // forward edges
  const revAdj = {};  // reverse edges
  const nodes = new Set();

  for (const n of depGraph.nodes) {
    nodes.add(n.path);
    adj[n.path] = [];
    revAdj[n.path] = [];
  }
  for (const edge of depGraph.edges) {
    if (adj[edge.from]) adj[edge.from].push(edge.to);
    if (revAdj[edge.to]) revAdj[edge.to].push(edge.from);
    nodes.add(edge.from);
    nodes.add(edge.to);
  }
  for (const n of nodes) {
    if (!adj[n]) adj[n] = [];
    if (!revAdj[n]) revAdj[n] = [];
  }

  const allNodes = [...nodes];

  // BFS to compute reachable set (transitive fan-out) for each node
  const reachable = {}; // node → Set of reachable nodes
  const directDeps = {}; // node → Set of direct deps

  for (const n of allNodes) {
    directDeps[n] = new Set(adj[n]);
    // BFS
    const visited = new Set();
    const queue = [n];
    visited.add(n);
    while (queue.length > 0) {
      const current = queue.shift();
      for (const neighbor of adj[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    visited.delete(n); // exclude self
    reachable[n] = visited;
  }

  // Compute transitive fan-in (reverse reachability)
  const reaching = {}; // node → Set of nodes that can reach it
  for (const n of allNodes) {
    const visited = new Set();
    const queue = [n];
    visited.add(n);
    while (queue.length > 0) {
      const current = queue.shift();
      for (const neighbor of revAdj[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    visited.delete(n);
    reaching[n] = visited;
  }

  // Top nodes by transitive fan-out (largest blast radius)
  const topTransitiveFanOut = allNodes
    .map((n) => ({ path: n, directCount: directDeps[n].size, transitiveCount: reachable[n].size, indirectOnly: reachable[n].size - directDeps[n].size }))
    .filter((x) => x.transitiveCount > 0)
    .sort((a, b) => b.transitiveCount - a.transitiveCount)
    .slice(0, 15);

  // Top nodes by transitive fan-in (most depended-on, including indirect)
  const topTransitiveFanIn = allNodes
    .map((n) => ({ path: n, directCount: (revAdj[n] || []).length, transitiveCount: reaching[n].size, indirectOnly: reaching[n].size - (revAdj[n] || []).length }))
    .filter((x) => x.transitiveCount > 0)
    .sort((a, b) => b.transitiveCount - a.transitiveCount)
    .slice(0, 15);

  // Bridge modules: nodes that if you look at their reachable set,
  // they are the sole connector between otherwise disconnected groups.
  // Simplified heuristic: a node is a "bridge" if it has both high fan-in AND high fan-out
  // AND many of its transitive connections are indirect (not direct).
  const bridgeModules = allNodes
    .map((n) => {
      const r = reachable[n];
      const ri = reaching[n];
      // Bridge score: product of direct fan-in and fan-out, weighted by indirect ratio
      const directOut = directDeps[n].size;
      const directIn = (revAdj[n] || []).length;
      const bridgeScore = directOut * directIn * (r.size > 0 ? (r.size - directOut) / r.size : 0);
      return { path: n, directIn, directOut, transitiveIn: ri.size, transitiveOut: r.size, bridgeScore: +bridgeScore.toFixed(1) };
    })
    .filter((x) => x.bridgeScore > 0)
    .sort((a, b) => b.bridgeScore - a.bridgeScore)
    .slice(0, 10);

  // Average path length and graph diameter
  const allReachableCounts = allNodes.map((n) => reachable[n].size);
  const avgReachable = allReachableCounts.length > 0 ? +(allReachableCounts.reduce((a, b) => a + b, 0) / allReachableCounts.length).toFixed(1) : 0;
  const maxReachable = Math.max(0, ...allReachableCounts);

  // Disconnected subgraph detection
  const subgraphs = findDisconnectedSubgraphs(allNodes, adj);

  return {
    topTransitiveFanOut,
    topTransitiveFanIn,
    bridgeModules,
    avgReachable,
    maxReachable,
    disconnectedSubgraphs: subgraphs.length,
    largestSubgraphRatio: subgraphs.length > 0 ? +(Math.max(...subgraphs.map((s) => s.size)) / allNodes.length).toFixed(2) : 1,
  };
}

/**
 * Find disconnected subgraphs using BFS on undirected version of graph.
 */
function findDisconnectedSubgraphs(nodes, adj) {
  const undirected = {};
  for (const n of nodes) {
    undirected[n] = new Set(adj[n] || []);
  }
  // Make undirected
  for (const n of nodes) {
    for (const neighbor of undirected[n]) {
      if (!undirected[neighbor]) undirected[neighbor] = new Set();
      undirected[neighbor].add(n);
    }
  }

  const visited = new Set();
  const subgraphs = [];

  for (const n of nodes) {
    if (visited.has(n)) continue;
    const component = new Set();
    const queue = [n];
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      component.add(current);
      for (const neighbor of undirected[current] || []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    subgraphs.push(component);
  }

  return subgraphs;
}

// ── Git churn analysis ──────────────────────────────────────────────────────

/**
 * Analyze git commit history to compute file change frequency (churn).
 * Cross-references churn with file size to identify change hotspots.
 *
 * @param {string} projectRoot
 * @param {object} opts - { timeWindow: '30 days' | '90 days' | 'all' }
 */
function computeGitChurn(projectRoot, files, opts = {}) {
  const timeWindow = opts.timeWindow || "90 days";
  const fileSet = new Set(files.map((f) => f.relPath));

  let gitOutput;
  try {
    const sincePeriod = timeWindow.replace(/\s+/g, ".");
    const args = ["log", `--since=${sincePeriod}`, "--name-only", "--pretty=format:", "--", "."];
    gitOutput = execSync(`git -C "${projectRoot}" ${args.join(" ")}`, { encoding: "utf-8", timeout: 10000, maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return { available: false, reason: "git command failed or timed out" };
  }

  // Parse git output: each line is a changed file path
  const changedFiles = gitOutput
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Count changes per file
  const churnCount = {};
  for (const f of changedFiles) {
    churnCount[f] = (churnCount[f] || 0) + 1;
  }

  // Cross-reference with project files
  const fileMap = new Map(files.map((f) => [f.relPath, f]));
  const hotFiles = [];

  for (const [path, count] of Object.entries(churnCount)) {
    if (!fileMap.has(path)) continue; // outside scope
    const file = fileMap.get(path);
    // Heat index: churn × log2(size in KB + 1) — balances size and frequency
    const sizeKB = file.size / 1024;
    const heatIndex = +(count * Math.log2(sizeKB + 1)).toFixed(1);
    hotFiles.push({
      path,
      size: file.size,
      churnCount: count,
      heatIndex,
    });
  }

  hotFiles.sort((a, b) => b.heatIndex - a.heatIndex);

  // Summary
  const totalChanges = hotFiles.reduce((s, f) => s + f.churnCount, 0);
  const filesChanged = hotFiles.length;
  const filesUnchanged = files.length - filesChanged;
  const topHotFiles = hotFiles.slice(0, 20);

  // Churn buckets
  const churnBuckets = { "0": 0, "1-2": 0, "3-5": 0, "6-10": 0, "11-20": 0, "20+": 0 };
  for (const f of hotFiles) {
    if (f.churnCount === 0) churnBuckets["0"]++;
    else if (f.churnCount <= 2) churnBuckets["1-2"]++;
    else if (f.churnCount <= 5) churnBuckets["3-5"]++;
    else if (f.churnCount <= 10) churnBuckets["6-10"]++;
    else if (f.churnCount <= 20) churnBuckets["11-20"]++;
    else churnBuckets["20+"]++;
  }

  return {
    available: true,
    timeWindow,
    totalChanges,
    filesChanged,
    filesUnchanged,
    churnRate: files.length > 0 ? +((filesChanged / files.length) * 100).toFixed(1) : 0,
    topHotFiles,
    churnBuckets,
  };
}

// ── Architecture layer detection ─────────────────────────────────────────────

/**
 * Detect architectural layers based on dependency direction.
 *
 * Layer assignment (topological):
 *   - Layer 0 (Entry): files with no incoming dependencies (fan-in = 0)
 *   - Layer N (Foundation): files with no outgoing dependencies (fan-out = 0)
 *   - Middle layers: everything else, ordered by dependency distance from entry
 *
 * Layer violation: a lower layer (higher layer number) depending on an upper layer
 * (lower layer number). This is the "downward dependency rule" — foundations
 * should not depend on entries.
 */
function detectLayers(files, depGraph) {
  if (depGraph.edges.length === 0) return { layers: [], violations: [], layerCount: 0 };

  // Compute fan-in and fan-out for each node
  const fanIn = {};
  const fanOut = {};
  const adj = {};
  const revAdj = {};

  for (const n of depGraph.nodes) {
    fanIn[n.path] = 0;
    fanOut[n.path] = 0;
    adj[n.path] = [];
    revAdj[n.path] = [];
  }
  for (const edge of depGraph.edges) {
    if (fanIn[edge.to] !== undefined) fanIn[edge.to]++;
    if (fanOut[edge.from] !== undefined) fanOut[edge.from]++;
    if (adj[edge.from]) adj[edge.from].push(edge.to);
    if (revAdj[edge.to]) revAdj[edge.to].push(edge.from);
  }

  const allNodes = depGraph.nodes.map((n) => n.path);

  // Compute topological layer using BFS from entry nodes (fan-in = 0)
  const entryNodes = allNodes.filter((n) => fanIn[n] === 0);
  const layerAssignment = {};
  const queue = entryNodes.map((n) => ({ node: n, layer: 0 }));

  while (queue.length > 0) {
    const { node, layer } = queue.shift();
    if (layerAssignment[node] !== undefined && layerAssignment[node] <= layer) continue;
    layerAssignment[node] = layer;
    for (const neighbor of adj[node] || []) {
      if (layerAssignment[neighbor] === undefined || layerAssignment[neighbor] < layer + 1) {
        queue.push({ node: neighbor, layer: layer + 1 });
      }
    }
  }

  // Assign remaining unassigned nodes
  for (const n of allNodes) {
    if (layerAssignment[n] === undefined) layerAssignment[n] = 0;
  }

  const maxLayer = Math.max(0, ...Object.values(layerAssignment));

  // Detect layer violations: lower layer (higher number) → upper layer (lower number)
  const violations = [];
  for (const edge of depGraph.edges) {
    const fromLayer = layerAssignment[edge.from] ?? 0;
    const toLayer = layerAssignment[edge.to] ?? 0;
    // Violation: depending upward (from lower to upper layer)
    if (fromLayer > toLayer) {
      violations.push({
        from: edge.from,
        to: edge.to,
        fromLayer,
        toLayer,
        gap: fromLayer - toLayer,
        type: edge.type || "import",
      });
    }
  }

  // Group nodes by layer
  const layerGroups = {};
  for (const n of allNodes) {
    const l = layerAssignment[n] ?? 0;
    if (!layerGroups[l]) layerGroups[l] = [];
    layerGroups[l].push(n);
  }

  // Layer metrics
  const layers = Object.entries(layerGroups)
    .map(([layer, nodeList]) => ({
      layer: parseInt(layer),
      nodeCount: nodeList.length,
      // Find representative files (largest in this layer)
      representatives: nodeList
        .map((n) => {
          const node = depGraph.nodes.find((nd) => nd.path === n);
          return { path: n, size: node ? node.size : 0 };
        })
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .map((x) => x.path.split("/").pop()),
      // Ratio of intra-layer edges vs cross-layer
      avgFanOut: nodeList.length > 0 ? +(nodeList.reduce((s, n) => s + (fanOut[n] || 0), 0) / nodeList.length).toFixed(1) : 0,
    }))
    .sort((a, b) => a.layer - b.layer);

  // Violation severity summary
  const severeViolations = violations.filter((v) => v.gap > 1).length;

  return {
    layers,
    violations: violations.slice(0, 20), // top 20
    violationCount: violations.length,
    severeViolations,
    layerCount: layers.length,
    maxLayer,
    entryNodeCount: entryNodes.length,
  };
}

// ── Co-change analysis ──────────────────────────────────────────────────────

/**
 * Analyze git history to find files that frequently change together in the same commit.
 * High co-change frequency suggests implicit coupling not captured by import analysis.
 *
 * Co-change score = Jaccard similarity of commit sets between two files.
 */
function computeCoChange(projectRoot, files, opts = {}) {
  const timeWindow = opts.timeWindow || "90 days";
  const maxPairs = opts.maxPairs || 30;
  const fileSet = new Set(files.map((f) => f.relPath));

  let gitOutput;
  try {
    // Get commits with their changed files (all files, not just modified)
    // Convert "90 days" → "90.days" for git --since format
    const sincePeriod = timeWindow.replace(/\s+/g, ".");
    const args = ["log", `--since=${sincePeriod}`, "--name-only", "--pretty=format:--COMMIT--", "--", "."];
    gitOutput = execSync(`git -C "${projectRoot}" ${args.join(" ")}`, { encoding: "utf-8", timeout: 15000, maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return { available: false, reason: "git command failed", pairs: [], summary: {} };
  }

  // Parse: each commit is separated by --COMMIT--
  const commits = gitOutput
    .split("--COMMIT--")
    .map((block) =>
      block
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && fileSet.has(l))
    )
    .filter((files) => files.length >= 2); // only commits with 2+ tracked files

  if (commits.length === 0) {
    return { available: true, timeWindow, pairs: [], summary: { totalCommits: 0, coChangedFiles: 0 }, commitCount: 0 };
  }

  // Count co-occurrences per file pair
  const pairCounts = {}; // "fileA||fileB" → count
  const fileCommitSets = {}; // file → Set of commit indices

  for (let ci = 0; ci < commits.length; ci++) {
    const commitFiles = commits[ci];
    for (const f of commitFiles) {
      if (!fileCommitSets[f]) fileCommitSets[f] = new Set();
      fileCommitSets[f].add(ci);
    }
    // Count all pairs in this commit
    for (let i = 0; i < commitFiles.length; i++) {
      for (let j = i + 1; j < commitFiles.length; j++) {
        const a = commitFiles[i];
        const b = commitFiles[j];
        const key = a < b ? `${a}||${b}` : `${b}||${a}`;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
    }
  }

  // Compute Jaccard similarity for each pair
  const pairs = Object.entries(pairCounts)
    .map(([key, coCount]) => {
      const [a, b] = key.split("||");
      const setA = fileCommitSets[a] || new Set();
      const setB = fileCommitSets[b] || new Set();
      const union = new Set([...setA, ...setB]);
      const jaccard = union.size > 0 ? +(coCount / union.size).toFixed(3) : 0;
      // Co-change strength: weighted by Jaccard
      const strength = +(coCount * jaccard).toFixed(2);
      return { files: [a, b], coChangeCount: coCount, jaccard, strength };
    })
    .sort((a, b) => b.strength - a.strength)
    .slice(0, maxPairs);

  // Summary
  const allCoChangedFiles = new Set();
  for (const p of pairs) {
    allCoChangedFiles.add(p.files[0]);
    allCoChangedFiles.add(p.files[1]);
  }

  // Find clusters of co-changing files (simplified: connected components in co-change graph)
  const coChangeClusters = findCoChangeClusters(pairs);

  return {
    available: true,
    timeWindow,
    pairs,
    commitCount: commits.length,
    coChangedFileCount: allCoChangedFiles.size,
    clusters: coChangeClusters,
    summary: {
      totalCommits: commits.length,
      coChangedFiles: allCoChangedFiles.size,
      topPairStrength: pairs.length > 0 ? pairs[0].strength : 0,
    },
  };
}

/**
 * Find clusters of files that change together (connected components in co-change graph).
 */
function findCoChangeClusters(pairs) {
  if (pairs.length === 0) return [];

  // Build adjacency for strong co-change (strength > 2)
  const adj = {};
  for (const p of pairs) {
    if (p.strength < 2) continue;
    const [a, b] = p.files;
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
  }

  const visited = new Set();
  const clusters = [];

  for (const node of Object.keys(adj)) {
    if (visited.has(node)) continue;
    const component = [];
    const queue = [node];
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      component.push(current);
      for (const neighbor of adj[current] || []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    if (component.length >= 2) clusters.push(component);
  }

  return clusters
    .sort((a, b) => b.length - a.length)
    .slice(0, 10)
    .map((c) => ({ files: c.slice(0, 10), size: c.length }));
}

// ── Risk scoring ────────────────────────────────────────────────────────────

/**
 * Compute per-file composite risk score based on multiple dimensions.
 *
 * Risk dimensions (each 0-1, then weighted):
 *   - sizeRisk: log-scaled file size (0=small, 1=>500KB)
 *   - churnRisk: normalized churn count
 *   - couplingRisk: normalized (fan-in + fan-out)
 *   - orphanRisk: binary (1 if orphan, 0 otherwise)
 *   - circularRisk: binary (1 if in circular dep, 0 otherwise)
 *   - zonePainRisk: binary (1 if in zone-of-pain package, 0 otherwise)
 *
 * Composite: weighted average × 100 → 0-100 risk score
 */
function computeRiskScores(files, stats) {
  const { circularDeps, orphanFiles, packageMetrics, gitChurn } = stats;

  // Build lookup sets
  const circularSet = new Set();
  for (const cycle of circularDeps) {
    for (const node of cycle) circularSet.add(node);
  }

  const orphanSet = new Set((orphanFiles || []).map((f) => f.path));

  const zonePainSet = new Set();
  if (packageMetrics && packageMetrics.packages) {
    for (const pkg of packageMetrics.packages) {
      if (pkg.zone === "zone-of-pain") {
        // Mark files in this package — simplified: mark all files under the package dir
        // For now, we don't have per-file package mapping, so skip precise marking
      }
    }
  }

  // Build churn map
  const churnMap = new Map();
  if (gitChurn && gitChurn.available && gitChurn.topHotFiles) {
    for (const f of gitChurn.topHotFiles) {
      churnMap.set(f.path, f.churnCount);
    }
  }
  const maxChurn = churnMap.size > 0 ? Math.max(1, ...churnMap.values()) : 1;

  // Build fan-in / fan-out from depGraph... actually we need the depGraph here
  // We'll compute from transitiveDeps if available, else use direct

  // Compute risk per file (only for source files > 100 bytes)
  const sourceFiles = files.filter((f) => f.size > 100 && (DEP_PARSE_EXTS.has(f.ext) || f.ext === ".html" || f.ext === ".md" || f.ext === ".json" || f.ext === ".yaml" || f.ext === ".yml"));

  const riskScores = sourceFiles.map((f) => {
    // Size risk: log scale, max at LARGE_FILE_THRESHOLD
    const sizeRisk = Math.min(1, Math.log2(f.size / 1024 + 1) / Math.log2(LARGE_FILE_THRESHOLD / 1024 + 1));

    // Churn risk: normalized by max churn
    const churnCount = churnMap.get(f.relPath) || 0;
    const churnRisk = Math.min(1, churnCount / Math.max(1, maxChurn));

    // Coupling risk: approximated from package presence
    // (full coupling needs depGraph access, use simplified version)
    const couplingRisk = 0; // placeholder — computed if depGraph available

    // Binary risks
    const orphanRisk = orphanSet.has(f.relPath) ? 1 : 0;
    const circularRisk = circularSet.has(f.relPath) ? 1 : 0;

    // Composite: weighted
    const composite = +(
      sizeRisk * 0.25 +
      churnRisk * 0.25 +
      couplingRisk * 0.15 +
      orphanRisk * 0.15 +
      circularRisk * 0.20
    ).toFixed(3);

    return {
      path: f.relPath,
      size: f.size,
      sizeRisk: +sizeRisk.toFixed(2),
      churnRisk: +churnRisk.toFixed(2),
      couplingRisk: +couplingRisk.toFixed(2),
      orphanRisk,
      circularRisk,
      composite,
    };
  });

  // Sort by composite risk descending
  riskScores.sort((a, b) => b.composite - a.composite);

  // Risk distribution
  const riskBuckets = { "low (0-20)": 0, "medium (20-40)": 0, "high (40-60)": 0, "critical (60-80)": 0, "extreme (80-100)": 0 };
  for (const r of riskScores) {
    const c = r.composite * 100;
    if (c < 20) riskBuckets["low (0-20)"]++;
    else if (c < 40) riskBuckets["medium (20-40)"]++;
    else if (c < 60) riskBuckets["high (40-60)"]++;
    else if (c < 80) riskBuckets["critical (60-80)"]++;
    else riskBuckets["extreme (80-100)"]++;
  }

  const avgRisk = riskScores.length > 0 ? +(riskScores.reduce((s, r) => s + r.composite, 0) / riskScores.length * 100).toFixed(1) : 0;

  return {
    topRisks: riskScores.slice(0, 25),
    riskBuckets,
    avgRisk,
    totalAssessed: riskScores.length,
  };
}

// ── Refactoring recommendations ─────────────────────────────────────────────

/**
 * Generate actionable refactoring recommendations from analysis data.
 * Each recommendation has: severity (P0/P1/P2), category, description, and affected files.
 */
function generateRecommendations(files, stats) {
  const recs = [];

  // P0: Oversized files
  if (stats.oversizedFiles && stats.oversizedFiles.length > 0) {
    for (const f of stats.oversizedFiles.slice(0, 3)) {
      recs.push({
        severity: "P0",
        category: "file-size",
        title: `Split oversized file: ${f.path.split("/").pop()}`,
        description: `${formatBytes(f.size)} exceeds the 500KB threshold. Consider splitting into smaller modules by responsibility.`,
        files: [f.path],
      });
    }
  }

  // P0: Circular dependencies
  if (stats.circularDeps && stats.circularDeps.length > 0) {
    for (const cycle of stats.circularDeps.slice(0, 3)) {
      recs.push({
        severity: "P0",
        category: "circular-dep",
        title: `Break circular dependency: ${cycle.slice(0, 3).map((c) => c.split("/").pop()).join(" → ")}`,
        description: `Circular dependency chain of ${cycle.length - 1} files. Extract shared interface/types into a separate module that both depend on.`,
        files: cycle.slice(0, -1),
      });
    }
  }

  // P1: Zone-of-pain packages
  if (stats.packageMetrics && stats.packageMetrics.packages) {
    const painPkgs = stats.packageMetrics.packages.filter((p) => p.zone === "zone-of-pain");
    for (const p of painPkgs.slice(0, 3)) {
      recs.push({
        severity: "P1",
        category: "architecture",
        title: `Add abstractions to package: ${p.package}/`,
        description: `Package "${p.package}" is in zone-of-pain (D=${p.D}, I=${p.I}, A=${p.A}). It's stable (highly depended-on) but concrete. Add abstract interfaces or types to allow dependents to decouple.`,
        files: [p.package],
      });
    }
  }

  // P1: Layer violations (severe)
  if (stats.layerAnalysis && stats.layerAnalysis.violations) {
    const severe = stats.layerAnalysis.violations.filter((v) => v.gap > 1);
    for (const v of severe.slice(0, 3)) {
      recs.push({
        severity: "P1",
        category: "layer-violation",
        title: `Fix layer violation: ${v.from.split("/").pop()} (L${v.fromLayer}) → ${v.to.split("/").pop()} (L${v.toLayer})`,
        description: `Layer ${v.fromLayer} should not depend on Layer ${v.toLayer} (gap=${v.gap}). Extract shared dependency to a lower layer or invert the dependency.`,
        files: [v.from, v.to],
      });
    }
  }

  // P1: High transitive fan-out (large blast radius)
  if (stats.transitiveDeps && stats.transitiveDeps.topTransitiveFanOut) {
    for (const f of stats.transitiveDeps.topTransitiveFanOut.slice(0, 3)) {
      if (f.transitiveCount > 10) {
        recs.push({
          severity: "P1",
          category: "blast-radius",
          title: `Reduce blast radius: ${f.path.split("/").pop()}`,
          description: `This file has a blast radius of ${f.transitiveCount} files (${f.directCount} direct + ${f.indirectOnly} indirect). Consider splitting to reduce the impact of changes.`,
          files: [f.path],
        });
      }
    }
  }

  // P2: Orphan files (potential dead code)
  if (stats.orphanFiles && stats.orphanFiles.length > 5) {
    recs.push({
      severity: "P2",
      category: "dead-code",
      title: `Review ${stats.orphanFiles.length} orphan files for dead code`,
      description: "These files are not imported by any other file. Verify they are not entry points or configuration, then remove if unused.",
      files: stats.orphanFiles.slice(0, 5).map((f) => f.path),
    });
  }

  // P2: Duplicate files
  if (stats.duplicates && stats.duplicates.length > 0) {
    const totalWasted = stats.duplicates.reduce((s, d) => s + (d.wastedBytes || 0), 0);
    recs.push({
      severity: "P2",
      category: "duplication",
      title: `Eliminate ${stats.duplicates.length} duplicate file groups`,
      description: `${formatBytes(totalWasted)} wasted by duplicated files. Extract shared content into a single module and import it.`,
      files: stats.duplicates.slice(0, 3).flatMap((g) => g.files),
    });
  }

  // P2: Co-change clusters (from gitChurn — if co-change analysis was run)
  // (This is a placeholder; full co-change integration requires running computeCoChange first)

  // P2: God Modules (high fan-out)
  if (stats.mostDependencies && stats.mostDependencies.length > 0) {
    const godModule = stats.mostDependencies[0];
    if (godModule.count > 10) {
      recs.push({
        severity: "P2",
        category: "god-module",
        title: `Refactor God Module: ${godModule.path.split("/").pop()}`,
        description: `This file depends on ${godModule.count} other files (high fan-out). Consider splitting responsibilities across multiple modules.`,
        files: [godModule.path],
      });
    }
  }

  return recs;
}

// ── SCC: Tarjan's strongly connected components ─────────────────────────────

/**
 * Tarjan's algorithm for finding strongly connected components (SCCs) in a directed graph.
 *
 * An SCC is a maximal set of nodes where every node can reach every other node.
 * SCCs of size > 1 represent circular dependency groups — more rigorous than
 * the simple DFS cycle detection (which finds cycles but not full SCCs).
 *
 * Complexity: O(V + E) — linear in nodes + edges.
 */
function computeSCC(depGraph) {
  const adj = {};
  for (const n of depGraph.nodes) adj[n.path] = [];
  for (const edge of depGraph.edges) {
    if (adj[edge.from]) adj[edge.from].push(edge.to);
    // Ensure target nodes exist in adj
    if (!adj[edge.to]) adj[edge.to] = [];
  }

  const nodes = Object.keys(adj);
  if (nodes.length === 0) return { components: [], multiNodeComponents: [], largestSCCSize: 0, sccCount: 0 };

  let index = 0;
  const indices = {};    // node → discovery index
  const lowlink = {};    // node → lowest index reachable
  const onStack = new Set();
  const stack = [];
  const components = [];

  function strongConnect(v) {
    indices[v] = index;
    lowlink[v] = index;
    index++;
    stack.push(v);
    onStack.add(v);

    for (const w of adj[v] || []) {
      if (indices[w] === undefined) {
        // Successor w not yet visited; recurse
        strongConnect(w);
        lowlink[v] = Math.min(lowlink[v], lowlink[w]);
      } else if (onStack.has(w)) {
        // Successor w is on stack → in current SCC
        lowlink[v] = Math.min(lowlink[v], indices[w]);
      }
    }

    // If v is a root node, pop the stack to form an SCC
    if (lowlink[v] === indices[v]) {
      const component = [];
      let w;
      do {
        w = stack.pop();
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      components.push(component);
    }
  }

  for (const v of nodes) {
    if (indices[v] === undefined) {
      strongConnect(v);
    }
  }

  // Filter to multi-node SCCs (actual circular dependency groups)
  const multiNodeComponents = components
    .filter((c) => c.length >= 2)
    .sort((a, b) => b.length - a.length);

  const largestSCCSize = multiNodeComponents.length > 0 ? multiNodeComponents[0].length : 0;

  // SCC size distribution
  const sizeDist = {};
  for (const c of components) {
    const bucket = c.length === 1 ? "1" : c.length <= 3 ? "2-3" : c.length <= 5 ? "4-5" : c.length <= 10 ? "6-10" : "11+";
    sizeDist[bucket] = (sizeDist[bucket] || 0) + 1;
  }

  return {
    components: multiNodeComponents.slice(0, 20), // top 20 multi-node SCCs
    multiNodeComponents,
    largestSCCSize,
    sccCount: components.length,
    multiNodeSccCount: multiNodeComponents.length,
    sizeDist,
    // Files that are part of any multi-node SCC (circularly dependent)
    circularFiles: new Set(multiNodeComponents.flat()),
  };
}

// ── Betweenness centrality ──────────────────────────────────────────────────

/**
 * Compute betweenness centrality for each node in the dependency graph.
 *
 * Betweenness centrality of a node v = fraction of all shortest paths between
 * any pair of nodes (s, t) that pass through v.
 *
 * High betweenness → architectural bottleneck: this node sits on the critical
 * path between many other nodes. If it fails or changes, many parts break.
 *
 * Uses Brandes' algorithm (unweighted): O(V × (V + E)) — quadratic but
 * acceptable for our capped graph (≤500 nodes).
 */
function computeBetweenness(depGraph) {
  const nodes = depGraph.nodes.map((n) => n.path);
  const adj = {};
  for (const n of nodes) adj[n] = [];
  for (const edge of depGraph.edges) {
    if (adj[edge.from]) adj[edge.from].push(edge.to);
    if (!adj[edge.to]) adj[edge.to] = [];
  }

  if (nodes.length === 0) return { topBottlenecks: [], avgBetweenness: 0, maxBetweenness: 0 };

  // Betweenness score per node
  const betweenness = {};
  for (const n of nodes) betweenness[n] = 0;

  // Brandes' algorithm: run BFS from each source node
  for (const s of nodes) {
    // BFS-based shortest path counting (unweighted)
    const dist = {};       // node → distance from s
    const sigma = {};      // node → number of shortest paths from s
    const pred = {};       // node → list of predecessors on shortest paths
    const stack = [];      // nodes in order of non-increasing distance

    for (const n of nodes) {
      dist[n] = -1;
      sigma[n] = 0;
      pred[n] = [];
    }
    dist[s] = 0;
    sigma[s] = 1;

    const queue = [s];
    while (queue.length > 0) {
      const v = queue.shift();
      stack.push(v);
      for (const w of adj[v] || []) {
        // w found for the first time?
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          queue.push(w);
        }
        // shortest path to w via v?
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          pred[w].push(v);
        }
      }
    }

    // Back-propagation: accumulate dependencies
    const delta = {};
    for (const n of nodes) delta[n] = 0;

    while (stack.length > 0) {
      const w = stack.pop();
      for (const v of pred[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s) {
        betweenness[w] += delta[w];
      }
    }
  }

  // Normalize for directed graph: divide by (n-1)(n-2)
  const n = nodes.length;
  const norm = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;

  const scored = Object.entries(betweenness)
    .map(([path, score]) => ({ path, betweenness: +(score * norm).toFixed(5) }))
    .sort((a, b) => b.betweenness - a.betweenness);

  const avgBetweenness = scored.length > 0 ? +(scored.reduce((s, x) => s + x.betweenness, 0) / scored.length).toFixed(5) : 0;
  const maxBetweenness = scored.length > 0 ? scored[0].betweenness : 0;

  return {
    topBottlenecks: scored.slice(0, 20),
    avgBetweenness,
    maxBetweenness,
    // Files with significantly above-average betweenness (architectural bottlenecks)
    significantBottlenecks: scored.filter((x) => x.betweenness > avgBetweenness * 3 && x.betweenness > 0),
  };
}

// ── Temporal trend persistence ──────────────────────────────────────────────

/**
 * Save analysis run to trend file for temporal tracking.
 * Format: JSONL (one JSON object per line), each line is a run snapshot.
 */
function saveTrend(projectRoot, trendData) {
  const trendPath = join(projectRoot, ".memory/bundle-trend.jsonl");
  try {
    const dir = dirname(trendPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const line = JSON.stringify(trendData) + "\n";
    const existing = existsSync(trendPath) ? readFileSync(trendPath, "utf-8") : "";
    writeFileSync(trendPath, existing + line, "utf-8");
    return trendPath;
  } catch {
    return null;
  }
}

/**
 * Load trend history from JSONL file.
 * Returns array of run snapshots, most recent first.
 */
function loadTrend(projectRoot) {
  const trendPath = join(projectRoot, ".memory/bundle-trend.jsonl");
  if (!existsSync(trendPath)) return [];

  try {
    const content = readFileSync(trendPath, "utf-8");
    return content
      .trim()
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        try { return JSON.parse(l); } catch { return null; }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Save the current analysis run to the trend file and analyze trends.
 */
function persistAndAnalyzeTrend(projectRoot, stats, meta) {
  const trendPath = join(projectRoot, ".memory/bundle-trend.jsonl");

  // Build a lightweight run snapshot
  const snapshot = {
    timestamp: meta.generatedAt,
    totalFiles: stats.totalFiles,
    totalSize: stats.totalSize,
    totalSizeFormatted: formatBytes(stats.totalSize),
    depNodes: meta.depNodes || 0,
    depEdges: meta.depEdges || 0,
    oversizedCount: (stats.oversizedFiles || []).length,
    circularCount: (stats.circularDeps || []).length,
    orphanCount: (stats.orphanFiles || []).length,
    duplicateGroups: (stats.duplicates || []).length,
    layerCount: stats.layerAnalysis?.layerCount || 0,
    layerViolations: stats.layerAnalysis?.violationCount || 0,
    avgRisk: stats.riskScores?.avgRisk || 0,
    recommendationCount: (stats.recommendations || []).length,
    sccCount: stats.scc?.multiNodeSccCount || 0,
    maxBetweenness: stats.betweenness?.maxBetweenness || 0,
    analysisVersion: ANALYSIS_VERSION,
  };

  // Append to trend file
  const dir = dirname(trendPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  try {
    const line = JSON.stringify(snapshot) + "\n";
    // Use append-like behavior via read+write
    const existing = existsSync(trendPath) ? readFileSync(trendPath, "utf-8") : "";
    writeFileSync(trendPath, existing + line, "utf-8");
  } catch {
    // Non-fatal: trend persistence failure shouldn't block analysis
  }

  // Load full history for analysis
  const history = loadTrend(projectRoot);

  // Compute trend metrics (if 2+ data points)
  let trendAnalysis = null;
  if (history.length >= 2) {
    const prev = history[history.length - 2]; // second-to-last
    const curr = history[history.length - 1]; // last (just added)

    trendAnalysis = {
      dataPoints: history.length,
      sizeDelta: curr.totalSize - prev.totalSize,
      sizeDeltaPercent: prev.totalSize > 0 ? +((curr.totalSize - prev.totalSize) / prev.totalSize * 100).toFixed(1) : 0,
      fileCountDelta: curr.totalFiles - prev.totalFiles,
      riskDelta: +(curr.avgRisk - prev.avgRisk).toFixed(1),
      circularDelta: curr.circularCount - prev.circularCount,
      // Anomaly detection: flag if any metric jumped significantly
      anomalies: [],
      // Simple moving average over last 5 runs (or all if fewer)
      smaSize: 0,
      smaRisk: 0,
    };

    // Detect anomalies
    if (Math.abs(trendAnalysis.sizeDeltaPercent) > 20) {
      trendAnalysis.anomalies.push(`Size changed ${trendAnalysis.sizeDeltaPercent > 0 ? "+" : ""}${trendAnalysis.sizeDeltaPercent}% — unusual`);
    }
    if (curr.circularCount > prev.circularCount) {
      trendAnalysis.anomalies.push(`+${trendAnalysis.circularDelta} new circular dependencies detected`);
    }
    if (trendAnalysis.riskDelta > 5) {
      trendAnalysis.anomalies.push(`Average risk score increased by ${trendAnalysis.riskDelta} points`);
    }

    // Compute SMA over last min(5, history.length) points
    const window = history.slice(-Math.min(5, history.length));
    trendAnalysis.smaSize = +(window.reduce((s, p) => s + p.totalSize, 0) / window.length).toFixed(0);
    trendAnalysis.smaRisk = +(window.reduce((s, p) => s + p.avgRisk, 0) / window.length).toFixed(1);
  }

  return { trendPath, history, trendAnalysis };
}

// ── Module boundary suggestions ─────────────────────────────────────────────

/**
 * Suggest natural module boundaries based on coupling, co-change, and cohesion.
 *
 * Heuristics:
 *   1. Files with high co-change (Jaccard > 0.5) should be co-located
 *   2. Files with high import coupling (direct deps) should be in the same module
 *   3. Files in the same directory but with ZERO coupling may be mis-placed
 *   4. Packages with very low cohesion (< 0.2) may need splitting
 */
function suggestModuleBoundaries(stats) {
  const suggestions = [];

  // 1. High co-change pairs that are in different directories → suggest co-location
  if (stats.coChange && stats.coChange.available && stats.coChange.pairs) {
    for (const pair of stats.coChange.pairs) {
      if (pair.jaccard < 0.5) continue;
      const [a, b] = pair.files;
      const dirA = dirname(a);
      const dirB = dirname(b);
      if (dirA !== dirB) {
        suggestions.push({
          type: "co-locate",
          priority: pair.jaccard > 0.7 ? "P1" : "P2",
          files: [a, b],
          reason: `Co-change Jaccard=${pair.jaccard} (${pair.coChangeCount}× together) but in different directories (${dirA} vs ${dirB})`,
        });
      }
    }
  }

  // 2. Low-cohesion packages → suggest splitting
  if (stats.packageMetrics && stats.packageMetrics.packages) {
    for (const pkg of stats.packageMetrics.packages) {
      if (pkg.cohesion < 0.2 && pkg.fileCount > 10 && pkg.zone === "zone-of-pain") {
        suggestions.push({
          type: "split-package",
          priority: "P2",
          files: [pkg.package],
          reason: `Package "${pkg.package}" has very low cohesion (${pkg.cohesion}) with ${pkg.fileCount} files — consider splitting into smaller, more cohesive packages`,
        });
      }
    }
  }

  // 3. Bridge modules that are single points of failure → suggest interface extraction
  if (stats.transitiveDeps && stats.transitiveDeps.bridgeModules) {
    for (const bridge of stats.transitiveDeps.bridgeModules.slice(0, 5)) {
      if (bridge.bridgeScore > 3) {
        suggestions.push({
          type: "extract-interface",
          priority: "P1",
          files: [bridge.path],
          reason: `Bridge module with score ${bridge.bridgeScore} (${bridge.directIn} dependents, ${bridge.directOut} deps) — high architectural risk if modified`,
        });
      }
    }
  }

  // 4. SCCs suggest tight coupling that may need refactoring
  if (stats.scc && stats.scc.multiNodeComponents) {
    for (const scc of stats.scc.multiNodeComponents.slice(0, 5)) {
      suggestions.push({
        type: "break-scc",
        priority: scc.length > 3 ? "P0" : "P1",
        files: scc,
        reason: `Strongly connected component of ${scc.length} files (mutually reachable) — break cyclic dependency by extracting shared abstractions`,
      });
    }
  }

  // Deduplicate and limit
  const seen = new Set();
  const unique = [];
  for (const s of suggestions) {
    const key = `${s.type}:${s.files.sort().join(",")}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  }

  return unique.slice(0, 20);
}

// ── Statistics ─────────────────────────────────────────────────────────────

function computeStats(files, depGraph, opts = {}) {
  const { projectRoot } = opts;

  // Largest files
  const largestFiles = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, STATS_TOP_N)
    .map((f) => ({ path: f.relPath, size: f.size, ext: f.ext }));

  // Size by extension
  const sizeByExt = {};
  for (const f of files) {
    const ext = f.ext || "(no ext)";
    sizeByExt[ext] = (sizeByExt[ext] || 0) + f.size;
  }

  // Size by top-level directory
  const sizeByDir = {};
  for (const f of files) {
    const topDir = f.relPath.split("/")[0] || ".";
    sizeByDir[topDir] = (sizeByDir[topDir] || 0) + f.size;
  }

  // Most depended-on (fan-in)
  const fanIn = {};
  for (const edge of depGraph.edges) {
    fanIn[edge.to] = (fanIn[edge.to] || 0) + 1;
  }
  const mostDependedOn = Object.entries(fanIn)
    .sort((a, b) => b[1] - a[1])
    .slice(0, DEP_RANK_TOP_N)
    .map(([path, count]) => ({ path, count }));

  // Most dependencies (fan-out)
  const fanOut = {};
  for (const edge of depGraph.edges) {
    fanOut[edge.from] = (fanOut[edge.from] || 0) + 1;
  }
  const mostDependencies = Object.entries(fanOut)
    .sort((a, b) => b[1] - a[1])
    .slice(0, DEP_RANK_TOP_N)
    .map(([path, count]) => ({ path, count }));

  // Circular dependency detection (DFS-based)
  const circularDeps = detectCircularDeps(depGraph);

  // Total
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalFiles = files.length;

  // Large files (above threshold)
  const oversizedFiles = files
    .filter((f) => f.size > LARGE_FILE_THRESHOLD)
    .sort((a, b) => b.size - a.size)
    .map((f) => ({ path: f.relPath, size: f.size }));

  // New: orphan file detection
  const orphanFiles = detectOrphanFiles(files, depGraph);

  // New: barrel file detection
  const barrelFiles = projectRoot ? detectBarrelFiles(files, projectRoot) : [];

  // New: size histogram
  const sizeHistogram = computeHistogram(files);

  // New: dependency depth analysis
  const { maxDepth } = computeDepths(depGraph);

  // New: directory depth distribution
  const depthDist = {};
  for (const f of files) {
    const depth = f.relPath.split("/").length;
    const bucket = depth <= 1 ? "1" : depth <= 2 ? "2" : depth <= 3 ? "3" : depth <= 5 ? "4-5" : depth <= 8 ? "6-8" : "9+";
    depthDist[bucket] = (depthDist[bucket] || 0) + 1;
  }

  // New: duplicate file detection
  const duplicates = projectRoot ? detectDuplicates(files, projectRoot) : [];

  // New: package-level metrics (Robert Martin I/A/D) + file coupling
  const packageMetrics = depGraph.edges.length > 0 ? computePackageMetrics(files, depGraph) : { packages: [], fileCoupling: [], edgeCount: 0, packageCount: 0 };

  // New: transitive dependency analysis
  const transitiveDeps = depGraph.edges.length > 0 ? computeTransitiveDeps(depGraph) : null;

  // New: git churn analysis (if projectRoot available and git repo)
  const gitChurn = projectRoot ? computeGitChurn(projectRoot, files, { timeWindow: "90 days" }) : null;

  // New: architecture layer detection
  const layerAnalysis = depGraph.edges.length > 0 ? detectLayers(files, depGraph) : null;

  // New: co-change analysis (git-based, independent of dep graph)
  const coChange = projectRoot ? computeCoChange(projectRoot, files, { timeWindow: "90 days" }) : null;

  // New: Tarjan's SCC for strongly connected components
  const scc = depGraph.edges.length > 0 ? computeSCC(depGraph) : { components: [], multiNodeComponents: [], largestSCCSize: 0, sccCount: 0, multiNodeSccCount: 0, sizeDist: {}, circularFiles: new Set() };

  // New: Betweenness centrality for bottleneck detection
  const betweenness = depGraph.edges.length > 0 ? computeBetweenness(depGraph) : { topBottlenecks: [], avgBetweenness: 0, maxBetweenness: 0, significantBottlenecks: [] };

  // Build a preliminary stats snapshot for risk scoring + recommendations
  const statsSnapshot = {
    circularDeps,
    orphanFiles,
    packageMetrics,
    transitiveDeps,
    gitChurn,
    layerAnalysis,
    oversizedFiles,
    duplicates,
    mostDependencies,
  };

  // New: composite risk scoring
  const riskScores = computeRiskScores(files, statsSnapshot);

  // New: refactoring recommendations
  const recommendations = generateRecommendations(files, statsSnapshot);

  // Build full stats for module boundary suggestions
  const fullStatsForBoundary = {
    coChange,
    packageMetrics,
    transitiveDeps,
    scc,
    oversizedFiles,
    circularDeps,
    orphanFiles,
    duplicates,
    mostDependencies,
    layerAnalysis,
    riskScores,
  };
  const moduleBoundaries = suggestModuleBoundaries(fullStatsForBoundary);

  return {
    largestFiles,
    sizeByExt,
    sizeByDir,
    mostDependedOn,
    mostDependencies,
    circularDeps,
    totalSize,
    totalFiles,
    oversizedFiles,
    orphanFiles,
    barrelFiles,
    sizeHistogram,
    maxDependencyDepth: maxDepth || 0,
    depthDist,
    duplicates,
    packageMetrics,
    transitiveDeps,
    gitChurn,
    layerAnalysis,
    coChange,
    riskScores,
    recommendations,
    scc,
    betweenness,
    moduleBoundaries,
  };
}

/**
 * Detect circular dependencies using DFS.
 */
function detectCircularDeps(depGraph) {
  const adj = {};
  for (const edge of depGraph.edges) {
    if (!adj[edge.from]) adj[edge.from] = [];
    adj[edge.from].push(edge.to);
  }

  const cycles = [];
  const visited = new Set();
  const recStack = new Set();
  const path = [];

  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), neighbor]);
        }
      }
    }

    path.pop();
    recStack.delete(node);
  }

  for (const node of Object.keys(adj)) {
    if (!visited.has(node)) dfs(node);
  }

  // Limit cycles to unique ones
  return cycles.slice(0, MAX_CIRCULAR_DEPS);
}

// ── HTML generation ────────────────────────────────────────────────────────

function escapeHtml(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Build a hierarchical data structure for the treemap.
 * { name, children: [{ name, value (size) }] or { name, children } }
 */
function buildTreemapData(files) {
  const root = { name: "root", children: [] };
  const dirMap = { "": root };

  // Sort files by path for consistent ordering
  const sorted = [...files].sort((a, b) => a.relPath.localeCompare(b.relPath));

  for (const f of sorted) {
    const parts = f.relPath.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];

      if (i === parts.length - 1) {
        // File node
        const dir = dirMap[parentPath];
        if (dir) {
          dir.children.push({
            name: parts[i],
            value: f.size,
            path: f.relPath,
            ext: f.ext,
          });
        }
      } else {
        // Directory node
        if (!dirMap[currentPath]) {
          const dir = { name: parts[i], children: [] };
          dirMap[currentPath] = dir;
          const parent = dirMap[parentPath];
          if (parent) parent.children.push(dir);
        }
      }
    }
  }

  // Remove empty directories
  function prune(node) {
    if (!node.children) return false;
    node.children = node.children.filter(prune);
    return node.children.length > 0 || node.value !== undefined;
  }
  prune(root);

  return root;
}

/**
 * Generate a self-contained HTML report.
 */
function generateHtml(data, meta, diff) {
  const { treemapData, depGraph, stats } = data;
  const treemapJson = JSON.stringify(treemapData);
  const depNodesJson = JSON.stringify(depGraph.nodes);
  const depEdgesJson = JSON.stringify(depGraph.edges);
  const statsJson = JSON.stringify(stats);
  const diffJson = diff ? JSON.stringify(diff) : "null";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bundle Analysis — ${escapeHtml(meta.projectName)}</title>
<script src="https://d3js.org/d3.v7.min.js"></script>
<style>
  :root {
    --bg: #1e1f2b;
    --panel-bg: #2b2d3b;
    --border: #3d59a1;
    --text: #a9b1d6;
    --text-dim: #6b7089;
    --accent: #3d59a1;
    --warn: #f59e0b;
    --danger: #ef4444;
    --ok: #34d399;
    --info: #22d3ee;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
    height: 100vh;
  }

  /* Header */
  #header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    height: 44px;
    flex-shrink: 0;
  }
  #header h1 { font-size:15px; font-weight:600; }
  #header .meta { font-size:12px; color: var(--text-dim); }

  /* Toolbar */
  #toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: #21232f;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  #toolbar button {
    padding: 4px 12px;
    border: 1px solid var(--border);
    background: var(--panel-bg);
    color: var(--text);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background .15s;
  }
  #toolbar button:hover { background: var(--accent); }
  #toolbar button.active { background: var(--accent); color: #fff; }
  #toolbar .spacer { flex:1; }
  #toolbar .stat-badge {
    font-size: 11px;
    color: var(--text-dim);
    padding: 2px 8px;
    background: var(--panel-bg);
    border-radius: 3px;
  }

  /* Main layout */
  #main { display:flex; flex:1; overflow:hidden; height: calc(100vh - 76px); }

  /* Visualization area */
  #vis {
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;
  }
  #vis:active { cursor: grabbing; }
  #vis svg { width:100%; height:100%; }

  /* Side panel */
  #sidebar {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    background: #21232f;
    border-left: 1px solid var(--border);
    padding: 12px;
  }
  #sidebar h3 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: .5px;
    margin: 12px 0 6px;
  }
  #sidebar h3:first-child { margin-top: 0; }

  /* Stat rows */
  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 3px;
  }
  .stat-row:hover { background: rgba(255,255,255,.03); }
  .stat-row .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }
  .stat-row .value { color: var(--info); font-variant-numeric: tabular-nums; flex-shrink: 0; margin-left: 8px; }
  .stat-row .value.warn { color: var(--warn); }
  .stat-row .value.danger { color: var(--danger); }

  /* Ext bar chart */
  .ext-bar-wrap { display:flex; align-items:center; gap:6px; margin:2px 0; font-size:11px; }
  .ext-bar-wrap .ext-label { width:50px; text-align:right; flex-shrink:0; color: var(--text-dim); }
  .ext-bar-wrap .ext-bar {
    height: 14px;
    background: var(--accent);
    border-radius: 2px;
    min-width: 2px;
    transition: width .3s;
  }
  .ext-bar-wrap .ext-size { margin-left:4px; color: var(--text-dim); flex-shrink:0; }

  /* Tooltip */
  #tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(30,31,43,.95);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.6;
    opacity: 0;
    transition: opacity .15s;
    z-index: 100;
    max-width: 280px;
  }
  #tooltip.visible { opacity: 1; }
  #tooltip .tt-path { color: var(--text-dim); font-size: 11px; word-break: break-all; }
  #tooltip .tt-size { color: var(--info); font-weight: 600; }

  /* Graph labels */
  .node-label { font-size:9px; fill: var(--text); pointer-events:none; }
  .link { stroke: #3d59a1; stroke-opacity: .4; }
  .link-require { stroke: #f59e0b; stroke-opacity: .5; stroke-dasharray: 4 2; }
  .link-dynamic { stroke: #a78bfa; stroke-opacity: .5; stroke-dasharray: 2 2; }

  /* Breadcrumb nav */
  #breadcrumb {
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    z-index: 10;
  }
  #breadcrumb button {
    padding: 2px 8px;
    font-size: 11px;
    background: rgba(30,31,43,.9);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 3px;
    cursor: pointer;
  }
  #breadcrumb button:hover { background: var(--accent); }

  /* Responsive */
  @media (max-width: 768px) {
    #sidebar { width: 240px; }
  }

  /* Scrollbar */
  #sidebar::-webkit-scrollbar { width: 4px; }
  #sidebar::-webkit-scrollbar-track { background: transparent; }
  #sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* Color legend */
  #legend {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(30,31,43,.92);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 10px;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  #legend .legend-item { display:flex; align-items:center; gap:5px; }
  #legend .legend-swatch { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
  #legend .legend-label { color: var(--text-dim); white-space:nowrap; }

  /* Histogram bars in sidebar */
  .histo-bar-wrap { display:flex; align-items:center; gap:6px; margin:2px 0; font-size:11px; }
  .histo-bar-wrap .histo-label { width:80px; text-align:right; flex-shrink:0; color: var(--text-dim); }
  .histo-bar-wrap .histo-bar {
    height: 14px;
    background: linear-gradient(90deg, var(--accent), var(--info));
    border-radius: 2px;
    min-width: 2px;
    transition: width .3s;
  }
  .histo-bar-wrap .histo-count { margin-left:4px; color: var(--text-dim); flex-shrink:0; }

  /* Diff indicators */
  .diff-up { color: var(--danger); }
  .diff-down { color: var(--ok); }
  .diff-neutral { color: var(--text-dim); }

  /* Search input */
  #file-search {
    width: 100%;
    padding: 4px 8px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 3px;
    font-size: 11px;
    margin-bottom: 8px;
  }
  #file-search::placeholder { color: var(--text-dim); }

  /* Trend summary card */
  .trend-card {
    background: var(--panel-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 8px;
  }
  .trend-card .trend-title { font-size:12px; font-weight:600; color: var(--info); margin-bottom:4px; }
  .trend-card .trend-row { font-size:11px; color: var(--text-dim); }
</style>
</head>
<body>

<div id="header">
  <h1>📦 Bundle Analysis — ${escapeHtml(meta.projectName)}</h1>
  <span class="meta">${escapeHtml(meta.generatedAt)} · ${stats.totalFiles} files · ${formatBytes(stats.totalSize)}</span>
</div>

<div id="toolbar">
  <button id="btn-treemap" class="active" onclick="switchView('treemap')">📏 Treemap</button>
  <button id="btn-graph" onclick="switchView('graph')">🔗 Dependency Graph</button>
  <button onclick="resetZoom()">🔍 Reset Zoom</button>
  <span class="spacer"></span>
  <span class="stat-badge">Nodes: ${depGraph.nodes.length}</span>
  <span class="stat-badge">Edges: ${depGraph.edges.length}</span>
  ${stats.circularDeps.length > 0 ? `<span class="stat-badge" style="color:var(--warn)">⚠ Cycles: ${stats.circularDeps.length}</span>` : ""}
  ${stats.oversizedFiles.length > 0 ? `<span class="stat-badge" style="color:var(--danger)">⚠ Oversized: ${stats.oversizedFiles.length}</span>` : ""}
</div>

<div id="main">
  <div id="vis"></div>
  <div id="sidebar">
    <input id="file-search" type="text" placeholder="🔍 Filter files..." oninput="filterSidebar(this.value)">
    <div id="sidebar-content">
      ${renderSidebar(stats, diff)}
    </div>
  </div>
</div>

<div id="tooltip"></div>
  <div id="legend"></div>
  <div id="breadcrumb"></div>

<script>
// ── Data ─────────────────────────────────────────────────────────────
const TREEMAP_DATA = ${treemapJson};
const DEP_NODES = ${depNodesJson};
const DEP_EDGES = ${depEdgesJson};
const STATS = ${statsJson};
const DIFF = ${diffJson};
const PKG_METRICS = ${JSON.stringify(stats.packageMetrics || { packages: [], fileCoupling: [], edgeCount: 0, packageCount: 0 })};

// ── D3 setup ─────────────────────────────────────────────────────────
const vis = d3.select("#vis");
const width = () => vis.node().clientWidth;
const height = () => vis.node().clientHeight;
let currentView = "treemap";

// Color scale for extensions
const extColors = d3.scaleOrdinal(d3.schemeTableau10);
const extColorMap = {};
function getExtColor(ext) {
  if (!extColorMap[ext]) extColorMap[ext] = extColors(ext);
  return extColorMap[ext];
}

// ── Treemap ──────────────────────────────────────────────────────────
function renderTreemap() {
  vis.selectAll("*").remove();

  const svg = vis.append("svg")
    .attr("width", width())
    .attr("height", height());

  const g = svg.append("g");

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", (event) => g.attr("transform", event.transform));

  svg.call(zoom);

  // Hierarchy
  const root = d3.hierarchy(TREEMAP_DATA)
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);

  // Treemap layout
  d3.treemap()
    .size([width(), height()])
    .padding(1)
    .round(true)(root);

  // Color scale
  const color = d3.scaleOrdinal()
    .domain([...new Set(root.leaves().map(d => d.data.ext || "dir"))])
    .range(d3.schemeTableau10);

  // Draw
  const cell = g.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => \`translate(\${d.x0},\${d.y0})\`);

  // Click to show breadcrumb (zoom to parent concept)
  cell.on("click", (event, d) => {
    // Navigate to parent via zoom
    const parent = d.parent;
    if (parent && parent !== root) {
      const leaves = parent.leaves();
      const x0 = d3.min(leaves, l => l.x0);
      const y0 = d3.min(leaves, l => l.y0);
      const x1 = d3.max(leaves, l => l.x1);
      const y1 = d3.max(leaves, l => l.y1);
      const dx = x1 - x0;
      const dy = y1 - y0;

      svg.transition().duration(500).call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width() / 2, height() / 2)
          .scale(Math.min(8, 0.9 / Math.max(dx / width(), dy / height())))
          .translate(-(x0 + dx / 2), -(y0 + dy / 2))
      );
    }
  });

  cell.append("rect")
    .attr("width", d => Math.max(0, d.x1 - d.x0))
    .attr("height", d => Math.max(0, d.y1 - d.y0))
    .attr("fill", d => getExtColor(d.data.ext || "dir"))
    .attr("fill-opacity", 0.85)
    .attr("stroke", "#1e1f2b")
    .attr("stroke-width", 0.5)
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip);

  // Labels (only on larger cells)
  cell.append("text")
    .attr("x", 3)
    .attr("y", 12)
    .attr("font-size", 10)
    .attr("fill", "#fff")
    .attr("font-family", "system-ui, sans-serif")
    .text(d => {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      if (w < 30 || h < 14) return "";
      const name = d.data.name || "";
      return w > name.length * 6 ? name : name.slice(0, Math.floor(w / 6) - 1) + "…";
    });

  // Breadcrumb (root = all files)
  updateBreadcrumb([TREEMAP_DATA]);

  // Color legend
  renderLegend();

  // Store zoom for reset
  vis.node()._zoom = zoom;
  vis.node()._svg = svg;
  vis.node()._g = g;
}

// ── Color Legend ─────────────────────────────────────────────────────
function renderLegend() {
  // Build extension → total size map for legend
  const extSizes = {};
  const leaves = d3.hierarchy(TREEMAP_DATA).leaves();
  for (const d of leaves) {
    const ext = d.data.ext || "dir";
    extSizes[ext] = (extSizes[ext] || 0) + (d.data.value || 0);
  }
  const entries = Object.entries(extSizes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const legend = d3.select("#legend");
  legend.html("");
  legend.style("display", currentView === "treemap" ? "flex" : "none");

  for (const [ext, size] of entries) {
    const item = legend.append("div").attr("class", "legend-item");
    item.append("div")
      .attr("class", "legend-swatch")
      .style("background", getExtColor(ext === "(no ext)" ? "dir" : ext));
    item.append("span")
      .attr("class", "legend-label")
      .text(ext + " (" + formatB(size) + ")");
  }
}

// ── Dependency Graph ─────────────────────────────────────────────────
function renderGraph() {
  vis.selectAll("*").remove();

  const svg = vis.append("svg")
    .attr("width", width())
    .attr("height", height());

  const g = svg.append("g");

  const zoom = d3.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", (event) => g.attr("transform", event.transform));

  svg.call(zoom);

  // Size scale for nodes
  const sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(DEP_NODES, d => d.size) || 1])
    .range([3, 40]);

  // Color by extension
  const nodeColor = d => getExtColor(d.ext || "dir");

  // Build adjacency for links
  const nodeMap = new Map(DEP_NODES.map(n => [n.path, n]));

  const links = DEP_EDGES
    .filter(e => nodeMap.has(e.from) && nodeMap.has(e.to))
    .map(e => ({
      source: e.from,
      target: e.to,
      type: e.type || "import",
    }));

  // Simulation
  const simulation = d3.forceSimulation(DEP_NODES)
    .force("link", d3.forceLink(links).id(d => d.path).distance(80))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width() / 2, height() / 2))
    .force("collision", d3.forceCollide().radius(d => sizeScale(d.size) + 4));

  // Draw links
  const link = g.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("class", d => d.type === "require" ? "link link-require" : d.type === "dynamic" ? "link link-dynamic" : "link")
    .attr("stroke-width", d => d.type === "dynamic" ? 0.8 : 1);

  // Draw nodes
  const node = g.append("g")
    .selectAll("g")
    .data(DEP_NODES)
    .join("g")
    .call(d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
    );

  node.append("circle")
    .attr("r", d => sizeScale(d.size))
    .attr("fill", nodeColor)
    .attr("fill-opacity", 0.8)
    .attr("stroke", "#1e1f2b")
    .attr("stroke-width", 1)
    .on("mouseover", showGraphTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip);

  // Labels on larger nodes
  node.append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", d => sizeScale(d.size) + 12)
    .text(d => {
      const r = sizeScale(d.size);
      if (r < 12) return "";
      const parts = d.path.split("/");
      return parts[parts.length - 1];
    });

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("transform", d => \`translate(\${d.x},\${d.y})\`);
  });

  // Store for reset
  vis.node()._zoom = zoom;
  vis.node()._svg = svg;
  vis.node()._g = g;
}

// ── Tooltips ─────────────────────────────────────────────────────────
const tooltip = d3.select("#tooltip");

function showTooltip(event, d) {
  const p = d.data.path || d.data.name;
  tooltip
    .classed("visible", true)
    .html(\`
      <div class="tt-path">\${escapeH(p)}</div>
      <div class="tt-size">\${formatB(d.value || d.data.value)}</div>
      \${d.data.ext ? \`<div style="color:#6b7089">ext: \${escapeH(d.data.ext)}</div>\` : ""}
    \`);
}

function showGraphTooltip(event, d) {
  tooltip
    .classed("visible", true)
    .html(\`
      <div class="tt-path">\${escapeH(d.path)}</div>
      <div class="tt-size">\${formatB(d.size)}</div>
    \`);
}

function moveTooltip(event) {
  tooltip
    .style("left", (event.pageX + 12) + "px")
    .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
  tooltip.classed("visible", false);
}

function escapeH(s) {
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function formatB(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + " " + units[i];
}

// ── Breadcrumb ───────────────────────────────────────────────────────
function updateBreadcrumb(ancestors) {
  // For treemap: show directory hierarchy
  let html = '<button onclick="resetZoom()">📦 root</button>';
  for (let i = 0; i < Math.min(ancestors.length, 6); i++) {
    html += \`<button>\${escapeH(ancestors[i].name || "root")}</button>\`;
  }
  d3.select("#breadcrumb").html(html);
}

// ── Controls ─────────────────────────────────────────────────────────
function switchView(view) {
  currentView = view;
  d3.select("#btn-treemap").classed("active", view === "treemap");
  d3.select("#btn-graph").classed("active", view === "graph");

  if (view === "treemap") renderTreemap();
  else {
    d3.select("#legend").style("display", "none");
    d3.select("#breadcrumb").html("");
    renderGraph();
  }
}

function resetZoom() {
  const svg = vis.node()._svg;
  const zoom = vis.node()._zoom;
  if (svg && zoom) {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  }
}

// ── Sidebar search filter ────────────────────────────────────────────
function filterSidebar(query) {
  const content = d3.select("#sidebar-content");
  const rows = content.selectAll(".stat-row");
  const headings = content.selectAll("h3");
  const bars = content.selectAll(".ext-bar-wrap, .histo-bar-wrap");
  const cards = content.selectAll(".trend-card");

  const q = (query || "").toLowerCase().trim();

  if (!q) {
    // Show all
    rows.style("display", "flex");
    headings.style("display", "block");
    bars.style("display", "flex");
    cards.style("display", "block");
    return;
  }

  // Filter rows
  rows.style("display", function() {
    const text = (this.textContent || "").toLowerCase();
    return text.includes(q) ? "flex" : "none";
  });

  // Filter bars
  bars.style("display", function() {
    const text = (this.textContent || "").toLowerCase();
    return text.includes(q) ? "flex" : "none";
  });

  // Show all headings and cards (they provide context)
  headings.style("display", "block");
  cards.style("display", "block");
}

// ── Init ─────────────────────────────────────────────────────────────
renderTreemap();

// Handle resize
window.addEventListener("resize", () => {
  if (currentView === "treemap") renderTreemap();
  else renderGraph();
});
</script>
</body>
</html>`;
}

function renderSidebar(stats, diff) {
  const { largestFiles, sizeByExt, sizeByDir, mostDependedOn, mostDependencies, circularDeps, oversizedFiles, orphanFiles, barrelFiles, sizeHistogram, maxDependencyDepth, depthDist, duplicates, packageMetrics, transitiveDeps, gitChurn, layerAnalysis, coChange, riskScores, recommendations, scc, betweenness, moduleBoundaries } = stats;

  const extEntries = Object.entries(sizeByExt).sort((a, b) => b[1] - a[1]);
  const maxExtSize = extEntries.length > 0 ? extEntries[0][1] : 1;
  const dirEntries = Object.entries(sizeByDir).sort((a, b) => b[1] - a[1]);

  let html = "";

  // ── Trend diff card (if diff data available) ──
  if (diff && diff.hasBaseline) {
    const deltaCls = diff.sizeDeltaPercent > 0 ? "diff-up" : diff.sizeDeltaPercent < 0 ? "diff-down" : "diff-neutral";
    const arrow = diff.sizeDeltaPercent > 0 ? "↑" : diff.sizeDeltaPercent < 0 ? "↓" : "→";
    html += `<h3>📈 Trend vs Baseline</h3>`;
    html += `<div class="trend-card">`;
    html += `<div class="trend-title">${escapeHtml(diff.baselineDate)}</div>`;
    html += `<div class="trend-row">Total size: <span class="${deltaCls}">${arrow} ${Math.abs(diff.sizeDeltaPercent).toFixed(1)}% (${formatBytes(Math.abs(diff.sizeDelta))})</span></div>`;
    html += `<div class="trend-row">+${diff.newFiles.length} new · −${diff.deletedFiles.length} deleted · ${diff.changedFiles.length} changed</div>`;
    if (diff.changedFiles.length > 0) {
      html += `<div class="trend-row" style="margin-top:4px; color:var(--text-dim)">Top changes:</div>`;
      for (const f of diff.changedFiles.slice(0, 5)) {
        const fCls = f.deltaPercent > 0 ? "diff-up" : "diff-down";
        const fArrow = f.deltaPercent > 0 ? "↑" : "↓";
        html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").pop())}</span><span class="value ${fCls}">${fArrow} ${formatBytes(Math.abs(f.delta))}</span></div>`;
      }
    }
    html += `</div>`;
  }

  // ── Largest files ──
  html += `<h3>📏 Top Largest Files</h3>`;
  for (const f of largestFiles.slice(0, 15)) {
    const cls = f.size > 500_000 ? "danger" : f.size > 100_000 ? "warn" : "";
    html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value ${cls}">${formatBytes(f.size)}</span></div>`;
  }

  // ── Oversized files warning ──
  if (oversizedFiles.length > 0) {
    html += `<h3>⚠️ Oversized Files (&gt;500KB)</h3>`;
    for (const f of oversizedFiles) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value danger">${formatBytes(f.size)}</span></div>`;
    }
  }

  // ── Size histogram ──
  if (sizeHistogram && Object.keys(sizeHistogram).length > 0) {
    html += `<h3>📊 Size Distribution</h3>`;
    const maxCount = Math.max(1, ...Object.values(sizeHistogram));
    for (const [bucket, count] of Object.entries(sizeHistogram)) {
      const pct = ((count / maxCount) * 100).toFixed(1);
      html += `<div class="histo-bar-wrap"><span class="histo-label">${escapeHtml(bucket)}</span><div class="histo-bar" style="width:${Math.max(pct, 1)}%"></div><span class="histo-count">${count} files</span></div>`;
    }
  }

  // ── By extension ──
  html += `<h3>📦 By Extension</h3>`;
  for (const [ext, size] of extEntries.slice(0, 12)) {
    const pct = ((size / maxExtSize) * 100).toFixed(1);
    html += `<div class="ext-bar-wrap"><span class="ext-label">${escapeHtml(ext)}</span><div class="ext-bar" style="width:${Math.max(pct, 1)}%"></div><span class="ext-size">${formatBytes(size)}</span></div>`;
  }

  // ── By directory ──
  html += `<h3>📁 By Directory</h3>`;
  for (const [dir, size] of dirEntries.slice(0, 10)) {
    html += `<div class="stat-row"><span class="label">${escapeHtml(dir)}/</span><span class="value">${formatBytes(size)}</span></div>`;
  }

  // ── Directory depth distribution ──
  if (depthDist && Object.keys(depthDist).length > 0) {
    html += `<h3>📐 Directory Depth</h3>`;
    for (const [depth, count] of Object.entries(depthDist)) {
      html += `<div class="stat-row"><span class="label">Depth ${escapeHtml(depth)}</span><span class="value">${count} files</span></div>`;
    }
  }

  // ── Most depended-on (fan-in) ──
  if (mostDependedOn.length > 0) {
    html += `<h3>🔥 Most Depended On (fan-in)</h3>`;
    for (const d of mostDependedOn) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(d.path)}">${escapeHtml(d.path.split("/").pop())}</span><span class="value">${d.count} refs</span></div>`;
    }
  }

  // ── Most dependencies (fan-out) ──
  if (mostDependencies.length > 0) {
    html += `<h3>📤 Most Dependencies (fan-out)</h3>`;
    for (const d of mostDependencies) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(d.path)}">${escapeHtml(d.path.split("/").pop())}</span><span class="value">${d.count} deps</span></div>`;
    }
  }

  // ── Max dependency depth ──
  if (maxDependencyDepth > 0) {
    html += `<h3>📏 Max Dependency Depth</h3>`;
    html += `<div class="stat-row"><span class="label">Longest chain</span><span class="value">${maxDependencyDepth} hops</span></div>`;
  }

  // ── Circular dependencies ──
  if (circularDeps.length > 0) {
    html += `<h3>🔄 Circular Dependencies</h3>`;
    for (const cycle of circularDeps.slice(0, 5)) {
      html += `<div class="stat-row"><span class="label" style="color:var(--warn)">${escapeHtml(cycle.join(" → "))}</span></div>`;
    }
  }

  // ── Orphan files ──
  if (orphanFiles && orphanFiles.length > 0) {
    html += `<h3>👻 Orphan Files (not imported)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Files that aren't imported by any other file (may be dead code)</span></div>`;
    for (const f of orphanFiles.slice(0, 10)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value" style="color:var(--text-dim)">${formatBytes(f.size)}</span></div>`;
    }
  }

  // ── Barrel files ──
  if (barrelFiles && barrelFiles.length > 0) {
    html += `<h3>📦 Barrel Files (re-export hubs)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Files that primarily re-export from other modules</span></div>`;
    for (const f of barrelFiles.slice(0, 10)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").pop())}</span><span class="value">${f.reExportCount}/${f.totalImportCount} re-exports</span></div>`;
    }
  }

  // ── Duplicate files ──
  if (duplicates && duplicates.length > 0) {
    const totalWasted = duplicates.reduce((s, d) => s + (d.wastedBytes || 0), 0);
    html += `<h3>🟰 Duplicate Files</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--warn);font-size:10px">${duplicates.length} groups · ${formatBytes(totalWasted)} wasted</span></div>`;
    for (const g of duplicates.slice(0, 8)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(g.files.join(', '))}">${escapeHtml(g.files[0].split('/').pop())} ×${g.count}</span><span class="value" style="color:var(--warn)">${formatBytes(g.wastedBytes)} wasted</span></div>`;
    }
  }

  // ── Package metrics (I/A/D) ──
  if (packageMetrics && packageMetrics.packages && packageMetrics.packages.length > 0) {
    html += `<h3>📐 Package Metrics (I/A/D)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Robert Martin instability/abstractness — ${packageMetrics.packageCount} packages</span></div>`;
    const painPkgs = packageMetrics.packages.filter((p) => p.zone === "zone-of-pain");
    const uselessPkgs = packageMetrics.packages.filter((p) => p.zone === "zone-of-uselessness");
    const showPkgs = [...painPkgs, ...uselessPkgs, ...packageMetrics.packages.filter((p) => p.zone === "main-sequence")].slice(0, 10);
    for (const p of showPkgs) {
      const zoneCls = p.zone === "zone-of-pain" ? "danger" : p.zone === "zone-of-uselessness" ? "warn" : "";
      const zoneLabel = p.zone === "zone-of-pain" ? "⚡Pain" : p.zone === "zone-of-uselessness" ? "💨Useless" : "";
      html += `<div class="stat-row"><span class="label" title="I=${p.I} A=${p.A} D=${p.D} Cohesion=${p.cohesion}">${escapeHtml(p.package)}</span><span class="value ${zoneCls}">D=${p.D} ${zoneLabel}</span></div>`;
    }
  }

  // ── Transitive dependency analysis ──
  if (transitiveDeps && transitiveDeps.topTransitiveFanOut && transitiveDeps.topTransitiveFanOut.length > 0) {
    html += `<h3>🔗 Transitive Dependencies</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Avg ${transitiveDeps.avgReachable} reachable · Max ${transitiveDeps.maxReachable} · ${transitiveDeps.disconnectedSubgraphs} subgraphs</span></div>`;
    // Top transitive fan-out (largest blast radius)
    if (transitiveDeps.topTransitiveFanOut.length > 0) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:2px 0;padding-left:8px">Largest blast radius:</div>`;
      for (const f of transitiveDeps.topTransitiveFanOut.slice(0, 5)) {
        html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").pop())}</span><span class="value">${f.transitiveCount} reachable (${f.directCount} direct)</span></div>`;
      }
    }
    // Bridge modules
    if (transitiveDeps.bridgeModules && transitiveDeps.bridgeModules.length > 0) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:2px 0;padding-left:8px">Bridge connectors:</div>`;
      for (const b of transitiveDeps.bridgeModules.slice(0, 5)) {
        html += `<div class="stat-row"><span class="label" title="${escapeHtml(b.path)}">${escapeHtml(b.path.split("/").pop())}</span><span class="value" style="color:var(--info)">↔${b.bridgeScore}</span></div>`;
      }
    }
  }

  // ── Git churn hotspots ──
  if (gitChurn && gitChurn.available && gitChurn.topHotFiles && gitChurn.topHotFiles.length > 0) {
    html += `<h3>📜 Change Hotspots (${escapeHtml(gitChurn.timeWindow)})</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${gitChurn.filesChanged} files changed · ${gitChurn.totalChanges} commits · ${gitChurn.churnRate}% churn rate</span></div>`;
    for (const f of gitChurn.topHotFiles.slice(0, 8)) {
      const cls = f.heatIndex > 100 ? "danger" : f.heatIndex > 50 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value ${cls}">🔥${f.heatIndex} (${f.churnCount}×)</span></div>`;
    }
    // Churn distribution
    if (gitChurn.churnBuckets) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:4px 0;padding-left:8px">Churn distribution: `;
      const parts = [];
      for (const [bucket, count] of Object.entries(gitChurn.churnBuckets)) {
        if (count > 0) parts.push(`${bucket}: ${count}`);
      }
      html += escapeHtml(parts.join(" · "));
      html += `</div>`;
    }
  }

  // ── Architecture layer analysis ──
  if (layerAnalysis && layerAnalysis.layers && layerAnalysis.layers.length > 0) {
    html += `<h3>🏗️ Architecture Layers</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${layerAnalysis.layerCount} layers (max depth ${layerAnalysis.maxLayer}) · ${layerAnalysis.violationCount} violations</span></div>`;
    for (const l of layerAnalysis.layers) {
      const label = l.layer === 0 ? "Entry" : l.layer === layerAnalysis.maxLayer ? "Foundation" : `Layer ${l.layer}`;
      html += `<div class="stat-row"><span class="label">L${l.layer} ${escapeHtml(label)}</span><span class="value">${l.nodeCount} files · fan-out ${l.avgFanOut}</span></div>`;
    }
    if (layerAnalysis.violations.length > 0) {
      html += `<div style="color:var(--warn);font-size:10px;margin:4px 0;padding-left:8px">⚠ Top violations (upward deps):</div>`;
      for (const v of layerAnalysis.violations.slice(0, 5)) {
        html += `<div class="stat-row"><span class="label" style="color:var(--warn);font-size:10px" title="${escapeHtml(v.from)} → ${escapeHtml(v.to)}">L${v.fromLayer}→L${v.toLayer}: ${escapeHtml(v.from.split('/').pop())} → ${escapeHtml(v.to.split('/').pop())}</span></div>`;
      }
    }
  }

  // ── Co-change analysis ──
  if (coChange && coChange.available && coChange.pairs && coChange.pairs.length > 0) {
    html += `<h3>🔀 Co-Change Pairs</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Files that change together in ${coChange.timeWindow} · ${coChange.commitCount} commits · ${coChange.pairs.length} strong pairs</span></div>`;
    for (const p of coChange.pairs.slice(0, 8)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(p.files.join(' + '))}">${escapeHtml(p.files.map(f=>f.split('/').pop()).join(' + '))}</span><span class="value">${p.coChangeCount}× (J=${p.jaccard})</span></div>`;
    }
    if (coChange.clusters && coChange.clusters.length > 0) {
      html += `<div style="color:var(--info);font-size:10px;margin:4px 0;padding-left:8px">📎 ${coChange.clusters.length} co-change clusters</div>`;
      for (const c of coChange.clusters.slice(0, 3)) {
        html += `<div class="stat-row"><span class="label" style="font-size:10px" title="${escapeHtml(c.files.join(', '))}">Cluster (${c.size} files): ${escapeHtml(c.files.slice(0,3).map(f=>f.split('/').pop()).join(', '))}</span></div>`;
      }
    }
  }

  // ── Risk scores ──
  if (riskScores && riskScores.topRisks && riskScores.topRisks.length > 0) {
    html += `<h3>🎯 Risk Scores</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Composite risk (size+churn+coupling+orphan+circular) · Avg ${riskScores.avgRisk}/100</span></div>`;
    // Risk distribution
    if (riskScores.riskBuckets) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:2px 0;padding-left:8px">`;
      const rbParts = [];
      for (const [bucket, count] of Object.entries(riskScores.riskBuckets)) {
        if (count > 0) rbParts.push(`${bucket}: ${count}`);
      }
      html += escapeHtml(rbParts.join(" · "));
      html += `</div>`;
    }
    // Top highest risk files
    for (const r of riskScores.topRisks.slice(0, 10)) {
      const riskPct = Math.round(r.composite * 100);
      const cls = riskPct >= 60 ? "danger" : riskPct >= 40 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(r.path)} score=${riskPct} (size=${r.sizeRisk} churn=${r.churnRisk} orphan=${r.orphanRisk} circ=${r.circularRisk})">${escapeHtml(r.path.split("/").slice(-2).join("/"))}</span><span class="value ${cls}">${riskPct}</span></div>`;
    }
  }

  // ── Recommendations ──
  if (recommendations && recommendations.length > 0) {
    const p0Count = recommendations.filter(r=>r.severity==='P0').length;
    const p1Count = recommendations.filter(r=>r.severity==='P1').length;
    html += `<h3>💡 Recommendations</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${recommendations.length} suggestions (${p0Count} P0 · ${p1Count} P1 · ${recommendations.length-p0Count-p1Count} P2)</span></div>`;
    for (const rec of recommendations.slice(0, 8)) {
      const sevCls = rec.severity === "P0" ? "danger" : rec.severity === "P1" ? "warn" : "";
      const sevIcon = rec.severity === "P0" ? "🔴" : rec.severity === "P1" ? "🟡" : "🟢";
      html += `<div class="stat-row"><span class="label ${sevCls}" title="${escapeHtml(rec.description)}">${sevIcon} ${escapeHtml(rec.title)}</span></div>`;
    }
  }

  // ── SCC (Tarjan) ──
  if (scc && scc.multiNodeComponents && scc.multiNodeComponents.length > 0) {
    html += `<h3>🔴 Strongly Connected Components (Tarjan)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${scc.multiNodeSccCount} multi-node SCCs · ${scc.sccCount} total SCCs · largest=${scc.largestSCCSize} files</span></div>`;
    for (const component of scc.multiNodeComponents.slice(0, 5)) {
      const names = component.slice(0, 4).map((c) => c.split("/").pop()).join(", ");
      const more = component.length > 4 ? ` +${component.length - 4}` : "";
      html += `<div class="stat-row"><span class="label" style="color:var(--warn)" title="${escapeHtml(component.join(' → '))}">${escapeHtml(names)}${more}</span><span class="value" style="color:var(--warn)">${component.length} files</span></div>`;
    }
    // SCC size distribution
    if (scc.sizeDist) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:2px 0;padding-left:8px">Distribution: `;
      const distParts = [];
      for (const [bucket, count] of Object.entries(scc.sizeDist)) {
        if (count > 0) distParts.push(`${bucket}: ${count}`);
      }
      html += escapeHtml(distParts.join(" · "));
      html += `</div>`;
    }
  }

  // ── Betweenness centrality ──
  if (betweenness && betweenness.topBottlenecks && betweenness.topBottlenecks.length > 0) {
    html += `<h3>🍾 Bottlenecks (Betweenness)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Architectural bottlenecks · avg=${betweenness.avgBetweenness.toFixed(4)} · max=${betweenness.maxBetweenness.toFixed(4)}</span></div>`;
    for (const b of betweenness.topBottlenecks.slice(0, 8)) {
      const cls = b.betweenness > betweenness.avgBetweenness * 5 ? "danger" : b.betweenness > betweenness.avgBetweenness * 2 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(b.path)}">${escapeHtml(b.path.split("/").pop())}</span><span class="value ${cls}">${b.betweenness.toFixed(4)}</span></div>`;
    }
  }

  // ── Module boundary suggestions ──
  if (moduleBoundaries && moduleBoundaries.length > 0) {
    html += `<h3>🧩 Module Boundaries</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${moduleBoundaries.length} structural suggestions</span></div>`;
    for (const s of moduleBoundaries.slice(0, 8)) {
      const typeIcon = s.type === "co-locate" ? "📁" : s.type === "split-package" ? "✂️" : s.type === "extract-interface" ? "🔌" : "🔗";
      const priCls = s.priority === "P0" ? "danger" : s.priority === "P1" ? "warn" : "";
      html += `<div class="stat-row"><span class="label ${priCls}" title="${escapeHtml(s.reason)}">${typeIcon} [${s.priority}] ${escapeHtml(s.type)}</span><span class="value" style="font-size:10px">${escapeHtml((s.files||[]).slice(0,2).map(f=>f.split('/').pop()).join(', '))}</span></div>`;
    }
  }

  return html;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const rawArgs = process.argv.slice(2);
  const args = parseArgs(rawArgs);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // Resolve project root and target directory
  const projectRoot = findProjectRoot(process.cwd());
  const targetDir = args.dir ? resolve(args.dir) : projectRoot;

  if (!existsSync(targetDir)) {
    console.error(`Error: directory not found: ${targetDir}`);
    process.exit(1);
  }

  // Read project name
  let projectName;
  try {
    const claudePath = join(projectRoot, "CLAUDE.md");
    if (existsSync(claudePath)) {
      const content = readFileSync(claudePath, "utf-8");
      const match = content.match(/\|\s*项目名\s*\|\s*(\S+)\s*\|/);
      projectName = match ? match[1] : basename(projectRoot);
    } else {
      projectName = basename(projectRoot);
    }
  } catch {
    projectName = basename(projectRoot);
  }

  // Walk files
  const files = walkDir(targetDir, { scopeGlob: args.scope });
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Build dependency graph (only for parsable files, skip if --scope used)
  const depGraph = args.scope ? { nodes: [], edges: [] } : buildDepGraph(files, projectRoot);

  // Compute statistics (with projectRoot for barrel detection)
  const stats = computeStats(files, depGraph, { projectRoot });

  // ── Baseline & Diff ──
  let baseline = null;
  let diff = null;

  if (args.diff) {
    baseline = loadBaseline(projectRoot);
    if (baseline) {
      diff = computeDiff(files, depGraph.edges, baseline);
    }
  }

  if (args.saveBaseline) {
    const baselineData = {
      meta: {
        projectName,
        generatedAt,
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        analysisVersion: ANALYSIS_VERSION,
      },
      files: files.map((f) => ({ path: f.relPath, size: f.size, ext: f.ext })),
      dependencies: depGraph.edges,
    };
    const baselinePath = saveBaseline(projectRoot, baselineData);
  }

  // JSON output mode
  if (args.json) {
    const jsonOutput = {
      meta: {
        root: relative(process.cwd(), targetDir) || ".",
        projectName,
        generatedAt,
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        totalSizeFormatted: formatBytes(stats.totalSize),
        analysisVersion: ANALYSIS_VERSION,
      },
      files: files.map((f) => ({ path: f.relPath, size: f.size, ext: f.ext })),
      directories: Object.entries(stats.sizeByDir)
        .sort((a, b) => b[1] - a[1])
        .map(([dir, size]) => ({ path: dir, size, fileCount: 0 })),
      dependencies: depGraph.edges,
      stats: {
        largestFiles: stats.largestFiles,
        mostDependedOn: stats.mostDependedOn,
        mostDependencies: stats.mostDependencies,
        sizeByExt: stats.sizeByExt,
        sizeByDir: stats.sizeByDir,
        circularDeps: stats.circularDeps,
        oversizedFiles: stats.oversizedFiles,
        orphanFiles: stats.orphanFiles,
        barrelFiles: stats.barrelFiles,
        sizeHistogram: stats.sizeHistogram,
        maxDependencyDepth: stats.maxDependencyDepth,
        depthDist: stats.depthDist,
        duplicates: stats.duplicates,
        packageMetrics: stats.packageMetrics,
        transitiveDeps: stats.transitiveDeps,
        gitChurn: stats.gitChurn,
        layerAnalysis: stats.layerAnalysis,
        coChange: stats.coChange,
        riskScores: stats.riskScores,
        recommendations: stats.recommendations,
        scc: {
          multiNodeComponents: stats.scc?.multiNodeComponents || [],
          largestSCCSize: stats.scc?.largestSCCSize || 0,
          sccCount: stats.scc?.sccCount || 0,
          multiNodeSccCount: stats.scc?.multiNodeSccCount || 0,
          sizeDist: stats.scc?.sizeDist || {},
        },
        betweenness: stats.betweenness,
        moduleBoundaries: stats.moduleBoundaries,
        trendAnalysis: stats.trendAnalysis || null,
      },
      diff: diff || { hasBaseline: false },
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    process.exit(0);
  }

  // Build treemap data
  const treemapData = buildTreemapData(files);

  // Generate HTML
  const html = generateHtml(
    {
      treemapData,
      depGraph,
      stats,
    },
    {
      projectName,
      generatedAt,
      targetDir,
    },
    diff
  );

  // Write report
  const reportDir = join(projectRoot, REPORT_DIR);
  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  const ts = generatedAt.replace(/:/g, "").replace(" ", "-");
  const reportPath = join(reportDir, `${REPORT_PREFIX}-${ts}.html`);
  writeFileSync(reportPath, html, "utf-8");

  console.log(`✅ Report generated: ${relative(process.cwd(), reportPath)}`);
  console.log(`   Files: ${stats.totalFiles} · Total size: ${formatBytes(stats.totalSize)}`);
  console.log(`   Dep graph: ${depGraph.nodes.length} nodes · ${depGraph.edges.length} edges`);
  if (stats.maxDependencyDepth > 0) {
    console.log(`   Max dep depth: ${stats.maxDependencyDepth} hops`);
  }

  if (stats.oversizedFiles.length > 0) {
    console.log(`   ⚠️  Oversized files (>500KB): ${stats.oversizedFiles.length}`);
  }
  if (stats.circularDeps.length > 0) {
    console.log(`   ⚠️  Circular dependencies: ${stats.circularDeps.length}`);
  }
  if (stats.orphanFiles && stats.orphanFiles.length > 0) {
    console.log(`   👻 Orphan files (not imported): ${stats.orphanFiles.length}`);
  }
  if (stats.barrelFiles && stats.barrelFiles.length > 0) {
    console.log(`   📦 Barrel files (re-export hubs): ${stats.barrelFiles.length}`);
  }
  if (stats.duplicates && stats.duplicates.length > 0) {
    const totalWasted = stats.duplicates.reduce((s, d) => s + d.wastedBytes, 0);
    console.log(`   🟰 Duplicate files: ${stats.duplicates.length} groups · ${formatBytes(totalWasted)} wasted`);
  }
  if (stats.packageMetrics && stats.packageMetrics.packages.length > 0) {
    const painCount = stats.packageMetrics.packages.filter((p) => p.zone === "zone-of-pain").length;
    const uselessCount = stats.packageMetrics.packages.filter((p) => p.zone === "zone-of-uselessness").length;
    if (painCount + uselessCount > 0) {
      console.log(`   📐 Package metrics (I/A/D): ${painCount} in zone-of-pain · ${uselessCount} in zone-of-uselessness`);
    }
  }
  if (stats.transitiveDeps) {
    const td = stats.transitiveDeps;
    console.log(`   🔗 Transitive deps: avg ${td.avgReachable} reachable · max ${td.maxReachable} · ${td.disconnectedSubgraphs} subgraphs`);
    if (td.bridgeModules.length > 0) {
      console.log(`   🌉 Bridge modules: ${td.bridgeModules.length} connectors`);
    }
  }
  if (stats.gitChurn && stats.gitChurn.available) {
    const gc = stats.gitChurn;
    console.log(`   📜 Git churn (${gc.timeWindow}): ${gc.filesChanged}/${stats.totalFiles} files changed · ${gc.totalChanges} total changes · rate ${gc.churnRate}%`);
  }
  if (stats.layerAnalysis && stats.layerAnalysis.layerCount > 0) {
    const la = stats.layerAnalysis;
    console.log(`   🏗️  Architecture layers: ${la.layerCount} layers (depth ${la.maxLayer}) · ${la.violationCount} violations (${la.severeViolations} severe)`);
  }
  if (stats.coChange && stats.coChange.available && stats.coChange.pairs && stats.coChange.pairs.length > 0) {
    console.log(`   🔀 Co-change pairs: ${stats.coChange.pairs.length} pairs in ${stats.coChange.commitCount} commits · ${stats.coChange.coChangedFileCount} files co-changed`);
    if (stats.coChange.clusters && stats.coChange.clusters.length > 0) {
      console.log(`   📎 Co-change clusters: ${stats.coChange.clusters.length} (largest: ${stats.coChange.clusters[0].size} files)`);
    }
  }
  if (stats.riskScores && stats.riskScores.topRisks && stats.riskScores.topRisks.length > 0) {
    const rs = stats.riskScores;
    const criticalCount = (rs.riskBuckets && (rs.riskBuckets["critical (60-80)"] || 0) + (rs.riskBuckets["extreme (80-100)"] || 0)) || 0;
    console.log(`   🎯 Risk scores: avg ${rs.avgRisk}/100 · ${criticalCount} critical/extreme · ${rs.totalAssessed} files assessed`);
  }
  if (stats.recommendations && stats.recommendations.length > 0) {
    const p0 = stats.recommendations.filter((r) => r.severity === "P0").length;
    const p1 = stats.recommendations.filter((r) => r.severity === "P1").length;
    const p2 = stats.recommendations.filter((r) => r.severity === "P2").length;
    console.log(`   💡 Recommendations: ${stats.recommendations.length} total (${p0} P0 · ${p1} P1 · ${p2} P2)`);
  }
  if (stats.scc && stats.scc.multiNodeSccCount > 0) {
    console.log(`   🔴 SCC (Tarjan): ${stats.scc.multiNodeSccCount} multi-node components · largest SCC=${stats.scc.largestSCCSize} files`);
  }
  if (stats.betweenness && stats.betweenness.significantBottlenecks && stats.betweenness.significantBottlenecks.length > 0) {
    console.log(`   🍾 Bottlenecks: ${stats.betweenness.significantBottlenecks.length} critical (max betweenness=${stats.betweenness.maxBetweenness.toFixed(4)})`);
  }
  if (stats.moduleBoundaries && stats.moduleBoundaries.length > 0) {
    const types = {};
    for (const s of stats.moduleBoundaries) { types[s.type] = (types[s.type] || 0) + 1; }
    console.log(`   🧩 Module suggestions: ${stats.moduleBoundaries.length} (${Object.entries(types).map(([k,v])=>`${k}×${v}`).join(', ')})`);
  }
  if (stats.trendAnalysis && stats.trendAnalysis.anomalies && stats.trendAnalysis.anomalies.length > 0) {
    console.log(`   📈 Trend anomalies: ${stats.trendAnalysis.anomalies.length} detected`);
  }

  // Diff summary
  if (diff && diff.hasBaseline) {
    const deltaArrow = diff.sizeDeltaPercent > 0 ? "↑" : diff.sizeDeltaPercent < 0 ? "↓" : "→";
    console.log(`   📈 vs baseline (${diff.baselineDate}): ${deltaArrow} ${diff.sizeDeltaPercent > 0 ? "+" : ""}${diff.sizeDeltaPercent.toFixed(1)}% (${formatBytes(Math.abs(diff.sizeDelta))})`);
    console.log(`      +${diff.newFiles.length} new · −${diff.deletedFiles.length} deleted · ${diff.changedFiles.length} changed`);
  }

  if (args.saveBaseline) {
    const bp = join(projectRoot, BASELINE_FILE);
    console.log(`   💾 Baseline saved: ${relative(process.cwd(), bp)}`);
  }

  // ── Trend persistence (always on — saves to .memory/bundle-trend.jsonl) ──
  const trendResult = persistAndAnalyzeTrend(projectRoot, stats, {
    generatedAt,
    depNodes: depGraph.nodes.length,
    depEdges: depGraph.edges.length,
  });
  stats.trendAnalysis = trendResult.trendAnalysis;
  if (trendResult.trendAnalysis && trendResult.trendAnalysis.dataPoints >= 2) {
    console.log(`   📈 Trend: ${trendResult.trendAnalysis.dataPoints} data points · SMA risk=${trendResult.trendAnalysis.smaRisk}`);
  }

  // Open in browser
  if (!args.noOpen) {
    const cmd = process.platform === "darwin" ? "open" :
                process.platform === "win32" ? "start" : "xdg-open";
    try {
      execSync(`${cmd} "${reportPath}"`, { stdio: "ignore" });
    } catch {
      // non-fatal: browser open failed
    }
  }
}

main();
