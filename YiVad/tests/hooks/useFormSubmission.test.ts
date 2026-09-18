/**
 * useFormSubmission — 表单提交管线与重试策略
 *
 * ## 场景
 * 表单提交遇到网络波动或服务器临时故障时自动重试，业务错误（如数据校验不通过）不重试直接返回失败。
 * 指数退避策略避免重试风暴：第 1 次等 1s，第 2 次等 2s，第 3 次等 4s。
 *
 * ## 效果演示
 * ```
 * const { isSubmitting, submitError, submit, reset } =
 *   useFormSubmission({ onSubmit: api.createOrder, maxRetries: 3, retryDelay: 1000 });
 *
 * // 提交按钮:
 * // <el-button @click="handleSubmit" :loading="isSubmitting" :disabled="isSubmitting">提交</el-button>
 * // <p v-if="submitError" class="error">{{ submitError }}</p>
 *
 * async function handleSubmit() {
 *   const result = await submit(formData);
 *   if (result.success) { message.success('提交成功'); reset(); }
 *   else { message.error(result.error); }
 * }
 * ```
 *
 * ## 关键行为
 * - 4xx 错误 → 不重试（业务错误，重试无意义）
 * - 5xx/网络错误 → 指数退避重试，最多 maxRetries 次
 * - `submit` 返回 `{ success, result }` 或 `{ success, error }`
 * - `reset()` 清除 isSubmitting/submitError/retryCount
 */
import { describe, it, expect, vi } from "vitest";
import { useFormSubmission } from "@/hooks/useFormSubmission";

describe("useFormSubmission", () => {
  // ── 初始状态 ────────────────────────────────────────

  it("初始 isSubmitting=false、submitError=null、retryCount=0", () => {
    const { isSubmitting, submitError, retryCount } = useFormSubmission({ onSubmit: vi.fn() });
    expect(isSubmitting.value).toBe(false);
    expect(submitError.value).toBeNull();
    expect(retryCount.value).toBe(0);
  });

  // ── 成功提交 ────────────────────────────────────────

  it("onSubmit 返回数据 → submit 返回 { success: true, result }", async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: 1 });
    const { submit } = useFormSubmission({ onSubmit });
    const result = await submit({ name: "John" });
    expect(result.success).toBe(true);
    expect(result.result).toEqual({ id: 1 });
  });

  // ── 重试：网络波动 → 重试后成功 ─────────────────────

  it("网络错误 2 次 + 第 3 次成功 → 共调用 3 次，最终 success=true", async () => {
    const onSubmit = vi.fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue({ id: 1 });
    const { submit } = useFormSubmission({ onSubmit, maxRetries: 3, retryDelay: 10 });
    const result = await submit({ name: "John" });
    expect(result.success).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(3);
  });

  // ── 不重试：4xx 业务错误 ────────────────────────────

  it("4xx 错误 → 不重试，只调用 1 次 onSubmit", async () => {
    const error = new Error("Validation failed") as any;
    error.response = { status: 400 };
    const onSubmit = vi.fn().mockRejectedValue(error);
    const { submit } = useFormSubmission({ onSubmit, maxRetries: 3, retryDelay: 10 });
    const result = await submit({ name: "" });
    expect(result.success).toBe(false);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // ── 重试耗尽 ────────────────────────────────────────

  it("持续失败 → 重试 maxRetries 次后返回 success=false", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Timeout"));
    const { submit } = useFormSubmission({ onSubmit, maxRetries: 2, retryDelay: 10 });
    const result = await submit({ name: "John" });
    expect(result.success).toBe(false);
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  // ── 重置 ────────────────────────────────────────────

  it("reset → 清除提交状态，isSubmitting=false", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("fail"));
    const { submit, reset, isSubmitting } = useFormSubmission({ onSubmit });
    await submit({});
    reset();
    expect(isSubmitting.value).toBe(false);
  });
});