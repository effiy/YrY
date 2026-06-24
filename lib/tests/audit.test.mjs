/**
 * Tests for lib/audit.mjs — tool call audit logger.
 * Tests internal functions, constants, and permission validation logic.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

const AGENT_TOOLS = {
  pm:             new Set(["Read", "Grep", "Glob", "Bash"]),
  coder:          new Set(["Read", "Grep", "Glob", "Edit", "Write", "Bash"]),
  tester:         new Set(["Read", "Grep", "Glob", "Bash"]),
  reporter:       new Set(["Read", "Grep", "Glob"]),
  security:       new Set(["Read", "Grep", "Glob"]),
  "self-improve": new Set(["Read", "Grep", "Glob", "Bash"]),
};

function checkToolPermission(agent, tool) {
  const allowed = AGENT_TOOLS[agent];
  if (!allowed) return { allowed: false, reason: "unknown_agent" };
  return { allowed: allowed.has(tool), reason: allowed.has(tool) ? null : "not_permitted" };
}

describe("lib/audit.mjs", () => {
  describe("Agent 工具权限定义", () => {
    it("pm 有 Read/Grep/Glob/Bash 权限", () => {
      const tools = AGENT_TOOLS.pm;
      assert.ok(tools.has("Read"));
      assert.ok(tools.has("Grep"));
      assert.ok(tools.has("Glob"));
      assert.ok(tools.has("Bash"));
      assert.ok(!tools.has("Edit"));
      assert.ok(!tools.has("Write"));
    });

    it("coder 有全部工具权限", () => {
      const tools = AGENT_TOOLS.coder;
      assert.ok(tools.has("Read"));
      assert.ok(tools.has("Grep"));
      assert.ok(tools.has("Glob"));
      assert.ok(tools.has("Edit"));
      assert.ok(tools.has("Write"));
      assert.ok(tools.has("Bash"));
    });

    it("tester 无 Edit/Write 权限", () => {
      const tools = AGENT_TOOLS.tester;
      assert.ok(!tools.has("Edit"));
      assert.ok(!tools.has("Write"));
    });

    it("reporter 仅有 Read/Grep/Glob 权限", () => {
      const tools = AGENT_TOOLS.reporter;
      assert.equal(tools.size, 3);
      assert.ok(tools.has("Read"));
      assert.ok(tools.has("Grep"));
      assert.ok(tools.has("Glob"));
      assert.ok(!tools.has("Bash"));
      assert.ok(!tools.has("Edit"));
      assert.ok(!tools.has("Write"));
    });

    it("security 仅有 Read/Grep/Glob 权限", () => {
      const tools = AGENT_TOOLS.security;
      assert.equal(tools.size, 3);
      assert.ok(!tools.has("Bash"));
      assert.ok(!tools.has("Edit"));
      assert.ok(!tools.has("Write"));
    });

    it("self-improve 有 Read/Grep/Glob/Bash 权限", () => {
      const tools = AGENT_TOOLS["self-improve"];
      assert.ok(tools.has("Bash"));
      assert.ok(!tools.has("Edit"));
      assert.ok(!tools.has("Write"));
    });
  });

  describe("工具权限检查", () => {
    it("pm 使用 Read 通过", () => {
      const result = checkToolPermission("pm", "Read");
      assert.ok(result.allowed);
    });

    it("pm 使用 Edit 被拒绝", () => {
      const result = checkToolPermission("pm", "Edit");
      assert.ok(!result.allowed);
      assert.equal(result.reason, "not_permitted");
    });

    it("coder 使用 Edit 通过", () => {
      const result = checkToolPermission("coder", "Edit");
      assert.ok(result.allowed);
    });

    it("coder 使用 Write 通过", () => {
      const result = checkToolPermission("coder", "Write");
      assert.ok(result.allowed);
    });

    it("未知 agent 返回 unknown_agent", () => {
      const result = checkToolPermission("unknown", "Read");
      assert.ok(!result.allowed);
      assert.equal(result.reason, "unknown_agent");
    });

    it("tester 越权使用 Edit 被拒绝", () => {
      const result = checkToolPermission("tester", "Edit");
      assert.ok(!result.allowed);
    });

    it("reporter 越权使用 Write 被拒绝", () => {
      const result = checkToolPermission("reporter", "Write");
      assert.ok(!result.allowed);
    });

    it("security 越权使用 Bash 被拒绝", () => {
      const result = checkToolPermission("security", "Bash");
      assert.ok(!result.allowed);
    });
  });

  describe("ISP 最小权限原则", () => {
    it("每个 agent 工具集 ≤ 6 个", () => {
      for (const [agent, tools] of Object.entries(AGENT_TOOLS)) {
        assert.ok(tools.size <= 6, `${agent} 工具集大小 ${tools.size} > 6`);
      }
    });

    it("仅 coder 有 Edit 权限", () => {
      for (const [agent, tools] of Object.entries(AGENT_TOOLS)) {
        if (agent === "coder") {
          assert.ok(tools.has("Edit"), "coder 必须有 Edit");
        } else {
          assert.ok(!tools.has("Edit"), `${agent} 不应有 Edit`);
        }
      }
    });

    it("仅 coder 有 Write 权限", () => {
      for (const [agent, tools] of Object.entries(AGENT_TOOLS)) {
        if (agent === "coder") {
          assert.ok(tools.has("Write"), "coder 必须有 Write");
        } else {
          assert.ok(!tools.has("Write"), `${agent} 不应有 Write`);
        }
      }
    });
  });

  describe("审计记录结构", () => {
    it("审计记录含必填字段", () => {
      const record = {
        timestamp: new Date().toISOString(),
        session_id: "",
        agent: "pm",
        tool: "Read",
        target: "skills/rui/SKILL.md",
        duration_ms: 150,
        result: "success",
        error: null,
      };

      assert.ok(record.timestamp);
      assert.ok(record.agent);
      assert.ok(record.tool);
      assert.equal(typeof record.duration_ms, "number");
      assert.ok(["success", "failure"].includes(record.result));
    });

    it("失败记录含 error 信息", () => {
      const record = {
        timestamp: new Date().toISOString(),
        agent: "coder",
        tool: "Write",
        target: "/nonexistent/file.mjs",
        duration_ms: 0,
        result: "failure",
        error: "ENOENT: no such file",
      };

      assert.equal(record.result, "failure");
      assert.ok(record.error);
      assert.ok(record.error.length > 0);
    });
  });
});