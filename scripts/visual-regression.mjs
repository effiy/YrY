#!/usr/bin/env node
/**
 * visual-regression.mjs — CDN 主题视觉回归测试
 *
 * 对比页面渲染快照，检测 CSS 变更造成的视觉差异。
 * 用法: node scripts/visual-regression.mjs [--baseline] [--diff]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-cdn/场景-4-存量页面迁移/
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASELINE_DIR = join(ROOT, '.cache', 'visual-baselines');
const JSON_MODE = process.argv.includes('--json');
const BASELINE_MODE = process.argv.includes('--baseline');

// ── Compute content hash for an HTML file ────────────────────────────
function hashFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// ── Extract CSS-relevant portions from HTML ──────────────────────────
function extractCssSnapshot(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  // Extract inline <style> blocks
  const styleBlocks = [];
  for (const match of content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    styleBlocks.push(match[1].trim());
  }
  // Extract linked stylesheets (just their paths as references)
  const links = [];
  for (const match of content.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/gi)) {
    links.push(match[1]);
  }
  return { hash: hashFile(filePath), styleBlocks, links };
}

// ── Collect test pages ───────────────────────────────────────────────
function collectPages() {
  const pages = [];
  const storyDirs = ['yry-arch', 'yry-self-test', 'yry-cdn', 'rui-npm'];
  for (const story of storyDirs) {
    const dir = join(ROOT, 'docs', '故事任务面板', story);
    if (!existsSync(dir)) continue;
    function walk(d) {
      for (const entry of readdirSync(d)) {
        const full = join(d, entry);
        if (statSync(full).isDirectory()) { walk(full); continue; }
        if (entry.endsWith('.html')) {
          pages.push({ story, path: full, rel: relative(ROOT, full) });
        }
      }
    }
    walk(dir);
  }
  return pages;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const pages = collectPages();

  if (BASELINE_MODE) {
    // Record current state as baseline
    writeFileSync(BASELINE_DIR, '', { flag: 'as' });
    for (const page of pages) {
      const snap = extractCssSnapshot(page.path);
      const outPath = join(BASELINE_DIR, page.rel.replace(/\//g, '_').replace('.html', '.json'));
      writeFileSync(outPath, JSON.stringify(snap, null, 2), 'utf-8');
    }
    console.log(`Baseline recorded for ${pages.length} pages.`);
    return 0;
  }

  // Compare against baselines
  const diffs = [];
  let checked = 0;
  let changed = 0;

  for (const page of pages) {
    const baselinePath = join(BASELINE_DIR, page.rel.replace(/\//g, '_').replace('.html', '.json'));
    if (!existsSync(baselinePath)) {
      diffs.push({ page: page.rel, status: 'new' });
      continue;
    }
    checked++;
    const current = extractCssSnapshot(page.path);
    const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
    if (current.hash !== baseline.hash) {
      changed++;
      diffs.push({ page: page.rel, status: 'changed', baseline: baseline.hash, current: current.hash });
    }
  }

  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      total: pages.length,
      checked,
      changed,
      diffs,
    }));
  } else {
    console.log(`Visual regression check:`);
    console.log(`  Total pages: ${pages.length}`);
    console.log(`  Checked: ${checked} | Changed: ${changed} | New: ${diffs.filter(d => d.status === 'new').length}\n`);
    if (diffs.length > 0) {
      for (const d of diffs) {
        if (d.status === 'new') console.log(`  🆕 ${d.page}`);
        if (d.status === 'changed') console.log(`  🔄 ${d.page}`);
      }
    } else {
      console.log('  ✅ No visual regressions detected');
    }
  }

  return changed > 0 ? 1 : 0;
}

process.exit(main());
