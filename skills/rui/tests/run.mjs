#!/usr/bin/env node

/**
 * YrY Self-Test Runner — discovers and runs all test suites.
 *
 * Usage:
 *   node skills/rui/tests/run.mjs                # Run all tests (text output)
 *   node skills/rui/tests/run.mjs --json         # Run all tests, write results.json
 *   node skills/rui/tests/run.mjs --skills       # Run only skill-specific tests
 *   node skills/rui/tests/run.mjs --agents       # Run only agent tests
 *   node skills/rui/tests/run.mjs --rules        # Run only rule tests
 *   node skills/rui/tests/run.mjs --integration  # Run only integration tests
 *   node skills/rui/tests/run.mjs --unit         # Run only unit tests
 *   node skills/rui/tests/run.mjs --lib          # Run only lib/ tests
 *   node skills/rui/tests/run.mjs --list         # List test files without running
 */

import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { NODE_ARGV_OFFSET } from '../../../lib/constants.mjs';

const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(TESTS_DIR, '..', '..', '..');
const RESULTS_PATH = resolve(TESTS_DIR, 'results.json');

// ── Discovery sources ──────────────────────────────────────────────────
/** @type {Record<string, string[] | null>} */
const TEST_SOURCES = {
  skills:        null,  // special: scan all skills/*/tests/ directories
  agents:        ['skills/rui/tests/agents.test.mjs'],
  rules:         ['skills/rui/tests/rules.test.mjs'],
  integration:   ['skills/rui/tests', 'skills/rui-story/tests'],
  unit:          ['skills/rui/tests/unit'],
  infrastructure:['skills/rui/tests/infrastructure'],
  lib:           ['lib/tests'],
};

function scanDir(/** @type {string} */ dir) {
  try {
    return readdirSync(dir)
      .filter((/** @type {string} */ f) => (f.endsWith('.mjs') || f.endsWith('.test.js')) && f !== 'run.mjs')
      .map((/** @type {string} */ f) => resolve(dir, f));
  } catch { return []; }
}

function discoverTests(/** @type {string} */ category) {
  const files = [];

  if (category === 'skills') {
    // Scan all skills/*/tests/ directories
    const skillsDir = resolve(PROJECT_ROOT, 'skills');
    if (existsSync(skillsDir)) {
      for (const skill of readdirSync(skillsDir)) {
        const testsDir = resolve(skillsDir, skill, 'tests');
        if (existsSync(testsDir)) {
          files.push(...scanDir(testsDir));
        }
      }
    }
  } else {
    const sources = TEST_SOURCES[category];
    if (!sources) return [];

    for (const src of sources) {
      const full = resolve(PROJECT_ROOT, src);
      if (!existsSync(full)) continue;

      if (full.endsWith('.mjs')) {
        files.push(full);
      } else {
        files.push(...scanDir(full));
      }
    }
  }
  return [...new Set(files)].sort();
}

function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  const filters = [];
  let listOnly = false;
  let jsonMode = false;

  const categoryFlags = ['skills', 'agents', 'rules', 'integration', 'unit', 'infrastructure', 'lib'];
  for (const arg of args) {
    const flag = arg.replace(/^--/, '');
    if (categoryFlags.includes(flag)) {
      filters.push(flag);
    } else if (arg === '--list') {
      listOnly = true;
    } else if (arg === '--json') {
      jsonMode = true;
    }
  }

  // Default: all categories except infrastructure (vitest-only)
  if (filters.length === 0) filters.push('skills', 'agents', 'rules', 'integration', 'unit', 'lib');
  return { filters, listOnly, jsonMode };
}

function runTestFile(/** @type {string} */ filePath, /** @type {boolean} */ jsonMode) {
  const args = ['--no-warnings', filePath];
  if (jsonMode) args.push('--json');
  return spawnSync('node', args, {
    cwd: PROJECT_ROOT,
    stdio: jsonMode ? 'pipe' : 'inherit',
    timeout: 30_000,
    encoding: 'utf-8',
  });
}

function main() {
  const { filters, listOnly, jsonMode } = parseArgs();
  const allFiles = [];

  for (const filter of filters) {
    allFiles.push(...discoverTests(filter));
  }
  // Deduplicate across categories
  const uniqueFiles = [...new Set(allFiles)].sort();

  if (listOnly) {
    console.log('Test files:');
    for (const f of uniqueFiles) console.log(`  ${f.replace(PROJECT_ROOT + '/', '')}`);
    console.log(`\n${uniqueFiles.length} test file(s)`);
    return 0;
  }

  if (!jsonMode) {
    console.log(`Running ${uniqueFiles.length} test suite(s)...\n`);
  }

  let totalFailed = 0;
  const allResults = [];

  for (const file of uniqueFiles) {
    const result = runTestFile(file, jsonMode);
    if (result.status !== 0) totalFailed++;

    if (jsonMode) {
      const output = (result.stdout || '').trim();
      try {
        const parsed = JSON.parse(output);
        allResults.push(parsed);
      } catch (_e) {
        allResults.push({
          file: file.replace(PROJECT_ROOT + '/', ''),
          error: 'Failed to parse JSON output',
          raw: output.slice(-500),
        });
      }
    }
  }

  if (jsonMode) {
    /** @type {{ timestamp: string, files: number, summary: { total: number, passed: number, failed: number, skipped: number }, suites: Array<{ name?: string, error?: string, tests: any[] }> }} */
    const merged = {
      timestamp: new Date().toISOString(),
      files: allResults.length,
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
      suites: [],
    };

    for (const r of allResults) {
      if (r.error) {
        merged.suites.push({ name: r.file, error: r.error, tests: [] });
        continue;
      }
      merged.summary.total += r.summary?.total || 0;
      merged.summary.passed += r.summary?.passed || 0;
      merged.summary.failed += r.summary?.failed || 0;
      merged.summary.skipped += r.summary?.skipped || 0;
      if (r.suites) merged.suites.push(...r.suites);
    }

    writeFileSync(RESULTS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(JSON.stringify(merged));
    return merged.summary.failed > 0 ? 1 : 0;
  }

  if (totalFailed > 0) {
    console.log(`\n${totalFailed} test suite(s) failed.`);
    return 1;
  }

  console.log('\nAll test suites passed.');
  return 0;
}

process.exit(main());
