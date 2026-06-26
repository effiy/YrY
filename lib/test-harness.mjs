/**
 * Lightweight test harness for YrY self-test framework.
 * Provides describe/it/assert primitives with pass/fail/skip reporting.
 *
 * Usage:
 *   import { describe, it, assert, run, getResults } from '../lib/test-harness.mjs';
 *   describe('my suite', () => { it('works', () => { assert.equal(1, 1); }); });
 *   const exitCode = await run();
 *   // getResults() returns structured data for JSON export
 */

// ── State ──────────────────────────────────────────────────────────
/** @type {any[]} */
const suites = [];
/** @type {any} */
let currentSuite = null;
const COUNTERS = { total: 0, passed: 0, failed: 0, skipped: 0 };
let _started = 0;
let _elapsed = 0;

// ── Assertion error ───────────────────────────────────────────────
const ASSERTION_TAG = Symbol('AssertionError');
/**
 * @constructor
 * @param {string} message
 * @returns {Error}
 */
function AssertionError(message) {
  const err = new Error(message);
  err.name = 'AssertionError';
  /** @type {any} */
  const anyErr = err;
  anyErr[ASSERTION_TAG] = true;
  return err;
}
function isAssertionError(/** @type {any} */ e) {
  return e != null && typeof e === 'object' && e[ASSERTION_TAG] === true;
}

// ── Assert ────────────────────────────────────────────────────────
const assert = {
  /** @param {any} actual @param {any} expected @param {string} [msg] */
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new AssertionError(msg || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  /** @param {any} actual @param {any} expected @param {string} [msg] */
  notEqual(actual, expected, msg) {
    if (actual === expected) throw new AssertionError(msg || `expected not ${JSON.stringify(expected)}`);
  },
  /** @param {any} actual @param {any} expected @param {string} [msg] */
  deepEqual(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new AssertionError(msg || `deepEqual failed`);
    }
  },
  /** @param {any} value @param {string} [msg] */
  ok(value, msg) {
    if (!value) throw new AssertionError(msg || `expected truthy, got ${JSON.stringify(value)}`);
  },
  /** @param {string} [msg] */
  fail(msg) { throw new AssertionError(msg || 'assert.fail() called'); },
  /** @param {() => void} fn @param {string} [msg] */
  throws(fn, msg) {
    try { fn(); } catch (e) {
      if (isAssertionError(e)) throw e;
      return;
    }
    throw new AssertionError(msg || 'expected function to throw');
  },
  /** @param {string} str @param {RegExp} regex @param {string} [msg] */
  match(str, regex, msg) {
    if (!regex.test(str)) throw new AssertionError(msg || `expected "${str}" to match ${regex}`);
  },
  /** @param {any} haystack @param {any} needle @param {string} [msg] */
  includes(haystack, needle, msg) {
    if (!haystack.includes(needle)) throw new AssertionError(msg || `expected to include "${needle}"`);
  },
  /** @param {any} value @param {string} expectedType @param {string} [msg] */
  typeOf(value, expectedType, msg) {
    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (actual !== expectedType) throw new AssertionError(msg || `expected type ${expectedType}, got ${actual}`);
  },
};

