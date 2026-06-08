#!/usr/bin/env node
/**
 * validate-module-topology.mjs — 模块拓扑验证
 *
 * 扫描 agents/ rules/ skills/ lib/ 之间的依赖关系，检测循环依赖、无效引用。
 * 用法: node scripts/validate-module-topology.mjs [--json] [--graph]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-arch/场景-1-模块定位/
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_MODE = process.argv.includes('--json');
const GRAPH_MODE = process.argv.includes('--graph');

// ── Module definitions ────────────────────────────────────────────────
const MODULES = {
  agents: { dir: 'agents', ext: '.md', label: 'Agent' },
  rules: { dir: 'rules', ext: '.md', label: 'Rule' },
  skills: { dir: 'skills', ext: '.md', label: 'Skill' },
  lib: { dir: 'lib', ext: '.mjs', label: 'Lib' },
  scripts: { dir: 'scripts', ext: '.mjs', label: 'Script' },
};

// ── Collect modules ──────────────────────────────────────────────────
function collectModules() {
  const modules = {};
  for (const [key, { dir, ext }] of Object.entries(MODULES)) {
    const fullDir = join(ROOT, dir);
    if (!existsSync(fullDir)) continue;
    modules[key] = [];
    function walk(d) {
      for (const entry of readdirSync(d)) {
        const full = join(d, entry);
        if (statSync(full).isDirectory()) { walk(full); continue; }
        if (entry.endsWith(ext)) {
          modules[key].push({ name: entry, path: relative(ROOT, full), content: readFileSync(full, 'utf-8') });
        }
      }
    }
    walk(fullDir);
  }
  return modules;
}

// ── Extract cross-references ─────────────────────────────────────────
function extractRefs(content) {
  const refs = {};
  for (const key of Object.keys(MODULES)) {
    const dirPrefix = MODULES[key].dir + '/';
    const matches = content.match(new RegExp(`${dirPrefix}[^\\s'"\`\\]},*]+`, 'g'));
    if (matches) {
      refs[key] = [...new Set(matches.map(m => m.replace(/[,;:'"\]\)].*$/, '')))];
    }
  }
  return refs;
}

// ── Detect cycles ────────────────────────────────────────────────────
function detectCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const stack = new Set();

  function dfs(node, path) {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push([...path.slice(cycleStart), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const neighbor of (graph[node] || [])) {
      dfs(neighbor, [...path, node]);
    }
    stack.delete(node);
  }

  for (const node of Object.keys(graph)) {
    dfs(node, []);
  }
  return cycles;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const modules = collectModules();
  const graph = {};
  const issues = [];

  // Build reference graph
  for (const [cat, files] of Object.entries(modules)) {
    for (const file of files) {
      const refs = extractRefs(file.content);
      graph[file.path] = [];
      for (const [targetCat, targets] of Object.entries(refs)) {
        for (const target of targets) {
          const targetPath = target.replace(/^skills\//, '').startsWith(targetCat) ? target : `${targetCat}/${target.replace(MODULES[targetCat].dir + '/', '')}`;
          const fullTarget = modules[targetCat]?.find(f => f.path === target || f.path.startsWith(target));
          if (fullTarget) {
            graph[file.path].push(fullTarget.path);
          } else {
            issues.push({ type: 'broken_ref', from: file.path, to: target });
          }
        }
      }
    }
  }

  const cycles = detectCycles(graph);
  for (const cycle of cycles) {
    issues.push({ type: 'cycle', path: cycle });
  }

  if (GRAPH_MODE) {
    console.log(JSON.stringify(graph, null, 2));
    return 0;
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      totalModules: Object.values(modules).reduce((s, a) => s + a.length, 0),
      totalEdges: Object.values(graph).reduce((s, a) => s + a.length, 0),
      cycles: cycles.length,
      issues,
    }));
  } else {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  YrY 模块拓扑验证                         ║');
    console.log('╚══════════════════════════════════════════╝\n');

    for (const [cat, files] of Object.entries(modules)) {
      console.log(`  ${MODULES[cat].label}: ${files.length} 个`);
    }
    console.log(`  总引用: ${Object.values(graph).reduce((s, a) => s + a.length, 0)} 条\n`);

    if (issues.length > 0) {
      for (const issue of issues) {
        if (issue.type === 'cycle') console.log(`  🔴 循环依赖: ${issue.path.join(' → ')}`);
        if (issue.type === 'broken_ref') console.log(`  🟡 无效引用: ${issue.from} → ${issue.to}`);
      }
    } else {
      console.log('  ✅ 模块拓扑正常，无循环依赖');
    }
  }

  return cycles.length > 0 ? 1 : 0;
}

process.exit(main());
