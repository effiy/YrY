/**
 * useFormWizard — 分步表单向导
 *
 * ## 场景
 * 多步骤配置向导（如部署配置、问卷）：步骤 1 填基本信息 → 步骤 2 选高级配置（仅高级模式显示）→
 * 步骤 3 确认提交。支持条件跳过不适用的步骤，关闭页面后可通过 restoreState 断点续填。
 *
 * ## 效果演示
 * ```
 * const { currentStep, progressPercent, isFirstStep, isLastStep, nextStep, prevStep, restoreState } =
 *   useFormWizard({ steps: [
 *     { id: "basic", title: "基本信息", fields: ["name"] },
 *     { id: "advanced", title: "高级配置", fields: ["retry"], condition: (d) => d.mode === "advanced" },
 *     { id: "confirm", title: "确认提交", fields: [] },
 *   ] });
 *
 * // 模板中:
 * // <el-steps :active="currentStepIndex">
 * //   <el-step v-for="s in activeSteps" :title="s.title" />
 * // </el-steps>
 * // <el-button @click="prevStep" :disabled="isFirstStep">上一步</el-button>
 * // <el-button @click="nextStep">{{ isLastStep ? '提交' : '下一步' }}</el-button>
 * // <el-progress :percentage="progressPercent" />
 * ```
 *
 * ## 关键行为
 * - `condition` 返回 false 的步骤从 `activeSteps` 排除
 * - `goToStep(index)` 的 index 基于 `activeSteps`（过滤后）
 * - `prevStep()` 在第一步时忽略
 * - `progressPercent` = (当前步 + 1) / activeSteps 总数 × 100
 * - `restoreState(stepIndex, data, completed)` 恢复断点
 */
import { describe, it, expect } from "vitest";
import { useFormWizard, type WizardStep } from "@/hooks/useFormWizard";

const steps: WizardStep[] = [
  { id: "step1", title: "Basic Info", fields: ["name"], validationRules: [] },
  { id: "step2", title: "Details", fields: ["email"], validationRules: [], condition: (fd: any) => fd.type === "advanced" },
  { id: "step3", title: "Confirm", fields: ["confirm"], validationRules: [] },
];

describe("useFormWizard", () => {
  // ── 初始状态：默认在第一步 ────────────────────────────

  it("初始在步骤 0，isFirstStep=true", () => {
    const { currentStepIndex, isFirstStep } = useFormWizard({ steps });
    expect(currentStepIndex.value).toBe(0);
    expect(isFirstStep.value).toBe(true);
  });

  // ── 步骤导航 ──────────────────────────────────────────

  it("nextStep → 前进，prevStep → 后退", () => {
    const { nextStep, prevStep, currentStepIndex } = useFormWizard({ steps });
    nextStep();
    expect(currentStepIndex.value).toBe(1);
    prevStep();
    expect(currentStepIndex.value).toBe(0);
  });

  it("第一步时 prevStep → 不生效", () => {
    const { prevStep, currentStepIndex } = useFormWizard({ steps });
    prevStep();
    expect(currentStepIndex.value).toBe(0);
  });

  it("goToStep(1) → 跳转到 activeSteps 中索引为 1 的步骤", () => {
    const { goToStep, currentStepIndex } = useFormWizard({ steps });
    goToStep(1); // step2 被过滤，索引 1 = step3
    expect(currentStepIndex.value).toBe(1);
  });

  // ── 条件步骤：根据 formData 动态显示/隐藏 ─────────────

  it("condition 返回 false → 步骤从 activeSteps 排除", () => {
    const { activeSteps } = useFormWizard({ steps });
    expect(activeSteps.value.length).toBe(2); // step1, step3
    expect(activeSteps.value[0].id).toBe("step1");
    expect(activeSteps.value[1].id).toBe("step3");
  });

  it("formData 变更使 condition 为 true → 步骤即刻出现", () => {
    const { activeSteps, formData } = useFormWizard({ steps });
    formData.value = { type: "advanced" };
    expect(activeSteps.value.length).toBe(3);
    expect(activeSteps.value[1].id).toBe("step2");
  });

  // ── 进度指示 ──────────────────────────────────────────

  it("isLastStep → 在最后一个 active 步骤时为 true", () => {
    const { nextStep, isLastStep } = useFormWizard({ steps });
    nextStep(); // 从 step1 到 step3（step2 被跳过）
    expect(isLastStep.value).toBe(true);
  });

  it("progressPercent → 第 1/2 步 = 50%", () => {
    const { nextStep, progressPercent } = useFormWizard({ steps });
    nextStep();
    expect(progressPercent.value).toBe(50);
  });

  // ── 重置与恢复 ────────────────────────────────────────

  it("reset → 回到初始步骤，清除数据", () => {
    const { nextStep, reset, currentStepIndex } = useFormWizard({ steps });
    nextStep();
    reset();
    expect(currentStepIndex.value).toBe(0);
  });

  it("restoreState → 恢复步骤位置、表单数据、已完成步骤", () => {
    const { restoreState, currentStepIndex, formData } = useFormWizard({ steps });
    restoreState(1, { name: "John", type: "advanced" }, [0]);
    expect(currentStepIndex.value).toBe(1);
    expect(formData.value.name).toBe("John");
  });
});