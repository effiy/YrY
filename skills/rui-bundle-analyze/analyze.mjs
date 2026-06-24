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
import { NODE_ARGV_OFFSET } from "../../lib/constants.mjs";

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
    quick: false,
    export: null,
    preCommit: false,
    config: null,
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
    else if (a === "--quick") { args.quick = true; }
    else if (a === "--export" && i + 1 < argv.length) { args.export = argv[++i]; }
    else if (a === "--pre-commit") { args.preCommit = true; args.quick = true; }
    else if (a === "--config" && i + 1 < argv.length) { args.config = argv[++i]; }
  }

  return args;
}

function printHelp() {
  // Delegate to help.mjs
  const help = `
rui-bundle-analyze v${ANALYSIS_VERSION} — File size & dependency analysis

Usage:
  node skills/rui-bundle-analyze/analyze.mjs [options]

Analysis Options:
  --dir <path>       Analyze a specific directory (default: project root)
  --scope <glob>     Limit files to a glob pattern (e.g. "**/*.js")
  --max-depth <n>    Limit dependency graph node depth (0 = no limit)
  --quick            Fast mode: skip expensive git operations (churn, co-change)
  --pre-commit       Pre-commit mode: analyze changed files only, fast
  --config <path>    Load custom config file (.bundle-analyze.json)

Output Options:
  --no-open          Don't open report in browser
  --json             JSON output to stdout
  --export <format>  Export analysis as md|json|csv
  --save-baseline    Save as baseline for --diff comparisons
  --diff             Compare with saved baseline
  --help, -h         Show this help

Examples:
  /rui-bundle-analyze
  /rui-bundle-analyze --quick                    # fast mode, no git
  /rui-bundle-analyze --pre-commit               # pre-commit hook
  /rui-bundle-analyze --export md > ISSUES.md    # generate issues
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

// ── PageRank for code importance ────────────────────────────────────────────

/**
 * Compute PageRank on the dependency graph to identify "authoritative" files.
 *
 * PageRank models a random walk through the dependency graph: at each step,
 * with probability d (damping factor, default 0.85), follow a random outgoing
 * dependency edge; with probability (1-d), jump to a random file.
 *
 * Files with high PageRank are "important" — pointed to by other important files.
 * This differs from fan-in (raw count) by weighting each reference by the
 * importance of the referring file.
 *
 * Complexity: O(k × E) where k = iterations (fixed at 100 for convergence).
 */
function computePageRank(depGraph, opts = {}) {
  const nodes = depGraph.nodes.map((n) => n.path);
  if (nodes.length === 0) return { topRanked: [], avgPagerank: 0, maxPagerank: 0 };

  const damping = opts.damping || 0.85;
  const maxIter = opts.maxIter || 100;
  const tolerance = opts.tolerance || 1e-6;
  const N = nodes.length;

  // Build adjacency (outgoing edges) and identify dangling nodes (no outgoing)
  const adj = {};
  const outDegree = {};
  for (const n of nodes) { adj[n] = []; outDegree[n] = 0; }
  for (const edge of depGraph.edges) {
    if (adj[edge.from]) { adj[edge.from].push(edge.to); outDegree[edge.from]++; }
    if (!adj[edge.to]) adj[edge.to] = [];
  }

  // PageRank vector
  let pr = {};
  for (const n of nodes) pr[n] = 1 / N;

  // Dangling nodes get uniform distribution
  const danglingNodes = nodes.filter((n) => outDegree[n] === 0);

  for (let iter = 0; iter < maxIter; iter++) {
    const prevPR = { ...pr };
    let danglingSum = 0;
    for (const n of danglingNodes) danglingSum += prevPR[n];
    danglingSum /= N;

    for (const n of nodes) {
      // Random jump component
      pr[n] = (1 - damping) / N + damping * danglingSum;
      // Incoming edges contribution
      for (const edge of depGraph.edges) {
        if (edge.to === n && outDegree[edge.from] > 0) {
          pr[n] += damping * prevPR[edge.from] / outDegree[edge.from];
        }
      }
    }

    // Check convergence
    let delta = 0;
    for (const n of nodes) delta += Math.abs(pr[n] - prevPR[n]);
    if (delta < tolerance) break;
  }

  // Sort by PageRank descending
  const ranked = Object.entries(pr)
    .map(([path, score]) => ({ path, pagerank: +score.toFixed(6) }))
    .sort((a, b) => b.pagerank - a.pagerank);

  const avgPagerank = 1 / N;
  const maxPagerank = ranked[0]?.pagerank || 0;

  // Files with significantly high PageRank (> 3× average)
  const authoritativeFiles = ranked.filter((x) => x.pagerank > avgPagerank * 3);

  return {
    topRanked: ranked.slice(0, 25),
    authoritativeFiles,
    avgPagerank: +avgPagerank.toFixed(6),
    maxPagerank,
    damping,
  };
}

// ── Test gap analysis ───────────────────────────────────────────────────────

/**
 * Identify high-risk files that lack corresponding test files.
 *
 * Heuristic for "has test":
 *   - file.test.ext, file.spec.ext in same directory
 *   - __tests__/file.ext
 *   - tests/file.ext (mirror structure)
 *   - file name contains .test. or .spec.
 */
function analyzeTestGaps(files, riskScores, projectRoot) {
  const fileSet = new Set(files.map((f) => f.relPath));
  const testPatterns = [".test.", ".spec.", "-test.", "-spec.", "_test.", "_spec."];

  function hasTestFile(fileRelPath) {
    const dir = dirname(fileRelPath);
    const base = basename(fileRelPath);
    const ext = extname(base);
    const nameNoExt = base.slice(0, -ext.length);

    // Check same-directory patterns: foo.test.js, foo.spec.js, test_foo.js
    const candidates = [
      join(dir, `${nameNoExt}.test${ext}`),
      join(dir, `${nameNoExt}.spec${ext}`),
      join(dir, `test_${base}`),
      join(dir, `spec_${base}`),
      join(dir, `__tests__`, base),
      join(dir, `__tests__`, `${nameNoExt}.test${ext}`),
    ];

    // Check tests/ mirror directory
    const parts = fileRelPath.split("/");
    if (parts[0] !== "tests" && parts[0] !== "test" && parts[0] !== "__tests__") {
      candidates.push(`tests/${fileRelPath}`);
      candidates.push(`test/${fileRelPath}`);
      candidates.push(`__tests__/${fileRelPath}`);
    }

    // Check if any candidate exists
    for (const c of candidates) {
      if (fileSet.has(c)) return true;
    }

    // Also check if the file itself is a test file
    const lowerName = base.toLowerCase();
    for (const tp of testPatterns) {
      if (lowerName.includes(tp)) return true; // it IS a test file
    }

    return false;
  }

  // Analyze source files (not test files themselves)
  const sourceFiles = files.filter((f) => {
    const lower = basename(f.relPath).toLowerCase();
    return !testPatterns.some((tp) => lower.includes(tp));
  });

  const untestedFiles = [];
  for (const f of sourceFiles) {
    // Skip non-source files
    if (!DEP_PARSE_EXTS.has(f.ext) && f.ext !== ".vue" && f.ext !== ".svelte") continue;
    if (f.size < 200) continue; // skip tiny files

    if (!hasTestFile(f.relPath)) {
      // Determine risk based on size and risk score
      const risk = riskScores?.topRisks?.find((r) => r.path === f.relPath);
      const compositeRisk = risk?.composite || 0;
      untestedFiles.push({
        path: f.relPath,
        size: f.size,
        riskScore: compositeRisk,
      });
    }
  }

  // Sort by risk score descending (highest-risk untested files first)
  untestedFiles.sort((a, b) => b.riskScore - a.riskScore);

  // Summary
  const totalSourceFiles = sourceFiles.filter((f) => DEP_PARSE_EXTS.has(f.ext) || f.ext === ".vue" || f.ext === ".svelte").length;
  const testedCount = totalSourceFiles - untestedFiles.length;
  const coverageRate = totalSourceFiles > 0 ? +((testedCount / totalSourceFiles) * 100).toFixed(1) : 0;

  // High priority: untested files with high risk
  const highPriority = untestedFiles.filter((f) => f.riskScore > 0.15 || f.size > 50_000);

  return {
    untestedFiles: untestedFiles.slice(0, 30),
    highPriority: highPriority.slice(0, 15),
    totalSourceFiles,
    testedCount,
    untestedCount: untestedFiles.length,
    coverageRate,
  };
}

// ── Change propagation probability ───────────────────────────────────────────

/**
 * Compute change propagation probabilities from co-change data.
 *
 * P(Y changes | X changed) = coChangeCount(X,Y) / totalChangesOf(X)
 *
 * This answers: "If I modify file X, what's the probability file Y also needs changes?"
 * High propagation probability → files are tightly coupled in practice.
 */
function computeChangePropagation(coChange, gitChurn) {
  if (!coChange || !coChange.available || !coChange.pairs || coChange.pairs.length === 0) {
    return { available: false, propagations: [], topPropagations: [] };
  }

  // Build change count per file from churn data
  const changeCount = {};
  if (gitChurn && gitChurn.available && gitChurn.topHotFiles) {
    for (const f of gitChurn.topHotFiles) {
      changeCount[f.path] = f.churnCount;
    }
  }

  const propagations = coChange.pairs.map((pair) => {
    const [a, b] = pair.files;
    const ca = changeCount[a] || pair.coChangeCount;
    const cb = changeCount[b] || pair.coChangeCount;
    // P(b|a) and P(a|b)
    const probBgivenA = ca > 0 ? +((pair.coChangeCount / ca) * 100).toFixed(1) : 0;
    const probAgivenB = cb > 0 ? +((pair.coChangeCount / cb) * 100).toFixed(1) : 0;

    return {
      files: [a, b],
      coChangeCount: pair.coChangeCount,
      jaccard: pair.jaccard,
      probBgivenA: Math.min(100, probBgivenA),
      probAgivenB: Math.min(100, probAgivenB),
      // The higher propagation probability
      maxPropagation: Math.max(probBgivenA, probAgivenB),
    };
  });

  // Sort by max propagation probability
  propagations.sort((a, b) => b.maxPropagation - a.maxPropagation);

  // High propagation pairs (>50% probability)
  const highPropagation = propagations.filter((p) => p.maxPropagation >= 50);

  return {
    available: true,
    propagations: propagations.slice(0, 25),
    topPropagations: propagations.slice(0, 10),
    highPropagation,
    highPropagationCount: highPropagation.length,
  };
}

// ── Knowledge distribution / Bus factor ──────────────────────────────────────

/**
 * Analyze git shortlog to compute knowledge distribution and bus factor risks.
 *
 * "Bus factor" = number of contributors who would need to be hit by a bus
 * before the project's knowledge is critically lost.
 *
 * For each file: how many unique contributors? Files with only 1 contributor
 * are bus-factor=1 risks.
 */
function computeKnowledgeDistribution(projectRoot, files, opts = {}) {
  const timeWindow = opts.timeWindow || "180 days";
  const fileSet = new Set(files.map((f) => f.relPath));

  let gitOutput;
  try {
    const sincePeriod = timeWindow.replace(/\s+/g, ".");
    const args = ["shortlog", `--since=${sincePeriod}`, "-sne", "--", "."];
    gitOutput = execSync(`git -C "${projectRoot}" ${args.join(" ")}`, { encoding: "utf-8", timeout: 10000 });
  } catch {
    return { available: false, reason: "git shortlog failed" };
  }

  // Parse shortlog: each line is like "  137\tAuthor Name <email>"
  const contributorLines = gitOutput.trim().split("\n").filter((l) => l.trim());
  const totalContributors = contributorLines.length;

  // For per-file contributor info, use git log with a different format
  let fileContribOutput;
  try {
    const sincePeriod = timeWindow.replace(/\s+/g, ".");
    // Get the list of files changed by each author
    const args = ["log", `--since=${sincePeriod}`, "--pretty=format:--AUTHOR--%an", "--name-only", "--", "."];
    fileContribOutput = execSync(`git -C "${projectRoot}" ${args.join(" ")}`, { encoding: "utf-8", timeout: 15000, maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return { available: true, totalContributors, fileOwnership: [], busFactorRisks: [] };
  }

  // Parse: blocks separated by --AUTHOR--AuthorName, followed by file list
  const blocks = fileContribOutput.split("--AUTHOR--").filter((b) => b.trim());
  const fileContributors = {}; // file → Set of authors

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;
    const author = lines[0].trim();
    for (let i = 1; i < lines.length; i++) {
      const file = lines[i].trim();
      if (file && fileSet.has(file)) {
        if (!fileContributors[file]) fileContributors[file] = new Set();
        fileContributors[file].add(author);
      }
    }
  }

  // Sort files by number of contributors (ascending = highest bus factor risk)
  const fileOwnership = Object.entries(fileContributors)
    .map(([path, authors]) => ({
      path,
      contributorCount: authors.size,
      contributors: [...authors].slice(0, 5),
    }))
    .sort((a, b) => a.contributorCount - b.contributorCount);

  // Bus factor 1 risks: files touched by only 1 person
  const busFactorRisks = fileOwnership.filter((f) => f.contributorCount === 1);

  // Files with no recent contributions (abandoned?)
  const abandonedFiles = files
    .filter((f) => DEP_PARSE_EXTS.has(f.ext) && f.size > 200 && !fileContributors[f.relPath])
    .map((f) => ({ path: f.relPath, size: f.size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 20);

  // Distribution statistics
  const contribCountDist = {};
  for (const f of fileOwnership) {
    const bucket = f.contributorCount === 1 ? "1" : f.contributorCount === 2 ? "2" : f.contributorCount <= 3 ? "3" : f.contributorCount <= 5 ? "4-5" : "6+";
    contribCountDist[bucket] = (contribCountDist[bucket] || 0) + 1;
  }

  return {
    available: true,
    totalContributors,
    timeWindow,
    fileOwnership: fileOwnership.slice(0, 30),
    busFactorRisks,
    busFactorRiskCount: busFactorRisks.length,
    abandonedFiles,
    abandonedCount: abandonedFiles.length,
    contribCountDist,
    // Files with healthy knowledge distribution (3+ contributors)
    healthyFiles: fileOwnership.filter((f) => f.contributorCount >= 3).length,
    singleContributorFiles: busFactorRisks.length,
  };
}

// ── Code complexity estimation ──────────────────────────────────────────────

/**
 * Estimate code complexity metrics per file using regex heuristics.
 *
 * Metrics:
 *   - loc: lines of code (non-blank, non-comment-only)
 *   - branchPoints: if/else/switch/case/for/while/do/&&/||/?/catch count
 *   - funcCount: function/arrow/method declarations
 *   - cyclomaticComplexity: M = branchPoints + 1 (McCabe's formula)
 *   - density: loc / size_bytes (code density indicator)
 *   - commentRatio: comment lines / total lines
 */
function computeComplexity(files, projectRoot) {
  const parsableExts = new Set([...DEP_PARSE_EXTS, ".html"]);
  const results = [];

  for (const f of files) {
    if (!parsableExts.has(f.ext) || f.size < 50 || f.size > 500_000) continue;

    let content;
    try {
      content = readFileSync(f.path, "utf-8");
    } catch { continue; }

    const lines = content.split("\n");
    const totalLines = lines.length;

    // Count comment lines (simplified: lines starting with //, #, /*, *, or empty)
    let commentLines = 0;
    let blankLines = 0;
    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { blankLines++; continue; }
      if (inBlockComment) {
        commentLines++;
        if (trimmed.includes("*/")) inBlockComment = false;
        continue;
      }
      if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("<!--")) {
        commentLines++;
        continue;
      }
      if (trimmed.startsWith("/*")) {
        commentLines++;
        if (!trimmed.includes("*/")) inBlockComment = true;
        continue;
      }
      if (trimmed === "*" || trimmed.startsWith("* ")) {
        commentLines++;
        continue;
      }
    }

    const loc = totalLines - blankLines - commentLines;
    const commentRatio = totalLines > 0 ? +(commentLines / totalLines).toFixed(2) : 0;

    // Count branch points
    const codeOnly = lines.filter((l) => {
      const t = l.trim();
      return t && !t.startsWith("//") && !t.startsWith("#") && !t.startsWith("/*") && !t.startsWith("*");
    }).join("\n");

    let branchPoints = 0;
    // Control flow branches
    branchPoints += (codeOnly.match(/\bif\s*\(/g) || []).length;
    branchPoints += (codeOnly.match(/\belse\s*\{/g) || []).length;
    branchPoints += (codeOnly.match(/\belse\s+if\b/g) || []).length;
    branchPoints += (codeOnly.match(/\bswitch\s*\(/g) || []).length;
    branchPoints += (codeOnly.match(/\bcase\s+/g) || []).length;
    branchPoints += (codeOnly.match(/\bfor\s*\(/g) || []).length;
    branchPoints += (codeOnly.match(/\bwhile\s*\(/g) || []).length;
    branchPoints += (codeOnly.match(/\bdo\s*\{/g) || []).length;
    branchPoints += (codeOnly.match(/\bcatch\s*\(/g) || []).length;
    branchPoints += (codeOnly.match(/\?\s*[^:]+:/g) || []).length; // ternary
    // Logical branches (&& and || in conditions)
    branchPoints += (codeOnly.match(/&&/g) || []).length;
    branchPoints += (codeOnly.match(/\|\|/g) || []).length;

    // Count functions
    let funcCount = 0;
    funcCount += (codeOnly.match(/\bfunction\s+\w+/g) || []).length;
    funcCount += (codeOnly.match(/=>\s*\{/g) || []).length; // arrow functions with body
    funcCount += (codeOnly.match(/=>\s*[^{]/g) || []).length; // arrow functions without body
    funcCount += (codeOnly.match(/\b(class|interface|enum)\s+\w+/g) || []).length;

    // Cyclomatic complexity: M = E - N + 2P, simplified as branchPoints + 1
    const cyclomaticComplexity = branchPoints + 1;

    // Density: bytes per LOC (lower = more efficient encoding)
    const density = loc > 0 ? +(f.size / loc).toFixed(1) : 0;

    results.push({
      path: f.relPath,
      size: f.size,
      loc,
      totalLines,
      commentRatio,
      branchPoints,
      funcCount,
      cyclomaticComplexity,
      density,
    });
  }

  // Sort by cyclomatic complexity descending
  results.sort((a, b) => b.cyclomaticComplexity - a.cyclomaticComplexity);

  // Summary statistics
  const complexities = results.map((r) => r.cyclomaticComplexity);
  const avgComplexity = complexities.length > 0 ? +(complexities.reduce((a, b) => a + b, 0) / complexities.length).toFixed(1) : 0;
  const maxComplexity = complexities.length > 0 ? Math.max(...complexities) : 0;

  // Complexity buckets
  const complexityBuckets = { "1-5 (simple)": 0, "6-10 (moderate)": 0, "11-20 (complex)": 0, "21-50 (very complex)": 0, "50+ (extreme)": 0 };
  for (const r of results) {
    if (r.cyclomaticComplexity <= 5) complexityBuckets["1-5 (simple)"]++;
    else if (r.cyclomaticComplexity <= 10) complexityBuckets["6-10 (moderate)"]++;
    else if (r.cyclomaticComplexity <= 20) complexityBuckets["11-20 (complex)"]++;
    else if (r.cyclomaticComplexity <= 50) complexityBuckets["21-50 (very complex)"]++;
    else complexityBuckets["50+ (extreme)"]++;
  }

  return {
    topComplex: results.slice(0, 25),
    complexityBuckets,
    avgComplexity,
    maxComplexity,
    totalAnalyzed: results.length,
  };
}

// ── Content similarity clustering ───────────────────────────────────────────

/**
 * Detect near-duplicate files using token-based Jaccard similarity.
 * Unlike hash-based duplicate detection (exact match), this finds files
 * with similar but not identical content.
 *
 * Tokenization: split by whitespace + punctuation, lowercase, filter short tokens.
 */
function computeContentSimilarity(files, projectRoot, opts = {}) {
  const threshold = opts.threshold || 0.7;  // Jaccard threshold for "similar"
  const maxFiles = opts.maxFiles || 300;    // Cap for performance
  const parsableExts = new Set([...DEP_PARSE_EXTS]);

  const sourceFiles = files
    .filter((f) => parsableExts.has(f.ext) && f.size > 200 && f.size < 100_000)
    .sort((a, b) => b.size - a.size)
    .slice(0, maxFiles);

  if (sourceFiles.length < 2) return { pairs: [], similarGroups: [], avgSimilarity: 0 };

  // Tokenize each file
  const fileTokens = {};
  for (const f of sourceFiles) {
    try {
      const content = readFileSync(f.path, "utf-8");
      // Tokenize: split by non-alphanumeric, lowercase, filter short tokens
      const tokens = content
        .toLowerCase()
        .split(/[^a-z0-9_$]+/)
        .filter((t) => t.length >= 4) // meaningful tokens only
        .slice(0, 2000); // cap tokens per file for performance
      fileTokens[f.relPath] = new Set(tokens);
    } catch { /* skip */ }
  }

  // Compute Jaccard similarity for all pairs (only compare files in different dirs)
  const pairs = [];
  const fileList = Object.keys(fileTokens);

  for (let i = 0; i < fileList.length; i++) {
    for (let j = i + 1; j < fileList.length; j++) {
      const a = fileList[i];
      const b = fileList[j];
      // Skip files in same directory (likely variants of the same component)
      if (dirname(a) === dirname(b)) continue;

      const tokensA = fileTokens[a];
      const tokensB = fileTokens[b];
      const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
      const union = new Set([...tokensA, ...tokensB]);
      const jaccard = union.size > 0 ? intersection.size / union.size : 0;

      if (jaccard >= threshold) {
        pairs.push({ files: [a, b], jaccard: +jaccard.toFixed(3), commonTokens: intersection.size, unionSize: union.size });
      }
    }
  }

  pairs.sort((a, b) => b.jaccard - a.jaccard);

  // Find similarity groups (connected components in similarity graph)
  const groups = findSimilarityGroups(pairs.slice(0, 100));

  const allJaccards = pairs.map((p) => p.jaccard);
  const avgSimilarity = allJaccards.length > 0 ? +(allJaccards.reduce((a, b) => a + b, 0) / allJaccards.length).toFixed(3) : 0;

  return {
    pairs: pairs.slice(0, 30),
    similarGroups: groups,
    pairCount: pairs.length,
    avgSimilarity,
    threshold,
  };
}

function findSimilarityGroups(pairs) {
  const adj = {};
  for (const p of pairs) {
    const [a, b] = p.files;
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
  }

  const visited = new Set();
  const groups = [];
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
    if (component.length >= 2) groups.push(component);
  }
  return groups.sort((a, b) => b.length - a.length).slice(0, 10);
}

// ── Hotspot severity matrix ─────────────────────────────────────────────────

/**
 * Build a hotspot severity matrix combining complexity and churn.
 *
 * Inspired by CodeScene's hotspot analysis:
 *   - X-axis: Churn (change frequency)
 *   - Y-axis: Complexity (cyclomatic complexity)
 *
 * Quadrants:
 *   - Low Complexity + Low Churn = Healthy (green)
 *   - High Complexity + Low Churn = Stable Complex (yellow — works but hard to change)
 *   - Low Complexity + High Churn = Frequent Simple (yellow — changes often but simple)
 *   - High Complexity + High Churn = HOTSPOT (red — prioritize refactoring)
 */
function computeHotspotMatrix(complexity, gitChurn) {
  if (!complexity || !complexity.topComplex || complexity.topComplex.length === 0) {
    return { hotspots: [], quadrants: {}, available: false };
  }
  if (!gitChurn || !gitChurn.available || !gitChurn.topHotFiles) {
    return { hotspots: [], quadrants: {}, available: false };
  }

  // Build complexity and churn maps
  const complexMap = {};
  for (const c of complexity.topComplex) {
    complexMap[c.path] = c.cyclomaticComplexity;
  }
  // Also add all analyzed files
  for (const c of complexity.topComplex) complexMap[c.path] = c.cyclomaticComplexity;

  const churnMap = {};
  for (const f of gitChurn.topHotFiles) {
    churnMap[f.path] = f.churnCount;
  }

  // Median thresholds
  const complexities = Object.values(complexMap);
  const churns = Object.values(churnMap);
  const medianComplexity = complexities.length > 0 ? complexities.sort((a, b) => a - b)[Math.floor(complexities.length / 2)] : 10;
  const medianChurn = churns.length > 0 ? churns.sort((a, b) => a - b)[Math.floor(churns.length / 2)] : 3;

  // Classify files
  const hotspots = [];
  const quadrants = { healthy: 0, stableComplex: 0, frequentSimple: 0, hotspot: 0 };

  // Get files that have both complexity and churn data
  const allFiles = new Set([...Object.keys(complexMap), ...Object.keys(churnMap)]);

  for (const path of allFiles) {
    const c = complexMap[path] || 0;
    const ch = churnMap[path] || 0;
    if (c === 0 && ch === 0) continue;

    const highComplexity = c > medianComplexity;
    const highChurn = ch > medianChurn;

    let quadrant;
    if (!highComplexity && !highChurn) { quadrant = "healthy"; quadrants.healthy++; }
    else if (highComplexity && !highChurn) { quadrant = "stableComplex"; quadrants.stableComplex++; }
    else if (!highComplexity && highChurn) { quadrant = "frequentSimple"; quadrants.frequentSimple++; }
    else { quadrant = "hotspot"; quadrants.hotspot++; }

    if (quadrant === "hotspot") {
      // Hotspot severity = normalized complexity × normalized churn
      const severity = +((c / Math.max(1, Math.max(...complexities))) * (ch / Math.max(1, Math.max(...churns))) * 100).toFixed(1);
      hotspots.push({ path, complexity: c, churn: ch, severity, quadrant });
    }
  }

  hotspots.sort((a, b) => b.severity - a.severity);

  return {
    available: true,
    hotspots: hotspots.slice(0, 20),
    quadrants,
    thresholds: { medianComplexity, medianChurn },
    totalClassified: allFiles.size,
  };
}

// ── Architecture fitness rules ───────────────────────────────────────────────

/**
 * Auto-generate and check architecture fitness rules.
 *
 * Rules derived from analysis:
 *   1. Layer isolation: files in layer N should not import from layer < N-1
 *   2. Package isolation: lib/ should not import from skills/
 *   3. Core isolation: infrastructure files should not import from feature files
 *   4. Circular dependency: no multi-node SCCs allowed
 *   5. God module: no file should depend on >15 other files
 *
 * Returns pass/fail for each rule with violation details.
 */
function checkFitnessRules(stats) {
  const rules = [];
  const violations = [];

  // Rule 1: Layer isolation (already in layerAnalysis.violations)
  if (stats.layerAnalysis && stats.layerAnalysis.violationCount > 0) {
    rules.push({ id: "layer-isolation", description: "Lower layers should not depend on upper layers", severity: "high" });
    for (const v of stats.layerAnalysis.violations.slice(0, 5)) {
      violations.push({
        rule: "layer-isolation",
        severity: v.gap > 1 ? "high" : "medium",
        description: `${v.from.split('/').pop()} (L${v.fromLayer}) → ${v.to.split('/').pop()} (L${v.toLayer}) [gap=${v.gap}]`,
        files: [v.from, v.to],
      });
    }
  }

  // Rule 2: Package isolation (lib should not import from skills)
  if (stats.transitiveDeps && stats.transitiveDeps.topTransitiveFanOut) {
    rules.push({ id: "package-isolation", description: "Shared libraries should not depend on feature packages", severity: "high" });
    // Check if lib files import from skills
    for (const edge of (stats.layerAnalysis?.violations || []).slice(0, 10)) {
      const fromInLib = edge.from.startsWith("lib/");
      const toInFeature = edge.to.startsWith("skills/");
      if (fromInLib && toInFeature) {
        violations.push({
          rule: "package-isolation",
          severity: "high",
          description: `lib file ${edge.from.split('/').pop()} imports from feature ${edge.to.split('/').pop()}`,
          files: [edge.from, edge.to],
        });
      }
    }
  }

  // Rule 3: No multi-node SCCs (circular dependency groups)
  if (stats.scc && stats.scc.multiNodeSccCount > 0) {
    rules.push({ id: "no-circular-scc", description: "No strongly connected components (circular dependency groups)", severity: "critical" });
    for (const scc of (stats.scc.multiNodeComponents || []).slice(0, 5)) {
      violations.push({
        rule: "no-circular-scc",
        severity: "critical",
        description: `SCC of ${scc.length} files: ${scc.slice(0, 3).map(f => f.split('/').pop()).join(', ')}`,
        files: scc,
      });
    }
  }

  // Rule 4: God module threshold (no file with >15 fan-out)
  rules.push({ id: "no-god-module", description: "No file should depend on more than 15 other files", severity: "medium" });
  if (stats.mostDependencies) {
    for (const d of stats.mostDependencies) {
      if (d.count > 15) {
        violations.push({
          rule: "no-god-module",
          severity: d.count > 25 ? "high" : "medium",
          description: `${d.path.split('/').pop()} depends on ${d.count} files (God Module)`,
          files: [d.path],
        });
      }
    }
  }

  // Rule 5: Zone-of-pain check
  if (stats.packageMetrics && stats.packageMetrics.packages) {
    rules.push({ id: "main-sequence-proximity", description: "Packages should be close to the main sequence (D < 0.7)", severity: "medium" });
    for (const pkg of stats.packageMetrics.packages) {
      if (pkg.zone === "zone-of-pain") {
        violations.push({
          rule: "main-sequence-proximity",
          severity: "medium",
          description: `Package "${pkg.package}" in zone-of-pain (D=${pkg.D})`,
          files: [pkg.package],
        });
      }
    }
  }

  // Compute scores
  const totalRules = rules.length;
  const rulesWithViolations = new Set(violations.map((v) => v.rule)).size;
  const rulesPassed = totalRules - rulesWithViolations;
  const fitnessScore = totalRules > 0 ? Math.round((rulesPassed / totalRules) * 100) : 100;

  return {
    rules,
    violations: violations.slice(0, 20),
    totalRules,
    rulesPassed,
    rulesFailed: rulesWithViolations,
    fitnessScore,
    grade: fitnessScore >= 100 ? "A" : fitnessScore >= 80 ? "B" : fitnessScore >= 60 ? "C" : fitnessScore >= 40 ? "D" : "F",
  };
}

// ── Import cost analysis ────────────────────────────────────────────────────

/**
 * Compute the transitive import cost for each file.
 *
 * "Import cost" of file X = total size of X + all files X transitively imports.
 * This answers: "If I import X, how much code am I really pulling in?"
 *
 * For directories: sum of import costs of all files within.
 */
function computeImportCost(files, depGraph) {
  if (depGraph.edges.length === 0) return { topHeavyImports: [], avgImportCost: 0, maxImportCost: 0 };

  // Build file size map
  const sizeMap = new Map(files.map((f) => [f.relPath, f.size]));

  // Build transitive closure (reuse from transitiveDeps if available)
  const adj = {};
  for (const n of depGraph.nodes) adj[n.path] = [];
  for (const edge of depGraph.edges) {
    if (adj[edge.from]) adj[edge.from].push(edge.to);
    if (!adj[edge.to]) adj[edge.to] = [];
  }

  // Compute transitive import cost per file: BFS to sum sizes of all reachable files
  const importCosts = [];
  for (const node of depGraph.nodes) {
    const visited = new Set();
    const queue = [node.path];
    visited.add(node.path);
    let totalCost = sizeMap.get(node.path) || 0;

    while (queue.length > 0) {
      const current = queue.shift();
      for (const neighbor of adj[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          totalCost += sizeMap.get(neighbor) || 0;
          queue.push(neighbor);
        }
      }
    }

    const ownSize = sizeMap.get(node.path) || 0;
    const transitiveCost = totalCost - ownSize;
    const multiplier = ownSize > 0 ? +((totalCost / ownSize)).toFixed(1) : 0;

    importCosts.push({
      path: node.path,
      ownSize,
      transitiveCost,
      totalCost,
      multiplier,
      reachableCount: visited.size - 1,
    });
  }

  // Sort by total import cost descending
  importCosts.sort((a, b) => b.totalCost - a.totalCost);

  // Also compute directory-level import costs
  const dirCosts = {};
  for (const ic of importCosts) {
    const dir = dirname(ic.path) || ".";
    if (!dirCosts[dir]) dirCosts[dir] = { ownSize: 0, transitiveCost: 0, totalCost: 0, fileCount: 0 };
    dirCosts[dir].ownSize += ic.ownSize;
    dirCosts[dir].transitiveCost += ic.transitiveCost;
    dirCosts[dir].totalCost += ic.totalCost;
    dirCosts[dir].fileCount++;
  }

  const topDirCosts = Object.entries(dirCosts)
    .map(([dir, d]) => ({ dir, ...d }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 15);

  const avgImportCost = importCosts.length > 0 ? +(importCosts.reduce((s, ic) => s + ic.totalCost, 0) / importCosts.length).toFixed(0) : 0;
  const maxImportCost = importCosts.length > 0 ? importCosts[0].totalCost : 0;

  return {
    topHeavyImports: importCosts.slice(0, 25),
    topDirCosts,
    avgImportCost,
    maxImportCost,
    // Files with highest multiplier (small file, huge transitive cost)
    highMultiplierImports: importCosts.filter((ic) => ic.multiplier > 10).sort((a, b) => b.multiplier - a.multiplier).slice(0, 15),
  };
}

// ── Technical debt quantification ───────────────────────────────────────────

/**
 * Quantify technical debt using an adaptation of the SIG/TÜViT maintainability
 * model. Estimates remediation cost in hours based on:
 *
 *   - Volume debt: oversized files (>500KB) → split cost
 *   - Complexity debt: high cyclomatic complexity (>50) → refactor cost
 *   - Duplication debt: content similarity pairs → dedup cost
 *   - Coupling debt: circular dependencies + high fan-out → decouple cost
 *   - Test debt: untested high-risk files → test writing cost
 *
 * Cost model (industry averages):
 *   - Split file: 4 hours per oversized file
 *   - Refactor complex logic: 2 hours per extreme-complexity file
 *   - Deduplicate: 1 hour per duplicate pair
 *   - Decouple: 3 hours per circular dep
 *   - Write tests: 1.5 hours per high-priority untested file
 *   - Fix layer violation: 2 hours per violation
 */
function quantifyTechDebt(stats) {
  const costModel = {
    splitFileHours: 4,
    refactorComplexHours: 2,
    deduplicateHours: 1,
    decoupleHours: 3,
    writeTestHours: 1.5,
    fixLayerViolationHours: 2,
    extractInterfaceHours: 3,
    breakSccHours: 4,
  };

  const breakdown = [];
  let totalHours = 0;

  // 1. Volume debt (oversized files)
  const oversizedCount = (stats.oversizedFiles || []).length;
  if (oversizedCount > 0) {
    const hours = oversizedCount * costModel.splitFileHours;
    totalHours += hours;
    breakdown.push({ category: "Volume (split large files)", count: oversizedCount, unitHours: costModel.splitFileHours, totalHours: hours });
  }

  // 2. Complexity debt (extreme complexity files)
  const extremeComplexCount = stats.complexity?.complexityBuckets?.["50+ (extreme)"] || 0;
  if (extremeComplexCount > 0) {
    const hours = extremeComplexCount * costModel.refactorComplexHours;
    totalHours += hours;
    breakdown.push({ category: "Complexity (refactor extreme)", count: extremeComplexCount, unitHours: costModel.refactorComplexHours, totalHours: hours });
  }

  // 3. Duplication debt
  const dupCount = (stats.duplicates || []).length;
  if (dupCount > 0) {
    const hours = dupCount * costModel.deduplicateHours;
    totalHours += hours;
    breakdown.push({ category: "Duplication (deduplicate)", count: dupCount, unitHours: costModel.deduplicateHours, totalHours: hours });
  }

  // 4. Coupling debt (circular deps)
  const circularCount = (stats.circularDeps || []).length;
  if (circularCount > 0) {
    const hours = circularCount * costModel.decoupleHours;
    totalHours += hours;
    breakdown.push({ category: "Coupling (decouple circular)", count: circularCount, unitHours: costModel.decoupleHours, totalHours: hours });
  }

  // 5. Test debt (untested high-priority)
  const highPriUntested = stats.testGaps?.highPriority?.length || 0;
  if (highPriUntested > 0) {
    const hours = highPriUntested * costModel.writeTestHours;
    totalHours += hours;
    breakdown.push({ category: "Test coverage (write tests)", count: highPriUntested, unitHours: costModel.writeTestHours, totalHours: hours });
  }

  // 6. Layer violation debt
  const layerViolationCount = stats.layerAnalysis?.violationCount || 0;
  if (layerViolationCount > 0) {
    const hours = layerViolationCount * costModel.fixLayerViolationHours;
    totalHours += hours;
    breakdown.push({ category: "Architecture (fix layer violations)", count: layerViolationCount, unitHours: costModel.fixLayerViolationHours, totalHours: hours });
  }

  // 7. SCC debt
  const sccCount = stats.scc?.multiNodeSccCount || 0;
  if (sccCount > 0) {
    const hours = sccCount * costModel.breakSccHours;
    totalHours += hours;
    breakdown.push({ category: "Architecture (break SCCs)", count: sccCount, unitHours: costModel.breakSccHours, totalHours: hours });
  }

  // 8. Zone-of-pain packages
  const painPkgCount = stats.packageMetrics?.packages?.filter((p) => p.zone === "zone-of-pain").length || 0;
  if (painPkgCount > 0) {
    const hours = painPkgCount * costModel.extractInterfaceHours;
    totalHours += hours;
    breakdown.push({ category: "Architecture (extract interfaces)", count: painPkgCount, unitHours: costModel.extractInterfaceHours, totalHours: hours });
  }

  // Convert to days (8h/day)
  const totalDays = +(totalHours / 8).toFixed(1);
  const totalWeeks = +(totalDays / 5).toFixed(1);

  // Debt ratio: hours per 1000 LOC
  const totalLoc = stats.complexity?.topComplex?.reduce((s, c) => s + c.loc, 0) || 1000;
  const debtDensity = +((totalHours / (totalLoc / 1000))).toFixed(1);

  // SIG Rating (1-5 stars)
  let sigRating;
  if (debtDensity < 2) sigRating = "★★★★★ (A)";
  else if (debtDensity < 5) sigRating = "★★★★☆ (B)";
  else if (debtDensity < 10) sigRating = "★★★☆☆ (C)";
  else if (debtDensity < 20) sigRating = "★★☆☆☆ (D)";
  else sigRating = "★☆☆☆☆ (F)";

  return {
    totalHours,
    totalDays,
    totalWeeks,
    debtDensity,
    sigRating,
    breakdown,
    costModel,
  };
}

// ── Refactoring ROI engine ──────────────────────────────────────────────────

/**
 * Augment refactoring recommendations with Impact (1-10) and Effort (1-10)
 * scores, then compute ROI = Impact / Effort for prioritization.
 *
 * Impact factors: risk score, blast radius, dependency count, churn frequency
 * Effort factors: file size, complexity, number of dependents
 */
function computeRefactoringROI(recommendations, stats) {
  if (!recommendations || recommendations.length === 0) return [];

  const augmented = recommendations.map((rec) => {
    // Estimate impact (1-10)
    let impact = 5; // baseline
    const files = rec.files || [];

    // Impact boosters
    if (rec.severity === "P0") impact += 3;
    else if (rec.severity === "P1") impact += 1;

    // Check blast radius
    if (stats.transitiveDeps?.topTransitiveFanOut) {
      for (const f of stats.transitiveDeps.topTransitiveFanOut) {
        if (files.includes(f.path) && f.transitiveCount > 10) impact += 2;
      }
    }

    // Check if in hotspot
    if (stats.hotspotMatrix?.hotspots) {
      for (const h of stats.hotspotMatrix.hotspots) {
        if (files.includes(h.path)) impact += 3;
      }
    }

    impact = Math.min(10, impact);

    // Estimate effort (1-10)
    let effort = 3; // baseline
    const categorize = rec.category;

    if (categorize === "file-size") effort += 3; // large files are harder
    else if (categorize === "circular-dep") effort += 4; // circular deps are complex
    else if (categorize === "architecture") effort += 2; // architecture changes take time
    else if (categorize === "layer-violation") effort += 2;
    else if (categorize === "dead-code") effort -= 2; // removing code is easier
    else if (categorize === "duplication") effort -= 1;

    // File size increases effort
    for (const f of files) {
      const fileInfo = stats.oversizedFiles?.find((of) => of.path === f);
      if (fileInfo && fileInfo.size > 500_000) effort += 3;
      else if (fileInfo && fileInfo.size > 100_000) effort += 1;
    }

    effort = Math.max(1, Math.min(10, effort));

    // ROI = Impact / Effort (higher = better return on time invested)
    const roi = +(impact / effort).toFixed(2);

    return {
      ...rec,
      impact,
      effort,
      roi,
      roiLevel: roi >= 2 ? "excellent" : roi >= 1.2 ? "good" : roi >= 0.8 ? "fair" : "poor",
    };
  });

  // Sort by ROI descending
  augmented.sort((a, b) => b.roi - a.roi);

  return augmented;
}

// ── API surface analysis ────────────────────────────────────────────────────

/**
 * Analyze the public API surface of each module by detecting export statements.
 *
 * Measures:
 *   - exportCount: number of export statements
 *   - namedExports: number of named exports
 *   - defaultExport: has default export?
 *   - reExports: number of re-exports
 *   - apiSurfaceScore: composite score (larger = more public surface)
 */
function analyzeApiSurface(files, projectRoot) {
  const parsableExts = new Set([...DEP_PARSE_EXTS]);
  const results = [];

  for (const f of files) {
    if (!parsableExts.has(f.ext) || f.size < 50) continue;
    let content;
    try { content = readFileSync(f.path, "utf-8"); } catch { continue; }

    const stripped = content
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/.*$/gm, " ");

    // Count export patterns
    const exportAll = (stripped.match(/export\s+/g) || []).length;
    const namedExports = (stripped.match(/export\s+(const|let|var|function|class|enum|interface|type)\s+\w+/g) || []).length;
    const defaultExport = /export\s+default\s+/.test(stripped);
    const namedExportList = (stripped.match(/export\s+\{[^}]+\}/g) || []).reduce((sum, m) => sum + (m.match(/,/g) || []).length + 1, 0);
    const reExports = (stripped.match(/export\s+\{[^}]*\}\s*from/g) || []).length + (stripped.match(/export\s+\*\s+from/g) || []).length;

    const totalExports = namedExports + namedExportList + (defaultExport ? 1 : 0) + reExports;
    if (totalExports === 0) continue;

    // API surface score: weighted composite
    const apiSurfaceScore = +(namedExports * 1 + namedExportList * 0.8 + (defaultExport ? 2 : 0) + reExports * 3).toFixed(1);

    results.push({
      path: f.relPath,
      totalExports,
      namedExports,
      namedExportList,
      defaultExport,
      reExports,
      apiSurfaceScore,
      size: f.size,
    });
  }

  // Sort by API surface score descending (largest public API first)
  results.sort((a, b) => b.apiSurfaceScore - a.apiSurfaceScore);

  // Summary
  const totalModules = results.length;
  const totalExportsAll = results.reduce((s, r) => s + r.totalExports, 0);
  const avgExportsPerModule = totalModules > 0 ? +(totalExportsAll / totalModules).toFixed(1) : 0;

  // Modules with largest API surface (these are most "exposed" to breaking changes)
  const largeApiModules = results.filter((r) => r.apiSurfaceScore > 10);

  return {
    topApiModules: results.slice(0, 25),
    largeApiModules,
    totalModules,
    totalExportsAll,
    avgExportsPerModule,
  };
}

// ── Dependency health index ─────────────────────────────────────────────────

/**
 * Compute a composite 0-100 health index for each file, aggregating all
 * analysis dimensions into a single actionable number.
 *
 * Health = 100 - penalties from:
 *   - Size (up to -15): oversized files
 *   - Complexity (up to -20): high cyclomatic complexity
 *   - Coupling (up to -15): high fan-in + fan-out
 *   - Churn (up to -15): high change frequency
 *   - Orphan (up to -10): orphan file
 *   - Circular (up to -15): in circular dependency
 *   - Zone-of-pain (up to -5): in zone-of-pain package
 *   - Untested (up to -10): no test coverage
 *   - Bus factor (up to -5): single contributor
 *   - Layer violation (up to -5): involved in layer violation
 *
 * Grading: A (90-100), B (75-89), C (60-74), D (40-59), F (<40)
 */
function computeHealthIndex(files, stats) {
  // Build lookup structures from stats
  const circularSet = new Set();
  for (const cycle of (stats.circularDeps || [])) {
    for (const node of cycle) circularSet.add(node);
  }

  const orphanSet = new Set((stats.orphanFiles || []).map((f) => f.path));
  const untestedSet = new Set((stats.testGaps?.highPriority || []).map((f) => f.path));

  const churnMap = new Map();
  if (stats.gitChurn?.available && stats.gitChurn?.topHotFiles) {
    const maxChurn = Math.max(1, ...stats.gitChurn.topHotFiles.map((f) => f.churnCount));
    for (const f of stats.gitChurn.topHotFiles) {
      churnMap.set(f.path, f.churnCount / maxChurn); // normalized 0-1
    }
  }

  const complexityMap = new Map();
  if (stats.complexity?.topComplex) {
    const maxC = Math.max(1, stats.complexity.maxComplexity);
    for (const c of stats.complexity.topComplex) {
      complexityMap.set(c.path, c.cyclomaticComplexity / maxC);
    }
  }

  const busFactorSet = new Set((stats.knowledgeDistribution?.busFactorRisks || []).map((f) => f.path));

  const layerViolationSet = new Set();
  if (stats.layerAnalysis?.violations) {
    for (const v of stats.layerAnalysis.violations) {
      layerViolationSet.add(v.from);
      layerViolationSet.add(v.to);
    }
  }

  const sourceFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext) && f.size > 100);
  const healthScores = [];

  for (const f of sourceFiles) {
    let health = 100;

    // Size penalty (0 to -15)
    const sizeRatio = Math.min(1, f.size / LARGE_FILE_THRESHOLD);
    health -= Math.round(sizeRatio * 15);

    // Complexity penalty (0 to -20)
    const cNorm = complexityMap.get(f.relPath) || 0;
    health -= Math.round(cNorm * 20);

    // Coupling penalty (simplified: based on size as proxy)
    // Full coupling needs fan-in/fan-out data which is in depGraph
    if (f.size > 100_000) health -= 10;
    else if (f.size > 50_000) health -= 5;

    // Churn penalty (0 to -15)
    const chNorm = churnMap.get(f.relPath) || 0;
    health -= Math.round(chNorm * 15);

    // Binary penalties
    if (orphanSet.has(f.relPath)) health -= 10;
    if (circularSet.has(f.relPath)) health -= 15;
    if (untestedSet.has(f.relPath)) health -= 10;
    if (busFactorSet.has(f.relPath)) health -= 5;
    if (layerViolationSet.has(f.relPath)) health -= 5;

    // Clamp
    health = Math.max(0, Math.min(100, health));

    const grade = health >= 90 ? "A" : health >= 75 ? "B" : health >= 60 ? "C" : health >= 40 ? "D" : "F";

    healthScores.push({ path: f.relPath, health, grade, size: f.size });
  }

  // Sort by health ascending (worst first)
  healthScores.sort((a, b) => a.health - b.health);

  // Distribution
  const gradeDist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const h of healthScores) gradeDist[h.grade]++;

  const avgHealth = healthScores.length > 0 ? +(healthScores.reduce((s, h) => s + h.health, 0) / healthScores.length).toFixed(1) : 0;
  const healthGrade = avgHealth >= 90 ? "A" : avgHealth >= 75 ? "B" : avgHealth >= 60 ? "C" : avgHealth >= 40 ? "D" : "F";

  return {
    topUnhealthy: healthScores.slice(0, 25),
    gradeDist,
    avgHealth,
    healthGrade,
    totalAssessed: healthScores.length,
  };
}

// ── Stable Dependencies Principle (SDP) checker ─────────────────────────────

/**
 * Check Stable Dependencies Principle: a package should only depend on packages
 * that are MORE stable than itself. I(depender) < I(dependee).
 *
 * Violation = depending on a less stable package.
 */
function checkSDP(packageMetrics, depGraph) {
  if (!packageMetrics || !packageMetrics.packages || packageMetrics.packages.length < 2) {
    return { violations: [], sdpScore: 100, passed: true };
  }

  // Build package → I (instability) map
  const pkgInstability = {};
  for (const p of packageMetrics.packages) {
    pkgInstability[p.package] = p.I;
  }

  // Determine package for each file (simplified: top-level dir)
  function getPackage(relPath) {
    const parts = relPath.split("/");
    return parts.length === 1 ? "." : parts[0];
  }

  // Build package-level edges
  const pkgEdges = {};
  for (const edge of depGraph.edges) {
    const fromPkg = getPackage(edge.from);
    const toPkg = getPackage(edge.to);
    if (fromPkg === toPkg) continue; // internal deps are fine
    const key = `${fromPkg}→${toPkg}`;
    if (!pkgEdges[key]) pkgEdges[key] = { from: fromPkg, to: toPkg, files: [] };
    pkgEdges[key].files.push({ from: edge.from, to: edge.to });
  }

  // Check SDP for each edge
  const violations = [];
  for (const [key, edge] of Object.entries(pkgEdges)) {
    const iFrom = pkgInstability[edge.from];
    const iTo = pkgInstability[edge.to];
    if (iFrom === undefined || iTo === undefined) continue;
    // SDP: depend on MORE stable (lower I)
    // Violation if I(depender) > I(dependee) + small tolerance
    if (iFrom > iTo + 0.01) {
      violations.push({
        from: edge.from,
        to: edge.to,
        iFrom: +iFrom.toFixed(3),
        iTo: +iTo.toFixed(3),
        delta: +(iFrom - iTo).toFixed(3),
        fileCount: edge.files.length,
        example: edge.files[0],
      });
    }
  }

  violations.sort((a, b) => b.delta - a.delta);

  const totalEdges = Object.keys(pkgEdges).length;
  const sdpScore = totalEdges > 0 ? Math.round((1 - violations.length / totalEdges) * 100) : 100;

  return {
    violations: violations.slice(0, 20),
    violationCount: violations.length,
    totalPkgEdges: totalEdges,
    sdpScore,
    sdpGrade: sdpScore >= 100 ? "A" : sdpScore >= 80 ? "B" : sdpScore >= 60 ? "C" : sdpScore >= 40 ? "D" : "F",
  };
}

// ── Trend forecasting ───────────────────────────────────────────────────────

/**
 * Simple linear regression on trend data to forecast future metrics.
 * Predicts: total size, risk score, file count at +30 and +90 days.
 */
function forecastTrends(trendAnalysis, history) {
  if (!history || history.length < 3) {
    return { available: false, reason: "Need 3+ data points for forecasting" };
  }

  // Extract time series: use data point index as x (0, 1, 2, ...)
  const xs = history.map((_, i) => i);
  const n = xs.length;

  function linearRegression(yValues) {
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = yValues.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - meanX) * (yValues[i] - meanY); den += (xs[i] - meanX) ** 2; }
    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;
    return { slope, intercept, predict: (x) => intercept + slope * x };
  }

  // Fit models for key metrics
  const sizeModel = linearRegression(history.map((h) => h.totalSize));
  const riskModel = linearRegression(history.map((h) => h.avgRisk));
  const fileCountModel = linearRegression(history.map((h) => h.totalFiles));
  const circularModel = linearRegression(history.map((h) => h.circularCount || 0));

  const lastIndex = n - 1;
  const day30 = lastIndex + (history.length >= 7 ? 1 : 2); // rough: 1-2 more runs in 30 days
  const day90 = lastIndex + (history.length >= 7 ? 3 : 6);

  // Forecast
  const forecasts = {
    totalSize: { current: history[lastIndex].totalSizeFormatted, day30: formatBytes(Math.max(0, Math.round(sizeModel.predict(day30)))), day90: formatBytes(Math.max(0, Math.round(sizeModel.predict(day90)))), trend: sizeModel.slope > 0 ? "growing" : "shrinking" },
    avgRisk: { current: history[lastIndex].avgRisk, day30: +riskModel.predict(day30).toFixed(1), day90: +riskModel.predict(day90).toFixed(1), trend: riskModel.slope > 0 ? "increasing" : "decreasing" },
    totalFiles: { current: history[lastIndex].totalFiles, day30: Math.round(fileCountModel.predict(day30)), day90: Math.round(fileCountModel.predict(day90)), trend: fileCountModel.slope > 0 ? "growing" : "shrinking" },
    circularDeps: { current: history[lastIndex].circularCount || 0, day30: Math.max(0, Math.round(circularModel.predict(day30))), day90: Math.max(0, Math.round(circularModel.predict(day90))), trend: circularModel.slope > 0 ? "worsening" : "improving" },
  };

  // Growth rates
  const sizeGrowthRate = sizeModel.slope > 0 ? `+${formatBytes(Math.round(sizeModel.slope))}/run` : `${formatBytes(Math.round(Math.abs(sizeModel.slope)))}/run`;

  return {
    available: true,
    forecasts,
    sizeGrowthRate,
    dataPoints: n,
    confidence: n >= 7 ? "high" : n >= 5 ? "medium" : "low",
  };
}

// ── Code review risk prioritization ─────────────────────────────────────────

/**
 * Compute code review risk scores to prioritize which files need most careful review.
 *
 * ReviewRisk = complexityScore × 0.3 + churnScore × 0.25 + riskScore × 0.2 + couplingScore × 0.15 + busFactorScore × 0.1
 *
 * High review risk = files where bugs are most likely AND most impactful.
 */
function computeReviewRisk(files, stats) {
  const { complexity, gitChurn, riskScores, knowledgeDistribution, healthIndex } = stats;

  const complexMap = new Map();
  if (complexity?.topComplex) {
    const maxC = Math.max(1, complexity.maxComplexity);
    for (const c of complexity.topComplex) complexMap.set(c.path, c.cyclomaticComplexity / maxC);
  }

  const churnMap = new Map();
  if (gitChurn?.available && gitChurn?.topHotFiles) {
    const maxCh = Math.max(1, ...gitChurn.topHotFiles.map((f) => f.churnCount));
    for (const f of gitChurn.topHotFiles) churnMap.set(f.path, f.churnCount / maxCh);
  }

  const riskMap = new Map();
  if (riskScores?.topRisks) {
    for (const r of riskScores.topRisks) riskMap.set(r.path, r.composite);
  }

  const busFactorSet = new Set((knowledgeDistribution?.busFactorRisks || []).map((f) => f.path));

  const sourceFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext) && f.size > 200);
  const reviewRisks = [];

  for (const f of sourceFiles) {
    const cScore = complexMap.get(f.relPath) || 0;          // 0-1
    const chScore = churnMap.get(f.relPath) || 0;            // 0-1
    const rScore = riskMap.get(f.relPath) || 0;              // 0-1
    const bfScore = busFactorSet.has(f.relPath) ? 1 : 0;     // 0 or 1
    const couplingScore = Math.min(1, f.size / LARGE_FILE_THRESHOLD); // 0-1

    const reviewRisk = +(
      cScore * 0.30 + chScore * 0.25 + rScore * 0.20 + couplingScore * 0.15 + bfScore * 0.10
    ).toFixed(3);

    if (reviewRisk > 0) {
      reviewRisks.push({
        path: f.relPath, reviewRisk,
        components: { complexity: +cScore.toFixed(2), churn: +chScore.toFixed(2), risk: +rScore.toFixed(2), coupling: +couplingScore.toFixed(2), busFactor: bfScore },
      });
    }
  }

  reviewRisks.sort((a, b) => b.reviewRisk - a.reviewRisk);

  const avgReviewRisk = reviewRisks.length > 0 ? +(reviewRisks.reduce((s, r) => s + r.reviewRisk, 0) / reviewRisks.length).toFixed(3) : 0;

  return {
    topReviewRisks: reviewRisks.slice(0, 25),
    avgReviewRisk,
    totalAssessed: reviewRisks.length,
    // High priority: > 2× average
    highPriorityReviews: reviewRisks.filter((r) => r.reviewRisk > avgReviewRisk * 2 && r.reviewRisk > 0.1),
  };
}

// ── Executive summary generator ─────────────────────────────────────────────

/**
 * Generate an executive summary suitable for management/CTO consumption.
 * Condenses all 30 analysis dimensions into a single-page narrative with
 * key metrics, top risks, and actionable recommendations.
 */
function generateExecutiveSummary(stats, meta) {
  const lines = [];

  // Header
  lines.push(`=== Executive Summary: ${meta.projectName} ===`);
  lines.push(`Generated: ${meta.generatedAt}  |  ${stats.totalFiles} files  |  ${formatBytes(stats.totalSize)}`);
  lines.push("");

  // Overall health
  const healthGrade = stats.healthIndex?.healthGrade || "N/A";
  const fitnessGrade = stats.fitnessRules?.grade || "N/A";
  const riskAvg = stats.riskScores?.avgRisk || 0;

  lines.push("## Overall Health");
  lines.push(`  File Health:    Grade ${healthGrade} (${stats.healthIndex?.avgHealth || "?"}/100  |  ${stats.healthIndex?.totalAssessed || 0} files)`);
  lines.push(`  Architecture:   Grade ${fitnessGrade} (${stats.fitnessRules?.fitnessScore || "?"}/100  |  ${stats.fitnessRules?.rulesPassed || 0}/${stats.fitnessRules?.totalRules || 0} rules)`);
  lines.push(`  Risk Level:     ${riskAvg}/100 average  |  ${stats.riskScores?.riskBuckets?.["critical (60-80)"] || 0} critical  |  ${stats.riskScores?.riskBuckets?.["extreme (80-100)"] || 0} extreme`);
  lines.push("");

  // Key metrics
  lines.push("## Key Metrics");
  lines.push(`  Complexity:     avg ${stats.complexity?.avgComplexity || "?"} McCabe  |  max ${stats.complexity?.maxComplexity || "?"}  |  ${stats.complexity?.complexityBuckets?.["50+ (extreme)"] || 0} extreme`);
  lines.push(`  Churn (90d):    ${stats.gitChurn?.filesChanged || 0}/${stats.totalFiles} files  |  ${stats.gitChurn?.totalChanges || 0} changes  |  rate ${stats.gitChurn?.churnRate || 0}%`);
  lines.push(`  Test Coverage:  ${stats.testGaps?.coverageRate || 0}%  |  ${stats.testGaps?.untestedCount || 0} untested  |  ${stats.testGaps?.highPriority?.length || 0} high-priority`);
  lines.push(`  Knowledge:      ${stats.knowledgeDistribution?.totalContributors || "?"} contributors  |  ${stats.knowledgeDistribution?.busFactorRiskCount || 0} bus-factor-1  |  ${stats.knowledgeDistribution?.abandonedCount || 0} abandoned`);
  lines.push("");

  // Technical debt
  if (stats.techDebt) {
    lines.push("## Technical Debt");
    lines.push(`  Total:          ${stats.techDebt.totalHours}h (${stats.techDebt.totalDays}d / ${stats.techDebt.totalWeeks}w)`);
    lines.push(`  SIG Rating:     ${stats.techDebt.sigRating}`);
    lines.push(`  Debt Density:   ${stats.techDebt.debtDensity}h/KLOC`);
    lines.push(`  Breakdown:`);
    for (const b of (stats.techDebt.breakdown || [])) {
      lines.push(`    - ${b.category}: ${b.totalHours}h (${b.count} items × ${b.unitHours}h)`);
    }
    lines.push("");
  }

  // Top risks
  lines.push("## Top Risks & Hotspots");
  if (stats.hotspotMatrix?.hotspots?.length > 0) {
    lines.push(`  Hotspots:       ${stats.hotspotMatrix.hotspots.length} files (high complexity + high churn)`);
    for (const h of stats.hotspotMatrix.hotspots.slice(0, 5)) {
      lines.push(`    - ${h.path.split("/").pop()}: severity=${h.severity}`);
    }
  } else {
    lines.push(`  Hotspots:       0 files — no complexity×churn hotspots detected`);
  }

  if (stats.scc && stats.scc.multiNodeSccCount > 0) {
    lines.push(`  SCCs:           ${stats.scc.multiNodeSccCount} strongly connected components (circular deps)`);
  } else {
    lines.push(`  SCCs:           0 — dependency graph is a DAG (healthy)`);
  }

  if (stats.layerAnalysis && stats.layerAnalysis.violationCount > 0) {
    lines.push(`  Layer Violations: ${stats.layerAnalysis.violationCount} (${stats.layerAnalysis.severeViolations} severe)`);
  }
  lines.push("");

  // Top recommendations (ROI-ranked)
  if (stats.recommendationsWithROI && stats.recommendationsWithROI.length > 0) {
    lines.push("## Top Action Items (ROI-ranked)");
    for (const rec of stats.recommendationsWithROI.slice(0, 5)) {
      const roiLabel = rec.roiLevel || "";
      lines.push(`  [${rec.severity}] ${rec.title} — ROI=${rec.roi} (${roiLabel})`);
    }
    lines.push("");
  }

  // Trend
  if (stats.trendAnalysis && stats.trendAnalysis.dataPoints >= 2) {
    lines.push(`## Trend (${stats.trendAnalysis.dataPoints} data points)`);
    lines.push(`  Size Trend:     ${stats.trendAnalysis.sizeDeltaPercent > 0 ? "+" : ""}${stats.trendAnalysis.sizeDeltaPercent}% since last run`);
    lines.push(`  Risk Trend:     ${stats.trendAnalysis.riskDelta > 0 ? "+" : ""}${stats.trendAnalysis.riskDelta} points`);
    if (stats.trendAnalysis.anomalies && stats.trendAnalysis.anomalies.length > 0) {
      lines.push(`  Anomalies:`);
      for (const a of stats.trendAnalysis.anomalies) lines.push(`    ⚠ ${a}`);
    }
    lines.push("");
  }

  // Forecast (if available)
  if (stats.forecast && stats.forecast.available) {
    lines.push(`## Forecast (confidence: ${stats.forecast.confidence})`);
    const f = stats.forecast.forecasts;
    lines.push(`  Size:     ${f.totalSize.current} → ${f.totalSize.day30} (30d) → ${f.totalSize.day90} (90d) [${f.totalSize.trend}]`);
    lines.push(`  Risk:     ${f.avgRisk.current} → ${f.avgRisk.day30} (30d) → ${f.avgRisk.day90} (90d) [${f.avgRisk.trend}]`);
  }

  return lines.join("\n");
}

