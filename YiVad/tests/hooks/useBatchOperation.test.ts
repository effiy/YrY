import { describe, it, expect, vi } from "vitest";
import { useBatchOperation } from "@/hooks/useBatchOperation";

describe("useBatchOperation", () => {
  it("initial state is idle with zero counts", () => {
    const { progress } = useBatchOperation();
    expect(progress.value.status).toBe("idle");
    expect(progress.value.total).toBe(0);
    expect(progress.value.completed).toBe(0);
    expect(progress.value.failed).toBe(0);
  });

  it("executeBatch processes all items successfully", async () => {
    const { progress, executeBatch } = useBatchOperation();
    const op = vi.fn().mockResolvedValue(undefined);
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const result = await executeBatch(items, op, (item) => item.id);
    expect(result.status).toBe("completed");
    expect(result.completed).toBe(3);
    expect(result.failed).toBe(0);
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("executeBatch handles partial failures", async () => {
    const { progress, executeBatch } = useBatchOperation();
    const op = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Permission denied"))
      .mockResolvedValueOnce(undefined);
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const result = await executeBatch(items, op, (item) => item.id);
    expect(result.completed).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.failedItems).toHaveLength(1);
    expect(result.failedItems[0].id).toBe("b");
    expect(result.failedItems[0].reason).toBe("Permission denied");
  });

  it("executeBatch can be cancelled mid-operation", async () => {
    const { progress, executeBatch, cancel } = useBatchOperation();
    let midOpCancel = false;
    const op = vi.fn().mockImplementation(async (item: { id: string }) => {
      if (item.id === "b" && !midOpCancel) {
        midOpCancel = true;
        cancel();
      }
    });
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const result = await executeBatch(items, op, (item) => item.id);
    expect(result.status).toBe("cancelled");
  });

  it("progressPercent calculates correctly", () => {
    const { progress, progressPercent } = useBatchOperation();
    progress.value.total = 10;
    progress.value.completed = 7;
    expect(progressPercent.value).toBe(70);
  });

  it("progressPercent returns 0 when total is 0", () => {
    const { progressPercent } = useBatchOperation();
    expect(progressPercent.value).toBe(0);
  });

  it("isProcessing is true during batch execution", () => {
    const { isProcessing } = useBatchOperation();
    expect(isProcessing.value).toBe(false);
  });

  it("resetProgress returns to idle defaults", () => {
    const { progress, resetProgress } = useBatchOperation();
    progress.value.total = 10;
    progress.value.completed = 5;
    progress.value.failed = 2;
    progress.value.status = "completed";
    resetProgress();
    expect(progress.value.status).toBe("idle");
    expect(progress.value.total).toBe(0);
    expect(progress.value.completed).toBe(0);
    expect(progress.value.failed).toBe(0);
    expect(progress.value.failedItems).toEqual([]);
  });

  it("executes empty items array without error", async () => {
    const { executeBatch } = useBatchOperation();
    const op = vi.fn();
    const result = await executeBatch([], op, (item: any) => item.id);
    expect(result.completed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.status).toBe("completed");
    expect(op).not.toHaveBeenCalled();
  });

  it("continues processing after individual failures", async () => {
    const { executeBatch } = useBatchOperation();
    const op = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"))
      .mockResolvedValueOnce(undefined);
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const result = await executeBatch(items, op, (item) => item.id);
    expect(result.completed).toBe(1);
    expect(result.failed).toBe(2);
    expect(result.failedItems.map((f) => f.id)).toEqual(["a", "b"]);
  });
});