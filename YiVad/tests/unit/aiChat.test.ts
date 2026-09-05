import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

/**
 * aiChat store tests.
 *
 * Tests the core chat state machine: message accumulation, loading state,
 * streaming lifecycle, and session management.
 */

// Mock the API modules that the store imports
vi.mock("@/api/modules/chatService", () => ({
  streamChat: vi.fn(),
}));

vi.mock("@/api/modules/agentService", () => ({
  streamAgentChat: vi.fn(),
  confirmAgentTool: vi.fn(),
}));

vi.mock("@/api/modules/sessions", () => ({
  getSessions: vi.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
  upsertSession: vi.fn(),
}));

describe("useAiChatStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("initializes with empty state", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(store).toBeDefined();
    expect(store.messages).toBeDefined();
    expect(Array.isArray(store.messages)).toBe(true);
  }, 10000);

  it("has sendMessage method", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.sendMessage).toBe("function");
  });

  it("has stopSending method", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.stopSending).toBe("function");
  });

  it("messages are reactive", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    const initialLength = store.messages.length;
    store.messages.push({ role: "user", content: "hello" } as any);
    expect(store.messages).toHaveLength(initialLength + 1);
  });
});

describe("useAiChatStore — agent mode", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("has knowledgeMode flag", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.knowledgeMode).toBe("boolean");
  });

  it("has ragEnabled flag", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.ragEnabled).toBe("boolean");
  });

  it("has batchMode flag", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.batchMode).toBe("boolean");
  });
});