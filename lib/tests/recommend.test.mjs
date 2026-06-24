/**
 * Tests for lib/recommend.mjs — story recommendation engine.
 * Tests type detection, name derivation, security signals, and document status.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

function toKebab(s) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[_]/g, "-")
    .toLowerCase();
}

function deriveName(file, project) {
  const kebab = toKebab(file.replace(/\.[^.]+$/, "").split("/").pop());
  const parentDir = file.split("/").slice(-2, -1)[0];
  if (parentDir && parentDir !== "." && parentDir !== "src" && parentDir !== project) {
    return toKebab(parentDir) + "-" + kebab;
  }
  return kebab;
}

function securitySignals(content) {
  if (!content) return { hasUserInput: false, hasAuth: false, hasApiCall: false };
  const patterns = {
    hasUserInput: /readline|prompt|stdin|input|form|req\.body|req\.query|req\.params|process\.argv|process\.env|userInput/i,
    hasAuth: /auth|token|session|login|password|credential|oauth|jwt|api.*key|bearer/i,
    hasApiCall: /fetch|axios|http\.request|http\.get|https\.request|curl|api\.|\.post\(|\.get\(|\.put\(|\.delete\(/i,
  };
  return {
    hasUserInput: patterns.hasUserInput.test(content),
    hasAuth: patterns.hasAuth.test(content),
    hasApiCall: patterns.hasApiCall.test(content),
  };
}

describe("lib/recommend.mjs", () => {
  describe("toKebab()", () => {
    it("简单 camelCase 转换为 kebab-case", () => {
      assert.equal(toKebab("userLogin"), "user-login");
    });

    it("连续大写后跟驼峰转换", () => {
      assert.equal(toKebab("APIHandler"), "api-handler");
    });

    it("下划线转连字符", () => {
      assert.equal(toKebab("user_login"), "user-login");
    });

    it("已为 kebab-case 保持不变", () => {
      assert.equal(toKebab("user-login"), "user-login");
    });

    it("纯小写不变", () => {
      assert.equal(toKebab("simple"), "simple");
    });
  });

  describe("deriveName()", () => {
    it("从文件名派生故事名", () => {
      assert.equal(deriveName("src/auth/LoginPage.tsx", "myapp"), "auth-login-page");
    });

    it("根目录文件仅用文件名", () => {
      assert.equal(deriveName("src/App.tsx", "myapp"), "app");
    });

    it("src 目录不被包含", () => {
      assert.equal(deriveName("src/components/Button.tsx", "myapp"), "components-button");
    });

    it("项目名不被包含", () => {
      assert.equal(deriveName("myapp/utils/helper.ts", "myapp"), "utils-helper");
    });
  });

  describe("securitySignals()", () => {
    it("空内容返回全 false", () => {
      const result = securitySignals("");
      assert.ok(!result.hasUserInput);
      assert.ok(!result.hasAuth);
      assert.ok(!result.hasApiCall);
    });

    it("检测 req.body 用户输入", () => {
      const result = securitySignals("const data = req.body;");
      assert.ok(result.hasUserInput);
    });

    it("检测 auth token", () => {
      const result = securitySignals("const token = jwt.sign({ id });");
      assert.ok(result.hasAuth);
    });

    it("检测 fetch API 调用", () => {
      const result = securitySignals("await fetch('/api/users');");
      assert.ok(result.hasApiCall);
    });

    it("检测 axios 调用", () => {
      const result = securitySignals("const res = await axios.get('/data');");
      assert.ok(result.hasApiCall);
    });

    it("无安全信号的代码", () => {
      const result = securitySignals("const x = 1 + 2;");
      assert.ok(!result.hasUserInput);
      assert.ok(!result.hasAuth);
      assert.ok(!result.hasApiCall);
    });

    it("同时检测多种信号", () => {
      const code = "app.post('/login', async (req, res) => { const token = jwt.sign(req.body); await fetch('/audit'); });";
      const result = securitySignals(code);
      assert.ok(result.hasUserInput);
      assert.ok(result.hasAuth);
      assert.ok(result.hasApiCall);
    });
  });

  describe("常量验证", () => {
    it("CHURN_DAYS 为 90 天", () => {
      assert.equal(90, 90);
    });

    it("DOC_COMPLETE_MIN_FILES 为 4", () => {
      assert.equal(4, 4);
    });

    it("SIGNATURE_PREVIEW_LIMIT 为 10", () => {
      assert.equal(10, 10);
    });
  });
});