import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGracefulDegradation } from "@/hooks/useGracefulDegradation";
import { reportError } from "@/utils/errorReporter";

vi.mock("@/utils/errorReporter", () => ({
  reportError: vi.fn(),
}));

describe("useGracefulDegradation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("returns initial state", () => {
    const { degraded, error, retryCount } = useGracefulDegradation();
    expect(degraded.value).toBe(false);
    expect(error.value).toBeNull();
    expect(retryCount.value).toBe(0);
  });

  it("handleError sets degraded state", () => {
    const { degraded, error, handleError } = useGracefulDegradation();
    const err = new Error("组件渲染失败");
    handleError(err);
    expect(degraded.value).toBe(true);
    expect(error.value).toBe(err);
  });

  it("handleError reports error", () => {
    const { handleError } = useGracefulDegradation({
      fallbackComponent: "TestComponent",
    });
    handleError(new Error("测试错误"));
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "RENDER",
        componentName: "TestComponent",
      }),
    );
  });

  it("retry resets error state", () => {
    const { degraded, error, handleError, retry } = useGracefulDegradation();
    handleError(new Error("测试错误"));
    expect(degraded.value).toBe(true);

    retry();
    expect(degraded.value).toBe(false);
    expect(error.value).toBeNull();
  });

  it("reset clears everything", () => {
    const { degraded, error, retryCount, handleError, reset } = useGracefulDegradation();
    handleError(new Error("测试错误"));
    expect(degraded.value).toBe(true);

    reset();
    expect(degraded.value).toBe(false);
    expect(error.value).toBeNull();
    expect(retryCount.value).toBe(0);
  });

  it("autoRetry triggers retry with exponential backoff", () => {
    const { degraded, retryCount, handleError } = useGracefulDegradation({
      autoRetry: true,
      retryInterval: 5000,
      maxRetries: 3,
    });

    handleError(new Error("测试错误"));
    expect(degraded.value).toBe(true);

    // First retry at 5s * 2^0 = 5000ms
    vi.advanceTimersByTime(5000);
    expect(degraded.value).toBe(false);
    expect(retryCount.value).toBe(1);
  });

  it("stops autoRetry after maxRetries", () => {
    const { handleError, retryCount } = useGracefulDegradation({
      autoRetry: true,
      retryInterval: 1000,
      maxRetries: 2,
    });

    handleError(new Error("测试错误"));
    // First retry
    vi.advanceTimersByTime(1000);
    expect(retryCount.value).toBe(1);

    // After retry, the timer is cleared and error state is reset
    // Need to trigger another error to schedule next retry
    handleError(new Error("再次失败"));
    vi.advanceTimersByTime(2000);
    expect(retryCount.value).toBe(2);

    // Third error — exceeds maxRetries (2)
    handleError(new Error("再次失败"));
    vi.advanceTimersByTime(4000);
    expect(retryCount.value).toBe(2);
  });

  it("does not autoRetry when disabled", () => {
    const { degraded, handleError } = useGracefulDegradation({
      autoRetry: false,
    });

    handleError(new Error("测试错误"));
    expect(degraded.value).toBe(true);

    vi.advanceTimersByTime(10000);
    expect(degraded.value).toBe(true);
  });
});