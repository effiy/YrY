/**
 * Tests for lib/constants.mjs — verifies all shared project constants are
 * defined, have correct types, and use sensible values.
 */

import { describe, it, assert, run } from '../vitest-adapter.mjs';

import * as C from '../constants.mjs';

describe('lib/constants.mjs', () => {
  describe('CLI 常量', () => {
    it('NODE_ARGV_OFFSET 必须是 2', () => {
      assert.equal(C.NODE_ARGV_OFFSET, 2, 'skip "node <script>" in process.argv');
    });
  });

  describe('网络超时', () => {
    it('HTTP_TIMEOUT_MS 是正整数', () => {
      assert.ok(Number.isInteger(C.HTTP_TIMEOUT_MS), 'must be integer');
      assert.ok(C.HTTP_TIMEOUT_MS > 0, 'must be positive');
    });

    it('HTTP_TIMEOUT_SHORT_MS < HTTP_TIMEOUT_MS', () => {
      assert.ok(C.HTTP_TIMEOUT_SHORT_MS < C.HTTP_TIMEOUT_MS, 'short timeout must be shorter than default');
    });

    it('GIT_TIMEOUT_MS 是正整数', () => {
      assert.ok(Number.isInteger(C.GIT_TIMEOUT_MS), 'must be integer');
      assert.ok(C.GIT_TIMEOUT_MS > 0, 'must be positive');
    });
  });

  describe('默认 API 配置', () => {
    it('DEFAULT_API_URL 是 https URL', () => {
      assert.ok(typeof C.DEFAULT_API_URL === 'string', 'must be string');
      assert.ok(C.DEFAULT_API_URL.startsWith('https://'), 'must be HTTPS');
    });

    it('SESSION_QUERY_LIMIT 是正整数', () => {
      assert.ok(Number.isInteger(C.SESSION_QUERY_LIMIT), 'must be integer');
      assert.ok(C.SESSION_QUERY_LIMIT >= 100, 'must be at least 100');
    });
  });

  describe('消息长度常量', () => {
    it('ERROR_MSG_MAX_LEN 是正整数', () => {
      assert.ok(Number.isInteger(C.ERROR_MSG_MAX_LEN), 'must be integer');
      assert.ok(C.ERROR_MSG_MAX_LEN >= 100, 'must be at least 100 chars');
    });

    it('MAX_MSG_LENGTH 是正整数', () => {
      assert.ok(Number.isInteger(C.MAX_MSG_LENGTH), 'must be integer');
      assert.ok(C.MAX_MSG_LENGTH > C.ERROR_MSG_MAX_LEN, 'MAX_MSG_LENGTH should exceed ERROR_MSG_MAX_LEN');
    });
  });

  describe('健康评级阈值 (HEALTH_GRADE_THRESHOLDS)', () => {
    it('是数组', () => {
      assert.ok(Array.isArray(C.HEALTH_GRADE_THRESHOLDS), 'must be array');
    });

    it('按 min 降序排列', () => {
      const thresholds = C.HEALTH_GRADE_THRESHOLDS;
      for (let i = 1; i < thresholds.length; i++) {
        assert.ok(thresholds[i].min < thresholds[i - 1].min, `threshold ${i}.min must be less than ${i - 1}.min`);
      }
    });

    it('每条都有 grade/label/color 字段', () => {
      for (const t of C.HEALTH_GRADE_THRESHOLDS) {
        assert.ok(typeof t.grade === 'string' && t.grade.length === 1, 'grade must be single letter');
        assert.ok(typeof t.label === 'string' && t.label.length > 0, 'label must be non-empty');
        assert.ok(typeof t.color === 'string' && t.color.length > 0, 'color must be non-empty');
        assert.ok(typeof t.min === 'number', 'min must be number');
      }
    });

    it('最后一条的 min 为 0', () => {
      const last = C.HEALTH_GRADE_THRESHOLDS[C.HEALTH_GRADE_THRESHOLDS.length - 1];
      assert.equal(last.min, 0, 'last threshold must catch all scores ≥ 0');
    });
  });

  describe('诊断引擎常量', () => {
    it('DIAGNOSTIC_MIN_CONFIDENCE D0-D8 全部定义', () => {
      for (let i = 0; i <= 8; i++) {
        assert.ok(typeof C.DIAGNOSTIC_MIN_CONFIDENCE[`D${i}`] === 'number', `D${i} must be defined`);
      }
    });

    it('DIAGNOSTIC_LABELS 包含 D0-D8', () => {
      for (let i = 0; i <= 8; i++) {
        assert.ok(typeof C.DIAGNOSTIC_LABELS[`D${i}`] === 'string', `D${i} label must be defined`);
      }
    });

    it('BLOCK_RATE_THRESHOLD 在 0-1 之间', () => {
      assert.ok(C.BLOCK_RATE_THRESHOLD > 0 && C.BLOCK_RATE_THRESHOLD < 1);
    });

    it('TOOL_ERROR_RATE_THRESHOLD 在 0-1 之间', () => {
      assert.ok(C.TOOL_ERROR_RATE_THRESHOLD > 0 && C.TOOL_ERROR_RATE_THRESHOLD < 1);
    });

    it('T3_PROPORTION_THRESHOLD 在 0-1 之间', () => {
      assert.ok(C.T3_PROPORTION_THRESHOLD > 0 && C.T3_PROPORTION_THRESHOLD < 1);
    });
  });

  describe('布局常量', () => {
    it('INDENT 是非空字符串', () => {
      assert.ok(typeof C.INDENT === 'string' && C.INDENT.length > 0);
    });

    it('LEFT_COLUMN_WIDTH 是正整数', () => {
      assert.ok(Number.isInteger(C.LEFT_COLUMN_WIDTH) && C.LEFT_COLUMN_WIDTH > 0);
    });

    it('COLUMN_MIN_PADDING 是正整数', () => {
      assert.ok(Number.isInteger(C.COLUMN_MIN_PADDING) && C.COLUMN_MIN_PADDING > 0);
    });
  });
});

await run();
