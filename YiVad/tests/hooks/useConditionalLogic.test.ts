/**
 * useConditionalLogic — 条件逻辑规则引擎
 *
 * ## 场景
 * 税务申报表单：「主体类型」选"企业" → 显示「统一社会信用代码」字段并设为必填；
 * 选"个人" → 隐藏该字段。多条规则按优先级排序，高优先级规则在冲突属性上覆盖低优先级。
 * 订阅表单：「订阅」未勾选 → 禁用「邮箱」字段。
 *
 * ## 效果演示
 * ```
 * const { fieldStates, runRules, testRules, exportRules } =
 *   useConditionalLogic({ formData, rules: [
 *     { id: "tax-id", priority: 10, name: "企业需填税号",
 *       conditions: { operator: "AND", conditions: [{ field: "type", operator: "equals", value: "enterprise" }] },
 *       actions: [{ target: "taxId", action: "show" }, { target: "taxId", action: "require" }] },
 *     { id: "disable-email", priority: 5, name: "未订阅禁用邮箱",
 *       conditions: { operator: "AND", conditions: [{ field: "subscribed", operator: "not_equals", value: true }] },
 *       actions: [{ target: "email", action: "disable" }] },
 *   ]});
 *
 * // 模板中:
 * // <el-form-item v-if="fieldStates.taxId?.visible" :required="fieldStates.taxId?.required">
 * // <el-input v-model="formData.email" :disabled="fieldStates.email?.disabled" />
 * ```
 *
 * ## 关键行为
 * - 11 种运算符 + AND/OR 组合 + 嵌套条件组
 * - 高优先级规则在相同 property 上覆盖低优先级；不同 property 可共存
 * - `testRules(testData)` 用假设数据运行，不修改真实 formData
 * - `exportRules()` / `importRules(json)` 支持规则持久化
 */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useConditionalLogic, type ConditionalRule } from "@/hooks/useConditionalLogic";

