#!/usr/bin/env node
/**
 * self-test.mjs — YrY 自检测试入口
 *
 * 运行全部场景的自检测试套件，输出健康报告。
 * 用法: node scripts/self-test.mjs [--json] [--quick]
 *
 * 对应场景文档:
 *   - docs/故事任务面板/yry-self-test/场景-1-init后全量自检/
 *   - docs/故事任务面板/yry-self-test/场景-2-commit前增量自检/
 */

import { existsSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TESTS_DIR = join(ROOT, 'tests');
const RUNNER = join(TESTS_DIR, 'run.mjs');
const NODE = process.execPath;

const JSON_MODE = process.argv.includes('--json');
const QUICK_MODE = process.argv.includes('--quick');

// ── Constants ────────────────────────────────────────────────────────
const CATEGORIES = ['skills', 'integration', 'agents', 'rules'];
const TEST_DIRS = CATEGORIES.map(c => [c, join(TESTS_DIR, c)]);

// ── Discover test files ──────────────────────────────────────────────
function collectTests() {
  const files = [];
  for (const [cat, dir] of TEST_DIRS) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      if (entry.endsWith('.test.mjs')) {
        files.push({ category: cat, path: join(dir, entry), name: entry });
      }
    }
  }
  return files;
}

// ── Run a single test ────────────────────────────────────────────────
function runTest(file) {
  const result = spawnSync(NODE, [file.path], {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: QUICK_MODE ? 30000 : 120000,
  });
  return {
    ...file,
    status: result.status ?? (result.error ? 1 : 0),
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
  };
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  const tests = collectTests();
  if (tests.length === 0) {
    console.log('No test files found.');
    process.exit(0);
  }

  const results = [];
  let passed = 0;
  let failed = 0;
  const start = performance.now();

  for (const test of tests) {
    const r = runTest(test);
    if (r.status === 0) {
      passed++;
      results.push({ ...r, verdict: 'passed' });
      if (!JSON_MODE) console.log(`  ✅ ${test.name} (${test.category})`);
    } else {
      failed++;
      results.push({ ...r, verdict: 'failed' });
      if (!JSON_MODE) {
        console.log(`  ❌ ${test.name} (${test.category})`);
        if (r.stderr) console.log(`    ${r.stderr.trim().split('\n').slice(0, 3).join('\n    ')}`);
      }
    }
  }

  const elapsed = Math.round(performance.now() - start);

  if (JSON_MODE) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      durationMs: elapsed,
      total: tests.length,
      passed,
      failed,
      results,
    }));
  } else {
    console.log(`\n───────────────────────────────────────────`);
    console.log(`  Self-Test: ${passed} passed | ${failed} failed | ${elapsed}ms`);
    console.log(`───────────────────────────────────────────`);
  }

  return failed === 0 ? 0 : 1;
}

process.exit(main());