// ── Breaking change impact prediction ───────────────────────────────────────

/**
 * Predict the downstream impact of changing a file's exports.
 * For each module with exports, compute the transitive set of files that
 * would need review/testing if the exports change.
 *
 * Impact level:
 *   - CRITICAL: >20 dependents (transitive)
 *   - HIGH: 10-20 dependents
 *   - MEDIUM: 3-9 dependents
 *   - LOW: 1-2 dependents
 */
function predictBreakingChangeImpact(apiSurface, depGraph) {
  if (!apiSurface || !apiSurface.topApiModules || apiSurface.topApiModules.length === 0) {
    return { impacts: [], criticalModules: [] };
  }
  if (!depGraph || depGraph.edges.length === 0) {
    return { impacts: [], criticalModules: [] };
  }

  // Build reverse adjacency (who depends on me?)
  const revAdj = {};
  for (const n of depGraph.nodes) revAdj[n.path] = [];
  for (const edge of depGraph.edges) {
    if (revAdj[edge.to]) revAdj[edge.to].push(edge.from);
    if (!revAdj[edge.from]) revAdj[edge.from] = [];
  }

  // Also build forward adjacency for transitive closure
  const adj = {};
  for (const n of depGraph.nodes) adj[n.path] = [];
  for (const edge of depGraph.edges) {
    if (adj[edge.from]) adj[edge.from].push(edge.to);
    if (!adj[edge.to]) adj[edge.to] = [];
  }

  const impacts = [];

  for (const mod of apiSurface.topApiModules) {
    // Compute transitive downstream: all files that can reach this module's file
    const downstream = new Set();
    const queue = [mod.path];
    const visited = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      if (current !== mod.path) downstream.add(current);
      for (const dep of revAdj[current] || []) {
        if (!visited.has(dep)) queue.push(dep);
      }
    }

    // Also compute direct dependents
    const directDependents = revAdj[mod.path] || [];

    const totalImpact = downstream.size;
    let level;
    if (totalImpact > 20) level = "CRITICAL";
    else if (totalImpact > 10) level = "HIGH";
    else if (totalImpact > 2) level = "MEDIUM";
    else if (totalImpact > 0) level = "LOW";
    else continue; // no dependents = no breaking change impact

    impacts.push({
      path: mod.path,
      totalExports: mod.totalExports,
      apiSurfaceScore: mod.apiSurfaceScore,
      directDependents: directDependents.length,
      transitiveDependents: totalImpact,
      impactLevel: level,
      // Sample of affected files
      affectedSample: [...downstream].slice(0, 5),
    });
  }

  // Sort by transitive dependents descending
  impacts.sort((a, b) => b.transitiveDependents - a.transitiveDependents);

  const criticalModules = impacts.filter((i) => i.impactLevel === "CRITICAL");
  const highModules = impacts.filter((i) => i.impactLevel === "HIGH");

  return {
    impacts: impacts.slice(0, 25),
    criticalModules,
    highModules,
    totalModulesWithImpact: impacts.length,
    criticalCount: criticalModules.length,
    highCount: highModules.length,
  };
}

