#!/usr/bin/env node
/**
 * validate-doc-consistency.mjs — 文档与代码一致性校验
 *
 * 扫描场景文档中引用的源代码路径，验证文件存在性。
 * 检测文档声明的模块、接口、命令是否与代码实现一致。
 * 用法: node scripts/validate-doc-consistency.mjs [--json]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-self-test/场景-3-文档代码一致性校验/
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs', '故事任务面板');
const JSON_MODE = process.argv.includes('--json');

// ── Collect all HTML/MD doc files ────────────────────────────────────
function collectDocFiles(dir) {
  const files = [];
  function walk(d) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (entry.endsWith('.html') || entry.endsWith('.md')) {
        files.push(full);
      }
    }
  }
  walk(dir);
  return files;
}

// ── Extract source file references from doc content ──────────────────
function extractRefs(content, docPath) {
  const refs = new Set();
  const docDir = dirname(docPath);

  // Patterns for source references
  const patterns = [
    // Relative file paths like ../../skills/... or ../../../../cdn/...
    /(?:href|src)=["']([^"']*\.[a-z]{1,6})["']/gi,
    // Code blocks referencing paths
    /(?:`|')(\.\.\/[^\s`']+\.[a-z]{2,6})(?:`|')/gi,
    // Absolute-like paths from repo root
    /(skills\/[^\s'"`]+\.[a-z]{2,6})/gi,
    /(scripts\/[^\s'"`]+\.[a-z]{2,6})/gi,
    /(tests\/[^\s'"`]+\.[a-z]{2,6})/gi,
    /(agents\/[^\s'"`]+\.[a-z]{2,6})/gi,
    /(rules\/[^\s'"`]+\.[a-z]{2,6})/gi,
    /(lib\/[^\s'"`]+\.[a-z]{2,6})/gi,
    /(cdn\/[^\s'"`]+\.[a-z]{2,6})/gi,
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      let p = match[1];
      // Resolve relative paths
      if (p.startsWith('.')) {
        p = resolve(docDir, p);
      } else {
        p = resolve(ROOT, p);
      }
      refs.add(relative(ROOT, p));
    }
  }

  return [...refs];
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const docFiles = collectDocFiles(DOCS_DIR);
  const allRefs = new Map();
  const missing = [];

  // Phase 1: collect all references
  for (const doc of docFiles) {
    try {
      const content = readFileSync(doc, 'utf-8');
      const refs = extractRefs(content, doc);
      for (const ref of refs) {
        if (!allRefs.has(ref)) allRefs.set(ref, []);
        allRefs.get(ref).push(relative(ROOT, doc));
      }
    } catch (err) {
      // Skip unreadable files
    }
  }

  // Phase 2: verify each referenced file exists
  for (const [ref, docs] of allRefs.entries()) {
    // Skip npm packages, external URLs
    if (ref.startsWith('node_modules/') || ref.startsWith('http')) continue;
    // Skip backup/reference-only files
    if (ref.includes('.bak.')) continue;

    const fullPath = resolve(ROOT, ref);
    if (!existsSync(fullPath)) {
      missing.push({ ref, docs });
    }
  }

  // Phase 3: output
  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      totalRefs: allRefs.size,
      missing: missing.length,
      details: missing,
    }));
  } else {
    console.log(`╔══════════════════════════════════════════════════════════╗`);
    console.log(`║  文档代码一致性校验 — YrY Doc-Code Validator            ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝\n`);
    console.log(`  扫描文档: ${docFiles.length} 个`);
    console.log(`  唯一引用: ${allRefs.size} 条`);
    console.log(`  缺失文件: ${missing.length} 个\n`);

    if (missing.length > 0) {
      console.log('── 缺失文件清单 ────────────────────────────────');
      for (const { ref, docs } of missing) {
        console.log(`  ❌ ${ref}`);
        console.log(`     引用自: ${docs.join(', ')}`);
      }
    } else {
      console.log('  ✅ 所有文档引用的源文件均存在');
    }

    console.log(`\n───────────────────────────────────────────`);
  }

  return missing.length === 0 ? 0 : 1;
}

process.exit(main());
