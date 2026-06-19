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
import { execSync } from "node:child_process";
import { findProjectRoot } from "../../lib/fs.mjs";

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

// ── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    dir: null,
    noOpen: false,
    json: false,
    scope: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") { args.help = true; }
    else if (a === "--dir" && i + 1 < argv.length) { args.dir = argv[++i]; }
    else if (a === "--no-open") { args.noOpen = true; }
    else if (a === "--json") { args.json = true; }
    else if (a === "--scope" && i + 1 < argv.length) { args.scope = argv[++i]; }
  }

  return args;
}

function printHelp() {
  // Delegate to help.mjs
  const help = `
rui-bundle-analyze — File size & dependency analysis (like webpack-bundle-analyzer)

Usage:
  node skills/rui-bundle-analyze/analyze.mjs [options]

Options:
  --dir <path>     Analyze a specific directory (default: project root)
  --no-open        Don't open the report in browser
  --json           Output JSON to stdout instead of generating HTML
  --scope <glob>   Limit files to a glob pattern (e.g. "**/*.js")
  --help, -h       Show this help

Example:
  /rui-bundle-analyze
  /rui-bundle-analyze --dir src/
  /rui-bundle-analyze --json | jq .stats.largestFiles
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
 * Simple static import parser using regex.
 * Handles: import ... from '...', import('...'), require('...')
 * Returns array of imported module specifiers.
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

  // Static imports: import { x } from '...' / import '...'
  const staticPattern = /import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = staticPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "import" });
  }

  // Dynamic imports: import('...')
  const dynamicPattern = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "dynamic" });
  }

  // require('...')
  const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requirePattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "require" });
  }

  // CSS @import url('...')
  const cssImportPattern = /@import\s+(?:url\s*\(\s*)?['"]([^'"]+)['"]/g;
  while ((match = cssImportPattern.exec(stripped)) !== null) {
    imports.push({ specifier: match[1], type: "css-import" });
  }

  return imports;
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

// ── Statistics ─────────────────────────────────────────────────────────────

function computeStats(files, depGraph) {
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

  // Circular dependency detection (simple DFS)
  const circularDeps = detectCircularDeps(depGraph);

  // Total
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalFiles = files.length;

  // Large files (above threshold)
  const oversizedFiles = files
    .filter((f) => f.size > LARGE_FILE_THRESHOLD)
    .sort((a, b) => b.size - a.size)
    .map((f) => ({ path: f.relPath, size: f.size }));

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
function generateHtml(data, meta) {
  const { treemapData, depGraph, stats } = data;
  const treemapJson = JSON.stringify(treemapData);
  const depNodesJson = JSON.stringify(depGraph.nodes);
  const depEdgesJson = JSON.stringify(depGraph.edges);
  const statsJson = JSON.stringify(stats);

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
    ${renderSidebar(stats)}
  </div>
</div>

<div id="tooltip"></div>

<script>
// ── Data ─────────────────────────────────────────────────────────────
const TREEMAP_DATA = ${treemapJson};
const DEP_NODES = ${depNodesJson};
const DEP_EDGES = ${depEdgesJson};
const STATS = ${statsJson};

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

  // Store zoom for reset
  vis.node()._zoom = zoom;
  vis.node()._svg = svg;
  vis.node()._g = g;
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
  else renderGraph();
}

function resetZoom() {
  const svg = vis.node()._svg;
  const zoom = vis.node()._zoom;
  if (svg && zoom) {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  }
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

function renderSidebar(stats) {
  const { largestFiles, sizeByExt, sizeByDir, mostDependedOn, mostDependencies, circularDeps, oversizedFiles } = stats;

  const extEntries = Object.entries(sizeByExt).sort((a, b) => b[1] - a[1]);
  const maxExtSize = extEntries.length > 0 ? extEntries[0][1] : 1;
  const dirEntries = Object.entries(sizeByDir).sort((a, b) => b[1] - a[1]);

  let html = "";

  // Largest files
  html += `<h3>📏 Top Largest Files</h3>`;
  for (const f of largestFiles.slice(0, 15)) {
    const cls = f.size > 500_000 ? "danger" : f.size > 100_000 ? "warn" : "";
    html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value ${cls}">${formatBytes(f.size)}</span></div>`;
  }

  // Oversized files warning
  if (oversizedFiles.length > 0) {
    html += `<h3>⚠️ Oversized Files (&gt;500KB)</h3>`;
    for (const f of oversizedFiles) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(f.path)}">${escapeHtml(f.path.split("/").slice(-2).join("/"))}</span><span class="value danger">${formatBytes(f.size)}</span></div>`;
    }
  }

  // By extension
  html += `<h3>📦 By Extension</h3>`;
  for (const [ext, size] of extEntries.slice(0, 12)) {
    const pct = ((size / maxExtSize) * 100).toFixed(1);
    html += `<div class="ext-bar-wrap"><span class="ext-label">${escapeHtml(ext)}</span><div class="ext-bar" style="width:${Math.max(pct, 1)}%"></div><span class="ext-size">${formatBytes(size)}</span></div>`;
  }

  // By directory
  html += `<h3>📁 By Directory</h3>`;
  for (const [dir, size] of dirEntries.slice(0, 10)) {
    html += `<div class="stat-row"><span class="label">${escapeHtml(dir)}/</span><span class="value">${formatBytes(size)}</span></div>`;
  }

  // Most depended-on
  if (mostDependedOn.length > 0) {
    html += `<h3>🔥 Most Depended On (fan-in)</h3>`;
    for (const d of mostDependedOn) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(d.path)}">${escapeHtml(d.path.split("/").pop())}</span><span class="value">${d.count} refs</span></div>`;
    }
  }

  // Most dependencies
  if (mostDependencies.length > 0) {
    html += `<h3>📤 Most Dependencies (fan-out)</h3>`;
    for (const d of mostDependencies) {
      html += `<div class="stat-row"><span class="label" title="${escapeHtml(d.path)}">${escapeHtml(d.path.split("/").pop())}</span><span class="value">${d.count} deps</span></div>`;
    }
  }

  // Circular dependencies
  if (circularDeps.length > 0) {
    html += `<h3>🔄 Circular Dependencies</h3>`;
    for (const cycle of circularDeps.slice(0, 5)) {
      html += `<div class="stat-row"><span class="label" style="color:var(--warn)">${escapeHtml(cycle.join(" → "))}</span></div>`;
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

  // Build dependency graph (only for parsable files)
  const depGraph = args.scope ? { nodes: [], edges: [] } : buildDepGraph(files, projectRoot);

  // Compute statistics
  const stats = computeStats(files, depGraph);

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
      },
      files: files.map((f) => ({ path: f.relPath, size: f.size, ext: f.ext })),
      directories: Object.entries(stats.sizeByDir)
        .sort((a, b) => b[1] - a[1])
        .map(([dir, size]) => ({ path: dir, size })),
      dependencies: depGraph.edges,
      stats: {
        largestFiles: stats.largestFiles,
        mostDependedOn: stats.mostDependedOn,
        mostDependencies: stats.mostDependencies,
        sizeByExt: stats.sizeByExt,
        circularDeps: stats.circularDeps,
        oversizedFiles: stats.oversizedFiles,
      },
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
    }
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

  if (stats.oversizedFiles.length > 0) {
    console.log(`   ⚠️  Oversized files (>500KB): ${stats.oversizedFiles.length}`);
  }
  if (stats.circularDeps.length > 0) {
    console.log(`   ⚠️  Circular dependencies: ${stats.circularDeps.length}`);
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
