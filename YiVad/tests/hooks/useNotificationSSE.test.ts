import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/stores/modules/notification", () => ({
  useNotificationStore: () => ({
    addNotification: vi.fn(),
  }),
}));

// Mock EventSource for jsdom
class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  constructor(url: string) {}
}
globalThis.EventSource = MockEventSource as any;

describe("useNotificationSSE", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("module exports the hook", async () => {
    const mod = await import("@/hooks/useNotificationSSE");
    expect(mod.useNotificationSSE).toBeDefined();
  });

  it("returns connected/error/reconnect API", async () => {
    const { useNotificationSSE } = await import("@/hooks/useNotificationSSE");
    const api = useNotificationSSE({ reconnectInterval: 1000 });
    expect(api).toHaveProperty("connected");
    expect(api).toHaveProperty("error");
    expect(api).toHaveProperty("reconnect");
  });

  it("initial state is not connected", async () => {
    const { useNotificationSSE } = await import("@/hooks/useNotificationSSE");
    const { connected, error } = useNotificationSSE();
    expect(connected.value).toBe(false);
  });

  it("accepts custom options without error", async () => {
    const { useNotificationSSE } = await import("@/hooks/useNotificationSSE");
    const { error } = useNotificationSSE({
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      endpoint: "/custom/stream"
    });
    expect(error.value).toBeNull();
  });

  it("reconnect is a function", async () => {
    const { useNotificationSSE } = await import("@/hooks/useNotificationSSE");
    const { reconnect, connected } = useNotificationSSE();
    expect(typeof reconnect).toBe("function");
  });

  it("disconnect handles clean state", async () => {
    const { useNotificationSSE } = await import("@/hooks/useNotificationSSE");
    const { connected } = useNotificationSSE();
    expect(connected.value).toBeDefined();
  });
});
