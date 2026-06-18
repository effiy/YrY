/**
 * bot-health-deps — System component dependency analysis.
 * Parses import/export statements, builds dependency graph, detects
 * circular dependencies, calculates coupling metrics, and identifies
 * architecture risks.
 *
 * Usage:
 *   import { getDependencyAnalysis } from './bot-health-deps.mjs';
 *   const depInfo = getDependencyAnalysis(projectRoot);
 */

import { join, relative, dirname } from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

import { scoreIcon, clampScore } from "./bot-health-analysis.mjs";

const SOURCE_EXT = new Set(["mjs", "js", "ts"]);

/**
 * Resolve a relative import specifier to a canonical project-relative path.
 */
function resolveImport(importPath, fromFile, projectRoot) {
  if (importPath.startsWith("node:") || importPath.startsWith("node:")) return null;
  if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
    // External package — skip
    return null;
  }

  const fromDir = dirname(fromFile);
  let resolved = join(fromDir, importPath);

  // Try extensions
  for (const ext of ["", ".mjs", ".js", ".ts", "/index.mjs", "/index.js"]) {
    const candidate = resolved + ext;
    const abs = join(projectRoot, candidate);
    if (existsSync(abs)) return candidate;
  }

  return null;
}

/**
 * Extract import specifiers from a .mjs/.js file.
 */
function extractImports(filePath, projectRoot) {
  const imports = [];
  try {
    const content = readFileSync(join(projectRoot, filePath), "utf-8");
    // Match static imports: import ... from '...'
    const staticRe = /import\s+(?:(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"])/g;
    let m;
    while ((m = staticRe.exec(content)) !== null) {
      const resolved = resolveImport(m[1], filePath, projectRoot);
      if (resolved) imports.push({ type: "static", from: resolved, specifier: m[1] });
    }

    // Match dynamic imports: import('...')
    const dynamicRe = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((m = dynamicRe.exec(content)) !== null) {
      const resolved = resolveImport(m[1], filePath, projectRoot);
      if (resolved) imports.push({ type: "dynamic", from: resolved, specifier: m[1] });
    }

    // Match re-exports: export ... from '...'
    const reExportRe = /export\s+(?:(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"])/g;
    while ((m = reExportRe.exec(content)) !== null) {
      const resolved = resolveImport(m[1], filePath, projectRoot);
      if (resolved) imports.push({ type: "reexport", from: resolved, specifier: m[1] });
    }
  } catch { /* skip unreadable */ }

  return imports;
}

/**
 * Detect cycles using DFS in the dependency graph.
 */
function detectCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const inStack = new Set();

  function dfs(node, path) {
    if (inStack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) {
        const cycle = path.slice(cycleStart);
        cycle.push(node);
        const key = [...cycle].sort().join("→");
        if (!cycles.some((c) => c.key === key)) {
          cycles.push({ path: cycle, key, length: cycle.length - 1 });
        }
      }
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    path.push(node);

    const deps = graph.get(node) || [];
    for (const dep of deps) {
      dfs(dep, path);
    }

    path.pop();
    inStack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node, []);
  }

  return cycles;
}

/**
 * Shorten a file path for display.
 */
function shortPath(p) {
  return p.replace(/^skills\//, "").replace(/^lib\//, "").replace(/^agents\//, "").replace(/^rules\//, "");
}

export function getDependencyAnalysis(projectRoot) {
  // ── Collect all source files ──────────────────────────────
  const sourceFiles = [];
  try {
    const tracked = execSync("git ls-files --cached --others --exclude-standard", {
      cwd: projectRoot, encoding: "utf-8", timeout: 8000,
    }).trim().split("\n").filter(Boolean);

    for (const rel of tracked) {
      const dot = rel.lastIndexOf(".");
      const ext = dot > 0 ? rel.slice(dot + 1).toLowerCase() : "";
      if (!SOURCE_EXT.has(ext)) continue;
      if (rel.startsWith("node_modules/") || rel.startsWith("cdn/") || rel.startsWith("dist/")) continue;
      sourceFiles.push(rel);
    }
  } catch (err) {
    return { graph: null, cycles: [], orphans: [], fanIn: [], fanOut: [],
      totalFiles: 0, totalEdges: 0, score: 0,
      summary: `分析失败: ${err.message?.slice(0, 40) || "unknown"}`, icon: "❌" };
  }

  // ── Build dependency graph ────────────────────────────────
  const graph = new Map();  // file → Set<file it imports>
  const revGraph = new Map(); // file → Set<file that import it>

  for (const file of sourceFiles) {
    graph.set(file, new Set());
    if (!revGraph.has(file)) revGraph.set(file, new Set());
  }

  let totalEdges = 0;
  for (const file of sourceFiles) {
    const imports = extractImports(file, projectRoot);
    for (const imp of imports) {
      if (sourceFiles.includes(imp.from) && imp.from !== file) {
        graph.get(file).add(imp.from);
        if (!revGraph.has(imp.from)) revGraph.set(imp.from, new Set());
        revGraph.get(imp.from).add(file);
        totalEdges++;
      }
    }
  }

  // ── Circular dependency detection ─────────────────────────
  const cycles = detectCycles(graph);

  // ── Fan-in / Fan-out calculation ──────────────────────────
  const fanIn = [];
  const fanOut = [];
  const orphans = [];

  for (const [file, deps] of graph) {
    const inCount = (revGraph.get(file) || new Set()).size;
    const outCount = deps.size;

    fanIn.push({ file, shortPath: shortPath(file), count: inCount });
    fanOut.push({ file, shortPath: shortPath(file), count: outCount });

    if (inCount === 0 && outCount === 0) {
      orphans.push({ file, shortPath: shortPath(file) });
    }
  }

  fanIn.sort((a, b) => b.count - a.count);
  fanOut.sort((a, b) => b.count - a.count);

  // ── Module coupling categories ────────────────────────────
  const highFanIn = fanIn.filter((f) => f.count >= 5);     // Core modules (heavily depended on)
  const highFanOut = fanOut.filter((f) => f.count >= 8);    // God modules (depends on too many)
  const isolated = fanIn.filter((f) => f.count === 0 && (graph.get(f.file)?.size || 0) > 0); // Only imports, never imported

  // ── Scoring ───────────────────────────────────────────────
  let score = 100;
  score -= cycles.length * 15;          // Circular deps are bad
  score -= highFanOut.length * 5;        // God modules
  score -= orphans.length * 2;           // Orphan files
  if (cycles.length > 0) score -= 10;    // Extra penalty for any cycles
  score = clampScore(score);

  const icon = scoreIcon(score);
  const summary = `${sourceFiles.length} 模块 · ${totalEdges} 依赖边` +
    (cycles.length > 0 ? ` · ${cycles.length} 循环依赖` : " · 无循环依赖") +
    (orphans.length > 0 ? ` · ${orphans.length} 孤立文件` : "");

  return {
    graph, cycles, orphans, isolated,
    fanIn: fanIn.slice(0, 10), fanOut: fanOut.slice(0, 10),
    highFanIn: highFanIn.slice(0, 10), highFanOut: highFanOut.slice(0, 10),
    totalFiles: sourceFiles.length, totalEdges,
    score, summary, icon,
  };
}