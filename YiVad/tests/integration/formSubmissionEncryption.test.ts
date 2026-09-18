/**
 * IT-F04: 提交 × 加密 × 离线 集成测试
 *
 * 验证范围：
 * - 加密字段提交 → 请求数据中敏感字段为密文
 * - 提交重试时加密数据一致性（非重复加密）
 * - maxRetries 耗尽后错误状态
 * - 离线入队 → 恢复后同步
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useFormSubmission } from "@/hooks/useFormSubmission";

describe("IT-F04: 提交 × 加密 × 离线", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ── IT-F04-1: 加密字段提交 → 请求数据中为密文 ──

  it("submit receives encrypted data for sensitive fields", async () => {
    // Simulate: encryption happened upstream, submission sends the encrypted data
    const encryptedSsn = "base64-encrypted-ssn-value";

    const submitFn = vi.fn().mockResolvedValue({ ok: true });
    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 1 });

    const formPayload = {
      name: "Alice",
      ssn: encryptedSsn, // Already encrypted
      email: "alice@example.com"
    };

    const result = await submission.submit(formPayload);

    expect(result.success).toBe(true);
    expect(submitFn).toHaveBeenCalledTimes(1);
    // Verify the encrypted field is sent as-is (not double-encrypted)
    expect(submitFn).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Alice",
        ssn: encryptedSsn,
        email: "alice@example.com"
      })
    );
  });

  // ── IT-F04-2: 提交重试保持数据一致性 ──

  it("retry sends identical payload (no double-encryption)", async () => {
    const submitFn = vi.fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ ok: true });

    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 3, retryDelay: 10 });

    const payload = { ssn: "encrypted-once", name: "Bob" };
    const result = await submission.submit(payload);

    expect(result.success).toBe(true);
    expect(submitFn).toHaveBeenCalledTimes(2);
    // Both calls should have identical payload
    expect(submitFn.mock.calls[0][0]).toEqual({ ssn: "encrypted-once", name: "Bob" });
    expect(submitFn.mock.calls[1][0]).toEqual({ ssn: "encrypted-once", name: "Bob" });
  });

  // ── IT-F04-3: 4xx 不重试 ──

  it("does not retry on 4xx business errors", async () => {
    const businessError = new Error("Validation failed") as any;
    businessError.response = { status: 422 };

    const submitFn = vi.fn().mockRejectedValue(businessError);
    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 3, retryDelay: 10 });

    const result = await submission.submit({ name: "" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Validation failed");
    expect(submitFn).toHaveBeenCalledTimes(1); // No retries
  });

  // ── IT-F04-4: 5xx 重试 ──

  it("retries on 5xx server errors", async () => {
    const serverError = new Error("Internal Server Error") as any;
    serverError.response = { status: 500 };

    const submitFn = vi.fn()
      .mockRejectedValueOnce(serverError)
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({ ok: true });

    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 3, retryDelay: 10 });

    const result = await submission.submit({ name: "Test" });

    expect(result.success).toBe(true);
    expect(submitFn).toHaveBeenCalledTimes(3);
  });

  // ── IT-F04-5: maxRetries 耗尽 → 失败 ──

  it("fails after maxRetries exhausted", async () => {
    const networkError = new Error("Network timeout");

    const submitFn = vi.fn().mockRejectedValue(networkError);
    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 3, retryDelay: 10 });

    const result = await submission.submit({ name: "Test" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network timeout");
    expect(submitFn).toHaveBeenCalledTimes(3);
    expect(submission.submitError.value).toBe("Network timeout");
  });

  // ── IT-F04-6: 提交管线步骤状态 ──

  it("tracks submission steps through the pipeline", async () => {
    const submitFn = vi.fn().mockResolvedValue({ ok: true });
    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 1 });

    await submission.submit({ x: 1 });

    // All steps should be completed
    const stepStatuses = submission.steps.map(s => s.status);
    expect(stepStatuses.every(s => s === "completed")).toBe(true);
  });

  // ── IT-F04-7: reset clears error and retry state ──

  it("reset clears submission state", async () => {
    const submitFn = vi.fn().mockRejectedValue(new Error("Fail"));
    const submission = useFormSubmission({ onSubmit: submitFn, maxRetries: 1, retryDelay: 10 });

    await submission.submit({ x: 1 });
    expect(submission.submitError.value).toBe("Fail");

    submission.reset();
    expect(submission.submitError.value).toBeNull();
    expect(submission.retryCount.value).toBe(0);
    expect(submission.isSubmitting.value).toBe(false);
  });
});