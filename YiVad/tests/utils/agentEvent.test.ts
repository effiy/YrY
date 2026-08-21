import { describe, it, expect } from "vitest";
import {
  toolLabel,
  toolCallsFromResults,
  runningToolCall,
  finalizeToolCall,
  modelSwitchNotice,
  MAX_TURNS_NOTICE,
} from "@/utils/agentEvent";

describe("toolLabel", () => {
  it("converts snake_case to Title Case", () => {
    expect(toolLabel("db_create")).toBe("Db Create");
    expect(toolLabel("db_delete")).toBe("Db Delete");
    expect(toolLabel("db_list")).toBe("Db List");
    expect(toolLabel("db_schema")).toBe("Db Schema");
  });

  it("handles single words", () => {
    expect(toolLabel("read")).toBe("Read");
  });
});

describe("toolCallsFromResults", () => {
  it("returns empty array for undefined", () => {
    expect(toolCallsFromResults(undefined)).toEqual([]);
  });

  it("maps tool results to entries", () => {
    const results = [
      { name: "db_list", content: "3 docs", error: undefined, duration_ms: 150 },
      { name: "db_create", content: "created", error: undefined, duration_ms: 200 },
    ];
    const entries = toolCallsFromResults(results);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ name: "db_list", label: "Db List", content: "3 docs", durationMs: 150 });
    expect(entries[1]).toMatchObject({ name: "db_create", label: "Db Create", content: "created", durationMs: 200 });
  });

  it("handles error results", () => {
    const results = [{ name: "db_delete", content: "", error: "Rejected by user", duration_ms: 0 }];
    const entries = toolCallsFromResults(results);
    expect(entries[0].error).toBe("Rejected by user");
  });
});

describe("runningToolCall", () => {
  it("creates a (running) entry", () => {
    const entry = runningToolCall({ name: "db_create", label: "Db Create" });
    expect(entry).toMatchObject({ name: "db_create", label: "Db Create", content: "(running)" });
  });

  it("generates label from name when not provided", () => {
    const entry = runningToolCall({ name: "db_list" });
    expect(entry.label).toBe("Db List");
  });
});

describe("finalizeToolCall", () => {
  it("updates the matching call with content", () => {
    const calls = [
      { name: "db_list", label: "Db List", content: "(running)" },
    ];
    const updated = finalizeToolCall(calls, { name: "db_list", content: "3 docs" });
    expect(updated[0].content).toBe("3 docs");
  });

  it("updates error and duration", () => {
    const calls = [{ name: "db_create", label: "Db Create", content: "(running)" }];
    const updated = finalizeToolCall(calls, {
      name: "db_create",
      content: "",
      error: "Rejected by user",
      duration_ms: 50,
    });
    expect(updated[0].error).toBe("Rejected by user");
    expect(updated[0].durationMs).toBe(50);
  });

  it("returns original array when no match", () => {
    const calls = [{ name: "db_list", label: "Db List", content: "ok" }];
    const updated = finalizeToolCall(calls, { name: "db_create", content: "x" });
    expect(updated).toBe(calls);
  });

  it("does not mutate original array", () => {
    const calls = [{ name: "db_list", label: "Db List", content: "(running)" }];
    const updated = finalizeToolCall(calls, { name: "db_list", content: "done" });
    expect(calls[0].content).toBe("(running)");
    expect(updated[0].content).toBe("done");
  });
});

describe("modelSwitchNotice", () => {
  it("formats zh model switch notice", () => {
    const notice = modelSwitchNotice("qwen3.5", "qwen3-coder");
    expect(notice).toContain("模型自动切换");
    expect(notice).toContain("qwen3.5");
    expect(notice).toContain("qwen3-coder");
  });
});

describe("MAX_TURNS_NOTICE", () => {
  it("is a non-empty string", () => {
    expect(typeof MAX_TURNS_NOTICE).toBe("string");
    expect(MAX_TURNS_NOTICE.length).toBeGreaterThan(0);
  });

  it("mentions continuing", () => {
    expect(MAX_TURNS_NOTICE).toContain("继续");
  });
});