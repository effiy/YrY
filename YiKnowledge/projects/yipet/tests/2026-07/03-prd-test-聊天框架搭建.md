---
doc_type: test
title: "YP-07-03: 聊天框架搭建 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
prd_month: "202607"
prd_task_id: "YP-07-03"
source_prds: ["03-基础设施-聊天框架搭建"]
source_modules: ["03-prd-task-聊天框架搭建"]
---

# YP-07-03: 聊天框架搭建 — 测试规格

> 来源 PRD：[03-基础设施-聊天框架搭建.md](../../prds/2026-07/03-基础设施-聊天框架搭建.md)
> 开发方案：[03-prd-task-聊天框架搭建.md](../../devs/2026-07/03-prd-task-聊天框架搭建.md)

---

## 一、单元测试

### U-01: ApiClient — RPC 信封

```typescript
describe("ApiClient RPC envelope", () => {
  it("U-01-S01: constructs correct RPC envelope", async () => {
    const captured = vi.fn();
    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      captured(JSON.parse(init!.body as string));
      return { ok: true, json: async () => ({ code: 0, data: {} }) };
    }) as any;

    await apiClient.call("services.ai.chat_service", "chat", { messages: [], stream: true });
    expect(captured).toHaveBeenCalledWith({
      module_name: "services.ai.chat_service",
      method_name: "chat",
      parameters: { messages: [], stream: true },
    });
  });

  it("U-01-S02: injects X-Token header when available", async () => {
    localStorage.setItem("token", "jwt_test_123");
    // fetch called with X-Token header
  });

  it("U-01-S03: uses parameter name 'filter' not 'query'", async () => {
    // data_service 调用必须使用 filter 而非 query
    const captured = vi.fn();
    await apiClient.call("services.database.data_service", "query_documents", {
      cname: "sessions", filter: { status: "active" },
    });
    expect(captured).toHaveBeenCalledWith(expect.objectContaining({
      parameters: expect.objectContaining({ filter: { status: "active" } }),
    }));
  });
});
```

### U-02: SSE 解析器

```typescript
describe("SSE parser", () => {
  it("U-02-S01: parses data: lines", async () => {
    const body = makeSSEBody(['data: {"msg":"hello"}\n\n']);
    const events = await collectSSE(body);
    expect(events[0].data).toEqual({ msg: "hello" });
  });

  it("U-02-S02: handles [DONE] termination", async () => {
    const body = makeSSEBody(['data: [DONE]\n\n']);
    const events = await collectSSE(body);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("done");
  });

  it("U-02-S03: AbortController stops stream", async () => {
    const ctrl = new AbortController();
    const body = new ReadableStream({ async start(c) {
      c.enqueue(new TextEncoder().encode('data: {"msg":"1"}\n\n'));
      ctrl.abort(); await new Promise(r => setTimeout(r, 50));
      c.enqueue(new TextEncoder().encode('data: {"msg":"2"}\n\n')); c.close();
    }});
    const events = await collectSSE(body, ctrl.signal);
    expect(events.length).toBeLessThanOrEqual(1);
  });
});
```

### U-03: ChatStore 会话管理

```typescript
describe("ChatStore sessions", () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it("U-03-S01: createConversation adds to list + sets active", async () => {
    const store = useChatStore();
    await store.createConversation("Test");
    expect(store.conversations).toHaveLength(1);
    expect(store.activeConversation).not.toBeNull();
    expect(store.activeConversation!.title).toBe("Test");
  });

  it("U-03-S02: selectConversation switches active", async () => {
    const store = useChatStore();
    await store.createConversation("A"); await store.createConversation("B");
    await store.selectConversation("A");
    expect(store.activeConversation!.title).toBe("A");
  });

  it("U-03-S03: deleteConversation removes from list", async () => {
    const store = useChatStore();
    await store.createConversation("A"); await store.createConversation("B");
    await store.deleteConversation("A");
    expect(store.conversations).toHaveLength(1);
    expect(store.conversations[0].title).toBe("B");
  });

  it("U-03-S04: sendMessage adds user + pet messages", async () => {
    vi.mock("@/api/modules/chatService");
    const { streamChat } = await import("@/api/modules/chatService");
    vi.mocked(streamChat).mockImplementation((_, h) => { h.onDone(); return { abort: vi.fn() }; });
    const store = useChatStore(); await store.createConversation("T");
    store.input = "Hello"; await store.sendMessage();
    expect(store.activeConversation!.messages).toHaveLength(2);
    expect(store.activeConversation!.messages[0].type).toBe("user");
    expect(store.activeConversation!.messages[1].type).toBe("pet");
  });
});
```

