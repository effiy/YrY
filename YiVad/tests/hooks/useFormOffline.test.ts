/**
 * useFormOffline — 离线表单提交队列
 *
 * ## 场景
 * 网络断开时填写的表单数据自动进入 IndexedDB 同步队列，网络恢复后按 FIFO 顺序自动同步。
 * 业务错误(4xx)标记失败不重试，网络/服务器错误最多重试 3 次。
 *
 * ## 效果演示
 * ```
 * const { isOnline, isSyncing, queueLength, enqueue, syncQueue, clearQueue } =
 *   useFormOffline({ rpcCall: api.submitForm, maxRetries: 3 });
 *
 * // 提交时:
 * async function handleSubmit(data) {
 *   if (isOnline.value) { await api.submitForm(data); }   // 直接提交
 *   else { await enqueue(data); }                          // 离线排队
 * }
 *
 * // 模板中:
 * // <el-badge :value="queueLength" v-if="queueLength > 0">
 * //   <span v-if="isSyncing">同步中 ({{ queueLength }} 条待处理)...</span>
 * ```
 *
 * ## 关键行为
 * - `isOnline` 初始化自 `navigator.onLine`，监听 online/offline 事件
 * - `syncQueue()` 在 `isSyncing=true` 时跳过，避免重复同步
 * - `enqueue(data)` 将提交数据写入 IndexedDB 队列
 * - `syncError` 初始为 null
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFormOffline } from "@/hooks/useFormOffline";

describe("useFormOffline", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  // ── 初始化 ────────────────────────────────────────

  it("isOnline → 反映 navigator.onLine 状态", () => {
    const { isOnline } = useFormOffline({ rpcCall: vi.fn() });
    expect(typeof isOnline.value).toBe("boolean");
  });

  it("isSyncing → 初始 false", () => {
    const { isSyncing } = useFormOffline({ rpcCall: vi.fn() });
    expect(isSyncing.value).toBe(false);
  });

  it("queueLength → 初始 0", () => {
    const { queueLength } = useFormOffline({ rpcCall: vi.fn() });
    expect(queueLength.value).toBe(0);
  });

  it("syncError → 初始 null", () => {
    const { syncError } = useFormOffline({ rpcCall: vi.fn() });
    expect(syncError.value).toBeNull();
  });

  // ── 同步保护 ──────────────────────────────────────

  it("isSyncing=true 时 syncQueue 跳过，不调用 rpcCall", async () => {
    const rpcCall = vi.fn();
    const { syncQueue, isSyncing } = useFormOffline({ rpcCall });
    isSyncing.value = true;
    await syncQueue();
    expect(rpcCall).not.toHaveBeenCalled();
  });

  // ── API 完整性 ────────────────────────────────────

  it("导出完整 API: isOnline/isSyncing/queueLength/syncError/enqueue/syncQueue/clearQueue", () => {
    const api = useFormOffline({ rpcCall: vi.fn() });
    for (const key of ["isOnline", "isSyncing", "queueLength", "syncError", "enqueue", "syncQueue", "clearQueue"]) {
      expect(api[key as keyof typeof api]).toBeDefined();
    }
  });
});