describe("useConditionalLogic", () => {
  const rules: ConditionalRule[] = [
    { id: "r1", name: "Show email when type is personal", priority: 10,
      conditions: { operator: "AND", conditions: [{ field: "type", operator: "equals", value: "personal" }] },
      actions: [{ target: "email", action: "show" }] },
    { id: "r2", name: "Require taxId when type is business", priority: 10,
      conditions: { operator: "AND", conditions: [{ field: "type", operator: "equals", value: "business" }] },
      actions: [{ target: "taxId", action: "require" }] },
    { id: "r3", name: "Disable submit when not agreed", priority: 5,
      conditions: { operator: "AND", conditions: [{ field: "agreed", operator: "not_equals", value: true }] },
      actions: [{ target: "submit", action: "disable" }] },
  ];

  // ── 规则未命中时不影响字段 ────────────────────────────

  it("规则条件不满足 → 目标字段不在 fieldStates 中出现", () => {
    const formData = ref({ type: "" });
    const { fieldStates } = useConditionalLogic({ formData, rules });
    expect(fieldStates.value.email).toBeUndefined();
  });

  // ── show/hide：根据条件控制字段显隐 ───────────────────

  it("type='personal' → email.visible=true", () => {
    const formData = ref({ type: "personal" });
    const { fieldStates } = useConditionalLogic({ formData, rules });
    expect(fieldStates.value.email?.visible).toBe(true);
  });

  // ── require/optional：根据条件控制字段必填 ────────────

  it("type='business' → taxId.required=true", () => {
    const formData = ref({ type: "business" });
    const { fieldStates } = useConditionalLogic({ formData, rules });
    expect(fieldStates.value.taxId?.required).toBe(true);
  });

  // ── enable/disable：根据条件控制字段可用性 ────────────

  it("agreed≠true → submit.disabled=true", () => {
    const formData = ref({ agreed: false });
    const { fieldStates } = useConditionalLogic({ formData, rules });
    expect(fieldStates.value.submit?.disabled).toBe(true);
  });

  // ── 条件组合：OR 任一满足即触发 ──────────────────────

  it("OR 条件组 → 任一子条件满足即执行 actions", () => {
    const orRules: ConditionalRule[] = [{
      id: "r1", name: "OR rule", priority: 1,
      conditions: { operator: "OR", conditions: [
        { field: "a", operator: "equals", value: 1 },
        { field: "b", operator: "equals", value: 2 },
      ]},
      actions: [{ target: "c", action: "show" }]
    }];
    const formData = ref({ a: 0, b: 2 }); // a 不满足，b 满足
    const { fieldStates } = useConditionalLogic({ formData, rules: orRules });
    expect(fieldStates.value.c?.visible).toBe(true);
  });

  // ── 嵌套条件组 ────────────────────────────────────────

  it("嵌套 AND( a=1 AND OR(b=1, b=2) ) → 全部满足触发", () => {
    const nestedRules: ConditionalRule[] = [{
      id: "r1", name: "Nested", priority: 1,
      conditions: {
        operator: "AND",
        conditions: [{ field: "a", operator: "equals", value: 1 }],
        groups: [{ operator: "OR", conditions: [
          { field: "b", operator: "equals", value: 1 },
          { field: "b", operator: "equals", value: 2 },
        ]}]
      },
      actions: [{ target: "c", action: "show" }]
    }];
    const formData = ref({ a: 1, b: 2 });
    const { fieldStates } = useConditionalLogic({ formData, rules: nestedRules });
    expect(fieldStates.value.c?.visible).toBe(true);
  });

  // ── set_value：自动填充派生字段 ──────────────────────

  it("set_value → 直接修改 formData 响应式值", () => {
    const setRules: ConditionalRule[] = [{
      id: "r1", name: "Set value", priority: 1,
      conditions: { operator: "AND", conditions: [{ field: "trigger", operator: "equals", value: true }] },
      actions: [{ target: "computed", action: "set_value", value: "auto-filled" }]
    }];
    const formData = ref({ trigger: true });
    useConditionalLogic({ formData, rules: setRules });
    expect(formData.value.computed).toBe("auto-filled");
  });

  // ── 优先级冲突：高优先级规则胜出 ──────────────────────

  it("priority=10 show vs priority=1 hide → 高优先级 show 胜出", () => {
    const conflictRules: ConditionalRule[] = [
      { id: "high", name: "高优先级显示", priority: 10,
        conditions: { operator: "AND", conditions: [{ field: "flag", operator: "equals", value: true }] },
        actions: [{ target: "fieldX", action: "show" }] },
      { id: "low", name: "低优先级隐藏", priority: 1,
        conditions: { operator: "AND", conditions: [{ field: "flag", operator: "equals", value: true }] },
        actions: [{ target: "fieldX", action: "hide" }] },
    ];
    const formData = ref({ flag: true });
    const { fieldStates } = useConditionalLogic({ formData, rules: conflictRules });
    expect(fieldStates.value.fieldX?.visible).toBe(true);
  });

  it("高优先级 show + 低优先级 disable → 两者共存（不同 property）", () => {
    const mixedRules: ConditionalRule[] = [
      { id: "high", name: "显示字段", priority: 10,
        conditions: { operator: "AND", conditions: [{ field: "flag", operator: "equals", value: true }] },
        actions: [{ target: "fieldX", action: "show" }] },
      { id: "low", name: "禁用字段", priority: 1,
        conditions: { operator: "AND", conditions: [{ field: "flag", operator: "equals", value: true }] },
        actions: [{ target: "fieldX", action: "disable" }] },
    ];
    const formData = ref({ flag: true });
    const { fieldStates } = useConditionalLogic({ formData, rules: mixedRules });
    expect(fieldStates.value.fieldX?.visible).toBe(true);
    expect(fieldStates.value.fieldX?.disabled).toBe(true);
  });

  // ── 规则导入/导出 ─────────────────────────────────────

  it("exportRules → importRules 往返一致", () => {
    const formData = ref({});
    const { exportRules, importRules } = useConditionalLogic({ formData, rules });
    const imported = importRules(exportRules());
    expect(imported).toHaveLength(rules.length);
    expect(imported[0].id).toBe(rules[0].id);
  });

  // ── 模拟测试：不影响真实数据 ──────────────────────────

  it("testRules({ type: 'personal' }) → email 可见，真实 formData 不变", () => {
    const formData = ref({ type: "" });
    const { testRules } = useConditionalLogic({ formData, rules });
    const result = testRules({ type: "personal" });
    expect(result.email?.visible).toBe(true);
    expect(formData.value.type).toBe(""); // 真实数据未修改
  });
});