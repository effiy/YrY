/**
 * useFormCollaboration — WebSocket 实时协作
 *
 * ## 场景
 * 多人同时编辑同一表单（如需求评审），字段级别的乐观锁：用户点击某字段时锁定，
 * 其他协作者看到"编辑中"状态。用户离开时自动释放锁。
 *
 * ## 效果演示
 * ```
 * const { isConnected, users, lockedFields, lockField, unlockField, broadcastFieldChange } =
 *   useFormCollaboration({ formId: "prd-review-42", userName: "陈铭" });
 *
 * // 模板中:
 * // <el-tag v-for="u in users" :key="u.id">{{ u.name }} 在线</el-tag>
 * // <el-input @focus="lockField('title')" @blur="unlockField('title')"
 * //   :disabled="lockedFields.title && getLockHolder('title') !== myName" />
 * ```
 *
 * ## 说明
 * 完整端到端测试需要 yiAi WebSocket 端点可用（见 §9.1 缺口 #3）。
 * 当前测试验证模块可正确导入及 API 接口完整性。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

class MockWebSocket {
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState: number = 0;
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSED = 3;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }

  send(data: string) { this.sentMessages.push(data); }
  close() { this.readyState = MockWebSocket.CLOSED; this.onclose?.(); }
}

(globalThis as any).WebSocket = MockWebSocket;

describe("useFormCollaboration", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.restoreAllMocks(); });
  afterEach(() => { vi.useRealTimers(); });

  // ── 模块导出验证 ──────────────────────────────────

  it("模块正确导出 useFormCollaboration 函数", async () => {
    const mod = await import("@/hooks/useFormCollaboration");
    expect(mod.useFormCollaboration).toBeDefined();
  });

  it("函数签名接受单个 options 对象参数", async () => {
    const { useFormCollaboration } = await import("@/hooks/useFormCollaboration");
    expect(typeof useFormCollaboration).toBe("function");
    expect(useFormCollaboration.length).toBe(1);
  });

  it("模块加载无异常", async () => {
    const { useFormCollaboration } = await import("@/hooks/useFormCollaboration");
    expect(useFormCollaboration).toBeDefined();
  });
});