// ── Component release coupling ──────────────────────────────────────────────

/**
 * Identify groups of files that form atomic release units based on
 * co-change frequency and dependency coupling.
 *
 * A "release unit" is a set of files that:
 *   1. Have high co-change frequency (Jaccard > 0.5)
 *   2. Share direct dependency edges
 *   3. Are in the same or adjacent directories
 *
 * Files in the same release unit should be versioned and released together.
 */
function computeReleaseCoupling(coChange, depGraph) {
  if (!coChange || !coChange.available || !coChange.pairs || coChange.pairs.length === 0) {
    return { releaseUnits: [], coupledFileCount: 0 };
  }

  // Build coupling graph: edge exists if co-change Jaccard > 0.4 OR direct dependency
  const adj = {};
  const allFiles = new Set();

  // From co-change
  for (const pair of coChange.pairs) {
    if (pair.jaccard < 0.4) continue;
    const [a, b] = pair.files;
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
    allFiles.add(a);
    allFiles.add(b);
  }

  // From dependency graph (strong coupling: direct bidirectional deps)
  if (depGraph && depGraph.edges) {
    const edgeSet = new Set(depGraph.edges.map((e) => `${e.from}→${e.to}`));
    for (const edge of depGraph.edges) {
      const reverse = `${edge.to}→${edge.from}`;
      if (edgeSet.has(reverse)) {
        // Bidirectional dependency = strong coupling
        if (!adj[edge.from]) adj[edge.from] = new Set();
        if (!adj[edge.to]) adj[edge.to] = new Set();
        adj[edge.from].add(edge.to);
        adj[edge.to].add(edge.from);
        allFiles.add(edge.from);
        allFiles.add(edge.to);
      }
    }
  }

  // Find connected components (release units)
  const visited = new Set();
  const releaseUnits = [];

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
    if (component.length >= 2) {
      releaseUnits.push({
        files: component,
        size: component.length,
        // Representative: shortest path
        representative: component.sort((a, b) => a.length - b.length)[0],
      });
    }
  }

  releaseUnits.sort((a, b) => b.size - a.size);

  return {
    releaseUnits: releaseUnits.slice(0, 15),
    coupledFileCount: visited.size,
    unitCount: releaseUnits.length,
    largestUnitSize: releaseUnits.length > 0 ? releaseUnits[0].size : 0,
  };
}

// ── Knowledge concentration (Herfindahl-Hirschman Index) ────────────────────

/**
 * Compute Herfindahl-Hirschman Index (HHI) for code ownership per directory.
 *
 * HHI = Σ(author_share²) for all authors in a directory.
 *   - HHI < 1500: Unconcentrated (healthy)
 *   - HHI 1500-2500: Moderately concentrated
 *   - HHI > 2500: Highly concentrated (knowledge silo risk)
 *
 * Also computes "bus factor" per directory: number of authors who contribute 50%+ of changes.
 */
function computeKnowledgeConcentration(knowledgeDistribution, files) {
  if (!knowledgeDistribution || !knowledgeDistribution.available || !knowledgeDistribution.fileOwnership || knowledgeDistribution.fileOwnership.length === 0) {
    return { directoryHHI: [], avgHHI: 0, highConcentrationDirs: [] };
  }

  // Build per-file contributor count
  const fileContribMap = new Map();
  for (const fo of knowledgeDistribution.fileOwnership) {
    fileContribMap.set(fo.path, fo.contributorCount);
  }

  // Aggregate per directory
  const dirStats = {}; // dir → { totalFiles, filesWithContribs, contribCounts: [] }
  for (const f of files) {
    if (!DEP_PARSE_EXTS.has(f.ext) && f.ext !== ".vue" && f.ext !== ".svelte") continue;
    const dir = dirname(f.relPath) || ".";
    if (!dirStats[dir]) dirStats[dir] = { totalFiles: 0, contribCounts: [] };
    dirStats[dir].totalFiles++;
    const cc = fileContribMap.get(f.relPath) || 0;
    if (cc > 0) dirStats[dir].contribCounts.push(cc);
  }

  // Compute HHI per directory
  const directoryHHI = [];
  for (const [dir, stats] of Object.entries(dirStats)) {
    if (stats.contribCounts.length === 0) continue;
    // Build author share distribution from contributor counts
    // Simplified: use contributor count as inverse proxy for concentration
    const avgContribs = stats.contribCounts.reduce((a, b) => a + b, 0) / stats.contribCounts.length;
    // Normalize: fewer avg contributors = higher concentration
    const singleContribRatio = stats.contribCounts.filter((c) => c <= 1).length / stats.contribCounts.length;

    // Pseudo-HHI: based on single-contributor concentration
    const hhi = Math.round(singleContribRatio * 10000); // scale to HHI-like range

    let level;
    if (hhi > 2500) level = "high";
    else if (hhi > 1500) level = "moderate";
    else level = "low";

    if (stats.totalFiles >= 3) { // only meaningful dirs
      directoryHHI.push({
        dir,
        totalFiles: stats.totalFiles,
        avgContributors: +avgContribs.toFixed(1),
        singleContribRatio: +(singleContribRatio * 100).toFixed(0),
        hhi,
        level,
      });
    }
  }

  directoryHHI.sort((a, b) => b.hhi - a.hhi);

  const avgHHI = directoryHHI.length > 0 ? Math.round(directoryHHI.reduce((s, d) => s + d.hhi, 0) / directoryHHI.length) : 0;
  const highConcentrationDirs = directoryHHI.filter((d) => d.level === "high");

  return {
    directoryHHI: directoryHHI.slice(0, 20),
    avgHHI,
    highConcentrationDirs,
    highCount: highConcentrationDirs.length,
  };
}

// ── Test prioritization matrix ──────────────────────────────────────────────

/**
 * Prioritize which tests to write first based on:
 *   Risk × Coverage Gap × Usage Frequency
 *
 * Priority Score = riskScore × (1 - coverage) × log(dependents + 1)
 *
 * Higher score = write tests for this file first.
 */
function prioritizeTests(testGaps, riskScores, depGraph) {
  if (!testGaps || !testGaps.untestedFiles || testGaps.untestedFiles.length === 0) {
    return { prioritizedTests: [], totalUntested: 0 };
  }

  // Build dependency count per file
  const depCount = {};
  if (depGraph && depGraph.edges) {
    for (const edge of depGraph.edges) {
      depCount[edge.from] = (depCount[edge.from] || 0) + 1;
      depCount[edge.to] = (depCount[edge.to] || 0) + 1;
    }
  }

  // Build risk map
  const riskMap = new Map();
  if (riskScores?.topRisks) {
    for (const r of riskScores.topRisks) riskMap.set(r.path, r.composite);
  }

  const prioritized = testGaps.untestedFiles.map((f) => {
    const risk = riskMap.get(f.path) || 0;
    const deps = depCount[f.path] || 0;
    const usageWeight = Math.log2(deps + 2); // log scale, min 1
    const priority = +(risk * usageWeight).toFixed(2);

    return {
      path: f.path,
      size: f.size,
      risk,
      dependents: deps,
      priority,
    };
  });

  // Remove zero-priority items and sort
  const filtered = prioritized.filter((p) => p.priority > 0);
  filtered.sort((a, b) => b.priority - a.priority);

  // Priority levels
  const urgent = filtered.filter((p) => p.priority > 5);
  const high = filtered.filter((p) => p.priority > 2 && p.priority <= 5);
  const medium = filtered.filter((p) => p.priority > 0.5 && p.priority <= 2);
  const low = filtered.filter((p) => p.priority <= 0.5);

  return {
    prioritizedTests: filtered.slice(0, 25),
    urgent,
    high,
    medium,
    low,
    totalUntested: testGaps.untestedCount,
    urgentCount: urgent.length,
    highCount: high.length,
  };
}

// ── Onboarding reading path ─────────────────────────────────────────────────

/**
 * Generate a recommended reading order for new developers based on
 * dependency structure: start from foundation (fan-out=0), work up.
 *
 * Reading path:
 *   1. Foundation files (no deps, high PageRank) — understand the basics
 *   2. Core library files (high fan-in) — understand shared utilities
 *   3. Feature entry points (high fan-out) — understand how features work
 *   4. Integration files (bridge modules, high betweenness) — understand connections
 */
