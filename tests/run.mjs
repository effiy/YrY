#!/usr/bin/env node

/**
 * YrY Self-Test Runner — discovers and runs all test suites.
 *
 * Usage:
 *   node tests/run.mjs                # Run all tests (text output)
 *   node tests/run.mjs --json         # Run all tests, write tests/results.json
 *   node tests/run.mjs --skills       # Run only skill tests
 *   node tests/run.mjs --agents       # Run only agent tests
 *   node tests/run.mjs --rules        # Run only rule tests
 *   node tests/run.mjs --integration  # Run only integration tests
 *   node tests/run.mjs --list         # List test files without running
 */

import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { NODE_ARGV_OFFSET } from '../lib/constants.mjs';

const TESTS_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(TESTS_DIR, '..');
const RESULTS_PATH = resolve(TESTS_DIR, 'results.json');

const TEST_DIRS = {
  skills: 'skills',
  agents: 'agents',
  rules: 'rules',
  integration: 'integration',
};

function discoverTests(subdir) {
  const dir = resolve(TESTS_DIR, subdir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.mjs') || f.endsWith('.test.js'))
    .map(f => resolve(dir, f))
    .sort();
}

function parseArgs() {
  const args = process.argv.slice(NODE_ARGV_OFFSET);
  const filters = [];
  let listOnly = false;
  let jsonMode = false;

  for (const arg of args) {
    if (arg === '--skills') filters.push('skills');
    else if (arg === '--agents') filters.push('agents');
    else if (arg === '--rules') filters.push('rules');
    else if (arg === '--integration') filters.push('integration');
    else if (arg === '--list') listOnly = true;
    else if (arg === '--json') jsonMode = true;
  }

  if (filters.length === 0) filters.push(...Object.keys(TEST_DIRS));
  return { filters, listOnly, jsonMode };
}

function runTestFile(filePath, jsonMode) {
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
    const subdir = TEST_DIRS[filter];
    if (!subdir) continue;
    allFiles.push(...discoverTests(subdir));
  }

  if (listOnly) {
    console.log('Test files:');
    for (const f of allFiles) console.log(`  ${f.replace(PROJECT_ROOT + '/', '')}`);
    console.log(`\n${allFiles.length} test file(s)`);
    return 0;
  }

  if (!jsonMode) {
    console.log(`Running ${allFiles.length} test suite(s)...\n`);
  }

  let totalFailed = 0;
  const allResults = [];

  for (const file of allFiles) {
    const result = runTestFile(file, jsonMode);
    if (result.status !== 0) totalFailed++;

    if (jsonMode) {
      // Parse JSON from stdout (last line is the JSON result)
      const output = (result.stdout || '').trim();
      try {
        const parsed = JSON.parse(output);
        allResults.push(parsed);
      } catch (e) {
        allResults.push({
          file: file.replace(PROJECT_ROOT + '/', ''),
          error: 'Failed to parse JSON output',
          raw: output.slice(-500),
        });
      }
    }
  }

  if (jsonMode) {
    // Merge results from all test suites
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
