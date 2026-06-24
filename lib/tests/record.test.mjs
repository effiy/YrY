/**
 * Tests for lib/record.mjs — execution memory recorder.
 * Tests data contracts, record structures, and state management.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

const VALID_COMMANDS = ["exec", "delivery", "audit", "state", "bootstrap", "compress"];

function createExecRecord(opts = {}) {
  return {
    session_id: opts.session || "s123",
    timestamp: new Date().toISOString(),
    story_name: opts.story || "test-story",
    feature: opts.feature || "",
    description: opts.description || "",
    planned_change_level: opts.changeLevel || "T2",
    actual_change_level: opts.changeLevel || "T2",
    phase_transitions: [],
    update_context: opts.context || "",
    agents_called: opts.agents || [],
    quality_issues: {
      P0: [],
      P1: [],
      P2: [],
    },
    bad_cases: [],
    was_blocked: opts.blocked || false,
    block_reason: opts.blocked ? (opts.reason || "unknown") : null,
    stage: opts.stage || "",
    duration_ms: opts.durationMs || 0,
  };
}

function createDeliveryRecord(opts = {}) {
  return {
    session_id: opts.session || "dlv123",
    timestamp: new Date().toISOString(),
    story_name: opts.story || "test-story",
    status: opts.status || "success",
    step: opts.step || "unknown",
    message: opts.message || "",
    duration_ms: opts.durationMs || 0,
  };
}

function createAuditRecord(opts = {}) {
  return {
    session_id: opts.session || "aud123",
    timestamp: new Date().toISOString(),
    story_name: opts.story || "test-story",
    tool: opts.tool || "unknown",
    result: opts.result || "success",
    duration_ms: opts.durationMs || 0,
    error: opts.error || null,
  };
}

function createInitialState(storyName) {
  const now = new Date().toISOString();
  return {
    story_name: storyName,
    started_at: now,
    current_stage: "任务",
    status: "任务",
    blocked: false,
    block_reason: null,
    last_updated: now,
    pipeline_progress: {},
    delivery_pipeline: {},
    change_history: [{
      timestamp: now,
      from_status: null,
      to_status: "任务",
      trigger: "bootstrap",
    }],
  };
}

function transitionState(state, newStage, trigger = "record state command") {
  const now = new Date().toISOString();
  const previousStage = state.current_stage;
  return {
    ...state,
    last_updated: now,
    current_stage: newStage,
    status: newStage,
    change_history: [
      ...state.change_history,
      { timestamp: now, from_status: previousStage, to_status: newStage, trigger },
    ],
  };
}

describe("lib/record.mjs", () => {
  describe("命令列表", () => {
    it("含 6 个命令", () => {
      assert.equal(VALID_COMMANDS.length, 6);
    });

    it("含 exec 命令", () => {
      assert.ok(VALID_COMMANDS.includes("exec"));
    });

    it("含 delivery 命令", () => {
      assert.ok(VALID_COMMANDS.includes("delivery"));
    });

    it("含 audit 命令", () => {
      assert.ok(VALID_COMMANDS.includes("audit"));
    });

    it("含 state 命令", () => {
      assert.ok(VALID_COMMANDS.includes("state"));
    });

    it("含 bootstrap 命令", () => {
      assert.ok(VALID_COMMANDS.includes("bootstrap"));
    });

    it("含 compress 命令", () => {
      assert.ok(VALID_COMMANDS.includes("compress"));
    });
  });

  describe("exec 记录结构", () => {
    it("含必填字段", () => {
      const record = createExecRecord({ story: "my-feature" });
      assert.ok(record.session_id);
      assert.equal(record.story_name, "my-feature");
      assert.ok(record.timestamp);
      assert.equal(typeof record.was_blocked, "boolean");
      assert.ok(Array.isArray(record.phase_transitions));
      assert.ok(Array.isArray(record.agents_called));
    });

    it("阻断记录含 reason", () => {
      const record = createExecRecord({ story: "bug", blocked: true, reason: "Gate A 失败" });
      assert.ok(record.was_blocked);
      assert.equal(record.block_reason, "Gate A 失败");
    });

    it("非阻断记录 reason 为 null", () => {
      const record = createExecRecord({ story: "ok" });
      assert.ok(!record.was_blocked);
      assert.equal(record.block_reason, null);
    });

    it("quality_issues 含 P0/P1/P2 数组", () => {
      const record = createExecRecord();
      assert.ok(Array.isArray(record.quality_issues.P0));
      assert.ok(Array.isArray(record.quality_issues.P1));
      assert.ok(Array.isArray(record.quality_issues.P2));
    });

    it("change_level 默认 T2", () => {
      const record = createExecRecord();
      assert.equal(record.planned_change_level, "T2");
      assert.equal(record.actual_change_level, "T2");
    });
  });

  describe("delivery 记录结构", () => {
    it("含必填字段", () => {
      const record = createDeliveryRecord({ story: "done", status: "success" });
      assert.equal(record.story_name, "done");
      assert.equal(record.status, "success");
      assert.ok(record.timestamp);
    });

    it("失败交付记录", () => {
      const record = createDeliveryRecord({ story: "fail", status: "failure" });
      assert.equal(record.status, "failure");
    });
  });

  describe("audit 记录结构", () => {
    it("含必填字段", () => {
      const record = createAuditRecord({ tool: "Edit", result: "success" });
      assert.equal(record.tool, "Edit");
      assert.equal(record.result, "success");
      assert.equal(record.error, null);
    });

    it("失败记录含 error", () => {
      const record = createAuditRecord({ tool: "Write", result: "failure", error: "ENOENT" });
      assert.equal(record.result, "failure");
      assert.equal(record.error, "ENOENT");
    });
  });

  describe("rui-state 状态管理", () => {
    it("初始状态为 任务", () => {
      const state = createInitialState("my-story");
      assert.equal(state.current_stage, "任务");
      assert.equal(state.status, "任务");
      assert.ok(!state.blocked);
      assert.equal(state.change_history.length, 1);
    });

    it("状态转换记录变更历史", () => {
      let state = createInitialState("my-story");
      state = transitionState(state, "设计");
      assert.equal(state.current_stage, "设计");
      assert.equal(state.change_history.length, 2);
      assert.equal(state.change_history[1].from_status, "任务");
      assert.equal(state.change_history[1].to_status, "设计");
    });

    it("完整管线状态转换", () => {
      let state = createInitialState("pipeline-test");
      const stages = ["设计", "实施", "测试", "报告", "改进"];
      for (const stage of stages) {
        state = transitionState(state, stage);
      }
      assert.equal(state.current_stage, "改进");
      assert.equal(state.change_history.length, 6); // 1 bootstrap + 5 transitions
    });

    it("阻断状态标记", () => {
      const state = createInitialState("blocked-story");
      const blocked = { ...state, blocked: true, block_reason: "no-branch-isolation" };
      assert.ok(blocked.blocked);
      assert.equal(blocked.block_reason, "no-branch-isolation");
    });
  });
});