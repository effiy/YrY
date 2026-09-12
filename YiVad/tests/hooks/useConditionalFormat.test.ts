import { describe, it, expect } from "vitest";
import { useConditionalFormat, type ConditionalFormatRule } from "@/hooks/useConditionalFormat";

describe("useConditionalFormat", () => {
  it("starts with empty rules", () => {
    const { rules } = useConditionalFormat();
    expect(rules.value).toEqual([]);
  });

  it("addRule appends a rule", () => {
    const { rules, addRule } = useConditionalFormat();
    const rule: ConditionalFormatRule = {
      id: "r1", column: "amount", type: "highlight",
      config: { operator: "gt", target: 100, bgColor: "red" }, priority: 1,
    };
    addRule(rule);
    expect(rules.value).toHaveLength(1);
    expect(rules.value[0].id).toBe("r1");
  });

  it("removeRule deletes by id", () => {
    const { rules, addRule, removeRule } = useConditionalFormat();
    addRule({ id: "r1", column: "amount", type: "highlight", config: {}, priority: 1 });
    addRule({ id: "r2", column: "name", type: "highlight", config: {}, priority: 2 });
    removeRule("r1");
    expect(rules.value).toHaveLength(1);
    expect(rules.value[0].id).toBe("r2");
  });

  it("updateRule patches specified fields", () => {
    const { rules, addRule, updateRule } = useConditionalFormat();
    addRule({ id: "r1", column: "amount", type: "highlight", config: {}, priority: 1 });
    updateRule("r1", { priority: 5 });
    expect(rules.value[0].priority).toBe(5);
  });

  it("clearRules removes all rules", () => {
    const { rules, addRule, clearRules } = useConditionalFormat();
    addRule({ id: "r1", column: "amount", type: "highlight", config: {}, priority: 1 });
    addRule({ id: "r2", column: "name", type: "highlight", config: {}, priority: 2 });
    clearRules();
    expect(rules.value).toEqual([]);
  });

  it("sortedRules sorts by priority ascending", () => {
    const { sortedRules, addRule } = useConditionalFormat();
    addRule({ id: "r2", column: "x", type: "highlight", config: {}, priority: 2 });
    addRule({ id: "r1", column: "x", type: "highlight", config: {}, priority: 1 });
    expect(sortedRules.value[0].id).toBe("r1");
    expect(sortedRules.value[1].id).toBe("r2");
  });

  it("getCellStyle returns style for matching gt condition", () => {
    const { addRule, getCellStyle } = useConditionalFormat();
    addRule({
      id: "r1", column: "amount", type: "highlight",
      config: { operator: "gt", target: 100, bgColor: "red", textColor: "white" },
      priority: 1,
    });
    const style = getCellStyle("amount", 200);
    expect(style).toEqual({ backgroundColor: "red", color: "white" });
  });

  it("getCellStyle returns empty for non-matching value", () => {
    const { addRule, getCellStyle } = useConditionalFormat();
    addRule({
      id: "r1", column: "amount", type: "highlight",
      config: { operator: "gt", target: 100, bgColor: "red" },
      priority: 1,
    });
    expect(getCellStyle("amount", 50)).toEqual({});
  });

  it("getCellStyle returns empty for non-matching column", () => {
    const { addRule, getCellStyle } = useConditionalFormat();
    addRule({
      id: "r1", column: "amount", type: "highlight",
      config: { operator: "gt", target: 100, bgColor: "red" },
      priority: 1,
    });
    expect(getCellStyle("name", 200)).toEqual({});
  });

  it("getCellStyle matches eq operator", () => {
    const { addRule, getCellStyle } = useConditionalFormat();
    addRule({
      id: "r1", column: "status", type: "highlight",
      config: { operator: "eq", target: "done", bgColor: "green" },
      priority: 1,
    });
    expect(getCellStyle("status", "done")).toEqual({ backgroundColor: "green" });
    expect(getCellStyle("status", "open")).toEqual({});
  });
});