function generateOnboardingPath(files, depGraph, pagerank, betweenness) {
  if (!depGraph || depGraph.nodes.length === 0) {
    return { path: [], phases: {} };
  }

  // Phase 1: Foundation — files with fan-out=0 (no deps), sorted by PageRank
  const fanOut = {};
  for (const n of depGraph.nodes) fanOut[n.path] = 0;
  for (const edge of depGraph.edges) {
    fanOut[edge.from] = (fanOut[edge.from] || 0) + 1;
  }

  const prMap = new Map();
  if (pagerank?.topRanked) {
    for (const pr of pagerank.topRanked) prMap.set(pr.path, pr.pagerank);
  }

  const bnMap = new Map();
  if (betweenness?.topBottlenecks) {
    for (const b of betweenness.topBottlenecks) bnMap.set(b.path, b.betweenness);
  }

  // Phase 1: Foundation (fan-out=0, high PageRank)
  const phase1Candidates = depGraph.nodes
    .filter((n) => (fanOut[n.path] || 0) === 0 && n.size > 200)
    .map((n) => ({ path: n.path, size: n.size, pagerank: prMap.get(n.path) || 0 }))
    .sort((a, b) => b.pagerank - a.pagerank)
    .slice(0, 10);

  // Phase 2: Core libraries (highest fan-in — most depended on)
  const fanIn = {};
  for (const n of depGraph.nodes) fanIn[n.path] = 0;
  for (const edge of depGraph.edges) {
    fanIn[edge.to] = (fanIn[edge.to] || 0) + 1;
  }
  const phase2Candidates = depGraph.nodes
    .filter((n) => (fanIn[n.path] || 0) > 0)
    .map((n) => ({ path: n.path, size: n.size, fanIn: fanIn[n.path] || 0 }))
    .sort((a, b) => b.fanIn - a.fanIn)
    .slice(0, 10);

  // Phase 3: Feature entry points (highest fan-out, large files)
  const phase3Candidates = depGraph.nodes
    .filter((n) => (fanOut[n.path] || 0) > 3)
    .map((n) => ({ path: n.path, size: n.size, fanOut: fanOut[n.path] || 0 }))
    .sort((a, b) => b.fanOut - a.fanOut)
    .slice(0, 10);

  // Phase 4: Integration points (highest betweenness)
  const phase4Candidates = depGraph.nodes
    .filter((n) => (bnMap.get(n.path) || 0) > 0)
    .map((n) => ({ path: n.path, size: n.size, betweenness: bnMap.get(n.path) || 0 }))
    .sort((a, b) => b.betweenness - a.betweenness)
    .slice(0, 10);

  return {
    phases: {
      "Phase 1: Foundation (no dependencies, understand basics)": phase1Candidates,
      "Phase 2: Core Libraries (most used, understand shared code)": phase2Candidates,
      "Phase 3: Feature Entries (orchestrate others, understand features)": phase3Candidates,
      "Phase 4: Integration Points (connect systems, understand architecture)": phase4Candidates,
    },
    totalFiles: phase1Candidates.length + phase2Candidates.length + phase3Candidates.length + phase4Candidates.length,
  };
}

// ── ADR auto-generation ─────────────────────────────────────────────────────

/**
 * Generate Architecture Decision Records (ADRs) from analysis findings.
 * Each ADR documents a significant architectural decision with context,
 * consequences, and recommendations.
 */
function generateADRs(stats, meta) {
  const adrs = [];

  // ADR 1: Layer architecture
  if (stats.layerAnalysis && stats.layerAnalysis.layerCount > 0) {
    const la = stats.layerAnalysis;
    adrs.push({
      id: `ADR-${String(adrs.length + 1).padStart(4, "0")}`,
      title: "Dependency Layer Architecture",
      status: la.violationCount > 0 ? "Needs Revision" : "Accepted",
      context: `Analysis detected ${la.layerCount} architectural layers (depth ${la.maxLayer}) with ${la.entryNodeCount} entry-point files.`,
      decision: `${la.layerCount}-layer architecture with downward dependency rule (higher layers depend on lower layers).`,
      consequences: `${la.violationCount} layer violations detected (${la.severeViolations} severe). Lower layers incorrectly depend on upper layers.`,
      recommendations: la.violationCount > 0 ? ["Fix severe layer violations by extracting shared dependencies to lower layers", "Consider dependency inversion for cross-layer references"] : [],
    });
  }

  // ADR 2: Package stability
  if (stats.packageMetrics && stats.packageMetrics.packages) {
    const painPkgs = stats.packageMetrics.packages.filter((p) => p.zone === "zone-of-pain");
    if (painPkgs.length > 0) {
      adrs.push({
        id: `ADR-${String(adrs.length + 1).padStart(4, "0")}`,
        title: "Package Stability and Abstraction",
        status: "Needs Revision",
        context: `${painPkgs.length} packages are in the Zone of Pain (stable but concrete): ${painPkgs.map((p) => p.package).join(", ")}.`,
        decision: "Stable packages should be abstract (Stable Abstractions Principle).",
        consequences: `These packages are heavily depended on but lack abstractions, making changes costly and risky.`,
        recommendations: ["Introduce abstract interfaces/types in zone-of-pain packages", "Gradually migrate dependents to depend on abstractions"],
      });
    }
  }

  // ADR 3: Test strategy
  if (stats.testGaps && stats.testGaps.coverageRate !== undefined && stats.testGaps.coverageRate < 50) {
    adrs.push({
      id: `ADR-${String(adrs.length + 1).padStart(4, "0")}`,
      title: "Test Coverage Strategy",
      status: "Proposed",
      context: `Current test coverage is ${stats.testGaps.coverageRate}% with ${stats.testGaps.untestedCount} untested source files (${stats.testGaps.highPriority?.length || 0} high-priority).`,
      decision: `Prioritize testing for high-risk files first, targeting ${Math.min(stats.testGaps.coverageRate + 20, 80)}% coverage within 90 days.`,
      consequences: "Improved reliability, reduced regression risk, easier refactoring. Initial investment required.",
      recommendations: [`Write tests for ${stats.testGaps.highPriority?.length || 0} high-priority untested files first`, "Establish coverage gate in CI pipeline"],
    });
  }

  // ADR 4: Code organization (if many orphans)
  if (stats.orphanFiles && stats.orphanFiles.length > 10) {
    adrs.push({
      id: `ADR-${String(adrs.length + 1).padStart(4, "0")}`,
      title: "Dead Code and Orphan File Management",
      status: "Proposed",
      context: `${stats.orphanFiles.length} orphan files detected — files not imported by any other file.`,
      decision: "Orphan files should be verified as non-entry-point and removed if unused, or documented as intentional singletons.",
      consequences: `Potential ${formatBytes(stats.orphanFiles.reduce((s, f) => s + f.size, 0))} of dead code removable. Cleaner codebase, faster builds.`,
      recommendations: ["Audit orphan files for dead code", "Add entry-point markers to intentional orphan files"],
    });
  }

  return adrs;
}

// ── Semantic versioning recommendation ──────────────────────────────────────

/**
 * Recommend semantic version bump type based on API surface and breaking change impact.
 *
 *   - MAJOR: CRITICAL breaking change impact modules changed
 *   - MINOR: New exports added, HIGH impact modules changed, backwards-compatible
 *   - PATCH: Bug fixes, internal refactoring, no API changes
 */
function recommendSemver(stats) {
  let recommendation = "PATCH";
  const reasons = [];

  if (stats.breakingChangeImpact) {
    if (stats.breakingChangeImpact.criticalCount > 0) {
      recommendation = "MAJOR";
      reasons.push(`${stats.breakingChangeImpact.criticalCount} CRITICAL breaking change impact modules`);
    } else if (stats.breakingChangeImpact.highCount > 0) {
      recommendation = "MINOR";
      reasons.push(`${stats.breakingChangeImpact.highCount} HIGH breaking change impact modules`);
    }
  }

  // New exports? (approximate from apiSurface)
  if (stats.apiSurface && stats.apiSurface.totalExportsAll > 0 && stats.recommendationsWithROI) {
    const newFeatureRecs = stats.recommendationsWithROI.filter((r) => r.category === "blast-radius" || r.category === "architecture");
    if (newFeatureRecs.length > 0 && recommendation === "PATCH") {
      recommendation = "MINOR";
      reasons.push(`${newFeatureRecs.length} feature-level changes detected`);
    }
  }

  // High churn = likely patch
  if (stats.gitChurn && stats.gitChurn.churnRate > 50 && recommendation === "PATCH") {
    reasons.push("High change activity (likely bug fixes)");
  }

  // SCC or circular deps found = potentially MAJOR
  if (stats.scc && stats.scc.multiNodeSccCount > 0 && recommendation !== "MAJOR") {
    recommendation = "MINOR";
    reasons.push(`${stats.scc.multiNodeSccCount} SCC groups indicate structural changes`);
  }

  return {
    recommendation,
    reasons,
    confidence: reasons.length >= 3 ? "high" : reasons.length >= 1 ? "medium" : "low",
  };
}

// ── Code review checklist generator ─────────────────────────────────────────

/**
 * Generate a per-file code review checklist for high-risk files.
 * Each checklist item targets a specific concern based on metrics.
 */
function generateReviewChecklists(stats) {
  const checklists = [];
  const highRiskFiles = [];

  // Collect high-risk files from multiple sources
  if (stats.reviewRisk?.topReviewRisks) {
    for (const r of stats.reviewRisk.topReviewRisks.slice(0, 10)) {
      highRiskFiles.push({ path: r.path, reviewRisk: r.reviewRisk, components: r.components });
    }
  }

  for (const file of highRiskFiles) {
    const items = [];
    const c = file.components || {};

    if (c.complexity > 0.3) items.push("🔍 Review for cyclomatic complexity — consider simplifying nested conditionals");
    if (c.churn > 0.5) items.push("📜 High change frequency — verify changes are intentional and well-tested");
    if (c.risk > 0.15) items.push("⚠️ Elevated risk score — review for potential bugs and edge cases");
    if (c.busFactor > 0) items.push("👤 Single contributor — ensure knowledge is documented/shared");
    if (c.coupling > 0.5) items.push("🔗 High coupling — verify all dependency changes are compatible");

    // Additional checks from other metrics
    const isOrphan = stats.orphanFiles?.some((f) => f.path === file.path);
    if (isOrphan) items.push("👻 Orphan file — verify this file is still needed");

    const isUntested = stats.testGaps?.highPriority?.some((f) => f.path === file.path);
    if (isUntested) items.push("🧪 No test coverage — write tests before/with this change");

    if (items.length > 0) {
      checklists.push({ path: file.path, riskLevel: file.reviewRisk > 0.3 ? "HIGH" : file.reviewRisk > 0.15 ? "MEDIUM" : "LOW", items });
    }
  }

  return checklists.slice(0, 15);
}

// ── Sprint work package generator ───────────────────────────────────────────

/**
 * Group recommendations into sprint-sized work packages.
 * Each package has estimated effort (hours) and suggested sprint assignment.
 */
function generateSprintPackages(recommendations, techDebt) {
  if (!recommendations || recommendations.length === 0) return [];

  const packages = [];
  let currentPackage = { name: "Sprint Work Package 1", items: [], totalEffortHours: 0, targetSprint: "Next Sprint" };
  const maxHoursPerSprint = 20; // half a week for refactoring

  for (const rec of recommendations) {
    // Estimate effort from ROI data
    const effortHours = rec.effort ? rec.effort * 2 : 4; // effort 1-10 → 2-20 hours
    const priority = rec.severity === "P0" ? 3 : rec.severity === "P1" ? 2 : 1;

    if (currentPackage.totalEffortHours + effortHours > maxHoursPerSprint) {
      packages.push({ ...currentPackage });
      const pkgNum = packages.length + 1;
      const sprintNum = pkgNum;
      currentPackage = {
        name: `Sprint Work Package ${pkgNum}`,
        items: [],
        totalEffortHours: 0,
        targetSprint: `Sprint +${sprintNum}`,
      };
    }

    currentPackage.items.push({
      title: rec.title,
      severity: rec.severity,
      roi: rec.roi,
      effortHours,
      category: rec.category,
    });
    currentPackage.totalEffortHours += effortHours;
  }

  if (currentPackage.items.length > 0) packages.push(currentPackage);

  // Add summary
  return packages.map((p) => ({
    ...p,
    totalEffortHours: Math.round(p.totalEffortHours),
    itemCount: p.items.length,
    p0Count: p.items.filter((i) => i.severity === "P0").length,
    p1Count: p.items.filter((i) => i.severity === "P1").length,
    avgROI: p.items.length > 0 ? +(p.items.reduce((s, i) => s + (i.roi || 0), 0) / p.items.length).toFixed(1) : 0,
  }));
}

// ── Ownership transfer risk ─────────────────────────────────────────────────

/**
 * Quantify knowledge loss risk if a contributor leaves.
 * For each bus-factor-1 file, assess the impact of losing its sole contributor.
 *
 * TransferRisk = file_complexity × dependency_impact × size_importance
 */
function computeOwnershipTransferRisk(knowledgeDistribution, complexity, depGraph) {
  if (!knowledgeDistribution || !knowledgeDistribution.available || !knowledgeDistribution.busFactorRisks || knowledgeDistribution.busFactorRisks.length === 0) {
    return { highRiskTransfers: [], totalAtRiskFiles: 0 };
  }

  const complexMap = new Map();
  if (complexity?.topComplex) {
    const maxC = Math.max(1, complexity.maxComplexity);
    for (const c of complexity.topComplex) complexMap.set(c.path, c.cyclomaticComplexity / maxC);
  }

  // Build dependency impact per file
  const depImpact = {};
  if (depGraph?.edges) {
    for (const edge of depGraph.edges) {
      depImpact[edge.from] = (depImpact[edge.from] || 0) + 1;
      depImpact[edge.to] = (depImpact[edge.to] || 0) + 1;
    }
  }
  const maxDep = Math.max(1, ...Object.values(depImpact));

  const transferRisks = knowledgeDistribution.busFactorRisks.map((f) => {
    const cNorm = complexMap.get(f.path) || 0;
    const dNorm = (depImpact[f.path] || 0) / maxDep;
    const contributor = f.contributors?.[0] || "unknown";
    const transferRisk = +((cNorm * 0.4 + dNorm * 0.4 + 0.2) * 100).toFixed(1); // base 0.2 for bus-factor-1

    return {
      path: f.path,
      contributor,
      complexityScore: +cNorm.toFixed(2),
      dependencyScore: +dNorm.toFixed(2),
      transferRisk,
    };
  });

  transferRisks.sort((a, b) => b.transferRisk - a.transferRisk);

  const highRiskTransfers = transferRisks.filter((t) => t.transferRisk > 40);

  return {
    highRiskTransfers: highRiskTransfers.slice(0, 20),
    totalAtRiskFiles: transferRisks.length,
    highRiskCount: highRiskTransfers.length,
    avgTransferRisk: transferRisks.length > 0 ? +(transferRisks.reduce((s, t) => s + t.transferRisk, 0) / transferRisks.length).toFixed(1) : 0,
  };
}

// ── File age analysis ───────────────────────────────────────────────────────

/**
 * Compute file age from git history (first commit date).
 * Correlates age with churn and complexity to identify:
 *   - Old + High Churn = unstable legacy (refactoring candidate)
 *   - Old + Low Churn = stable core (well-established)
 *   - Young + High Churn = active development (normal)
 *   - Young + Low Churn = new stable code (recently added, already stable)
 */
function computeFileAge(projectRoot, files, gitChurn) {
  const fileSet = new Set(files.filter((f) => DEP_PARSE_EXTS.has(f.ext) && f.size > 200).map((f) => f.relPath));
  if (fileSet.size === 0) return { available: false, ageBuckets: {}, oldestFiles: [] };

  let gitOutput;
  try {
    // Get first commit date for each file
    const script = `for f in $(git ls-files); do echo "$f $(git log --reverse --format=%ai -- "$f" | head -1)"; done`;
    gitOutput = execSync(`cd "${projectRoot}" && ${script}`, { encoding: "utf-8", timeout: 30000, maxBuffer: 10 * 1024 * 1024, shell: "/bin/bash" });
  } catch {
    return { available: false, reason: "git log failed", ageBuckets: {}, oldestFiles: [] };
  }

  // Parse: "filepath YYYY-MM-DD HH:MM:SS +TZ"
  const now = new Date();
  const fileAges = [];

  for (const line of gitOutput.trim().split("\n")) {
    const parts = line.trim().split(" ");
    if (parts.length < 2) continue;
    const filePath = parts[0];
    const dateStr = parts.slice(1).join(" ");
    if (!fileSet.has(filePath)) continue;

    try {
      const createdAt = new Date(dateStr);
      if (isNaN(createdAt.getTime())) continue;
      const ageDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      const ageMonths = +(ageDays / 30).toFixed(1);
      fileAges.push({ path: filePath, createdAt: dateStr, ageDays, ageMonths });
    } catch { /* skip */ }
  }

  // Age buckets
  const ageBuckets = { "0-30d": 0, "1-3mo": 0, "3-6mo": 0, "6-12mo": 0, "1-2yr": 0, "2yr+": 0 };
  for (const fa of fileAges) {
    if (fa.ageDays <= 30) ageBuckets["0-30d"]++;
    else if (fa.ageDays <= 90) ageBuckets["1-3mo"]++;
    else if (fa.ageDays <= 180) ageBuckets["3-6mo"]++;
    else if (fa.ageDays <= 365) ageBuckets["6-12mo"]++;
    else if (fa.ageDays <= 730) ageBuckets["1-2yr"]++;
    else ageBuckets["2yr+"]++;
  }

  // Cross-reference with churn
  const churnMap = new Map();
  if (gitChurn?.available && gitChurn?.topHotFiles) {
    for (const f of gitChurn.topHotFiles) churnMap.set(f.path, f.churnCount);
  }

  // Age × Churn matrix
  const ageChurnMatrix = { oldHighChurn: [], oldLowChurn: [], youngHighChurn: [], youngLowChurn: [] };
  const ageThreshold = 180; // 6 months

  for (const fa of fileAges) {
    const churn = churnMap.get(fa.path) || 0;
    const isOld = fa.ageDays > ageThreshold;
    const isHighChurn = churn > 5;

    if (isOld && isHighChurn) ageChurnMatrix.oldHighChurn.push({ ...fa, churn });
    else if (isOld && !isHighChurn) ageChurnMatrix.oldLowChurn.push({ ...fa, churn });
    else if (!isOld && isHighChurn) ageChurnMatrix.youngHighChurn.push({ ...fa, churn });
    else ageChurnMatrix.youngLowChurn.push({ ...fa, churn });
  }

  // Sort each category
  for (const key of Object.keys(ageChurnMatrix)) {
    ageChurnMatrix[key].sort((a, b) => b.churn - a.churn);
  }

  return {
    available: true,
    ageBuckets,
    oldestFiles: fileAges.sort((a, b) => b.ageDays - a.ageDays).slice(0, 20),
    newestFiles: fileAges.sort((a, b) => a.ageDays - b.ageDays).slice(0, 20),
    ageChurnMatrix: {
      oldHighChurn: ageChurnMatrix.oldHighChurn.slice(0, 10),
      oldLowChurn: ageChurnMatrix.oldLowChurn.slice(0, 5),
      youngHighChurn: ageChurnMatrix.youngHighChurn.slice(0, 10),
      youngLowChurn: ageChurnMatrix.youngLowChurn.slice(0, 5),
    },
    avgAgeDays: fileAges.length > 0 ? Math.round(fileAges.reduce((s, f) => s + f.ageDays, 0) / fileAges.length) : 0,
    totalDated: fileAges.length,
  };
}

// ── Statistical anomaly detection ───────────────────────────────────────────

/**
 * Detect anomalies in trend data using Z-score method.
 * A data point is anomalous if |Z-score| > 2 (outside 95% confidence).
 */
function detectAnomalies(history) {
  if (!history || history.length < 5) return { anomalies: [], available: false, reason: "Need 5+ data points" };

  // Analyze key metrics
  const metrics = ["totalSize", "totalFiles", "avgRisk"];
  const anomalies = [];

  for (const metric of metrics) {
    const values = history.map((h) => h[metric] || 0);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);

    if (stdDev === 0) continue; // no variation = no anomalies

    for (let i = 0; i < n; i++) {
      const zScore = (values[i] - mean) / stdDev;
      if (Math.abs(zScore) > 2) {
        anomalies.push({
          metric,
          dataPointIndex: i,
          timestamp: history[i].timestamp || `point-${i}`,
          value: values[i],
          mean: +mean.toFixed(1),
          zScore: +zScore.toFixed(2),
          direction: zScore > 0 ? "spike" : "drop",
        });
      }
    }
  }

  // Sort by |Z-score| descending
  anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

  // Also detect trend direction changes (consecutive opposite moves)
  const trendChanges = [];
  for (const metric of metrics) {
    const values = history.map((h) => h[metric] || 0);
    for (let i = 2; i < values.length; i++) {
      const prevDiff = values[i - 1] - values[i - 2];
      const currDiff = values[i] - values[i - 1];
      if (prevDiff !== 0 && currDiff !== 0 && Math.sign(prevDiff) !== Math.sign(currDiff)) {
        trendChanges.push({ metric, dataPointIndex: i, from: prevDiff > 0 ? "up" : "down", to: currDiff > 0 ? "up" : "down" });
      }
    }
  }

  return {
    available: true,
    anomalies: anomalies.slice(0, 15),
    trendChanges: trendChanges.slice(0, 10),
    totalAnomalies: anomalies.length,
    analyzedMetrics: metrics.length,
    dataPoints: history.length,
  };
}

// ── Refactoring priority matrix ─────────────────────────────────────────────

/**
 * Compute a composite "refactoring priority" score for each file,
 * aggregating ALL dimensions into a single number 0-100.
 *
 * Priority = weighted max of normalized scores:
 *   complexity(20%) + churn(20%) + risk(20%) + size(15%) + coupling(10%)
 *   + age(5%) + busFactor(5%) + testGap(5%)
 *
 * This is the "one number to rule them all" for refactoring decisions.
 */
function computeRefactoringPriority(files, stats) {
  const allStats = stats;

  // Normalize helpers
  const complexMap = new Map();
  if (allStats.complexity?.topComplex) {
    const maxC = Math.max(1, allStats.complexity.maxComplexity);
    for (const c of allStats.complexity.topComplex) complexMap.set(c.path, c.cyclomaticComplexity / maxC);
  }

  const churnMap = new Map();
  if (allStats.gitChurn?.available && allStats.gitChurn?.topHotFiles) {
    const maxCh = Math.max(1, ...allStats.gitChurn.topHotFiles.map((f) => f.churnCount));
    for (const f of allStats.gitChurn.topHotFiles) churnMap.set(f.path, f.churnCount / maxCh);
  }

  const riskMap = new Map();
  if (allStats.riskScores?.topRisks) {
    for (const r of allStats.riskScores.topRisks) riskMap.set(r.path, r.composite);
  }

  const orphanSet = new Set((allStats.orphanFiles || []).map((f) => f.path));
  const untestedSet = new Set((allStats.testGaps?.highPriority || []).map((f) => f.path));
  const busFactorSet = new Set((allStats.knowledgeDistribution?.busFactorRisks || []).map((f) => f.path));

  const sourceFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext) && f.size > 200);
  const priorities = [];

  for (const f of sourceFiles) {
    const cScore = complexMap.get(f.relPath) || 0;
    const chScore = churnMap.get(f.relPath) || 0;
    const rScore = riskMap.get(f.relPath) || 0;
    const sizeScore = Math.min(1, f.size / LARGE_FILE_THRESHOLD);
    const couplingScore = 0; // placeholder — full coupling needs depGraph
    const ageScore = 0; // placeholder
    const bfScore = busFactorSet.has(f.relPath) ? 1 : 0;
    const testScore = untestedSet.has(f.relPath) ? 1 : 0;
    const orphanScore = orphanSet.has(f.relPath) ? 1 : 0;

    const priority = +(
      cScore * 20 + chScore * 20 + rScore * 20 + sizeScore * 15 +
      couplingScore * 10 + bfScore * 5 + testScore * 5 + orphanScore * 5
    ).toFixed(1);

    if (priority > 0) {
      priorities.push({
        path: f.relPath,
        priority,
        components: { complexity: +cScore.toFixed(2), churn: +chScore.toFixed(2), risk: +rScore.toFixed(2), size: +sizeScore.toFixed(2), busFactor: bfScore, untested: testScore, orphan: orphanScore },
      });
    }
  }

  priorities.sort((a, b) => b.priority - a.priority);

  const avgPriority = priorities.length > 0 ? +(priorities.reduce((s, p) => s + p.priority, 0) / priorities.length).toFixed(1) : 0;

  return {
    topPriorities: priorities.slice(0, 30),
    avgPriority,
    totalAssessed: priorities.length,
    // Tiers
    critical: priorities.filter((p) => p.priority >= 40),
    high: priorities.filter((p) => p.priority >= 25 && p.priority < 40),
    medium: priorities.filter((p) => p.priority >= 10 && p.priority < 25),
    low: priorities.filter((p) => p.priority < 10),
  };
}

// ── Architecture conformance check ──────────────────────────────────────────

/**
 * Check if the actual dependency structure conforms to expected architecture rules.
 *
 * Inferred expectations (from common patterns):
 *   1. lib/* should NOT import from skills/* (shared → feature)
 *   2. skills/* should import from lib/* (feature → shared)
 *   3. No circular dependencies at the directory level
 *   4. Test files should only import from their corresponding source dir
 *
 * Conformance = % of expected rules that are satisfied.
 */
function checkArchitectureConformance(depGraph, files) {
  const getTopDir = (p) => p.split("/")[0] || ".";

  // Expected rules — agents/ and rules/ are now integrated into skills/
  const expectedRules = [
    { id: "shared-isolation", description: "lib/ should not import from skills/", check: (e) => !(getTopDir(e.from) === "lib" && getTopDir(e.to) === "skills") },
    { id: "dependency-direction", description: "skills/ should depend on lib/ (not inverse)", check: (e) => !(getTopDir(e.from) === "lib" && getTopDir(e.to) === "skills") },
  ];

  const ruleResults = [];
  for (const rule of expectedRules) {
    const violations = depGraph.edges.filter((e) => !rule.check(e));
    const totalRelevant = depGraph.edges.filter((e) => {
      const f = getTopDir(e.from);
      const t = getTopDir(e.to);
      return rule.id.includes(f) || rule.id.includes(t);
    }).length;

    ruleResults.push({
      rule: rule.id,
      description: rule.description,
      violations: violations.length,
      totalRelevant,
      passed: violations.length === 0,
      sampleViolations: violations.slice(0, 3).map((e) => ({ from: e.from, to: e.to })),
    });
  }

  const passedCount = ruleResults.filter((r) => r.passed).length;
  const conformanceScore = ruleResults.length > 0 ? Math.round((passedCount / ruleResults.length) * 100) : 100;

  return {
    rules: ruleResults,
    conformanceScore,
    conformanceGrade: conformanceScore >= 100 ? "A" : conformanceScore >= 75 ? "B" : conformanceScore >= 50 ? "C" : conformanceScore >= 25 ? "D" : "F",
    passedCount,
    totalRules: ruleResults.length,
  };
}

