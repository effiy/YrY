import { ref, reactive } from "vue";

interface SubmissionStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "failed";
}

interface UseFormSubmissionOptions {
  onSubmit: (data: Record<string, any>) => Promise<any>;
  maxRetries?: number;
  retryDelay?: number; // base delay in ms for exponential backoff
}

export const useFormSubmission = (options: UseFormSubmissionOptions) => {
  const { onSubmit, maxRetries = 3, retryDelay = 1000 } = options;

  const isSubmitting = ref(false);
  const submitError = ref<string | null>(null);
  const retryCount = ref(0);

  const steps = reactive<SubmissionStep[]>([
    { id: "validate", label: "正在验证表单数据...", status: "pending" },
    { id: "upload", label: "正在上传文件...", status: "pending" },
    { id: "submit", label: "正在保存数据...", status: "pending" },
    { id: "process", label: "正在处理...", status: "pending" },
  ]);

  function resetSteps() {
    steps.forEach((s) => (s.status = "pending"));
  }

  function updateStep(id: string, status: SubmissionStep["status"]) {
    const step = steps.find((s) => s.id === id);
    if (step) step.status = status;
  }

  function getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return retryDelay * Math.pow(2, attempt - 1);
  }

  async function submit(data: Record<string, any>): Promise<{ success: boolean; result?: any; error?: string }> {
    isSubmitting.value = true;
    submitError.value = null;
    retryCount.value = 0;
    resetSteps();

    // Step 1: Validate
    updateStep("validate", "active");
    // Validation is done by the caller before submit()
    updateStep("validate", "completed");

    // Step 2: Upload (handled by caller if needed)
    updateStep("upload", "completed");

    // Step 3: Submit
    updateStep("submit", "active");

    let lastError: string | undefined = undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        retryCount.value = attempt;
        const result = await onSubmit(data);
        updateStep("submit", "completed");
        updateStep("process", "completed");
        isSubmitting.value = false;
        return { success: true, result };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error.message : "提交失败";

        // Don't retry on business errors (4xx)
        const status = (error as any)?.response?.status;
        if (status && status >= 400 && status < 500) {
          updateStep("submit", "failed");
          submitError.value = lastError ?? null;
          isSubmitting.value = false;
          return { success: false, error: lastError };
        }

        // Retry on network/server errors
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
        }
      }
    }

    updateStep("submit", "failed");
    submitError.value = lastError ?? null;
    isSubmitting.value = false;
    return { success: false, error: lastError };
  }

  function reset() {
    isSubmitting.value = false;
    submitError.value = null;
    retryCount.value = 0;
    resetSteps();
  }

  return {
    isSubmitting,
    submitError,
    retryCount,
    steps,
    submit,
    reset,
    updateStep,
  };
};