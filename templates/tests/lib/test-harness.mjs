/**
 * Lightweight test harness for {{PROJECT_NAME}} self-test framework.
 * Usage: import { describe, it, assert, run } from '../lib/test-harness.mjs';
 */
const suites = [];
let currentSuite = null;
const COUNTERS = { total: 0, passed: 0, failed: 0, skipped: 0 };

class AssertionError extends Error { constructor(msg) { super(msg); this.name = 'AssertionError'; } }

export const assert = {
  equal(actual, expected, msg) { if (actual !== expected) throw new AssertionError(msg || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); },
  notEqual(actual, expected, msg) { if (actual === expected) throw new AssertionError(msg || `expected not ${JSON.stringify(expected)}`); },
  ok(value, msg) { if (!value) throw new AssertionError(msg || 'expected truthy value'); },
  throws(fn, msg) { try { fn(); throw new AssertionError(msg || 'expected exception'); } catch(e) { if (e instanceof AssertionError) throw e; } },
};

export function describe(name, fn) {
  const suite = { name, tests: [], subSuites: [] };
  const prev = currentSuite;
  currentSuite = suite;
  fn();
  if (prev) prev.subSuites.push(suite); else suites.push(suite);
  currentSuite = prev;
}

export function it(name, fn) {
  COUNTERS.total++;
  try { fn(); COUNTERS.passed++; if (currentSuite) currentSuite.tests.push({ name, passed: true }); }
  catch(e) { COUNTERS.failed++; if (currentSuite) currentSuite.tests.push({ name, passed: false, error: e.message }); console.error(`  ✗ ${name}: ${e.message}`); }
}

export function getResults() { return { suites, counters: { ...COUNTERS } }; }

export async function run() {
  COUNTERS.total = COUNTERS.passed = COUNTERS.failed = COUNTERS.skipped = 0;
  suites.length = 0;
  const { {{TEST_IMPORTS}} } = await Promise.all([{{TEST_MODULES}}]);
  console.log(`\n${COUNTERS.passed}/${COUNTERS.total} passed`);
  return COUNTERS.failed > 0 ? 1 : 0;
}