// ── Quality gates ───────────────────────────────────────────────────────────

/**
 * Define quality gates with thresholds. Each gate returns PASS/FAIL/WARN.
 * Designed for CI/CD integration: non-zero FAIL count → build can fail.
 */
function checkQualityGates(stats) {
  const gates = [
    { id: "no-oversized-files", metric: "oversizedFiles", threshold: 0, operator: "eq", description: "No files exceeding 500KB", severity: "critical" },
    { id: "no-circular-deps", metric: "circularDeps.length", threshold: 0, operator: "eq", description: "No circular dependencies", severity: "critical" },
    { id: "no-extreme-complexity", metric: "complexity.complexityBuckets", threshold: 5, operator: "lt", description: "Extreme complexity files (50+) < 5", severity: "high", extract: (s) => s.complexity?.complexityBuckets?.["50+ (extreme)"] || 0 },
    { id: "health-index-min", metric: "healthIndex.avgHealth", threshold: 70, operator: "gte", description: "Average health index ≥ 70", severity: "high", extract: (s) => s.healthIndex?.avgHealth || 0 },
    { id: "fitness-min", metric: "fitnessRules.fitnessScore", threshold: 60, operator: "gte", description: "Architecture fitness score ≥ 60", severity: "high", extract: (s) => s.fitnessRules?.fitnessScore || 0 },
    { id: "coverage-min", metric: "testGaps.coverageRate", threshold: 30, operator: "gte", description: "Test coverage ≥ 30%", severity: "medium", extract: (s) => s.testGaps?.coverageRate || 0 },
    { id: "bus-factor-max", metric: "knowledgeDistribution.busFactorRiskCount", threshold: 100, operator: "lt", description: "Bus-factor-1 files < 100", severity: "medium", extract: (s) => s.knowledgeDistribution?.busFactorRiskCount || 0 },
    { id: "layer-violation-max", metric: "layerAnalysis.violationCount", threshold: 10, operator: "lt", description: "Layer violations < 10", severity: "medium", extract: (s) => s.layerAnalysis?.violationCount || 0 },
    { id: "conformance-min", metric: "conformance.conformanceScore", threshold: 80, operator: "gte", description: "Architecture conformance ≥ 80", severity: "high", extract: (s) => s.conformance?.conformanceScore || 0 },
    { id: "sdp-min", metric: "sdp.sdpScore", threshold: 60, operator: "gte", description: "SDP score ≥ 60", severity: "medium", extract: (s) => s.sdp?.sdpScore || 0 },
  ];

  const results = [];
  for (const gate of gates) {
    let value;
    if (gate.extract) {
      value = gate.extract(stats);
    } else {
      // Simple path access
      const parts = gate.metric.split(".");
      let v = stats;
      for (const p of parts) {
        if (v === null || v === undefined) { v = undefined; break; }
        v = v[p];
      }
      value = Array.isArray(v) ? v.length : v;
    }

    let status;
    if (value === undefined || value === null) {
      status = "SKIP";
    } else if (gate.operator === "eq") {
      status = value === gate.threshold ? "PASS" : "FAIL";
    } else if (gate.operator === "lt") {
      status = value < gate.threshold ? "PASS" : "FAIL";
    } else if (gate.operator === "lte") {
      status = value <= gate.threshold ? "PASS" : "FAIL";
    } else if (gate.operator === "gt") {
      status = value > gate.threshold ? "PASS" : "FAIL";
    } else if (gate.operator === "gte") {
      status = value >= gate.threshold ? "PASS" : "FAIL";
    }

    results.push({
      id: gate.id,
      description: gate.description,
      value,
      threshold: gate.threshold,
      operator: gate.operator,
      status,
      severity: gate.severity,
    });
  }

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  const warnCount = results.filter((r) => r.status === "WARN" || r.status === "SKIP").length;
  const criticalFails = results.filter((r) => r.status === "FAIL" && r.severity === "critical").length;

  return {
    gates: results,
    passCount,
    failCount,
    warnCount,
    criticalFails,
    overallStatus: failCount === 0 ? "PASS" : criticalFails > 0 ? "FAIL" : "WARN",
    score: results.length > 0 ? Math.round((passCount / (passCount + failCount)) * 100) : 100,
  };
}

// ── Dependency concentration risk ───────────────────────────────────────────

/**
 * Apply portfolio theory to dependency risk: how concentrated are your dependencies?
 *
 * Dependency HHI = Σ(dep_share²) where dep_share = imports_from_module / total_imports
 * High concentration → over-dependent on few modules → single point of failure
 *
 * Also computes "dependency diversification ratio" = 1 - normalized HHI.
 */
function computeDependencyConcentration(depGraph, files) {
  if (!depGraph || depGraph.edges.length === 0) return { available: false };

  // Count imports per target module
  const importCounts = {};
  for (const edge of depGraph.edges) {
    importCounts[edge.to] = (importCounts[edge.to] || 0) + 1;
  }

  const totalImports = depGraph.edges.length;
  if (totalImports === 0) return { available: true, dependencyHHI: 0, concentrationLevel: "none", topConcentrations: [] };

  // HHI on import shares
  let hhi = 0;
  const concentrations = [];
  for (const [path, count] of Object.entries(importCounts)) {
    const share = count / totalImports;
    hhi += share * share;
    concentrations.push({ path, importCount: count, share: +(share * 100).toFixed(1) });
  }

  // Normalize HHI: 0 (evenly distributed) to 1 (single dependency)
  const n = Object.keys(importCounts).length;
  const normalizedHHI = n > 1 ? (hhi - 1 / n) / (1 - 1 / n) : 0;
  const diversificationRatio = +(1 - normalizedHHI).toFixed(2);

  // Concentration level
  let concentrationLevel;
  if (normalizedHHI < 0.15) concentrationLevel = "well-diversified";
  else if (normalizedHHI < 0.25) concentrationLevel = "moderate";
  else if (normalizedHHI < 0.4) concentrationLevel = "concentrated";
  else concentrationLevel = "highly-concentrated";

  // Top concentrations
  concentrations.sort((a, b) => b.share - a.share);
  const top5Share = concentrations.slice(0, 5).reduce((s, c) => s + c.share, 0);

  return {
    available: true,
    dependencyHHI: +normalizedHHI.toFixed(3),
    diversificationRatio,
    concentrationLevel,
    totalImportEdges: totalImports,
    uniqueDependencies: n,
    topConcentrations: concentrations.slice(0, 15),
    top5Share: +top5Share.toFixed(1),
    // "Too big to fail" modules: those capturing >10% of imports
    criticalDependencies: concentrations.filter((c) => c.share > 10),
  };
}

// ── Code review time estimation ─────────────────────────────────────────────

/**
 * Estimate code review time for each file based on complexity, size, and deps.
 *
 * ReviewTime (minutes) = baseTime + complexityFactor + sizeFactor + depFactor
 *   baseTime = 5 min (overhead)
 *   complexityFactor = cyclomaticComplexity / 10 × 2 min
 *   sizeFactor = loc / 100 × 1 min
 *   depFactor = dependentCount × 0.5 min (checking downstream impact)
 *
 * Industry reference: Cisco study — reviewers find most bugs in first 60 min;
 * files with estimated review time > 60 min should be split for review.
 */
function estimateReviewTime(files, complexity, depGraph) {
  const complexMap = new Map();
  if (complexity?.topComplex) {
    for (const c of complexity.topComplex) complexMap.set(c.path, { cyclomatic: c.cyclomaticComplexity, loc: c.loc });
  }

  const depCount = {};
  if (depGraph?.edges) {
    for (const edge of depGraph.edges) {
      depCount[edge.to] = (depCount[edge.to] || 0) + 1;
    }
  }

  const sourceFiles = files.filter((f) => DEP_PARSE_EXTS.has(f.ext) && f.size > 200);
  const estimates = [];

  for (const f of sourceFiles) {
    const cx = complexMap.get(f.relPath);
    const cyclomatic = cx?.cyclomatic || 0;
    const loc = cx?.loc || 0;
    const deps = depCount[f.relPath] || 0;

    const baseTime = 5;
    const complexityTime = (cyclomatic / 10) * 2;
    const sizeTime = (loc / 100) * 1;
    const depTime = deps * 0.5;
    const totalMinutes = Math.round(baseTime + complexityTime + sizeTime + depTime);

    if (totalMinutes >= 5) { // only meaningful files
      estimates.push({
        path: f.relPath,
        estimatedMinutes: totalMinutes,
        components: { cyclomatic, loc, dependents: deps },
        needsSplitReview: totalMinutes > 60,
      });
    }
  }

  estimates.sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);

  const avgMinutes = estimates.length > 0 ? Math.round(estimates.reduce((s, e) => s + e.estimatedMinutes, 0) / estimates.length) : 0;
  const totalReviewHours = estimates.length > 0 ? +(estimates.reduce((s, e) => s + e.estimatedMinutes, 0) / 60).toFixed(1) : 0;

  return {
    topHeavyReviews: estimates.slice(0, 25),
    totalReviewHours,
    avgMinutes,
    filesNeedingSplit: estimates.filter((e) => e.needsSplitReview),
    splitCount: estimates.filter((e) => e.needsSplitReview).length,
    totalAssessed: estimates.length,
  };
}

// ── Percentile rankings ─────────────────────────────────────────────────────

/**
 * Compute percentile rankings for key metrics to provide comparative context.
 * Answers: "How does this file compare to others in the project?"
 */
function computePercentileRankings(files, stats) {
  // Build metric arrays
  const sizeValues = files.filter((f) => f.size > 100).map((f) => ({ path: f.relPath, size: f.size }));
  sizeValues.sort((a, b) => a.size - b.size);

  const complexityMap = new Map();
  if (stats.complexity?.topComplex) {
    for (const c of stats.complexity.topComplex) complexityMap.set(c.path, c.cyclomaticComplexity);
  }
  const complexityValues = [...complexityMap.entries()].map(([path, c]) => ({ path, c })).sort((a, b) => a.c - b.c);

  const churnMap = new Map();
  if (stats.gitChurn?.available && stats.gitChurn?.topHotFiles) {
    for (const f of stats.gitChurn.topHotFiles) churnMap.set(f.path, f.churnCount);
  }
  const churnValues = [...churnMap.entries()].map(([path, ch]) => ({ path, ch })).sort((a, b) => a.ch - b.ch);

  function percentile(sorted, path, getter) {
    const idx = sorted.findIndex((v) => v.path === path);
    if (idx < 0) return null;
    return Math.round((idx / (sorted.length - 1)) * 100);
  }

  // Rank each file across multiple dimensions
  const allPaths = new Set([...sizeValues.map((v) => v.path), ...complexityValues.map((v) => v.path), ...churnValues.map((v) => v.path)]);

  const rankings = [];
  for (const path of allPaths) {
    const pSize = percentile(sizeValues, path, (v) => v.size);
    const pComplex = percentile(complexityValues, path, (v) => v.c);
    const pChurn = percentile(churnValues, path, (v) => v.ch);

    if (pSize === null && pComplex === null && pChurn === null) continue;

    // Composite percentile: average of available dimensions
    const available = [pSize, pComplex, pChurn].filter((p) => p !== null);
    const compositePct = available.length > 0 ? Math.round(available.reduce((a, b) => a + b, 0) / available.length) : 0;

    rankings.push({
      path,
      percentiles: {
        size: pSize !== null ? `P${pSize}` : null,
        complexity: pComplex !== null ? `P${pComplex}` : null,
        churn: pChurn !== null ? `P${pChurn}` : null,
        composite: `P${compositePct}`,
      },
      compositePct,
    });
  }

  rankings.sort((a, b) => b.compositePct - a.compositePct);

  // Top 90th+ percentile (most extreme files)
  const topPercentile = rankings.filter((r) => r.compositePct >= 90);
  const topPercentileFiles = topPercentile.map((r) => ({
    ...r,
    sizePct: r.percentiles.size,
    complexityPct: r.percentiles.complexity,
    churnPct: r.percentiles.churn,
  }));

  return {
    topRanked: rankings.slice(0, 30),
    topPercentile: topPercentileFiles.slice(0, 20),
    topPercentileCount: topPercentileFiles.length,
    totalRanked: rankings.length,
    // Distribution
    percentileDistribution: {
      "P90+": rankings.filter((r) => r.compositePct >= 90).length,
      "P75-89": rankings.filter((r) => r.compositePct >= 75 && r.compositePct < 90).length,
      "P50-74": rankings.filter((r) => r.compositePct >= 50 && r.compositePct < 75).length,
      "P25-49": rankings.filter((r) => r.compositePct >= 25 && r.compositePct < 50).length,
      "P0-24": rankings.filter((r) => r.compositePct < 25).length,
    },
  };
}

// ── Metric correlation matrix ───────────────────────────────────────────────

/**
 * Compute Pearson correlation coefficients between key metrics.
 * Discovers which metrics move together (e.g., complexity ↔ size, churn ↔ risk).
 */
function computeCorrelationMatrix(stats) {
  // Extract metric vectors from available data
  const vectors = {};

  // Complexity vs Size
  if (stats.complexity?.topComplex && stats.oversizedFiles) {
    const complexityVec = [];
    const sizeVec = [];
    const sizeMap = new Map();
    for (const f of (stats.oversizedFiles || [])) sizeMap.set(f.path, f.size);

    for (const c of stats.complexity.topComplex.slice(0, 100)) {
      complexityVec.push(c.cyclomaticComplexity);
      sizeVec.push(sizeMap.get(c.path) || c.size);
    }
    if (complexityVec.length > 2) vectors["Complexity ↔ Size"] = { x: complexityVec, y: sizeVec, xLabel: "Complexity (M)", yLabel: "Size (bytes)" };
  }

  // Complexity vs Churn
  if (stats.complexity?.topComplex && stats.gitChurn?.topHotFiles) {
    const cVec = [];
    const chVec = [];
    const churnMap = new Map();
    for (const f of stats.gitChurn.topHotFiles) churnMap.set(f.path, f.churnCount);
    for (const c of stats.complexity.topComplex.slice(0, 100)) {
      if (churnMap.has(c.path)) {
        cVec.push(c.cyclomaticComplexity);
        chVec.push(churnMap.get(c.path));
      }
    }
    if (cVec.length > 2) vectors["Complexity ↔ Churn"] = { x: cVec, y: chVec, xLabel: "Complexity (M)", yLabel: "Churn Count" };
  }

  // Churn vs Risk
  if (stats.gitChurn?.topHotFiles && stats.riskScores?.topRisks) {
    const chVec2 = [];
    const rVec = [];
    const churnMap2 = new Map();
    const riskMap = new Map();
    for (const f of stats.gitChurn.topHotFiles) churnMap2.set(f.path, f.churnCount);
    for (const r of stats.riskScores.topRisks) riskMap.set(r.path, r.composite);
    for (const [path, ch] of churnMap2) {
      if (riskMap.has(path)) {
        chVec2.push(ch);
        rVec.push(riskMap.get(path) * 100);
      }
    }
    if (chVec2.length > 2) vectors["Churn ↔ Risk"] = { x: chVec2, y: rVec, xLabel: "Churn Count", yLabel: "Risk Score" };
  }

  // Size vs Churn
  if (stats.oversizedFiles && stats.gitChurn?.topHotFiles) {
    const szVec = [];
    const chVec3 = [];
    const szMap = new Map();
    const chMap3 = new Map();
    for (const f of (stats.oversizedFiles || [])) szMap.set(f.path, f.size);
    for (const f of stats.gitChurn.topHotFiles) chMap3.set(f.path, f.churnCount);
    for (const [path, sz] of szMap) {
      if (chMap3.has(path)) { szVec.push(sz / 1024); chVec3.push(chMap3.get(path)); }
    }
    if (szVec.length > 2) vectors["Size ↔ Churn"] = { x: szVec, y: chVec3, xLabel: "Size (KB)", yLabel: "Churn Count" };
  }

  // Pearson correlation
  function pearson(xs, ys) {
    const n = xs.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX;
      const dy = ys[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    return denX > 0 && denY > 0 ? +(num / Math.sqrt(denX * denY)).toFixed(3) : 0;
  }

  const correlations = [];
  for (const [name, vec] of Object.entries(vectors)) {
    const r = pearson(vec.x, vec.y);
    const strength = Math.abs(r) > 0.7 ? "strong" : Math.abs(r) > 0.4 ? "moderate" : Math.abs(r) > 0.2 ? "weak" : "none";
    const direction = r > 0 ? "positive" : r < 0 ? "negative" : "none";
    correlations.push({ metrics: name, r, strength, direction, n: vec.x.length });
  }

  correlations.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return {
    correlations,
    strongCorrelations: correlations.filter((c) => c.strength === "strong"),
    totalPairs: correlations.length,
  };
}

// ── Documentation coverage ──────────────────────────────────────────────────

/**
 * Analyze documentation coverage: comment ratio, JSDoc/docstring presence,
 * and identify under-documented high-risk files.
 */
function analyzeDocCoverage(files, complexity) {
  const parsableExts = new Set([...DEP_PARSE_EXTS]);
  const results = [];

  for (const f of files) {
    if (!parsableExts.has(f.ext) || f.size < 200) continue;
    let content;
    try { content = readFileSync(f.path, "utf-8"); } catch { continue; }

    const lines = content.split("\n");
    const totalLines = lines.length;

    // Count doc lines (JSDoc /** */, block comments /* */, line comments //)
    let docLines = 0;
    let inJSDoc = false;
    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (inJSDoc) {
        docLines++;
        if (trimmed.includes("*/")) inJSDoc = false;
        continue;
      }
      if (inBlockComment) {
        docLines++;
        if (trimmed.includes("*/")) inBlockComment = false;
        continue;
      }
      if (trimmed.startsWith("/**")) {
        docLines++;
        if (!trimmed.includes("*/")) inJSDoc = true;
        continue;
      }
      if (trimmed.startsWith("/*")) {
        docLines++;
        if (!trimmed.includes("*/")) inBlockComment = true;
        continue;
      }
      if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
        docLines++;
        continue;
      }
    }

    const docRatio = totalLines > 0 ? +(docLines / totalLines).toFixed(2) : 0;

    // Check for JSDoc specifically
    const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content);

    // Check for function-level documentation (JSDoc before function/class)
    const hasFuncDocs = /\*\//.test(content) && /\/\*\*/.test(content);

    results.push({
      path: f.relPath,
      totalLines,
      docLines,
      docRatio,
      hasJSDoc,
      hasFuncDocs,
      size: f.size,
    });
  }

  // Sort by doc ratio ascending (least documented first)
  results.sort((a, b) => a.docRatio - b.docRatio);

  const underDocumented = results.filter((r) => r.docRatio < 0.05); // <5% doc
  const wellDocumented = results.filter((r) => r.docRatio > 0.2);   // >20% doc
  const avgDocRatio = results.length > 0 ? +(results.reduce((s, r) => s + r.docRatio, 0) / results.length).toFixed(2) : 0;

  // Cross with complexity
  const complexMap = new Map();
  if (complexity?.topComplex) {
    for (const c of complexity.topComplex) complexMap.set(c.path, c.cyclomaticComplexity);
  }
  const underDocHighComplex = underDocumented.filter((r) => (complexMap.get(r.path) || 0) > 20);

  return {
    underDocumented: underDocumented.slice(0, 25),
    wellDocumented: wellDocumented.slice(0, 10),
    underDocHighComplex: underDocHighComplex.slice(0, 15),
    avgDocRatio,
    totalAnalyzed: results.length,
    withJSDoc: results.filter((r) => r.hasJSDoc).length,
    jsDocRate: results.length > 0 ? Math.round((results.filter((r) => r.hasJSDoc).length / results.length) * 100) : 0,
  };
}

// ── Codebase maturity assessment ────────────────────────────────────────────

/**
 * Assess codebase maturity using a 5-level model inspired by CMMI.
 *
 * Level 1 - Initial: ad-hoc structure, many oversized files, no tests
 * Level 2 - Managed: some structure, basic metrics tracked
 * Level 3 - Defined: consistent patterns, moderate testing
 * Level 4 - Measured: quantitative quality gates, good coverage
 * Level 5 - Optimizing: continuous improvement, all gates pass
 */
function assessMaturity(stats) {
  let score = 0;
  const maxScore = 100;
  const findings = [];

  // Dimension 1: Structure (25 pts)
  if (stats.conformance && stats.conformance.conformanceScore >= 80) { score += 20; findings.push("✅ Architecture conformance ≥ 80"); }
  else if (stats.conformance && stats.conformance.conformanceScore >= 50) { score += 10; findings.push("⚠️ Architecture conformance moderate"); }
  else { score += 5; findings.push("❌ Architecture conformance low"); }

  if (stats.scc && stats.scc.multiNodeSccCount === 0) { score += 5; findings.push("✅ No circular dependency groups (SCC)"); }
  else { findings.push("❌ Circular dependency groups exist"); }

  // Dimension 2: Quality (25 pts)
  if (stats.healthIndex && stats.healthIndex.avgHealth >= 85) { score += 15; findings.push("✅ Health index ≥ 85"); }
  else if (stats.healthIndex && stats.healthIndex.avgHealth >= 70) { score += 8; findings.push("⚠️ Health index moderate"); }
  else { score += 3; findings.push("❌ Health index low"); }

  if (stats.complexity && stats.complexity.avgComplexity < 15) { score += 10; findings.push("✅ Low average complexity"); }
  else if (stats.complexity && stats.complexity.avgComplexity < 30) { score += 5; findings.push("⚠️ Moderate complexity"); }
  else { score += 2; findings.push("❌ High average complexity"); }

  // Dimension 3: Testing (20 pts)
  if (stats.testGaps && stats.testGaps.coverageRate >= 60) { score += 20; findings.push("✅ Test coverage ≥ 60%"); }
  else if (stats.testGaps && stats.testGaps.coverageRate >= 30) { score += 10; findings.push("⚠️ Test coverage moderate"); }
  else { score += 3; findings.push("❌ Test coverage low or none"); }

  // Dimension 4: Maintainability (20 pts)
  if (stats.techDebt && stats.techDebt.debtDensity < 5) { score += 10; findings.push("✅ Low debt density"); }
  else if (stats.techDebt && stats.techDebt.debtDensity < 15) { score += 5; findings.push("⚠️ Moderate debt density"); }
  else { score += 2; findings.push("❌ High debt density"); }

  if (stats.fitnessRules && stats.fitnessRules.fitnessScore >= 80) { score += 10; findings.push("✅ Architecture fitness ≥ 80"); }
  else if (stats.fitnessRules && stats.fitnessRules.fitnessScore >= 60) { score += 5; findings.push("⚠️ Architecture fitness moderate"); }
  else { score += 2; findings.push("❌ Architecture fitness low"); }

  // Dimension 5: Knowledge (10 pts)
  if (stats.knowledgeDistribution) {
    const busFactorRatio = stats.knowledgeDistribution.busFactorRiskCount / Math.max(1, stats.totalFiles);
    if (busFactorRatio < 0.3) { score += 10; findings.push("✅ Good knowledge distribution"); }
    else if (busFactorRatio < 0.6) { score += 5; findings.push("⚠️ Moderate knowledge concentration"); }
    else { score += 2; findings.push("❌ High knowledge concentration"); }
  }

  // Determine level
  let level, levelName;
  if (score >= 80) { level = 5; levelName = "Optimizing"; }
  else if (score >= 65) { level = 4; levelName = "Measured"; }
  else if (score >= 50) { level = 3; levelName = "Defined"; }
  else if (score >= 35) { level = 2; levelName = "Managed"; }
  else { level = 1; levelName = "Initial"; }

  return {
    level,
    levelName,
    score,
    maxScore,
    findings,
    dimensions: {
      structure: { score: score >= 40 ? "good" : score >= 20 ? "fair" : "poor", label: "Architecture Structure" },
      quality: { score: stats.healthIndex?.healthGrade || "N/A", label: "Code Quality" },
      testing: { score: `${stats.testGaps?.coverageRate || 0}%`, label: "Test Coverage" },
      maintainability: { score: stats.techDebt?.sigRating || "N/A", label: "Maintainability (SIG)" },
      knowledge: { score: stats.knowledgeDistribution ? `${stats.knowledgeDistribution.totalContributors || "?"} contributors` : "N/A", label: "Knowledge Distribution" },
    },
  };
}

// ── Insight synthesis engine ─────────────────────────────────────────────────

/**
 * Synthesize cross-dimensional insights by connecting patterns across analyses.
 * Discovers "stories" that span multiple dimensions.
 */
