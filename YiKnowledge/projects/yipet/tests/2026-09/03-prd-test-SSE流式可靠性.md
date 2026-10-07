---

doc_type: test
title: "YP-09-03: SSE 流式可靠性 — 指数退避重连 + chunk 去重 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-03"
source_prds: ["10-稳定性-SSE流式"]
source_modules: ["03-prd-task-SSE流式可靠性"]

type: test
---

# YP-09-03: SSE 流式可靠性 — 测试规格

### U-01: SSE 重连 + chunk 去重

```typescript
describe("SSE retry", () => {
  it("U-01-S01: retries with exponential backoff on network error", async () => {
    vi.useFakeTimers();
    let calls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      calls++;
      return Promise.reject(new TypeError("network error"));
    });
    const gen = streamChatWithRetry({ messages: [] });
    const next = gen.next();
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync([1000, 2000, 4000, 8000, 16000][i] || 16000);
    }
    await expect(next).rejects.toThrow();
    expect(calls).toBe(6);
    vi.useRealTimers();
  });

  it("U-01-S02: includes skip_chunks in retry params", async () => {
    let lastBody: any;
    vi.spyOn(globalThis, "fetch").mockImplementation((_url, init) => {
      lastBody = JSON.parse((init as any).body);
      throw new TypeError("fail");
    });
    const gen = streamChatWithRetry({ messages: [] });
    await gen.next().catch(() => {});
    // 首次: skip_chunks = 0
    expect(lastBody.parameters.skip_chunks).toBe(0);
  });

  it("U-01-S03: AbortError does NOT trigger retry", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new DOMException("aborted", "AbortError"));
    const gen = streamChatWithRetry({ messages: [] });
    const { done } = await gen.next();
    expect(done).toBe(true);
  });
});
```

### C-01: UI 错误展示

```typescript
describe("SSE error UI", () => {
  it("C-01-S01: error message shown after max retries", async () => {
    vi.spyOn(ApiClient.prototype, "streamChatWithRetry" as any).mockImplementation(async function*() {
      throw new Error("SSE stream interrupted");
    });
    const store = useChatStore();
    store.input = "Hello";
    await store.sendMessage();
    const lastMsg = store.messages[store.messages.length - 1];
    expect(lastMsg.error).toContain("AI 回复中断");
  });

  it("C-01-S02: retry button visible on errored message", () => {
    const wrapper = mount(MessageBubble, {
      props: { message: { type: "pet", error: "中断", timestamp: Date.now() } },
    });
    expect(wrapper.find(".retry-btn").exists()).toBe(true);
  });
});
```

完成定义: U-01(3) + C-01(2) = 5 用例全通过