### U-04: chrome.storage 持久化

```typescript
describe("chrome.storage persistence", () => {
  it("U-04-S01: saves and restores sessions", async () => {
    const store = useChatStore();
    await store.createConversation("Saved Chat");
    // 模拟刷新 → 重新加载 → 会话恢复
  });

  it("U-04-S02: clears storage on logout", () => {
    chrome.storage.local.clear();
    // verify sessions empty
  });
});
```

---

## 二、组件测试

### C-01: ChatInput

```typescript
describe("ChatInput", () => {
  it("C-01-S01: Enter sends and clears", async () => {
    const store = useChatStore(); store.input = "Hello"; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(store.input).toBe("");
  });

  it("C-01-S02: Shift+Enter inserts newline", async () => {
    const store = useChatStore(); store.input = "A"; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true }));
    expect(store.input).toContain("\n");
  });

  it("C-01-S03: IME blocks Enter send", async () => {
    const store = useChatStore(); store.input = "ni hao"; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }));
    expect(store.input).toBe("ni hao");
  });
});
```

### C-02: MessageList

```typescript
describe("MessageList", () => {
  it("C-02-S01: renders user + AI messages", () => {
    const store = useChatStore();
    store.activeConversation = { messages: [
      { type: "user", message: "Hi", timestamp: Date.now() },
      { type: "pet", message: "Hello!", timestamp: Date.now() },
    ]};
    const wrapper = mount(MessageList);
    expect(wrapper.text()).toContain("Hi");
    expect(wrapper.text()).toContain("Hello!");
  });

  it("C-02-S02: shows empty state for no active conversation", () => {
    const store = useChatStore(); store.activeConversation = null;
    const wrapper = mount(MessageList);
    expect(wrapper.find(".empty-state").exists()).toBe(true);
  });

  it("C-02-S03: auto-scrolls to bottom on new message", async () => {
    // trigger new message → verify scrollTop updated
  });
});
```

---

## 三、集成测试

```typescript
describe("Chat framework integration", () => {
  it("I-01: full send → receive flow via msw", async () => {
    server.use(http.post("/", async () => new HttpResponse(
      makeSSEBody(['event: token\ndata: {"content":"Response"}\n\n', 'event: done\ndata: {"done":true}\n\n']),
      { headers: { "Content-Type": "text/event-stream" } },
    )));
    const store = useChatStore(); await store.createConversation("T");
    store.input = "Query"; await store.sendMessage();
    expect(store.activeConversation!.messages[1].message).toBe("Response");
  });

  it("I-02: RPC parameter name 'filter' returns correct results", async () => {
    // Verify data_service calls use 'filter' not 'query'
  });

  it("I-03: chat window survives popup close", async () => {
    // 独立 iframe → popup 关闭不影响聊天
  });
});
```

---

## 四、需求追溯矩阵

| 需求 | 单元 | 组件 | 集成 |
|------|------|------|------|
| FR-01 四层 API 架构 | U-01 S01-03 | — | I-02 |
| FR-02 SSE 流式聊天 | U-02 S01-03 | — | I-01 |
| FR-03 独立聊天窗口 | — | — | I-03 |
| FR-04 状态管理 | U-03 S01-04 | C-01-02 | I-01 |
| NFR 持久化 | U-04 S01-02 | — | — |

---

## 五、完成定义

- [ ] 单元测试：U-01(3) + U-02(3) + U-03(4) + U-04(2) = 12 用例全通过
- [ ] 组件测试：C-01(3) + C-02(3) = 6 用例全通过
- [ ] 集成测试：I-01~03 全通过
- [ ] RPC 参数名 `filter` 而非 `query` 验证通过
- [ ] `npm test` 全量通过
- [ ] `tsc --noEmit` 零错误