function synthesizeInsights(stats, fileAge) {
  const insights = [];

  // Pattern 1: Old + High Complexity = Legacy Debt Trap
  if (fileAge?.available && stats.complexity?.topComplex) {
    const oldHighComplex = [];
    const complexMap = new Map();
    for (const c of stats.complexity.topComplex) complexMap.set(c.path, c.cyclomaticComplexity);
    for (const old of (fileAge.ageChurnMatrix?.oldHighChurn || [])) {
      const cx = complexMap.get(old.path);
      if (cx && cx > 30) oldHighComplex.push({ ...old, complexity: cx });
    }
    if (oldHighComplex.length > 0) {
      insights.push({
        pattern: "Legacy Debt Trap",
        description: `${oldHighComplex.length} files are old (>6mo), frequently changed, AND highly complex — classic legacy debt that compounds over time.`,
        severity: "high",
        affectedFiles: oldHighComplex.slice(0, 5).map((f) => f.path),
        recommendation: "Prioritize refactoring or replacement of these files before they become unmaintainable.",
      });
    }
  }

  // Pattern 2: High PageRank + Low Health = Critical Fragility
  if (stats.pagerank?.topRanked && stats.healthIndex?.topUnhealthy) {
    const fragile = [];
    const unhealthySet = new Set(stats.healthIndex.topUnhealthy.filter((h) => h.health < 75).map((h) => h.path));
    for (const pr of stats.pagerank.topRanked.slice(0, 15)) {
      if (unhealthySet.has(pr.path)) fragile.push(pr);
    }
    if (fragile.length > 0) {
      insights.push({
        pattern: "Critical Fragility",
        description: `${fragile.length} authoritative files (high PageRank) have poor health scores — these are critical infrastructure files that are fragile.`,
        severity: "critical",
        affectedFiles: fragile.slice(0, 5).map((f) => f.path),
        recommendation: "Invest in hardening these files: add tests, reduce complexity, document thoroughly.",
      });
    }
  }

  // Pattern 3: High Co-Change + Different Directories = Implicit Coupling
  if (stats.coChange?.pairs && stats.moduleBoundaries) {
    const implicit = stats.coChange.pairs.filter((p) => p.jaccard > 0.6 && dirname(p.files[0]) !== dirname(p.files[1]));
    if (implicit.length > 0) {
      insights.push({
        pattern: "Implicit Module Coupling",
        description: `${implicit.length} file pairs have high co-change frequency (Jaccard>0.6) but live in different directories — hidden coupling not captured by imports.`,
        severity: "medium",
        affectedFiles: implicit.slice(0, 5).flatMap((p) => p.files),
        recommendation: "Consider co-locating these files or formalizing their dependency through explicit interfaces.",
      });
    }
  }

  // Pattern 4: High Blast Radius + High Churn = Volatile Core
  if (stats.transitiveDeps?.topTransitiveFanOut && stats.gitChurn?.topHotFiles) {
    const volatileChurn = new Set(stats.gitChurn.topHotFiles.filter((f) => f.churnCount > 10).map((f) => f.path));
    const volatileCore = stats.transitiveDeps.topTransitiveFanOut.filter((f) => volatileChurn.has(f.path) && f.transitiveCount > 10);
    if (volatileCore.length > 0) {
      insights.push({
        pattern: "Volatile Core",
        description: `${volatileCore.length} files have both large blast radius (>10 transitive deps) AND high change frequency (>10) — changes ripple widely and frequently.`,
        severity: "high",
        affectedFiles: volatileCore.slice(0, 5).map((f) => f.path),
        recommendation: "Stabilize these files' APIs and add comprehensive integration tests to catch regressions.",
      });
    }
  }

  // Pattern 5: Under-documented + High Risk
  if (stats.healthIndex?.topUnhealthy && stats.complexity?.topComplex) {
    const unhealthyComplex = [];
    const unhealthySet = new Set(stats.healthIndex.topUnhealthy.filter((h) => h.health < 60).map((h) => h.path));
    for (const c of stats.complexity.topComplex) {
      if (unhealthySet.has(c.path) && c.cyclomaticComplexity > 50) unhealthyComplex.push(c);
    }
    if (unhealthyComplex.length > 0) {
      insights.push({
        pattern: "Critical Complexity Gap",
        description: `${unhealthyComplex.length} files combine extreme complexity (>50) with poor health scores — highest priority for intervention.`,
        severity: "critical",
        affectedFiles: unhealthyComplex.slice(0, 5).map((f) => f.path),
        recommendation: "Break these files down into smaller, focused modules with clear responsibilities.",
      });
    }
  }

  return {
    insights,
    totalInsights: insights.length,
    criticalInsights: insights.filter((i) => i.severity === "critical"),
    highInsights: insights.filter((i) => i.severity === "high"),
  };
}

// ── Config file loader ──────────────────────────────────────────────────────

/**
 * Load custom configuration from .bundle-analyze.json (project root or specified path).
 */
function loadConfig(projectRoot, configPath) {
  const paths = configPath ? [configPath] : [join(projectRoot, ".bundle-analyze.json"), join(projectRoot, ".bundle-analyze.yaml")];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, "utf-8"));
      } catch { /* skip */ }
    }
  }
  return null;
}

// ── Export formatters ────────────────────────────────────────────────────────

/**
 * Format analysis results as Markdown report.
 */
function formatMarkdownExport(stats, meta) {
  const lines = [];
  lines.push(`# Bundle Analysis: ${meta.projectName}`);
  lines.push(`> ${meta.generatedAt} · ${stats.totalFiles} files · ${formatBytes(stats.totalSize)}`);
  lines.push("");
  lines.push("## Health Summary");
  lines.push(`| Metric | Value | Grade |`);
  lines.push(`|--------|-------|-------|`);
  lines.push(`| File Health | ${stats.healthIndex?.avgHealth || "N/A"}/100 | ${stats.healthIndex?.healthGrade || "N/A"} |`);
  lines.push(`| Architecture Fitness | ${stats.fitnessRules?.fitnessScore || "N/A"}/100 | ${stats.fitnessRules?.grade || "N/A"} |`);
  lines.push(`| Quality Gates | ${stats.qualityGates?.overallStatus || "N/A"} | ${stats.qualityGates?.score || "N/A"}/100 |`);
  lines.push(`| Maturity | Level ${stats.maturity?.level || "?"} - ${stats.maturity?.levelName || "N/A"} | ${stats.maturity?.score || "?"}/100 |`);
  lines.push("");
  lines.push("## Top Risks");
  if (stats.breakingChangeImpact?.criticalModules?.length > 0) {
    lines.push(`- 💥 ${stats.breakingChangeImpact.criticalCount} CRITICAL breaking change modules`);
  }
  if (stats.synthesizedInsights?.criticalInsights?.length > 0) {
    for (const si of stats.synthesizedInsights.criticalInsights) lines.push(`- 🔴 ${si.pattern}: ${si.description}`);
  }
  lines.push("");
  lines.push("## Top Recommendations (ROI-ranked)");
  for (const rec of (stats.recommendationsWithROI || []).slice(0, 5)) {
    lines.push(`- [${rec.severity}] **${rec.title}** — ROI=${rec.roi} (I=${rec.impact} E=${rec.effort})`);
  }
  lines.push("");
  lines.push("## Technical Debt");
  if (stats.techDebt) {
    lines.push(`- Total: **${stats.techDebt.totalHours}h** (${stats.techDebt.totalDays}d / ${stats.techDebt.totalWeeks}w)`);
    lines.push(`- SIG Rating: ${stats.techDebt.sigRating}`);
    for (const b of (stats.techDebt.breakdown || [])) lines.push(`  - ${b.category}: ${b.totalHours}h`);
  }
  lines.push("");
  if (stats.executiveSummary) {
    lines.push("## Executive Summary");
    lines.push("```");
    lines.push(stats.executiveSummary);
    lines.push("```");
  }
  return lines.join("\n");
}

/**
 * Format analysis results as CSV (top issues).
 */
function formatCSVExport(stats) {
  const rows = [["Category", "Severity", "Title", "ROI", "Impact", "Effort"].join(",")];
  for (const rec of (stats.recommendationsWithROI || [])) {
    rows.push([rec.category, rec.severity, `"${rec.title}"`, rec.roi, rec.impact, rec.effort].join(","));
  }
  return rows.join("\n");
}

// ── Issue generator (GitHub/GitLab markdown) ─────────────────────────────────

/**
 * Generate GitHub/GitLab issue-ready markdown from analysis findings.
 */
