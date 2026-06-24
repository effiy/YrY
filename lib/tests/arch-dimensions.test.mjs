/**
 * Tests for lib/arch-dimensions/* — verifies architecture dimension
 * checkers can be invoked and return structured results.
 *
 * These checks operate on the entire project, so they may take time.
 * We only verify the shape and pass/fail classification of results.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';

import {
  checkKernel, checkParadigm, checkCoupling,
} from '../arch-dimensions/kernel-paradigm.mjs';
import {
  checkSRP, checkDRY, checkYAGNI, checkOCP,
} from '../arch-dimensions/solid.mjs';
import {
  checkISP, checkFrontmatter, checkDocFreshness,
} from '../arch-dimensions/quality.mjs';

const CHECKS = [
  ['checkKernel',       checkKernel],
  ['checkParadigm',     checkParadigm],
  ['checkCoupling',     checkCoupling],
  ['checkSRP',          checkSRP],
  ['checkDRY',          checkDRY],
  ['checkYAGNI',        checkYAGNI],
  ['checkOCP',          checkOCP],
  ['checkISP',          checkISP],
  ['checkFrontmatter',  checkFrontmatter],
  ['checkDocFreshness', checkDocFreshness],
];

describe('lib/arch-dimensions/*', () => {
  for (const [name, fn] of CHECKS) {
    describe(name, () => {
      it('返回包含 dim/label/pass/checks 字段的对象', () => {
        const root = process.cwd();
        const result = fn(root);
        assert.ok(typeof result === 'object', 'must return object');
        assert.ok(typeof result.dim === 'string', 'must have dim field');
        assert.ok(typeof result.label === 'string', 'must have label field');
        assert.ok(Array.isArray(result.checks), 'must have checks array');
        assert.ok(typeof result.pass === 'boolean', 'must have pass boolean');
      });

      it('每条 check 都有 id/pass 字段', () => {
        const result = fn(process.cwd());
        for (const c of result.checks) {
          assert.ok(typeof c.id === 'string' && c.id.length > 0, 'check must have id');
          assert.ok(typeof c.pass === 'boolean', 'check must have pass boolean');
        }
      });
    });
  }
});

await run();
