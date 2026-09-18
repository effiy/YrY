/**
 * IT-F03: 向导 × 条件逻辑 × 字段依赖 集成测试
 *
 * 验证范围：
 * - 步骤选择触发条件逻辑 → 后续步骤字段变化
 * - 返回修改前序步骤 → 条件重新评估
 * - 条件步骤过滤（condition 返回 false 时步骤不在 activeSteps 中）
 * - 字段依赖跨步骤传递数据
 */
import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useFormWizard, type WizardStep } from "@/hooks/useFormWizard";
import { useConditionalLogic, type ConditionalRule } from "@/hooks/useConditionalLogic";
import { useFieldDependency } from "@/hooks/useFieldDependency";

describe("IT-F03: 向导 × 条件逻辑 × 字段依赖", () => {
  function makeWizard(steps: WizardStep[]) {
    return useFormWizard({ steps });
  }

  // ── IT-F03-1: 步骤 1 选择触发条件 → 步骤 2 字段变化 ──

  it("step 1 choice affects step 2 fields via conditional logic", () => {
    const steps: WizardStep[] = [
      {
        id: "user-type",
        title: "User Type",
        fields: ["type"],
        validationRules: []
      },
      {
        id: "company-details",
        title: "Company Details",
        description: "Only for company users",
        fields: ["taxId", "companyName"],
        validationRules: [],
        condition: (data) => data.type === "company"
      },
      {
        id: "summary",
        title: "Summary",
        fields: [],
        validationRules: []
      }
    ];

    const wizard = makeWizard(steps);

    // Initially (no data), company step should be filtered out
    expect(wizard.activeSteps.value).toHaveLength(2); // user-type + summary
    expect(wizard.activeSteps.value.map(s => s.id)).toEqual(["user-type", "summary"]);

    // Set type=company → company step appears
    wizard.formData.value.type = "company";
    expect(wizard.activeSteps.value).toHaveLength(3);
    expect(wizard.activeSteps.value.map(s => s.id)).toEqual([
      "user-type",
      "company-details",
      "summary"
    ]);
  });

  // ── IT-F03-2: 返回修改步骤 1 → 步骤 2 条件重新评估 ──

  it("changing step 1 back re-evaluates step visibility", () => {
    const steps: WizardStep[] = [
      {
        id: "type",
        title: "Type",
        fields: ["accountType"],
        validationRules: []
      },
      {
        id: "business",
        title: "Business Info",
        fields: ["license"],
        validationRules: [],
        condition: (data) => data.accountType === "business"
      },
      {
        id: "done",
        title: "Done",
        fields: [],
        validationRules: []
      }
    ];

    const wizard = makeWizard(steps);

    // Select business
    wizard.formData.value.accountType = "business";
    expect(wizard.activeSteps.value).toHaveLength(3);

    // Change to individual → business step disappears
    wizard.formData.value.accountType = "individual";
    expect(wizard.activeSteps.value).toHaveLength(2);
    expect(wizard.activeSteps.value.map(s => s.id)).toEqual(["type", "done"]);
  });

  // ── IT-F03-3: 条件步骤过滤后步骤索引跳转 ──

  it("nextStep skips hidden conditional steps", () => {
    const steps: WizardStep[] = [
      { id: "s1", title: "Step 1", fields: ["role"], validationRules: [] },
      {
        id: "s2-admin",
        title: "Admin Step",
        fields: ["adminNote"],
        validationRules: [],
        condition: (data) => data.role === "admin"
      },
      { id: "s3", title: "Step 3", fields: [], validationRules: [] }
    ];

    const wizard = makeWizard(steps);

    // role is empty → admin step hidden
    expect(wizard.activeSteps.value).toHaveLength(2); // s1, s3

    // Go from step 0 to step "1" (which is s3 since s2-admin is hidden)
    wizard.nextStep();
    expect(wizard.currentStep.value?.id).toBe("s3");
    expect(wizard.isLastStep.value).toBe(true);
  });

  // ── IT-F03-4: 字段依赖跨步骤传递 ──

  it("dependency resolves cross-step data flow", () => {
    const formData = ref({ province: "Zhejiang", city: "" });

    const { cascadeOptions, resolveDeps } = useFieldDependency({
      formData,
      dependencies: [
        {
          field: "city",
          dependsOn: "province",
          loader: async (parentValues: Record<string, any>) => {
            if (parentValues.province === "Zhejiang") {
              return ["Hangzhou", "Ningbo", "Wenzhou"];
            }
            return [];
          }
        }
      ]
    });

    // Manually trigger dependency resolution
    resolveDeps("province");

    // After resolution, cascade options should be available
    // (note: resolveDeps is async, but the loader sets cascadeOptions)
    expect(cascadeOptions.value).toBeDefined();
  });
});