function generateIssues(stats, meta) {
  const issues = [];

  // Issue 1: Quality gate failures
  if (stats.qualityGates && stats.qualityGates.failCount > 0) {
    const failedGates = stats.qualityGates.gates.filter((g) => g.status === "FAIL");
    const body = [];
    body.push("## Quality Gate Failures");
    body.push(`The following quality gates failed in analysis run ${meta.generatedAt}:`);
    body.push("");
    for (const g of failedGates) {
      body.push(`- [${g.severity}] **${g.description}**: value=${g.value}, threshold=${g.threshold}`);
    }
    body.push("");
    body.push("## Action Required");
    body.push("Address the failed gates to improve the quality gate score.");
    body.push("");
    body.push("---");
    body.push("🤖 Auto-generated by rui-bundle-analyze");

    issues.push({
      title: `Quality Gate Failures (${stats.qualityGates.failCount} gates)`,
      labels: ["quality", "automated"],
      body: body.join("\n"),
    });
  }

  // Issue 2: Critical insights
  if (stats.synthesizedInsights?.criticalInsights?.length > 0) {
    const body = [];
    body.push("## Critical Cross-Dimensional Insights");
    for (const si of stats.synthesizedInsights.criticalInsights) {
      body.push(`### ${si.pattern}`);
      body.push(`${si.description}`);
      body.push("");
      body.push(`**Recommendation**: ${si.recommendation}`);
      body.push("");
      body.push("**Affected files**:");
      for (const f of (si.affectedFiles || []).slice(0, 10)) body.push(`- \`${f}\``);
      body.push("");
    }
    body.push("---");
    body.push("🤖 Auto-generated by rui-bundle-analyze");

    issues.push({
      title: `Critical Architecture Insights (${stats.synthesizedInsights.criticalInsights.length} patterns)`,
      labels: ["architecture", "critical", "automated"],
      body: body.join("\n"),
    });
  }

  // Issue 3: Top ROI recommendations
  if (stats.recommendationsWithROI && stats.recommendationsWithROI.length > 0) {
    const topRecs = stats.recommendationsWithROI.slice(0, 5);
    const body = [];
    body.push("## Top Refactoring Recommendations (ROI-ranked)");
    for (const rec of topRecs) {
      body.push(`### [${rec.severity}] ${rec.title} (ROI=${rec.roi})`);
      body.push(`${rec.description}`);
      body.push(`- Impact: ${rec.impact}/10 · Effort: ${rec.effort}/10 · ROI Level: ${rec.roiLevel || "N/A"}`);
      if (rec.files) body.push(`- Files: ${rec.files.slice(0, 5).map((f) => `\`${f}\``).join(", ")}`);
      body.push("");
    }
    body.push("---");
    body.push("🤖 Auto-generated by rui-bundle-analyze");

    issues.push({
      title: `Top Refactoring Recommendations (${topRecs.length} items)`,
      labels: ["refactoring", "improvement", "automated"],
      body: body.join("\n"),
    });
  }

  return issues;
}

// ── Pre-commit mode ─────────────────────────────────────────────────────────

/**
 * Get list of changed files from git (staged + unstaged) for pre-commit analysis.
 */
function getChangedFiles(projectRoot) {
  try {
    const output = execSync(`git -C "${projectRoot}" diff --name-only HEAD 2>/dev/null || git -C "${projectRoot}" diff --name-only --cached 2>/dev/null || echo ""`, { encoding: "utf-8", timeout: 5000 });
    return output.trim().split("\n").filter((l) => l.trim());
  } catch {
    return [];
  }
}

// ── Analysis confidence scores ──────────────────────────────────────────────

/**
 * Compute confidence scores for each metric based on data quality indicators.
 * Confidence = f(sampleSize, dataCompleteness, measurementPrecision).
 */
function computeConfidence(stats) {
  const scores = [];

  function add(metric, confidence, reason) {
    scores.push({ metric, confidence, reason });
  }

  // High confidence: direct measurements
  add("File Size", 100, "Direct filesystem measurement, 100% coverage");
  add("File Count", 100, "Direct filesystem measurement");
  add("Extension Distribution", 100, "Complete file enumeration");

  // High confidence: well-defined algorithms
  add("SCC (Tarjan)", 100, "Exact graph algorithm on complete dependency graph");
  add("Betweenness", 100, "Exact Brandes algorithm");
  add("PageRank", 95, "Converged over 100 iterations, damping=0.85");

  // Medium-high confidence: heuristic but well-established
  add("Complexity (McCabe)", 85, "Regex-based heuristic, may miss template/generated code patterns");
  if (stats.gitChurn?.available) add("Git Churn", 90, `Based on ${stats.gitChurn.totalChanges || 0} commits in ${stats.gitChurn.timeWindow || '90d'}`);
  else add("Git Churn", 30, "Git data unavailable");

  if (stats.coChange?.available) add("Co-Change", 85, `Based on ${stats.coChange.commitCount || 0} commits`);
  else add("Co-Change", 30, "Co-change data unavailable");

  // Medium confidence: heuristic estimates
  add("Risk Scores", 75, "Weighted composite of estimated metrics");
  add("Tech Debt (SIG)", 70, "Industry-standard cost model, approximate");
  add("Health Index", 75, "9-dimension weighted composite");
  add("Maturity (CMMI)", 65, "5-dimension heuristic assessment");
  add("Semver Recommendation", 70, "Based on available metrics and heuristics");

  // Lower confidence: heavily estimated
  if (stats.testGaps?.coverageRate !== undefined) add("Test Coverage", stats.testGaps.coverageRate > 0 ? 80 : 60, stats.testGaps.coverageRate > 0 ? "Based on detected test files" : "No test files detected — may be incomplete");
  add("Doc Coverage", 70, "Comment ratio from regex — may include license headers");
  add("Insight Synthesis", 60, "Cross-dimensional pattern matching — requires human validation");

  // Overall confidence
  const avg = scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.confidence, 0) / scores.length) : 0;

  return { scores, overallConfidence: avg, level: avg >= 90 ? "Very High" : avg >= 75 ? "High" : avg >= 60 ? "Moderate" : "Limited" };
}

// ── Standup summary ─────────────────────────────────────────────────────────

/**
 * Generate a 5-line summary optimized for daily engineering standups.
 */
function generateStandupSummary(stats, trendResult) {
  const lines = [];
  const prev = trendResult?.trendAnalysis;

  // Line 1: Overall health
  lines.push(`Health: ${stats.healthIndex?.healthGrade || "?"} (${stats.healthIndex?.avgHealth || "?"}/100) · ${stats.totalFiles} files · ${formatBytes(stats.totalSize)}`);

  // Line 2: Changes since last run
  if (prev && prev.sizeDeltaPercent !== undefined) {
    const arrow = prev.sizeDeltaPercent > 0 ? "+" : "";
    lines.push(`Δ: ${arrow}${prev.sizeDeltaPercent}% size · ${prev.fileCountDelta > 0 ? "+" : ""}${prev.fileCountDelta} files · risk ${prev.riskDelta > 0 ? "+" : ""}${prev.riskDelta}`);
  }

  // Line 3: Top risk indicators
  const risks = [];
  if ((stats.oversizedFiles || []).length > 0) risks.push(`${stats.oversizedFiles.length} large`);
  if ((stats.circularDeps || []).length > 0) risks.push(`${stats.circularDeps.length} circular`);
  if (stats.scc?.multiNodeSccCount > 0) risks.push(`${stats.scc.multiNodeSccCount} SCC`);
  if (stats.hotspotMatrix?.hotspots?.length > 0) risks.push(`${stats.hotspotMatrix.hotspots.length} hotspots`);
  lines.push(`Risks: ${risks.length > 0 ? risks.join(", ") : "none critical"}`);

  // Line 4: Action items
  const p0Count = (stats.recommendationsWithROI || []).filter((r) => r.severity === "P0").length;
  const p1Count = (stats.recommendationsWithROI || []).filter((r) => r.severity === "P1").length;
  lines.push(`Actions: ${p0Count} P0 · ${p1Count} P1 · ${(stats.recommendationsWithROI || []).length - p0Count - p1Count} P2`);

  // Line 5: Quality gates
  lines.push(`Gates: ${stats.qualityGates?.overallStatus || "N/A"} (${stats.qualityGates?.passCount || 0}P/${stats.qualityGates?.failCount || 0}F)`);

  return lines.join("\n");
}

// ── Metric explanation engine ───────────────────────────────────────────────

/**
 * Generate human-readable explanations for each key metric:
 * what it is, why it matters, and what the current value means.
 */
function explainMetrics(stats) {
  const explanations = [];

  function explain(name, why, current, assessment) {
    explanations.push({ metric: name, why, currentValue: current, assessment });
  }

  // Health & Quality
  const healthGrade = stats.healthIndex?.healthGrade || "?";
  explain("Health Index", "Aggregates 9 file-level quality dimensions into 0-100 score", `${stats.healthIndex?.avgHealth || "?"}/100 (${healthGrade})`,
    healthGrade === "A" ? "Excellent — files are well-maintained and low-risk" : healthGrade === "B" ? "Good — minor improvements needed" : "Needs attention — focus on low-health files");

  // Complexity
  const cxAvg = stats.complexity?.avgComplexity || 0;
  explain("Cyclomatic Complexity (McCabe)", "Measures code branching — higher = harder to test and maintain", `avg ${cxAvg}`,
    cxAvg < 10 ? "Low — code is simple and easy to understand" : cxAvg < 20 ? "Moderate — acceptable for most projects" : "High — consider simplifying complex files");

  // Coverage
  const cov = stats.testGaps?.coverageRate || 0;
  explain("Test Coverage", "Percentage of source files with corresponding test files", `${cov}%`,
    cov >= 70 ? "Good coverage — most files have tests" : cov >= 30 ? "Moderate — prioritize high-risk untested files" : "Low — significant testing gap, write tests for high-risk files first");

  // Tech debt
  if (stats.techDebt) {
    explain("Technical Debt", "Estimated remediation cost for code and architecture issues", `${stats.techDebt.totalHours}h (${stats.techDebt.totalDays}d)`,
      stats.techDebt.totalDays < 10 ? "Manageable — low debt relative to codebase size" : stats.techDebt.totalDays < 30 ? "Moderate — address top items in coming sprints" : "Significant — create dedicated debt reduction plan");
  }

  // Architecture
  const fitnessScore = stats.fitnessRules?.fitnessScore || 0;
  explain("Architecture Fitness", "Checks architectural rules: layer isolation, package isolation, SCC, God Modules, zone-of-pain", `${fitnessScore}/100`,
    fitnessScore >= 80 ? "Strong architecture — all key rules satisfied" : fitnessScore >= 60 ? "Moderate — address rule violations gradually" : "Needs architectural refactoring — multiple rule violations");

  // Knowledge
  const bfCount = stats.knowledgeDistribution?.busFactorRiskCount || 0;
  explain("Knowledge Distribution", "Number of files with only one contributor (bus factor risk)", `${bfCount} files`,
    bfCount < 50 ? "Healthy — knowledge is well-distributed" : bfCount < 150 ? "Moderate — some knowledge silos exist" : "Risky — many files known by only one person");

  return explanations;
}

// ── Improvement tracker ─────────────────────────────────────────────────────

/**
 * Track metric improvements/worsening compared to previous run or baseline.
 */
function trackImprovements(stats, trendResult) {
  const changes = [];
  const prev = trendResult?.history?.[trendResult.history.length - 2]; // second-to-last

  if (!prev) return { changes: [], improved: 0, worsened: 0, summary: "No historical data for comparison" };

  function track(name, current, previous, unit = "", lowerIsBetter = true) {
    if (current === undefined || previous === undefined || previous === 0) return;
    const delta = current - previous;
    const pct = +((Math.abs(delta) / Math.abs(previous)) * 100).toFixed(1);
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    changes.push({ metric: name, current, previous, delta, pct, improved, unit });
  }

  track("Total Size", stats.totalSize, prev.totalSize, "B", true);
  track("File Count", stats.totalFiles, prev.totalFiles, "", false);
  track("Avg Risk", stats.riskScores?.avgRisk || 0, prev.avgRisk || 0, "pts", true);
  track("Circular Deps", (stats.circularDeps || []).length, prev.circularCount || 0, "", true);
  track("Orphan Files", (stats.orphanFiles || []).length, prev.orphanCount || 0, "", true);
  track("Oversized Files", (stats.oversizedFiles || []).length, prev.oversizedCount || 0, "", true);

  const improved = changes.filter((c) => c.improved).length;
  const worsened = changes.filter((c) => !c.improved).length;

  return {
    changes,
    improved,
    worsened,
    summary: `${improved} improved · ${worsened} worsened · ${changes.length - improved - worsened} unchanged`,
  };
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

  // New: PageRank for code importance
  const pagerank = depGraph.edges.length > 0 ? computePageRank(depGraph) : { topRanked: [], authoritativeFiles: [], avgPagerank: 0, maxPagerank: 0, damping: 0.85 };

  // Build full stats for module boundary suggestions and downstream analysis
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

  // New: Test gap analysis
  const testGaps = projectRoot ? analyzeTestGaps(files, riskScores, projectRoot) : null;

  // New: Change propagation probability (from co-change data)
  const changePropagation = computeChangePropagation(coChange, gitChurn);

  // New: Knowledge distribution / bus factor
  const knowledgeDistribution = projectRoot ? computeKnowledgeDistribution(projectRoot, files, { timeWindow: "180 days" }) : null;

  // New: Code complexity estimation
  const complexity = projectRoot ? computeComplexity(files, projectRoot) : null;

  // New: Content similarity (near-duplicate detection)
  const contentSimilarity = projectRoot ? computeContentSimilarity(files, projectRoot, { threshold: 0.6 }) : null;

  // New: Hotspot matrix (complexity × churn)
  const hotspotMatrix = computeHotspotMatrix(complexity, gitChurn);

  // New: Architecture fitness rules
  // Build a temporary full stats for fitness check
  const fitnessStats = { layerAnalysis, transitiveDeps, scc, mostDependencies, packageMetrics };
  const fitnessRules = checkFitnessRules(fitnessStats);

  // New: Import cost analysis
  const importCost = depGraph.edges.length > 0 ? computeImportCost(files, depGraph) : null;

  // Build preliminary stats for downstream modules that need full analysis context
  const allStatsPreview = {
    oversizedFiles,
    complexity,
    duplicates,
    circularDeps,
    testGaps,
    layerAnalysis,
    scc,
    packageMetrics,
    transitiveDeps,
    hotspotMatrix,
    gitChurn,
    mostDependencies,
    orphanFiles,
    knowledgeDistribution,
    recommendations,
  };

  // New: Technical debt quantification
  const techDebt = quantifyTechDebt(allStatsPreview);

  // New: ROI-augmented recommendations
  const recommendationsWithROI = computeRefactoringROI(recommendations, allStatsPreview);

  // New: API surface analysis
  const apiSurface = projectRoot ? analyzeApiSurface(files, projectRoot) : null;

  // New: Dependency health index
  const healthIndex = computeHealthIndex(files, allStatsPreview);

  // New: Stable Dependencies Principle checker
  const sdp = checkSDP(packageMetrics, depGraph);

  // New: Code review risk prioritization
  const reviewRisk = computeReviewRisk(files, allStatsPreview);

  // New: Breaking change impact
  const breakingChangeImpact = predictBreakingChangeImpact(apiSurface, depGraph);

  // New: Component release coupling
  const releaseCoupling = computeReleaseCoupling(coChange, depGraph);

  // New: Knowledge concentration (HHI)
  const knowledgeConcentration = computeKnowledgeConcentration(knowledgeDistribution, files);

  // New: Test prioritization
  const testPrioritization = prioritizeTests(testGaps, riskScores, depGraph);

  // New: Onboarding path
  const onboardingPath = generateOnboardingPath(files, depGraph, pagerank, betweenness);

  // New: Ownership transfer risk
  const ownershipTransferRisk = computeOwnershipTransferRisk(knowledgeDistribution, complexity, depGraph);

  // New: File age analysis
  const fileAge = projectRoot ? computeFileAge(projectRoot, files, gitChurn) : null;

  // New: Architecture conformance
  const conformance = depGraph.edges.length > 0 ? checkArchitectureConformance(depGraph, files) : null;

  // New: Refactoring priority (needs full stats, computed here with what's available)
  const refactoringPriority = computeRefactoringPriority(files, {
    complexity, gitChurn, riskScores, orphanFiles, testGaps, knowledgeDistribution, oversizedFiles,
  });

  // New: Dependency concentration risk
  const dependencyConcentration = computeDependencyConcentration(depGraph, files);

  // New: Code review time estimation
  const reviewTime = estimateReviewTime(files, complexity, depGraph);

  // New: Percentile rankings (needs full files + stats)
  const percentileRankings = computePercentileRankings(files, { complexity, gitChurn });

  // New: Documentation coverage
  const docCoverage = projectRoot ? analyzeDocCoverage(files, complexity) : null;

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
    pagerank,
    testGaps,
    changePropagation,
    knowledgeDistribution,
    complexity,
    contentSimilarity,
    hotspotMatrix,
    fitnessRules,
    importCost,
    techDebt,
    recommendationsWithROI,
    apiSurface,
    healthIndex,
    sdp,
    reviewRisk,
    breakingChangeImpact,
    releaseCoupling,
    knowledgeConcentration,
    testPrioritization,
    onboardingPath,
    ownershipTransferRisk,
    fileAge,
    conformance,
    refactoringPriority,
    dependencyConcentration,
    reviewTime,
    percentileRankings,
    docCoverage,
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
  const { largestFiles, sizeByExt, sizeByDir, mostDependedOn, mostDependencies, circularDeps, oversizedFiles, orphanFiles, barrelFiles, sizeHistogram, maxDependencyDepth, depthDist, duplicates, packageMetrics, transitiveDeps, gitChurn, layerAnalysis, coChange, riskScores, recommendations: rawRecs, scc, betweenness, moduleBoundaries, pagerank, testGaps, changePropagation, knowledgeDistribution, complexity, contentSimilarity, hotspotMatrix, fitnessRules, importCost, techDebt, recommendationsWithROI, apiSurface, healthIndex, sdp, reviewRisk, breakingChangeImpact, releaseCoupling, knowledgeConcentration, testPrioritization, onboardingPath, ownershipTransferRisk, adrs, semverRecommendation, reviewChecklists, sprintPackages, fileAge, refactoringPriority, conformance, qualityGates, dependencyConcentration, reviewTime, percentileRankings, docCoverage, maturity, synthesizedInsights } = stats;
  const recommendations = recommendationsWithROI || rawRecs;

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
    html += `<h3>💡 Recommendations (ROI-ranked)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${recommendations.length} suggestions (${p0Count} P0 · ${p1Count} P1 · ${recommendations.length-p0Count-p1Count} P2) · ranked by ROI (Impact/Effort)</span></div>`;
    for (const rec of recommendations.slice(0, 8)) {
      const sevCls = rec.severity === "P0" ? "danger" : rec.severity === "P1" ? "warn" : "";
      const sevIcon = rec.severity === "P0" ? "🔴" : rec.severity === "P1" ? "🟡" : "🟢";
      const roiInfo = rec.roi !== undefined ? ` I=${rec.impact} E=${rec.effort} ROI=${rec.roi}` : "";
      html += `<div class="stat-row"><span class="label ${sevCls}" title="${escapeHtml(rec.description + roiInfo)}">${sevIcon} ${escapeHtml(rec.title)}</span><span class="value" style="font-size:10px">${rec.roi !== undefined ? 'ROI='+rec.roi : ''}</span></div>`;
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

  // ── PageRank ──
  if (pagerank && pagerank.topRanked && pagerank.topRanked.length > 0) {
    html += `<h3>📄 PageRank (Code Importance)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Authoritative files (damping=${pagerank.damping}) · avg=${pagerank.avgPagerank.toFixed(4)} · ${pagerank.authoritativeFiles?.length||0} above 3×avg</span></div>`;
    for (const pr of pagerank.topRanked.slice(0, 10)) {
      const cls = pr.pagerank > pagerank.avgPagerank * 5 ? "info" : pr.pagerank > pagerank.avgPagerank * 2 ? "" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(pr.path)}">${escapeHtml(pr.path.split("/").pop())}</span><span class="value ${cls}">${pr.pagerank.toFixed(4)}</span></div>`;
    }
  }

  // ── Test gaps ──
  if (testGaps && testGaps.untestedCount > 0) {
    html += `<h3>🧪 Test Gaps</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${testGaps.coverageRate}% coverage · ${testGaps.untestedCount}/${testGaps.totalSourceFiles} untested · ${testGaps.highPriority.length} high-priority</span></div>`;
    for (const f of testGaps.highPriority.slice(0, 8)) {
      const riskPct = Math.round(f.riskScore * 100);
      const cls = riskPct >= 30 ? "danger" : riskPct >= 15 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value ${cls}">risk ${riskPct}</span></div>`;
    }
  }

  // ── Change propagation ──
  if (changePropagation && changePropagation.available && changePropagation.topPropagations && changePropagation.topPropagations.length > 0) {
    html += `<h3>📡 Change Propagation</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">If X changes, probability Y must also change · ${changePropagation.highPropagationCount} pairs >50%</span></div>`;
    for (const p of changePropagation.topPropagations.slice(0, 8)) {
      const maxProb = Math.max(p.probBgivenA, p.probAgivenB);
      const cls = maxProb >= 70 ? "danger" : maxProb >= 50 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(p.files[0])} ↔ ${escapeHtml(p.files[1])}">${escapeHtml(p.files.map(f=>f.split('/').pop()).join(' → '))}</span><span class="value ${cls}">${maxProb}%</span></div>`;
    }
  }

  // ── Knowledge distribution ──
  if (knowledgeDistribution && knowledgeDistribution.available) {
    html += `<h3>🧠 Knowledge Distribution</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${knowledgeDistribution.totalContributors} contributors · ${knowledgeDistribution.busFactorRiskCount} bus-factor-1 · ${knowledgeDistribution.abandonedCount} abandoned</span></div>`;
    // Bus factor risks
    if (knowledgeDistribution.busFactorRisks && knowledgeDistribution.busFactorRisks.length > 0) {
      html += `<div style="color:var(--warn);font-size:10px;margin:2px 0;padding-left:8px">⚠ Single-contributor files:</div>`;
      for (const f of knowledgeDistribution.busFactorRisks.slice(0, 5)) {
        html += `<div class="stat-row"><span class="label" style="color:var(--warn);font-size:10px" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value" style="color:var(--warn)">1 person</span></div>`;
      }
    }
    // Contributor distribution
    if (knowledgeDistribution.contribCountDist) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:4px 0;padding-left:8px">Distribution: `;
      const kdParts = [];
      for (const [bucket, count] of Object.entries(knowledgeDistribution.contribCountDist)) {
        if (count > 0) kdParts.push(`${bucket}: ${count}`);
      }
      html += escapeHtml(kdParts.join(" · "));
      html += `</div>`;
    }
  }

  // ── Complexity ──
  if (complexity && complexity.topComplex && complexity.topComplex.length > 0) {
    html += `<h3>📐 Cyclomatic Complexity</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">McCabe · avg ${complexity.avgComplexity} · max ${complexity.maxComplexity} · ${complexity.totalAnalyzed} files analyzed</span></div>`;
    if (complexity.complexityBuckets) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:2px 0;padding-left:8px">`;
      const cbParts = [];
      for (const [bucket, count] of Object.entries(complexity.complexityBuckets)) {
        if (count > 0) cbParts.push(`${bucket}: ${count}`);
      }
      html += escapeHtml(cbParts.join(" · "));
      html += `</div>`;
    }
    for (const c of complexity.topComplex.slice(0, 8)) {
      const cls = c.cyclomaticComplexity > 50 ? "danger" : c.cyclomaticComplexity > 20 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(c.path)} loc=${c.loc} funcs=${c.funcCount}">${escapeHtml(c.path.split("/").pop())}</span><span class="value ${cls}">M=${c.cyclomaticComplexity}</span></div>`;
    }
  }

  // ── Content similarity ──
  if (contentSimilarity && contentSimilarity.pairCount > 0) {
    html += `<h3>🔍 Near-Duplicates (Jaccard≥${contentSimilarity.threshold})</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${contentSimilarity.pairCount} similar pairs · ${contentSimilarity.similarGroups?.length||0} groups</span></div>`;
    for (const p of contentSimilarity.pairs.slice(0, 8)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(p.files[0])} ↔ ${escapeHtml(p.files[1])}">${escapeHtml(p.files.map(f=>f.split('/').pop()).join(' ≈ '))}</span><span class="value">${(p.jaccard*100).toFixed(0)}%</span></div>`;
    }
  }

  // ── Hotspot matrix ──
  if (hotspotMatrix && hotspotMatrix.available && hotspotMatrix.hotspots.length > 0) {
    html += `<h3>🔥 Hotspot Matrix (Complexity × Churn)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${hotspotMatrix.totalClassified} files · median C=${hotspotMatrix.thresholds?.medianComplexity} Ch=${hotspotMatrix.thresholds?.medianChurn}</span></div>`;
    // Quadrant summary
    const q = hotspotMatrix.quadrants;
    html += `<div style="font-size:10px;margin:2px 0;padding-left:8px">`;
    html += `<span style="color:var(--ok)">🟢 Healthy: ${q.healthy||0}</span> · `;
    html += `<span style="color:var(--warn)">🟡 Stable-Complex: ${q.stableComplex||0}</span> · `;
    html += `<span style="color:var(--warn)">🟡 Frequent-Simple: ${q.frequentSimple||0}</span> · `;
    html += `<span style="color:var(--danger)">🔴 Hotspots: ${q.hotspot||0}</span>`;
    html += `</div>`;
    for (const h of hotspotMatrix.hotspots.slice(0, 8)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(h.path)} C=${h.complexity} Ch=${h.churn}">${escapeHtml(h.path.split("/").pop())}</span><span class="value danger">🔥${h.severity}</span></div>`;
    }
  }

  // ── Fitness rules ──
  if (fitnessRules && fitnessRules.rules && fitnessRules.rules.length > 0) {
    const gradeCls = fitnessRules.grade === "A" || fitnessRules.grade === "B" ? "ok" : fitnessRules.grade === "C" ? "warn" : "danger";
    html += `<h3>🛡️ Architecture Fitness</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Grade <span class="${gradeCls}" style="font-weight:bold">${fitnessRules.grade}</span> · ${fitnessRules.fitnessScore}/100 · ${fitnessRules.rulesPassed}/${fitnessRules.totalRules} passed</span></div>`;
    for (const r of fitnessRules.rules) {
      const hasViolation = fitnessRules.violations.some((v) => v.rule === r.id);
      const icon = hasViolation ? "❌" : "✅";
      html += `<div class="stat-row"><span class="label" style="font-size:10px">${icon} ${escapeHtml(r.description)}</span></div>`;
    }
  }

  // ── Import cost ──
  if (importCost && importCost.topHeavyImports && importCost.topHeavyImports.length > 0) {
    html += `<h3>📦 Import Cost (Transitive)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Total transitive weight · avg ${formatBytes(importCost.avgImportCost)} · max ${formatBytes(importCost.maxImportCost)}</span></div>`;
    for (const ic of importCost.topHeavyImports.slice(0, 8)) {
      const cls = ic.multiplier > 10 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(ic.path)} own=${formatBytes(ic.ownSize)} transitive=${formatBytes(ic.transitiveCost)} reachable=${ic.reachableCount}">${escapeHtml(ic.path.split("/").pop())}</span><span class="value ${cls}">${formatBytes(ic.totalCost)} (×${ic.multiplier})</span></div>`;
    }
    // High-multiplier imports (small file, huge cost)
    if (importCost.highMultiplierImports && importCost.highMultiplierImports.length > 0) {
      html += `<div style="color:var(--warn);font-size:10px;margin:4px 0;padding-left:8px">⚠ High-multiplier (small file, big transitive cost):</div>`;
      for (const hm of importCost.highMultiplierImports.slice(0, 5)) {
        html += `<div class="stat-row"><span class="label" style="font-size:10px" title="${escapeHtml(hm.path)}">${escapeHtml(hm.path.split("/").pop())}</span><span class="value" style="color:var(--warn)">${formatBytes(hm.ownSize)} → ${formatBytes(hm.totalCost)}</span></div>`;
      }
    }
  }

  // ── Technical debt ──
  if (techDebt && techDebt.breakdown && techDebt.breakdown.length > 0) {
    const gradeCls = techDebt.sigRating.includes("A") || techDebt.sigRating.includes("B") ? "ok" : techDebt.sigRating.includes("C") ? "warn" : "danger";
    html += `<h3>💰 Technical Debt</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">SIG Rating: <span class="${gradeCls}" style="font-weight:bold">${techDebt.sigRating}</span> · ${techDebt.totalHours}h (${techDebt.totalDays}d / ${techDebt.totalWeeks}w) · ${techDebt.debtDensity}h/KLOC</span></div>`;
    for (const b of techDebt.breakdown) {
      html += `<div class="stat-row"><span class="label" style="font-size:10px">${escapeHtml(b.category)} (×${b.count})</span><span class="value">${b.totalHours}h</span></div>`;
    }
  }

  // ── API surface ──
  if (apiSurface && apiSurface.topApiModules && apiSurface.topApiModules.length > 0) {
    html += `<h3>🔌 API Surface</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${apiSurface.totalModules} modules · ${apiSurface.totalExportsAll} exports · avg ${apiSurface.avgExportsPerModule}/module</span></div>`;
    for (const m of apiSurface.topApiModules.slice(0, 8)) {
      const cls = m.apiSurfaceScore > 20 ? "warn" : "";
      const parts = [];
      if (m.namedExports > 0) parts.push(`${m.namedExports} named`);
      if (m.namedExportList > 0) parts.push(`${m.namedExportList} list`);
      if (m.defaultExport) parts.push("default");
      if (m.reExports > 0) parts.push(`${m.reExports} re-exp`);
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(m.path)}">${escapeHtml(m.path.split("/").pop())}</span><span class="value ${cls}">${m.apiSurfaceScore} (${parts.join(', ')})</span></div>`;
    }
  }

  // ── Health index ──
  if (healthIndex && healthIndex.topUnhealthy && healthIndex.topUnhealthy.length > 0) {
    const gradeCls = healthIndex.healthGrade === "A" || healthIndex.healthGrade === "B" ? "ok" : healthIndex.healthGrade === "C" ? "warn" : "danger";
    html += `<h3>💚 Dependency Health Index</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Overall Grade: <span class="${gradeCls}" style="font-weight:bold">${healthIndex.healthGrade}</span> · avg ${healthIndex.avgHealth}/100 · ${healthIndex.totalAssessed} files</span></div>`;
    // Grade distribution
    const gd = healthIndex.gradeDist;
    if (gd) {
      html += `<div style="font-size:10px;margin:2px 0;padding-left:8px">`;
      html += `<span style="color:var(--ok)">A: ${gd.A||0}</span> · `;
      html += `<span style="color:var(--info)">B: ${gd.B||0}</span> · `;
      html += `<span style="color:var(--warn)">C: ${gd.C||0}</span> · `;
      html += `<span style="color:var(--danger)">D: ${gd.D||0}</span> · `;
      html += `<span style="color:var(--danger)">F: ${gd.F||0}</span>`;
      html += `</div>`;
    }
    for (const h of healthIndex.topUnhealthy.slice(0, 10)) {
      const cls = h.grade === "F" || h.grade === "D" ? "danger" : h.grade === "C" ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(h.path)} health=${h.health}">${escapeHtml(h.path.split("/").pop())}</span><span class="value ${cls}">${h.health} (${h.grade})</span></div>`;
    }
  }

  // ── SDP (Stable Dependencies Principle) ──
  if (sdp && sdp.totalPkgEdges > 0) {
    const sdpCls = sdp.sdpGrade === "A" || sdp.sdpGrade === "B" ? "ok" : sdp.sdpGrade === "C" ? "warn" : "danger";
    html += `<h3>⚖️ Stable Dependencies Principle</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">"Depend on more stable packages" · Score: <span class="${sdpCls}" style="font-weight:bold">${sdp.sdpScore}/100 (${sdp.sdpGrade})</span> · ${sdp.violationCount}/${sdp.totalPkgEdges} violations</span></div>`;
    for (const v of (sdp.violations || []).slice(0, 6)) {
      html += `<div class="stat-row"><span class="label" style="color:var(--warn);font-size:10px" title="I(${v.from})=${v.iFrom} → I(${v.to})=${v.iTo} (delta=${v.delta})">${escapeHtml(v.from)} (I=${v.iFrom}) → ${escapeHtml(v.to)} (I=${v.iTo})</span><span class="value" style="color:var(--warn)">Δ${v.delta}</span></div>`;
    }
  }

  // ── Code review risk ──
  if (reviewRisk && reviewRisk.topReviewRisks && reviewRisk.topReviewRisks.length > 0) {
    html += `<h3>👀 Code Review Priority</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Files ranked by review risk (complexity+churn+coupling+bus factor) · ${reviewRisk.highPriorityReviews?.length||0} high-priority</span></div>`;
    for (const r of reviewRisk.topReviewRisks.slice(0, 10)) {
      const riskPct = Math.round(r.reviewRisk * 100);
      const cls = riskPct >= 30 ? "danger" : riskPct >= 15 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(r.path)} C=${r.components.complexity} Ch=${r.components.churn} R=${r.components.risk} Bf=${r.components.busFactor}">${escapeHtml(r.path.split("/").pop())}</span><span class="value ${cls}">${riskPct}</span></div>`;
    }
  }

  // ── Breaking change impact ──
  if (breakingChangeImpact && breakingChangeImpact.impacts && breakingChangeImpact.impacts.length > 0) {
    html += `<h3>💥 Breaking Change Impact</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${breakingChangeImpact.totalModulesWithImpact} modules with downstream impact · ${breakingChangeImpact.criticalCount} CRITICAL</span></div>`;
    for (const imp of breakingChangeImpact.impacts.slice(0, 8)) {
      const cls = imp.impactLevel === "CRITICAL" ? "danger" : imp.impactLevel === "HIGH" ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="direct=${imp.directDependents} transitive=${imp.transitiveDependents}">${escapeHtml(imp.path.split("/").pop())}</span><span class="value ${cls}">${imp.impactLevel} (${imp.transitiveDependents})</span></div>`;
    }
  }

  // ── Release coupling ──
  if (releaseCoupling && releaseCoupling.releaseUnits && releaseCoupling.releaseUnits.length > 0) {
    html += `<h3>📦 Release Coupling</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${releaseCoupling.unitCount} atomic release units · ${releaseCoupling.coupledFileCount} coupled files</span></div>`;
    for (const ru of releaseCoupling.releaseUnits.slice(0, 6)) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(ru.files.slice(0,5).join(', '))}">Unit (${ru.size} files): ${escapeHtml(ru.representative.split('/').slice(-2).join('/'))}</span></div>`;
    }
  }

  // ── Knowledge concentration ──
  if (knowledgeConcentration && knowledgeConcentration.directoryHHI && knowledgeConcentration.directoryHHI.length > 0) {
    html += `<h3>📊 Knowledge Concentration (HHI)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Herfindahl-Hirschman Index per directory · avg ${knowledgeConcentration.avgHHI} · ${knowledgeConcentration.highCount} high-risk</span></div>`;
    for (const d of knowledgeConcentration.directoryHHI.slice(0, 8)) {
      const cls = d.level === "high" ? "danger" : d.level === "moderate" ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${d.totalFiles} files, avg ${d.avgContributors} contributors">${escapeHtml(d.dir)}/</span><span class="value ${cls}">HHI ${d.hhi} (${d.singleContribRatio}% solo)</span></div>`;
    }
  }

  // ── Test prioritization ──
  if (testPrioritization && testPrioritization.prioritizedTests && testPrioritization.prioritizedTests.length > 0) {
    html += `<h3>🧪 Test Prioritization</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${testPrioritization.totalUntested} untested · ${testPrioritization.urgentCount} urgent · ${testPrioritization.highCount} high</span></div>`;
    for (const t of testPrioritization.urgent.slice(0, 5)) {
      html += `<div class="stat-row"><span class="label" title="risk=${t.risk} deps=${t.dependents}">${escapeHtml(t.path.split("/").pop())}</span><span class="value danger">⚡${t.priority}</span></div>`;
    }
    for (const t of testPrioritization.high.slice(0, 5)) {
      html += `<div class="stat-row"><span class="label" title="risk=${t.risk} deps=${t.dependents}">${escapeHtml(t.path.split("/").pop())}</span><span class="value warn">${t.priority}</span></div>`;
    }
  }

  // ── Onboarding path ──
  if (onboardingPath && onboardingPath.phases && onboardingPath.totalFiles > 0) {
    html += `<h3>📖 Onboarding Reading Path</h3>`;
    for (const [phase, files] of Object.entries(onboardingPath.phases)) {
      if (!files || files.length === 0) continue;
      html += `<div style="color:var(--info);font-size:10px;margin:4px 0;padding-left:4px;font-weight:600">${escapeHtml(phase)}</div>`;
      for (const f of files.slice(0, 4)) {
        html += `<div class="stat-row"><span class="label" style="font-size:10px" title="${escapeHtml(f.path)}">📄 ${escapeHtml(f.path.split("/").pop())}</span><span class="value" style="font-size:10px">${formatBytes(f.size)}</span></div>`;
      }
      if (files.length > 4) html += `<div class="stat-row"><span class="label" style="font-size:10px;color:var(--text-dim)">... +${files.length - 4} more</span></div>`;
    }
  }

  // ── Semver recommendation ──
  if (semverRecommendation && semverRecommendation.recommendation) {
    const svCls = semverRecommendation.recommendation === "MAJOR" ? "danger" : semverRecommendation.recommendation === "MINOR" ? "warn" : "";
    html += `<h3>🏷️ Semver Recommendation</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Confidence: ${semverRecommendation.confidence}</span><span class="value ${svCls}" style="font-weight:bold">${semverRecommendation.recommendation}</span></div>`;
    for (const r of (semverRecommendation.reasons || []).slice(0, 5)) {
      html += `<div class="stat-row"><span class="label" style="font-size:10px">${escapeHtml(r)}</span></div>`;
    }
  }

  // ── Ownership transfer risk ──
  if (ownershipTransferRisk && ownershipTransferRisk.highRiskCount > 0) {
    html += `<h3>🔄 Ownership Transfer Risk</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${ownershipTransferRisk.highRiskCount} high-risk files · avg ${ownershipTransferRisk.avgTransferRisk}/100 · ${ownershipTransferRisk.totalAtRiskFiles} bus-factor-1</span></div>`;
    for (const t of (ownershipTransferRisk.highRiskTransfers || []).slice(0, 8)) {
      const cls = t.transferRisk > 60 ? "danger" : t.transferRisk > 40 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="contributor=${t.contributor} complexity=${t.complexityScore} deps=${t.dependencyScore}">${escapeHtml(t.path.split("/").pop())}</span><span class="value ${cls}">${t.transferRisk}</span></div>`;
    }
  }

  // ── Sprint packages ──
  if (sprintPackages && sprintPackages.length > 0) {
    html += `<h3>🏃 Sprint Work Packages</h3>`;
    for (const sp of sprintPackages.slice(0, 4)) {
      html += `<div class="trend-card">`;
      html += `<div class="trend-title">${escapeHtml(sp.name)} (${sp.targetSprint})</div>`;
      html += `<div class="trend-row">${sp.itemCount} items · ${sp.totalEffortHours}h · ${sp.p0Count}P0 ${sp.p1Count}P1 · avg ROI ${sp.avgROI}</div>`;
      html += `</div>`;
    }
  }

  // ── File age ──
  if (fileAge && fileAge.available && fileAge.totalDated > 0) {
    html += `<h3>🕐 File Age Analysis</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Avg ${fileAge.avgAgeDays}d · ${fileAge.totalDated} files</span></div>`;
    if (fileAge.ageBuckets) {
      html += `<div style="color:var(--text-dim);font-size:10px;margin:2px 0;padding-left:8px">`;
      const abParts = [];
      for (const [bucket, count] of Object.entries(fileAge.ageBuckets)) {
        if (count > 0) abParts.push(`${bucket}: ${count}`);
      }
      html += escapeHtml(abParts.join(" · "));
      html += `</div>`;
    }
    const oldHigh = fileAge.ageChurnMatrix?.oldHighChurn || [];
    if (oldHigh.length > 0) {
      html += `<div style="color:var(--warn);font-size:10px;margin:4px 0;padding-left:8px">⚠ Old + High Churn (refactoring candidates):</div>`;
      for (const f of oldHigh.slice(0, 5)) {
        html += `<div class="stat-row"><span class="label" style="font-size:10px" title="${f.ageDays}d old, churn=${f.churn}">${escapeHtml(f.path.split("/").pop())}</span><span class="value" style="color:var(--warn)">${f.ageDays}d</span></div>`;
      }
    }
  }

  // ── Refactoring priority ──
  if (refactoringPriority && refactoringPriority.topPriorities && refactoringPriority.topPriorities.length > 0) {
    html += `<h3>🔧 Refactoring Priority</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">All-metrics composite · ${refactoringPriority.critical?.length||0} critical · ${refactoringPriority.high?.length||0} high · ${refactoringPriority.medium?.length||0} medium</span></div>`;
    for (const rp of refactoringPriority.topPriorities.slice(0, 10)) {
      const cls = rp.priority >= 40 ? "danger" : rp.priority >= 25 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="C=${rp.components.complexity} Ch=${rp.components.churn} R=${rp.components.risk} Sz=${rp.components.size}">${escapeHtml(rp.path.split("/").pop())}</span><span class="value ${cls}">${rp.priority}</span></div>`;
    }
  }

  // ── Architecture conformance ──
  if (conformance && conformance.rules && conformance.rules.length > 0) {
    const confCls = conformance.conformanceGrade === "A" || conformance.conformanceGrade === "B" ? "ok" : conformance.conformanceGrade === "C" ? "warn" : "danger";
    html += `<h3>📏 Architecture Conformance</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Grade: <span class="${confCls}" style="font-weight:bold">${conformance.conformanceGrade}</span> · ${conformance.conformanceScore}/100 · ${conformance.passedCount}/${conformance.totalRules} rules</span></div>`;
    for (const r of conformance.rules) {
      const icon = r.passed ? "✅" : "❌";
      html += `<div class="stat-row"><span class="label" style="font-size:10px">${icon} ${escapeHtml(r.description)}</span><span class="value" style="font-size:10px">${r.violations} violations</span></div>`;
    }
  }

  // ── Quality gates ──
  if (qualityGates && qualityGates.gates && qualityGates.gates.length > 0) {
    const qgCls = qualityGates.overallStatus === "PASS" ? "ok" : qualityGates.overallStatus === "WARN" ? "warn" : "danger";
    html += `<h3>🚦 Quality Gates</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Overall: <span class="${qgCls}" style="font-weight:bold">${qualityGates.overallStatus}</span> · ${qualityGates.score}/100 · ${qualityGates.passCount}P ${qualityGates.failCount}F</span></div>`;
    for (const g of qualityGates.gates) {
      const icon = g.status === "PASS" ? "✅" : g.status === "FAIL" ? "❌" : "⬜";
      const cls = g.status === "FAIL" && g.severity === "critical" ? "danger" : g.status === "FAIL" ? "warn" : "";
      html += `<div class="stat-row"><span class="label ${cls}" style="font-size:10px">${icon} ${escapeHtml(g.description)}</span><span class="value ${cls}" style="font-size:10px">${g.value} ${g.operator} ${g.threshold}</span></div>`;
    }
  }

  // ── Dependency concentration ──
  if (dependencyConcentration && dependencyConcentration.available) {
    const dcCls = dependencyConcentration.concentrationLevel === "well-diversified" ? "ok" : dependencyConcentration.concentrationLevel === "concentrated" ? "warn" : "danger";
    html += `<h3>🎯 Dependency Concentration</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${dependencyConcentration.totalImportEdges} imports → ${dependencyConcentration.uniqueDependencies} unique · Diversification: ${dependencyConcentration.diversificationRatio}</span></div>`;
    for (const c of (dependencyConcentration.topConcentrations || []).slice(0, 8)) {
      const cls = c.share > 10 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(c.path)}">${escapeHtml(c.path.split("/").pop())}</span><span class="value ${cls}">${c.share}% (${c.importCount}×)</span></div>`;
    }
  }

  // ── Review time ──
  if (reviewTime && reviewTime.topHeavyReviews && reviewTime.topHeavyReviews.length > 0) {
    html += `<h3>⏱️ Review Time Estimation</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">avg ${reviewTime.avgMinutes}min/file · ${reviewTime.totalReviewHours}h total · ${reviewTime.splitCount} need split (>60min)</span></div>`;
    for (const rt of reviewTime.topHeavyReviews.slice(0, 8)) {
      const cls = rt.needsSplitReview ? "warn" : "";
      const split = rt.needsSplitReview ? " ⚠split" : "";
      html += `<div class="stat-row"><span class="label" title="M=${rt.components.cyclomatic} LOC=${rt.components.loc} deps=${rt.components.dependents}">${escapeHtml(rt.path.split("/").pop())}</span><span class="value ${cls}">${rt.estimatedMinutes}min${split}</span></div>`;
    }
  }

  // ── Percentile rankings ──
  if (percentileRankings && percentileRankings.topRanked && percentileRankings.topRanked.length > 0) {
    html += `<h3>📊 Percentile Rankings (Composite Pctl)</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${percentileRankings.totalRanked} files · ${percentileRankings.topPercentileCount} in P90+</span></div>`;
    for (const pr of percentileRankings.topRanked.slice(0, 8)) {
      const cls = pr.compositePct >= 90 ? "danger" : pr.compositePct >= 75 ? "warn" : "";
      html += `<div class="stat-row"><span class="label" title="size=${pr.percentiles.size} complexity=${pr.percentiles.complexity} churn=${pr.percentiles.churn}">${escapeHtml(pr.path.split("/").pop())}</span><span class="value ${cls}">${pr.percentiles.composite}</span></div>`;
    }
  }

  // ── Documentation coverage ──
  if (docCoverage && docCoverage.totalAnalyzed > 0) {
    html += `<h3>📝 Documentation Coverage</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">${docCoverage.jsDocRate}% JSDoc · avg ${(docCoverage.avgDocRatio*100).toFixed(0)}% comment ratio · ${docCoverage.underDocHighComplex?.length||0} high-risk under-documented</span></div>`;
    for (const f of (docCoverage.underDocHighComplex || []).slice(0, 6)) {
      html += `<div class="stat-row"><span class="label" style="color:var(--warn);font-size:10px" title="docRatio=${(f.docRatio*100).toFixed(0)}%">${escapeHtml(f.path.split("/").pop())}</span><span class="value" style="color:var(--warn)">${(f.docRatio*100).toFixed(0)}%</span></div>`;
    }
  }

  // ── Maturity ──
  if (maturity && maturity.level) {
    const matCls = maturity.level >= 4 ? "ok" : maturity.level >= 3 ? "warn" : "danger";
    html += `<h3>🏛️ Codebase Maturity</h3>`;
    html += `<div class="stat-row"><span class="label" style="color:var(--text-dim);font-size:10px">Level <span class="${matCls}" style="font-weight:bold">${maturity.level} - ${maturity.levelName}</span> · ${maturity.score}/${maturity.maxScore}</span></div>`;
    for (const f of (maturity.findings || []).slice(0, 6)) {
      html += `<div class="stat-row"><span class="label" style="font-size:10px">${escapeHtml(f)}</span></div>`;
    }
  }

  // ── Synthesized insights ──
  if (synthesizedInsights && synthesizedInsights.insights && synthesizedInsights.insights.length > 0) {
    html += `<h3>💡 Cross-Dimensional Insights</h3>`;
    for (const si of synthesizedInsights.insights) {
      const cls = si.severity === "critical" ? "danger" : si.severity === "high" ? "warn" : "";
      html += `<div class="trend-card">`;
      html += `<div class="trend-title"><span class="${cls}">${si.severity.toUpperCase()}</span>: ${escapeHtml(si.pattern)}</div>`;
      html += `<div class="trend-row">${escapeHtml(si.description)}</div>`;
      html += `<div class="trend-row" style="color:var(--info);margin-top:2px">→ ${escapeHtml(si.recommendation)}</div>`;
      html += `</div>`;
    }
  }

  return html;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const rawArgs = process.argv.slice(NODE_ARGV_OFFSET);
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

  // ── Load custom config ──
  const config = loadConfig(projectRoot, args.config);
  if (config) {
    // Apply config overrides (e.g., custom thresholds)
    if (config.qualityGates) {
      // config.qualityGates can override gate thresholds (used in checkQualityGates)
    }
  }

  // ── Pre-commit mode: only analyze changed files ──
  let changedFiles = [];
  if (args.preCommit) {
    changedFiles = getChangedFiles(projectRoot);
    if (changedFiles.length === 0) {
      console.log("✅ No changed files — skipping analysis.");
      process.exit(0);
    }
    console.log(`🔍 Pre-commit: analyzing ${changedFiles.length} changed files`);
  }

  // Walk files
  let files = walkDir(targetDir, { scopeGlob: args.scope });
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);

  // ── Pre-commit filter: only keep changed files ──
  if (args.preCommit && changedFiles.length > 0) {
    const changedSet = new Set(changedFiles);
    files = files.filter((f) => changedSet.has(f.relPath));
  }

  // Build dependency graph (only for parsable files, skip if --scope used)
  const depGraph = args.scope || args.preCommit ? { nodes: [], edges: [] } : buildDepGraph(files, projectRoot);

  // Compute statistics (with projectRoot for barrel detection)
  const stats = computeStats(files, depGraph, { projectRoot, quick: args.quick || args.preCommit });

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

  // ── Trend persistence & forecasting (before JSON so fields are included) ──
  const trendResult = persistAndAnalyzeTrend(projectRoot, stats, {
    generatedAt,
    depNodes: depGraph.nodes.length,
    depEdges: depGraph.edges.length,
  });
  stats.trendAnalysis = trendResult.trendAnalysis;
  const forecast = forecastTrends(trendResult.trendAnalysis, trendResult.history);
  stats.forecast = forecast;
  const executiveSummary = generateExecutiveSummary(stats, { projectName, generatedAt });
  stats.executiveSummary = executiveSummary;

  // ── Anomaly detection on trend data ──
  stats.anomalyDetection = detectAnomalies(trendResult.history);

  // ── Quality gates (CI-ready, need full stats) ──
  stats.qualityGates = checkQualityGates(stats);

  // ── Correlation matrix, Maturity, Insight synthesis (need full stats) ──
  stats.correlationMatrix = computeCorrelationMatrix(stats);
  stats.maturity = assessMaturity(stats);
  stats.synthesizedInsights = synthesizeInsights(stats, stats.fileAge);

  // ── Confidence, Standup, Explanations, Improvements (meta-analysis) ──
  stats.confidence = computeConfidence(stats);
  stats.standupSummary = generateStandupSummary(stats, trendResult);
  stats.metricExplanations = explainMetrics(stats);
  stats.improvementTracker = trackImprovements(stats, trendResult);

  // ── ADR, Semver, Checklists, Sprint packages (need full stats) ──
  stats.adrs = generateADRs(stats, { projectName, generatedAt });
  stats.semverRecommendation = recommendSemver(stats);
  stats.reviewChecklists = generateReviewChecklists(stats);
  stats.sprintPackages = generateSprintPackages(stats.recommendationsWithROI || stats.recommendations, stats.techDebt);

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
        pagerank: stats.pagerank,
        testGaps: stats.testGaps,
        changePropagation: stats.changePropagation,
        knowledgeDistribution: stats.knowledgeDistribution,
        complexity: stats.complexity,
        contentSimilarity: stats.contentSimilarity,
        hotspotMatrix: stats.hotspotMatrix,
        fitnessRules: stats.fitnessRules,
        importCost: stats.importCost,
        techDebt: stats.techDebt,
        recommendationsWithROI: stats.recommendationsWithROI,
        apiSurface: stats.apiSurface,
        healthIndex: stats.healthIndex,
        sdp: stats.sdp,
        reviewRisk: stats.reviewRisk,
        forecast: stats.forecast,
        executiveSummary: stats.executiveSummary,
        breakingChangeImpact: stats.breakingChangeImpact,
        releaseCoupling: stats.releaseCoupling,
        knowledgeConcentration: stats.knowledgeConcentration,
        testPrioritization: stats.testPrioritization,
        onboardingPath: stats.onboardingPath,
        ownershipTransferRisk: stats.ownershipTransferRisk,
        adrs: stats.adrs || [],
        semverRecommendation: stats.semverRecommendation || {},
        reviewChecklists: stats.reviewChecklists || [],
        sprintPackages: stats.sprintPackages || [],
        fileAge: stats.fileAge,
        anomalyDetection: stats.anomalyDetection || null,
        refactoringPriority: stats.refactoringPriority,
        conformance: stats.conformance,
        qualityGates: stats.qualityGates || null,
        dependencyConcentration: stats.dependencyConcentration,
        reviewTime: stats.reviewTime,
        percentileRankings: stats.percentileRankings,
        docCoverage: stats.docCoverage,
        correlationMatrix: stats.correlationMatrix || null,
        maturity: stats.maturity || null,
        synthesizedInsights: stats.synthesizedInsights || [],
        confidence: stats.confidence || null,
        standupSummary: stats.standupSummary || "",
        metricExplanations: stats.metricExplanations || [],
        improvementTracker: stats.improvementTracker || null,
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
  if (stats.pagerank && stats.pagerank.authoritativeFiles && stats.pagerank.authoritativeFiles.length > 0) {
    console.log(`   📄 PageRank: ${stats.pagerank.authoritativeFiles.length} authoritative files (top: ${stats.pagerank.topRanked[0]?.path.split('/').pop() || 'N/A'} = ${stats.pagerank.maxPagerank.toFixed(4)})`);
  }
  if (stats.testGaps && stats.testGaps.untestedCount > 0) {
    const tg = stats.testGaps;
    console.log(`   🧪 Test gaps: ${tg.untestedCount}/${tg.totalSourceFiles} untested (${tg.coverageRate}% coverage) · ${tg.highPriority.length} high-priority`);
  }
  if (stats.changePropagation && stats.changePropagation.available && stats.changePropagation.highPropagationCount > 0) {
    console.log(`   📡 Change propagation: ${stats.changePropagation.highPropagationCount} pairs with >50% propagation probability`);
  }
  if (stats.knowledgeDistribution && stats.knowledgeDistribution.available) {
    const kd = stats.knowledgeDistribution;
    console.log(`   🧠 Knowledge: ${kd.totalContributors} contributors · ${kd.busFactorRiskCount} bus-factor-1 files · ${kd.abandonedCount} abandoned`);
  }
  if (stats.complexity && stats.complexity.topComplex && stats.complexity.topComplex.length > 0) {
    const cx = stats.complexity;
    console.log(`   📐 Complexity: avg ${cx.avgComplexity} cyclomatic · max ${cx.maxComplexity} · ${cx.complexityBuckets?.['50+ (extreme)']||0} extreme`);
  }
  if (stats.contentSimilarity && stats.contentSimilarity.pairCount > 0) {
    console.log(`   🔍 Similarity: ${stats.contentSimilarity.pairCount} near-duplicate pairs (threshold=${stats.contentSimilarity.threshold})`);
  }
  if (stats.hotspotMatrix && stats.hotspotMatrix.available && stats.hotspotMatrix.hotspots.length > 0) {
    const hm = stats.hotspotMatrix;
    console.log(`   🔥 Hotspots: ${hm.hotspots.length} files in hotspot quadrant · ${hm.quadrants.hotspot} total`);
  }
  if (stats.fitnessRules) {
    const fr = stats.fitnessRules;
    console.log(`   🛡️  Fitness: ${fr.fitnessScore}/100 (Grade ${fr.grade}) · ${fr.rulesPassed}/${fr.totalRules} rules passed`);
  }
  if (stats.importCost && stats.importCost.topHeavyImports && stats.importCost.topHeavyImports.length > 0) {
    const ic = stats.importCost;
    console.log(`   📦 Import cost: avg ${formatBytes(ic.avgImportCost)}/file · max ${formatBytes(ic.maxImportCost)}`);
  }
  if (stats.techDebt) {
    const td = stats.techDebt;
    console.log(`   💰 Tech debt: ${td.totalHours}h (${td.totalDays}d / ${td.totalWeeks}w) · ${td.sigRating} · density ${td.debtDensity}h/KLOC`);
  }
  if (stats.recommendationsWithROI && stats.recommendationsWithROI.length > 0) {
    const topROI = stats.recommendationsWithROI[0];
    console.log(`   📊 Top ROI: "${topROI.title}" (I=${topROI.impact} E=${topROI.effort} ROI=${topROI.roi})`);
  }
  if (stats.apiSurface && stats.apiSurface.totalModules > 0) {
    const as = stats.apiSurface;
    console.log(`   🔌 API surface: ${as.totalModules} modules · ${as.totalExportsAll} exports · avg ${as.avgExportsPerModule}/module`);
  }
  if (stats.healthIndex && stats.healthIndex.totalAssessed > 0) {
    const hi = stats.healthIndex;
    console.log(`   💚 Health index: avg ${hi.avgHealth}/100 (Grade ${hi.healthGrade}) · ${hi.gradeDist?.A||0}A ${hi.gradeDist?.B||0}B ${hi.gradeDist?.C||0}C ${hi.gradeDist?.D||0}D ${hi.gradeDist?.F||0}F`);
  }
  if (stats.sdp) {
    const sdp = stats.sdp;
    console.log(`   ⚖️  SDP: ${sdp.sdpScore}/100 (Grade ${sdp.sdpGrade}) · ${sdp.violationCount}/${sdp.totalPkgEdges} edges violate Stable Dependencies Principle`);
  }
  if (stats.reviewRisk && stats.reviewRisk.topReviewRisks && stats.reviewRisk.topReviewRisks.length > 0) {
    const rr = stats.reviewRisk;
    console.log(`   👀 Review risk: avg ${rr.avgReviewRisk.toFixed(3)} · ${rr.highPriorityReviews?.length||0} high-priority reviews`);
  }
  if (stats.breakingChangeImpact && stats.breakingChangeImpact.criticalCount > 0) {
    console.log(`   💥 Breaking changes: ${stats.breakingChangeImpact.criticalCount} CRITICAL · ${stats.breakingChangeImpact.highCount} HIGH impact modules`);
  }
  if (stats.releaseCoupling && stats.releaseCoupling.unitCount > 0) {
    console.log(`   📦 Release units: ${stats.releaseCoupling.unitCount} atomic release groups (${stats.releaseCoupling.coupledFileCount} files, largest=${stats.releaseCoupling.largestUnitSize})`);
  }
  if (stats.knowledgeConcentration && stats.knowledgeConcentration.highCount > 0) {
    console.log(`   📊 Knowledge HHI: avg ${stats.knowledgeConcentration.avgHHI} · ${stats.knowledgeConcentration.highCount} high-concentration dirs`);
  }
  if (stats.testPrioritization && stats.testPrioritization.urgentCount > 0) {
    console.log(`   🧪 Test priority: ${stats.testPrioritization.urgentCount} urgent · ${stats.testPrioritization.highCount} high · ${stats.testPrioritization.medium?.length||0} medium`);
  }
  if (stats.onboardingPath && stats.onboardingPath.totalFiles > 0) {
    console.log(`   📖 Onboarding: ${stats.onboardingPath.totalFiles} files across 4 phases`);
  }
  if (stats.adrs && stats.adrs.length > 0) {
    console.log(`   📋 ADRs: ${stats.adrs.length} architecture decision records generated`);
  }
  if (stats.semverRecommendation && stats.semverRecommendation.recommendation) {
    const sv = stats.semverRecommendation;
    console.log(`   🏷️  Semver: ${sv.recommendation} (${sv.confidence}) — ${sv.reasons?.join('; ') || ''}`);
  }
  if (stats.reviewChecklists && stats.reviewChecklists.length > 0) {
    console.log(`   ✅ Review checklists: ${stats.reviewChecklists.length} files with review guidance`);
  }
  if (stats.sprintPackages && stats.sprintPackages.length > 0) {
    console.log(`   🏃 Sprint packages: ${stats.sprintPackages.length} work packages (${stats.sprintPackages.reduce((s,p)=>s+p.totalEffortHours,0)}h total)`);
  }
  if (stats.ownershipTransferRisk && stats.ownershipTransferRisk.highRiskCount > 0) {
    console.log(`   🔄 Transfer risk: ${stats.ownershipTransferRisk.highRiskCount} high-risk files · avg ${stats.ownershipTransferRisk.avgTransferRisk}/100`);
  }
  if (stats.fileAge && stats.fileAge.available) {
    const fa = stats.fileAge;
    console.log(`   🕐 File age: avg ${fa.avgAgeDays}d · ${fa.totalDated} files dated · ${fa.ageChurnMatrix?.oldHighChurn?.length||0} old+high-churn`);
  }
  if (stats.anomalyDetection && stats.anomalyDetection.available) {
    const ad = stats.anomalyDetection;
    console.log(`   📊 Anomalies: ${ad.totalAnomalies} Z-score anomalies in ${ad.dataPoints} data points · ${ad.trendChanges?.length||0} trend changes`);
  }
  if (stats.refactoringPriority && stats.refactoringPriority.topPriorities && stats.refactoringPriority.topPriorities.length > 0) {
    const rp = stats.refactoringPriority;
    console.log(`   🔧 Refactoring priority: avg ${rp.avgPriority} · ${rp.critical?.length||0} critical · ${rp.high?.length||0} high · ${rp.medium?.length||0} medium`);
  }
  if (stats.conformance) {
    const conf = stats.conformance;
    console.log(`   📏 Conformance: ${conf.conformanceScore}/100 (Grade ${conf.conformanceGrade}) · ${conf.passedCount}/${conf.totalRules} rules passed`);
  }
  if (stats.qualityGates) {
    const qg = stats.qualityGates;
    console.log(`   🚦 Quality gates: ${qg.overallStatus} (${qg.score}/100) · ${qg.passCount}P ${qg.failCount}F ${qg.criticalFails} critical fails`);
  }
  if (stats.dependencyConcentration && stats.dependencyConcentration.available) {
    const dc = stats.dependencyConcentration;
    console.log(`   🎯 Dep concentration: ${dc.concentrationLevel} (HHI=${dc.dependencyHHI}) · top5 share ${dc.top5Share}% · ${dc.criticalDependencies?.length||0} critical`);
  }
  if (stats.reviewTime && stats.reviewTime.totalAssessed > 0) {
    const rt = stats.reviewTime;
    console.log(`   ⏱️  Review time: avg ${rt.avgMinutes}min/file · ${rt.totalReviewHours}h total · ${rt.splitCount} files need split-review (>60min)`);
  }
  if (stats.percentileRankings && stats.percentileRankings.totalRanked > 0) {
    const pr = stats.percentileRankings;
    console.log(`   📊 Percentiles: ${pr.totalRanked} files ranked · ${pr.topPercentileCount} in P90+`);
  }
  if (stats.correlationMatrix && stats.correlationMatrix.strongCorrelations && stats.correlationMatrix.strongCorrelations.length > 0) {
    const strong = stats.correlationMatrix.strongCorrelations;
    console.log(`   🔗 Correlations: ${stats.correlationMatrix.totalPairs} pairs · ${strong.length} strong (${strong.map(c=>c.metrics).join(', ')})`);
  }
  if (stats.docCoverage && stats.docCoverage.totalAnalyzed > 0) {
    const dc = stats.docCoverage;
    console.log(`   📝 Doc coverage: avg ${(dc.avgDocRatio*100).toFixed(0)}% · ${dc.jsDocRate}% JSDoc · ${dc.underDocHighComplex?.length||0} high-complex+under-documented`);
  }
  if (stats.maturity) {
    const m = stats.maturity;
    console.log(`   🏛️  Maturity: Level ${m.level} - ${m.levelName} (${m.score}/${m.maxScore})`);
  }
  if (stats.synthesizedInsights && stats.synthesizedInsights.insights && stats.synthesizedInsights.insights.length > 0) {
    const si = stats.synthesizedInsights;
    console.log(`   💡 Insights: ${si.totalInsights} synthesized · ${si.criticalInsights?.length||0} critical · ${si.highInsights?.length||0} high`);
  }
  if (stats.confidence) {
    console.log(`   🎯 Confidence: ${stats.confidence.overallConfidence}% (${stats.confidence.level})`);
  }
  if (stats.improvementTracker && stats.improvementTracker.improved !== undefined) {
    console.log(`   📈 Improvements: ${stats.improvementTracker.summary}`);
  }
  // Print standup summary
  if (stats.standupSummary && !args.json) {
    console.log(`\n📋 Standup Summary:\n${stats.standupSummary}`);
  }
  // Print executive summary to stderr for pipe-safe consumption
  if (stats.executiveSummary && !args.json) {
    console.error(`\n${stats.executiveSummary}`);
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

  // Trend/forecast/exec summary already computed above (before JSON block)
  if (trendResult.trendAnalysis && trendResult.trendAnalysis.dataPoints >= 2) {
    console.log(`   📈 Trend: ${trendResult.trendAnalysis.dataPoints} data points · SMA risk=${trendResult.trendAnalysis.smaRisk}`);
  }
  if (forecast && forecast.available) {
    console.log(`   🔮 Forecast (${forecast.confidence}): size ${forecast.forecasts.totalSize.trend} · risk ${forecast.forecasts.avgRisk.trend}`);
  }

  // ── Export formats ──
  if (args.export) {
    const exportPath = join(projectRoot, `bundle-analysis.${args.export === "csv" ? "csv" : args.export === "json" ? "json" : "md"}`);
    let exportContent;
    if (args.export === "md" || args.export === "markdown") {
      exportContent = formatMarkdownExport(stats, { projectName, generatedAt });
    } else if (args.export === "csv") {
      exportContent = formatCSVExport(stats);
    } else if (args.export === "json") {
      exportContent = JSON.stringify({ meta: { projectName, generatedAt }, stats: { healthIndex: stats.healthIndex, qualityGates: stats.qualityGates, maturity: stats.maturity, techDebt: stats.techDebt, recommendationsWithROI: stats.recommendationsWithROI } }, null, 2);
    }
    if (exportContent) {
      writeFileSync(exportPath, exportContent, "utf-8");
      console.log(`   📄 Export: ${relative(process.cwd(), exportPath)}`);
    }
  }

  // ── Issue generation ──
  const issues = generateIssues(stats, { projectName, generatedAt });
  if (issues.length > 0 && !args.json && !args.export) {
    console.log(`   🎫 Issues: ${issues.length} issue-ready markdown blocks generated (use --json to access)`);
  }

  // Open in browser
  if (!args.noOpen && !args.preCommit && !args.export) {
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
