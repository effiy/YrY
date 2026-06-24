/**
 * Vitest adapter for YrY self-test suites.
 *
 * Wraps the custom test-harness.mjs assert API with vitest's expect()
 * for richer error diffs, while preserving the same describe/it/assert
 * surface that existing test files expect.
 *
 * Usage (under vitest):
 *   import { describe, it, assert, run } from '../lib/vitest-adapter.mjs';
 *
 * Standalone (Node.js, no vitest):
 *   import { describe, it, assert, run } from '../lib/test-harness.mjs';
 */

import { describe as vitestDescribe, it as vitestIt, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Re-export vitest primitives under harness-compatible names
export const describe = vitestDescribe;
export const it = vitestIt;
// it.skip / it.only are already available as properties of vitestIt (getter-only in vitest 3.x)
export { beforeAll, afterAll, beforeEach, afterEach, expect };

// ── COUNTERS (maintained for backward compat) ───────────────────────
export const COUNTERS = { total: 0, passed: 0, failed: 0, skipped: 0 };

// ── Assert — mapped to vitest expect for better diffs ───────────────
export const assert = {
  equal(actual, expected, msg) {
    expect(actual, msg).toBe(expected);
  },
  notEqual(actual, expected, msg) {
    expect(actual, msg).not.toBe(expected);
  },
  deepEqual(actual, expected, msg) {
    expect(actual, msg).toEqual(expected);
  },
  ok(value, msg) {
    expect(value, msg).toBeTruthy();
  },
  fail(msg) {
    expect.fail(msg || 'assert.fail() called');
  },
  throws(fn, msg) {
    expect(fn).toThrow();
  },
  match(str, regex, msg) {
    expect(str, msg).toMatch(regex);
  },
  includes(haystack, needle, msg) {
    expect(haystack, msg).toContain(needle);
  },
  typeOf(value, expectedType, msg) {
    if (expectedType === 'array') expect(Array.isArray(value), msg).toBe(true);
    else expect(typeof value, msg).toBe(expectedType);
  },
};

// ── Run — no-op under vitest (vitest manages execution) ─────────────
/** Vitest-managed run — no-op, returns 0. Vitest handles execution.
 * @returns {Promise<number>} Always 0 */
export async function run() {
  return 0;
}

// ── getResults — stub for backward compat ───────────────────────────
/** Return a results stub for backward compatibility with legacy test runner consumers.
 * @returns {{ timestamp: string, durationMs: number, summary: object, suites: Array }} */
export function getResults() {
  return {
    timestamp: new Date().toISOString(),
    durationMs: 0,
    summary: { ...COUNTERS },
    suites: [],
  };
}

// ── Re-export helpers unchanged ─────────────────────────────────────
export {
  PROJECT_ROOT,
  DIRS,
  fileExists,
  readFile,
  readDir,
  isDir,
  hasSection,
  hasMermaidDiagram,
  hasTable,
  countMarkdownLinks,
  escapeRegex,
  parseFrontmatter,
  listSkills,
  listAgents,
  listRules,
  listStoryDirs,
} from './test-helpers.mjs';
