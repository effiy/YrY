import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("@/api/modules/chatService", () => ({ streamChat: vi.fn() }));
vi.mock("@/api/modules/sessions", () => ({
  getSessions: vi.fn().mockResolvedValue({ data: { list: [], total: 0 } }),
  upsertSession: vi.fn(),
}));

describe("useAiChatStore — tokenUsage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("tokenUsage starts null", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(store.tokenUsage).toBeNull();
  });

  it("updateTokenUsage(null) estimates from messages", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    store.updateTokenUsage(null);
    expect(store.tokenUsage).not.toBeNull();
    expect(store.tokenUsage!.modelWindow).toBe(8192);
    expect(store.tokenUsage!.total).toBeGreaterThanOrEqual(0);
  });

  it("updateTokenUsage with partial data merges correctly", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    store.updateTokenUsage({ total: 1000, modelWindow: 4096 });
    expect(store.tokenUsage!.total).toBe(1000);
    expect(store.tokenUsage!.modelWindow).toBe(4096);
    expect(store.tokenUsage!.responseReserve).toBe(1024);
  });

  it("contextPressure uses tokenUsage when available", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    store.updateTokenUsage({ total: 7000, modelWindow: 8192 });
    const cp = store.contextPressure;
    expect(cp.estimatedTokens).toBe(7000);
    expect(cp.pct).toBeGreaterThan(80);
    // 7000/8192 ≈ 85%
  });

  it("contextPressure returns low for empty messages", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    store.tokenUsage = null;
    const cp = store.contextPressure;
    expect(cp.level).toBe("low");
  });
});

describe("useAiChatStore — model selection", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("has selectedModel default", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.selectedModel).toBe("string");
  });

  it("has availableModels array", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(Array.isArray(store.availableModels)).toBe(true);
  });
});

describe("useAiChatStore — RAG settings", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("ragEnabled defaults to boolean", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.ragEnabled).toBe("boolean");
  });

  it("ragHybrid/ragRerank/ragCitations/ragHyde are booleans", async () => {
    const { useAiChatStore } = await import("@/stores/modules/aiChat");
    const store = useAiChatStore();
    expect(typeof store.ragHybrid).toBe("boolean");
    expect(typeof store.ragRerank).toBe("boolean");
    expect(typeof store.ragCitations).toBe("boolean");
    expect(typeof store.ragHyde).toBe("boolean");
  });
});