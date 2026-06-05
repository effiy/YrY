#!/usr/bin/env node
/**
 * {{PROJECT_NAME}} Self-Test Runner
 * Usage: node tests/run.mjs [--json] [--skills|--agents|--rules|--integration] [--list]
 */
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(TESTS_DIR, '..');
const RESULTS_PATH = resolve(TESTS_DIR, 'results.json');
const TEST_DIRS = { skills: 'skills', agents: 'agents', rules: 'rules', integration: 'integration' };

function discoverTests(filter) {
  const tests = [];
  for (const [category, dir] of Object.entries(TEST_DIRS)) {
    if (filter && filter !== category) continue;
    const dirPath = resolve(TESTS_DIR, dir);
    if (!existsSync(dirPath)) continue;
    for (const f of readdirSync(dirPath)) {
      if (f.endsWith('.test.mjs')) tests.push({ category, path: resolve(dirPath, f), name: f });
    }
  }
  return tests;
}

function runTest(testPath) {
  const result = spawnSync('node', ['--experimental-vm-modules', testPath], { cwd: PROJECT_ROOT, timeout: 30000, encoding: 'utf-8' });
  return { passed: result.status === 0, output: result.stdout + result.stderr, exitCode: result.status };
}

export async function run(filter) {
  const tests = discoverTests(filter);
  const results = { timestamp: new Date().toISOString(), files: tests.length, summary: { total: 0, passed: 0, failed: 0, skipped: 0 }, suites: [] };
  for (const t of tests) {
    const r = runTest(t.path);
    results.suites.push({ name: t.name.replace('.test.mjs',''), category: t.category, passed: r.passed, output: r.output });
    results.summary.total++;
    if (r.passed) results.summary.passed++; else results.summary.failed++;
  }
  if (process.argv.includes('--json')) writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  return results.summary.failed > 0 ? 1 : 0;
}

const args = process.argv.slice(2);
if (args.includes('--list')) { discoverTests().forEach(t => console.log(`[${t.category}] ${t.name}`)); process.exit(0); }
const filter = args.includes('--skills') ? 'skills' : args.includes('--agents') ? 'agents' : args.includes('--rules') ? 'rules' : args.includes('--integration') ? 'integration' : null;
const exitCode = await run(filter);
process.exit(exitCode);