// ── Helpers ───────────────────────────────────────────────────────
function fmtDuration(/** @type {number} */ ms) {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
function statusIcon(/** @type {string} */ s) {
  if (s === 'passed') return '✅';
  if (s === 'failed') return '❌';
  if (s === 'skipped') return '⏭️';
  return '  ';
}

// ── Core API ──────────────────────────────────────────────────────
/**
 * @param {string} name
 * @param {() => void} fn
 */
function describe(name, fn) {
  suites.push({ name, fn, tests: [] });
}

/**
 * @param {string} name
 * @param {() => void} fn
 * @param {{ skip?: boolean, only?: boolean }} [opts]
 */
function it(name, fn, opts = {}) {
  if (currentSuite) {
    currentSuite.tests.push({ name, fn, skip: !!opts.skip, only: !!opts.only });
  } else {
    suites.push({ name: '(standalone)', fn: () => {}, tests: [{ name, fn, skip: !!opts.skip, only: false }] });
  }
}
/** @param {string} name @param {() => void} fn */
it.skip = (name, fn) => it(name, fn, { skip: true });
/** @param {string} name @param {() => void} fn */
it.only = (name, fn) => it(name, fn, { only: true });

const _jsonMode = () => process.argv.includes('--json');

/** @param {any} suite */
async function runSuite(suite) {
  const quiet = _jsonMode();
  if (!quiet) console.log(`\n${suite.name}`);
  currentSuite = suite;
  const hasOnly = suite.tests.some((/** @type {any} */ t) => t.only);
  const testsToRun = hasOnly ? suite.tests.filter((/** @type {any} */ t) => t.only) : suite.tests;

  for (const test of testsToRun) {
    COUNTERS.total++;
    if (test.skip) {
      COUNTERS.skipped++;
      test._result = 'skipped';
      if (!quiet) console.log(`  ${statusIcon('skipped')} ${test.name} (skipped)`);
      continue;
    }
    const start = performance.now();
    try {
      await test.fn();
      const elapsed = performance.now() - start;
      COUNTERS.passed++;
      test._result = 'passed';
      test._duration = elapsed;
      if (!quiet) console.log(`  ${statusIcon('passed')} ${test.name} (${fmtDuration(elapsed)})`);
    } catch (err) {
      const elapsed = performance.now() - start;
      COUNTERS.failed++;
      test._result = 'failed';
      test._duration = elapsed;
      test._error = isAssertionError(err) ? err.message : `${err.name}: ${err.message}`;
      if (!quiet) {
        console.log(`  ${statusIcon('failed')} ${test.name} (${fmtDuration(elapsed)})`);
        console.log(`    ${test._error}`);
        if (!isAssertionError(err) && err.stack) {
          for (const line of err.stack.split('\n').slice(1, 4)) {
            console.log(`    ${line.trim()}`);
          }
        }
      }
    }
  }
  currentSuite = null;
}

async function run() {
  const quiet = _jsonMode();
  _started = performance.now();

  if (!quiet) {
    console.log('\n═══════════════════════════════════════════');
    console.log('  YrY Self-Test Suite');
    console.log('═══════════════════════════════════════════');
  }

  for (const suite of suites) suite.fn();
  for (const suite of suites) await runSuite(suite);

  _elapsed = performance.now() - _started;

  if (quiet) {
    // Output only JSON to stdout — run.mjs parses the last line
    console.log(JSON.stringify(getResults()));
  } else {
    console.log('\n───────────────────────────────────────────');
    console.log(`  Total: ${COUNTERS.total} | ${statusIcon('passed')} ${COUNTERS.passed} passed | ${statusIcon('failed')} ${COUNTERS.failed} failed | ${statusIcon('skipped')} ${COUNTERS.skipped} skipped`);
    console.log(`  Duration: ${fmtDuration(_elapsed)}`);
    console.log('───────────────────────────────────────────\n');
  }

  return COUNTERS.failed === 0 ? 0 : 1;
}

function getResults() {
  return {
    timestamp: new Date().toISOString(),
    durationMs: Math.round(_elapsed),
    summary: {
      total: COUNTERS.total,
      passed: COUNTERS.passed,
      failed: COUNTERS.failed,
      skipped: COUNTERS.skipped,
    },
    suites: suites.map((/** @type {any} */ s) => ({
      name: s.name,
      tests: s.tests.map((/** @type {any} */ t) => ({
        name: t.name,
        status: t._result || 'pending',
        duration: t._duration || null,
        error: t._error || null,
        skip: !!t.skip,
      }))
    })),
  };
}

export { describe, it, assert, run, getResults, AssertionError, isAssertionError, COUNTERS };
