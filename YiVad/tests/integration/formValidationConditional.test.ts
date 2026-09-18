/**
 * IT-F01: 验证 × 条件逻辑 × 字段依赖 集成测试
 *
 * 验证范围：
 * - 条件逻辑隐藏字段后验证跳过
 * - 条件逻辑显示字段后验证生效
 * - 字段依赖级联加载期间验证状态
 * - 依赖字段值清除触发条件重新评估
 * - 循环依赖检测阻断提交流程
 */
import { describe, it, expect } from "vitest";
import { ref, nextTick } from "vue";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useConditionalLogic, type ConditionalRule } from "@/hooks/useConditionalLogic";
import { useFieldDependency } from "@/hooks/useFieldDependency";
import type { FieldValidationConfig } from "@/utils/validation/types";

describe("IT-F01: 验证 × 条件逻辑 × 字段依赖", () => {
  // ── Helper: create a validation hook for a typical form ──

  function createValidation(
    initialData: Record<string, any>,
    fields: FieldValidationConfig[]
  ) {
    return useFormValidation({ initialData, fields });
  }

  // ── Helper: create conditional logic rules ──

  function createConditionalLogic(
    formData: ReturnType<typeof ref<Record<string, any>>>,
    rules: ConditionalRule[]
  ) {
    return useConditionalLogic({ formData, rules });
  }

  // ── Helper: create field dependencies ──

  function createFieldDependency(
    formData: ReturnType<typeof ref<Record<string, any>>>,
    deps: any[]
  ) {
    return useFieldDependency({ formData, dependencies: deps });
  }

  // ── IT-F01-1: 条件逻辑隐藏字段后验证跳过 ──

  it("validateAll skips fields hidden by conditional logic", async () => {
    const formData = ref({ type: "individual", taxId: "" });

    const { validateAll, state } = useFormValidation({
      initialData: formData.value,
      fields: [
        {
          field: "type",
          label: "Type",
          rules: [
            { name: "required", validator: (v: any) => !!v, message: "Required", trigger: "change" }
          ]
        },
        {
          field: "taxId",
          label: "Tax ID",
          rules: [
            { name: "required", validator: (v: any) => !!v, message: "Tax ID required", trigger: "blur" },
            { name: "len", validator: (v: any) => String(v ?? "").length >= 5, message: "Min 5 chars", trigger: "blur" }
          ],
          when: (data) => data.type === "company"
        }
      ]
    });

    // taxId has a "when" condition — should be skipped when type !== "company"
    formData.value = { type: "individual", taxId: "" };
    const valid = await validateAll();

    // Only "type" field should be validated; taxId's when() returns false so skipped
    expect(valid).toBe(true);
    expect(state.formStatus).toBe("valid");
  });

  // ── IT-F01-2: 条件逻辑显示字段后验证生效 ──

  it("validateAll checks field when conditional rule shows it", async () => {
    const formData = ref({ type: "company", taxId: "" });

    const { validateAll, state } = useFormValidation({
      initialData: formData.value,
      fields: [
        {
          field: "type",
          label: "Type",
          rules: [
            { name: "required", validator: (v: any) => !!v, message: "Required", trigger: "change" }
          ]
        },
        {
          field: "taxId",
          label: "Tax ID",
          rules: [
            { name: "required", validator: (v: any) => !!v, message: "Tax ID required", trigger: "blur" }
          ],
          when: (data) => data.type === "company"
        }
      ]
    });

    formData.value = { type: "company", taxId: "" };
    const valid = await validateAll();

    // type === "company" so taxId should be validated
    expect(valid).toBe(false);
    expect(state.formStatus).toBe("invalid");
  });

  // ── IT-F01-3: 循环依赖检测阻断提交 ──

  it("detectCycles finds A→B→A dependency loop", () => {
    const formData = ref({ province: "", city: "" });

    const { detectCycles } = useFieldDependency({
      formData,
      dependencies: [
        { field: "city", dependsOn: "province" },
        { field: "province", dependsOn: "city" }
      ]
    });

    const cycles = detectCycles();
    expect(cycles.length).toBeGreaterThan(0);
  });

  // ── IT-F01-4: 无环依赖检测通过 ──

  it("detectCycles returns empty for acyclic dependencies", () => {
    const formData = ref({ province: "", city: "", district: "" });

    const { detectCycles } = useFieldDependency({
      formData,
      dependencies: [
        { field: "city", dependsOn: "province" },
        { field: "district", dependsOn: "city" }
      ]
    });

    expect(detectCycles()).toEqual([]);
  });

  // ── IT-F01-5: 依赖字段值清除 → 验证状态重置 ──

  it("clearing dependent field resets its validation state", async () => {
    const { validateField, state, formData } = useFormValidation({
      initialData: { city: "Hangzhou" },
      fields: [
        {
          field: "city",
          label: "City",
          rules: [
            { name: "required", validator: (v: any) => !!v, message: "City is required", trigger: "change" }
          ]
        }
      ]
    });

    // Initially valid — use hook's internal formData
    await validateField("city");
    expect(state.fields.city.status).toBe("valid");

    // Clear via hook's reactive formData (not external ref)
    formData.city = "";
    await validateField("city");
    expect(state.fields.city.status).toBe("invalid");
    expect(state.fields.city.errors).toContain("City is required");
  });
});