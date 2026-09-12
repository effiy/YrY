import { ref, computed, type Component } from "vue";
import type { FieldValidationConfig } from "@/utils/validation/types";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  validationRules: FieldValidationConfig[];
  condition?: (formData: Record<string, any>) => boolean;
  component?: Component;
}

interface UseFormWizardOptions {
  steps: WizardStep[];
  allowSkipOptional?: boolean;
  showSummary?: boolean;
}

export const useFormWizard = (options: UseFormWizardOptions) => {
  const { steps, allowSkipOptional = false, showSummary = true } = options;

  const currentStepIndex = ref(0);
  const completedSteps = ref<Set<number>>(new Set());
  const formData = ref<Record<string, any>>({});

  /** Active (visible) steps after evaluating conditions */
  const activeSteps = computed(() => {
    return steps.filter((step) => {
      if (!step.condition) return true;
      return step.condition(formData.value);
    });
  });

  const currentStep = computed(() => activeSteps.value[currentStepIndex.value]);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value >= activeSteps.value.length - 1);

  const progressPercent = computed(() => {
    if (activeSteps.value.length === 0) return 0;
    return Math.round((completedSteps.value.size / activeSteps.value.length) * 100);
  });

  function goToStep(index: number) {
    if (index < 0 || index >= activeSteps.value.length) return;
    // Only allow navigation to completed steps or the next step
    if (index <= currentStepIndex.value + 1 || completedSteps.value.has(index)) {
      currentStepIndex.value = index;
    }
  }

  function nextStep() {
    if (isLastStep.value) return;
    completedSteps.value.add(currentStepIndex.value);
    currentStepIndex.value++;
  }

  function prevStep() {
    if (isFirstStep.value) return;
    currentStepIndex.value--;
  }

  /** Mark current step complete and advance */
  function completeCurrentStep() {
    completedSteps.value.add(currentStepIndex.value);
    if (!isLastStep.value) {
      currentStepIndex.value++;
    }
  }

  function reset() {
    currentStepIndex.value = 0;
    completedSteps.value = new Set();
    formData.value = {};
  }

  function restoreState(stepIndex: number, data: Record<string, any>, completed: number[]) {
    currentStepIndex.value = stepIndex;
    formData.value = { ...data };
    completedSteps.value = new Set(completed);
  }

  return {
    currentStepIndex,
    currentStep,
    activeSteps,
    completedSteps,
    formData,
    progressPercent,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    completeCurrentStep,
    reset,
    restoreState,
  };
};