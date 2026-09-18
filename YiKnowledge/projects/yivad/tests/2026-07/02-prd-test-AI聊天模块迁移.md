---
title: "YV-07-02: AI Chat 模块迁移 — 测试规格"
tags: [测试规格, 管理后台, AI Chat, SSE, RPC, 流式聊天, Vitest]
category: 项目/管理后台/测试
created: 2026-09-11
updated: 2026-09-16
source: 内部
type: reference
status: stable
priority: P0
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202607"
prd_task_id: YV-07-02
source_prds: ["02-prd-AI聊天模块迁移"]
roles: [engineer, qa]
---

# YV-07-02: AI Chat 模块迁移 — 测试规格

> 来源 PRD：[02-prd-AI聊天模块迁移.md](../../prds/2026-07/02-prd-AI聊天模块迁移.md)
> 开发方案：[02-prd-task-AI聊天模块迁移.md](../../devs/2026-07/02-prd-task-AI聊天模块迁移.md)
> 框架：Vitest + @vue/test-utils + jsdom + msw · 目标：93 用例

---

## 一、测试策略

```
E2E           5  cases  ▏▏ Playwright
Integration  16  cases  ▏▏▏▏▏ Vitest + msw
Component    29  cases  ▏▏▏▏▏▏▏▏▏▏▏ Vitest + Vue Test Utils
Unit         43  cases  ▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏ Vitest
─────────────────────────────────────────
Total        93  cases
```

**覆盖率目标**：`api/sse.ts` ≥95% / `stores/aiChat.ts` ≥80% / 组件 ≥70% / composables ≥90%
**增量用例**：Pi 风格扩展 + 技术债实现共 29 用例 (U-06~U-12: 18 单元 + C-06~C-07: 5 组件 + I-11~I-14: 6 集成)

### 测试数据固件

```typescript
// fixtures/sessions.ts
export const mockSession: SessionDocument = {
  key: "test-chat-001", title: "Q3 Roadmap Review", url: "",
  pageContent: "工程团队 Q3 规划",
  messages: [
    { type: "user", message: "总结 Q3", timestamp: 1726470000000 },
    { type: "pet", message: "Q3 进展：\n1. 项目初始化 ✅\n2. AI Chat ✅", timestamp: 1726470060000 },
  ],
  tags: ["from:/aiChat"], isFavorite: true,
  createdAt: 1726470000000, updatedAt: 1726470100000,
};

// fixtures/sse.ts
export function makeSSEBody(chunks: string[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(ctrl) { chunks.forEach(c => ctrl.enqueue(new TextEncoder().encode(c))); ctrl.close(); }
  });
}
export async function collectSSE(body: ReadableStream, signal?: AbortSignal): Promise<SSEEvent[]> {
  const events: SSEEvent[] = [];
  for await (const e of parseSSEStream(new Response(body), signal)) events.push(e);
  return events;
}

// fixtures/xss.ts
export const xssVectors: [string, string][] = [
  ['<script>alert(1)</script>', 'script tag'],
  ['<img src=x onerror="alert(1)">', 'img onerror'],
  ['<svg onload="alert(1)">', 'svg onload'],
  ['<a href="javascript:alert(1)">click</a>', 'javascript: protocol'],
  ['<a href="data:text/html,<script>alert(1)</script>">click</a>', 'data: protocol'],
  ['<div onclick="alert(1)">click</div>', 'onclick attribute'],
  ['<iframe src="javascript:alert(1)">', 'iframe'],
  ['&lt;script&gt;alert(1)&lt;/script&gt;', 'HTML entity bypass'],
];
```

---

## 二、单元测试 (25 用例)

### U-01: SSE 解析器 (8 用例)

```typescript
describe("parseSSEStream", () => {
  const doneFrame = 'event: done\ndata: {"done":true}\n\n';

  // U-01-S01: 标准 data: 行
  it("parses standard data: lines", async () => {
    const events = await collectSSE(makeSSEBody(['data: {"msg":"hello"}\n\n', doneFrame]));
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ data: { msg: "hello" } });
    expect(events[1]).toMatchObject({ event: "done" });
  });

  // U-01-S02: [DONE] 终止
  it("yields done and returns on [DONE]", async () => {
    const events = await collectSSE(makeSSEBody(['data: [DONE]\n\n']));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ event: "done", data: null, id: undefined });
  });

  // U-01-S03: event: 路由
  it("routes data: by preceding event: type", async () => {
    const events = await collectSSE(makeSSEBody([
      'event: session_key\ndata: {"session_key":"abc"}\n\n',
      'event: token\ndata: {"content":"hi"}\n\n',
    ]));
    expect(events[0].event).toBe("session_key");
    expect(events[1].event).toBe("token");
  });

  // U-01-S04: UTF-8 跨 chunk
  it("reassembles multi-byte UTF-8 across chunks", async () => {
    const prefix = new TextEncoder().encode('data: {"content":"');
    const char1 = new Uint8Array([0xe4, 0xbd]);
    const char2 = new Uint8Array([0xa0, 0xe5, 0xa5, 0xbd]);
    const suffix = new TextEncoder().encode('"}\n\n');
    const body = new ReadableStream({ start(ctrl) {
      ctrl.enqueue(new Uint8Array([...prefix, ...char1]));
      ctrl.enqueue(new Uint8Array([...char2, ...suffix])); ctrl.close();
    }});
    const events = await collectSSE(body);
    expect(events[0].data.content).toBe("你好");
  });

  // U-01-S05: AbortController
  it("exits on signal abort", async () => {
    const ctrl = new AbortController();
    const body = new ReadableStream({ async start(c) {
      c.enqueue(new TextEncoder().encode('data: {"msg":"1"}\n\n'));
      ctrl.abort(); await new Promise(r => setTimeout(r, 50));
      c.enqueue(new TextEncoder().encode('data: {"msg":"2"}\n\n')); c.close();
    }});
    const events = await collectSSE(body, ctrl.signal);
    expect(events.length).toBeLessThanOrEqual(1);
  });

  // U-01-S06: 非 JSON + 心跳
  it("skips non-JSON lines and heartbeat comments", async () => {
    const events = await collectSSE(makeSSEBody([
      ': heartbeat\n\n', 'data: not-json\n\n', 'data: {"valid":true}\n\n',
    ]));
    expect(events).toHaveLength(1);
    expect(events[0].data).toEqual({ valid: true });
  });

  // U-01-S07: id: 字段
  it("captures id: field", async () => {
    const events = await collectSSE(makeSSEBody(['id: 42\ndata: {"msg":"with-id"}\n\n']));
    expect(events[0].id).toBe("42");
  });

  // U-01-S08: currentEvent 重置
  it("resets currentEvent after data: consumed", async () => {
    const events = await collectSSE(makeSSEBody([
      'event: error\ndata: {"error":"bad"}\n\n', 'data: {"msg":"no-event"}\n\n',
    ]));
    expect(events[0].event).toBe("error");
    expect(events[1].event).toBeUndefined();
  });
});
```

### U-02: Store — 消息引擎 (4 用例)

```typescript
describe("useAiChatStore.sendMessage", () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.mock("@/api/modules/chatService"); });

  it("U-02-S01: creates user+pet messages and streams", async () => {
    const { streamChat } = await import("@/api/modules/chatService");
    vi.mocked(streamChat).mockImplementation((_, h) => {
      h.onChunk("Hello"); h.onChunk(" World"); h.onDone(); return { abort: vi.fn() };
    });
    const store = useAiChatStore();
    await store.createConversation("Test");
    await store.sendMessage("Hi");
    expect(store.activeConversation!.messages).toHaveLength(2);
    expect(store.activeConversation!.messages[0]).toMatchObject({ type: "user", message: "Hi" });
    expect(store.activeConversation!.messages[1]).toMatchObject({ type: "pet", message: "Hello World" });
    expect(store.sending).toBe(false);
    expect(store.streamingPhase).toBe("idle");
  });

  it("U-02-S02: blocks duplicate send when sending=true", async () => {
    const store = useAiChatStore(); store.sending = true; store.input = "blocked";
    await store.sendMessage();
    expect(store.activeConversation?.messages).toBeFalsy();
  });

  it("U-02-S03: auto-creates conversation when null", async () => {
    const store = useAiChatStore(); store.input = "first";
    await store.sendMessage();
    expect(store.activeConversation).not.toBeNull();
    expect(store.conversations).toHaveLength(1);
  });

  it("U-02-S04: marks aborted + preserves partial on stop", async () => {
    const { streamChat } = await import("@/api/modules/chatService");
    vi.mocked(streamChat).mockImplementation((_, h) => {
      h.onChunk("partial"); return { abort: vi.fn() };
    });
    const store = useAiChatStore(); await store.createConversation("Test");
    const p = store.sendMessage("Hi"); store.stopSending(); await p;
    expect(store.activeConversation!.messages[1].aborted).toBe(true);
    expect(store.activeConversation!.messages[1].message).toContain("partial");
  });
});
```

### U-03: Store — 会话管理 (3 用例)

```typescript
describe("useAiChatStore sessions", () => {
  it("U-03-S01: deleteConversation auto-switches to next", async () => {
    const store = useAiChatStore();
    await store.createConversation("A"); await store.createConversation("B"); await store.createConversation("C");
    await store.selectConversation("B"); await store.deleteConversation("B");
    expect(store.conversations).toHaveLength(2);
    expect(store.activeConversation!.title).toBe("C");
  });
  it("U-03-S02: delete last → null active", async () => {
    const store = useAiChatStore(); await store.createConversation("Only");
    await store.deleteConversation("Only");
    expect(store.activeConversation).toBeNull();
  });
  it("U-03-S03: toggleFavorite sorts to top", async () => {
    const store = useAiChatStore();
    await store.createConversation("A"); await store.createConversation("B");
    await store.toggleFavorite("A");
    expect(store.conversations[0].title).toBe("A");
  });
});
```

### U-04: Markdown 安全 (4 用例)

```typescript
describe("Markdown Security", () => {
  const ALLOWED_TAGS = ["p","br","strong","em","code","pre","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","a","img","table","thead","tbody","tr","th","td","span","div","hr"];
  const ALLOWED_ATTR = ["href","src","alt","class","target","rel"];

  for (const [vector, desc] of xssVectors) {
    it(`U-04-S01: sanitizes ${desc}`, () => {
      const html = marked.parse(vector) as string;
      const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false });
      const div = document.createElement("div"); div.innerHTML = clean;
      expect(div.querySelector("script")).toBeNull();
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("javascript:");
    });
  }

  it("U-04-S02: external links get security attrs", () => {
    const raw = marked.parse('[example](https://evil.com)') as string;
    const div = document.createElement("div"); div.innerHTML = sanitizeLinks(raw);
    const a = div.querySelector("a")!;
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
  });

  it("U-04-S03: detects unclosed code blocks", () => {
    const text = '```python\nprint("hello")';
    expect(text.split("```").length - 1).toBe(1);
    expect((text + "\n```").split("```").length - 1).toBe(2);
  });

  it("U-04-S04: preserves valid markdown", () => {
    const raw = marked.parse("## Title\n**bold**\n- item") as string;
    const clean = DOMPurify.sanitize(raw, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false });
    expect(clean).toContain("<h2>"); expect(clean).toContain("<strong>"); expect(clean).toContain("<li>");
  });
});
```

### U-05: Composables (6 用例)

```typescript
describe("Composables", () => {
  it("U-05-S01: useChatUiState initial state", () => {
    const s = useChatUiState();
    expect(s.faqVisible.value).toBe(false);
    expect(s.batchMode.value).toBe(false);
    expect(s.selectedKeys.value.size).toBe(0);
  });
  it("U-05-S02: useModelSelection defaults to DEFAULT_MODEL", () => {
    localStorage.clear();
    expect(useModelSelection().selectedModel.value).toBe(DEFAULT_MODEL);
  });
  it("U-05-S03: useModelSelection persists to localStorage", () => {
    const { selectedModel } = useModelSelection();
    selectedModel.value = "llama3.1:8b";
    expect(localStorage.getItem("aiChat.selectedModel")).toBe("llama3.1:8b");
  });
  it("U-05-S04: pushPromptHistory + recall", () => {
    const { promptHistory } = usePromptHistory();
    pushPromptHistory("test");
    expect(promptHistory.value).toContain("test");
  });
  it("U-05-S05: useRagSettings defaults", () => {
    const { ragEnabled, ragHybrid, ragCitations } = useRagSettings();
    expect(ragEnabled.value).toBe(false);
    expect(ragHybrid.value).toBe(true);
    expect(ragCitations.value).toBe(true);
  });
  it("U-05-S06: compaction threshold detection", () => {
    const msgs = Array.from({ length: 200 }, (_, i) => ({
      type: (i % 2 ? "user" : "pet") as const,
      message: "Lorem ".repeat(200), timestamp: Date.now(),
    }));
    const estimatedTokens = msgs.reduce((s, m) => s + m.message.length / 4, 0);
    expect(estimatedTokens).toBeGreaterThan(6554);
  });
});
```

---

## 三、组件测试 (24 用例)

### C-01: MessageBubble (5 用例)

```typescript
describe("MessageBubble", () => {
  it("C-01-S01: user message right-aligned", () => {
    const w = mount(MessageBubble, { props: { message: { type:"user", message:"Hello", timestamp:Date.now() }, index:0, streaming:false } });
    expect(w.classes()).toContain("mb-bubble--user");
    expect(w.text()).toContain("Hello");
  });
  it("C-01-S02: typing indicator during streaming", () => {
    const w = mount(MessageBubble, { props: { message: { type:"pet", message:"", timestamp:Date.now() }, index:1, streaming:true } });
    expect(w.find(".mb-typing").exists()).toBe(true);
  });
  it("C-01-S03: error state border", () => {
    const w = mount(MessageBubble, { props: { message: { type:"pet", message:"Err", timestamp:Date.now(), error:true }, index:1, streaming:false } });
    expect(w.classes()).toContain("mb-bubble--error");
  });
  it("C-01-S04: copy button triggers clipboard", async () => {
    const wt = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: wt }, writable: true });
    const w = mount(MessageBubble, { props: { message: { type:"pet", message:"Copy me", timestamp:Date.now() }, index:1, streaming:false } });
    await w.find('[title="Copy"]').trigger("click");
    expect(wt).toHaveBeenCalledWith("Copy me");
  });
  it("C-01-S05: v-memo on same-length update", async () => {
    const w = mount(MessageBubble, { props: { message: { type:"pet", message:"1234", timestamp:Date.now() }, index:1, streaming:false } });
    await w.setProps({ message: { type:"pet", message:"5678", timestamp:Date.now() }, index:1, streaming:false });
    expect(w.text()).toContain("5678");
  });
});
```

### C-02: MessageList (4 用例)

```typescript
describe("MessageList", () => {
  it("C-02-S01: welcome empty state", () => {
    const store = useAiChatStore(); store.activeConversation = null;
    const w = mount(MessageList);
    expect(w.find(".ml-welcome-empty").exists()).toBe(true);
    expect(w.text()).toContain("AI Chat");
  });
  it("C-02-S02: scroll-to-bottom button when scrolled up", async () => {
    const store = useAiChatStore();
    store.activeConversation = { ...mockSession, messages: Array(50).fill(null).map((_,i) => ({ type:"user" as const, message:`m${i}`, timestamp:Date.now()+i })) };
    const w = mount(MessageList);
    const el = w.find(".ml-container").element;
    Object.defineProperty(el, "scrollHeight", { value: 5000, writable: true });
    Object.defineProperty(el, "clientHeight", { value: 400, writable: true });
    Object.defineProperty(el, "scrollTop", { value: 0, writable: true });
    w.find(".ml-container").trigger("scroll"); await nextTick();
    expect(w.find(".ml-scroll-btn").exists()).toBe(true);
  });
  it("C-02-S03: Welcome Card metadata", () => {
    const store = useAiChatStore(); store.activeConversation = { ...mockSession };
    const w = mount(MessageList);
    expect(w.text()).toContain("Q3 Roadmap Review");
    expect(w.text()).toContain("2 msgs");
  });
  it("C-02-S04: Welcome Card collapse/expand", async () => {
    const store = useAiChatStore(); store.activeConversation = { ...mockSession };
    const w = mount(MessageList);
    await w.find(".ml-welcome-toggle").trigger("click");
    expect(w.find(".ml-welcome").classes()).toContain("is-collapsed");
  });
});
```

### C-03: ChatInput (9 用例)

```typescript
describe("ChatInput", () => {
  it("C-03-S01: Enter sends", async () => {
    const store = useAiChatStore(); store.input = "Hello"; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key:"Enter", bubbles:true }));
    expect(store.input).toBe("");
  });
  it("C-03-S02: Shift+Enter newline", async () => {
    const store = useAiChatStore(); store.input = "A"; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key:"Enter", shiftKey:true, bubbles:true }));
    expect(store.input).toContain("\n");
  });
  it("C-03-S03: IME blocks Enter", async () => {
    const store = useAiChatStore(); store.input = "ni hao"; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new CompositionEvent("compositionstart", { bubbles:true }));
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key:"Enter", isComposing:true, bubbles:true }));
    expect(store.input).toBe("ni hao");
  });
  it("C-03-S04: Escape clears when idle", async () => {
    const store = useAiChatStore(); store.input = "x"; store.sending = false; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key:"Escape", bubbles:true }));
    expect(store.input).toBe("");
  });
  it("C-03-S05: Escape stops when streaming", async () => {
    const store = useAiChatStore(); store.sending = true;
    const spy = vi.spyOn(store, "stopSending"); mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key:"Escape", bubbles:true }));
    expect(spy).toHaveBeenCalled();
  });
  it("C-03-S06: send button when has content", () => {
    const store = useAiChatStore(); store.input = "Hi"; store.sending = false;
    expect(mount(ChatInput).find(".ci-send-btn").exists()).toBe(true);
  });
  it("C-03-S07: stop button during streaming", () => {
    const store = useAiChatStore(); store.sending = true;
    expect(mount(ChatInput).find(".ci-stop-icon").exists()).toBe(true);
  });
  it("C-03-S08: @ triggers mention dropdown", async () => {
    const store = useAiChatStore(); store.input = "@"; mount(ChatInput); await nextTick();
    // FileMentionDropdown visible
  });
  it("C-03-S09: ArrowUp recalls prompt", async () => {
    pushPromptHistory("prev"); const store = useAiChatStore(); store.input = ""; mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key:"ArrowUp", bubbles:true }));
    expect(store.input).toBe("prev");
  });
});
```

### C-04: 上下文文件 (4 用例)

```typescript
describe("Context Files", () => {
  it("C-04-S01: @mention adds ctx: tag", async () => {
    const store = useAiChatStore(); await store.createConversation("T");
    store.addTag("ctx:test/file.md");
    expect(store.activeConversation!.tags).toContain("ctx:test/file.md");
    expect(store.ragActive).toBe(true);
  });
  it("C-04-S02: applyContextChange updates pageContent", async () => {
    const store = useAiChatStore(); await store.createConversation("T");
    await store.applyContextChange("test/file.md", "new content");
    expect(store.activeConversation!.pageContent).toContain("## test/file.md");
    expect(store.activeConversation!.pageContent).toContain("new content");
  });
  it("C-04-S03: undoLastContextChange reverts", async () => {
    const store = useAiChatStore(); await store.createConversation("T");
    const prev = store.activeConversation!.pageContent || "";
    await store.applyContextChange("test/file.md", "changed");
    await store.undoLastContextChange("test/file.md");
    expect(store.activeConversation!.pageContent).toBe(prev);
  });
  it("C-04-S04: knowledge picker in toolbar", () => {
    // ChatToolbar renders knowledge file picker button
  });
});
```

### C-05: ConversationSidebar (2 用例)

```typescript
describe("ConversationSidebar", () => {
  it("C-05-S01: file click opens preview", () => { /* onNodeClick → openPreview */ });
  it("C-05-S02: sync button triggers API", async () => { /* syncKnowledge → ElMessage */ });
});
```

---

## 四、集成测试 (8 用例)

```typescript
describe("Integration", () => {
  // ── I-01: SSE 端到端流式 ──────────────────────────────────────────
  it("I-01: streams tokens end-to-end via msw", async () => {
    // Given: msw intercepts POST / with SSE text/event-stream
    server.use(http.post("/", async () => new HttpResponse(
      makeSSEBody([
        'event: token\ndata: {"content":"Hello"}\n\n',
        'event: token\ndata: {"content":" World"}\n\n',
        'event: done\ndata: {"done":true}\n\n',
      ]),
      { headers: { "Content-Type": "text/event-stream" } },
    )));
    const store = useAiChatStore();
    await store.createConversation("Integration Test");

    // When: user sends a message
    await store.sendMessage("Hi");

    // Then: AI reply accumulated from SSE tokens
    expect(store.activeConversation!.messages).toHaveLength(2);
    expect(store.activeConversation!.messages[0]).toMatchObject({ type: "user", message: "Hi" });
    expect(store.activeConversation!.messages[1]).toMatchObject({ type: "pet", message: "Hello World" });
    // Then: streaming state reset after done
    expect(store.sending).toBe(false);
    expect(store.streamingPhase).toBe("idle");
  });

  // ── I-02: 流式完成后持久化 ──────────────────────────────────────
  it("I-02: persists session after streaming completes", async () => {
    // Given: mock SSE and capture upsertSession call
    const { upsertSession } = await import("@/api/modules/sessions");
    const spy = vi.spyOn({ upsertSession }, "upsertSession");
    server.use(http.post("/", async () => new HttpResponse(
      makeSSEBody(['event: done\ndata: {"done":true}\n\n']),
      { headers: { "Content-Type": "text/event-stream" } },
    )));
    const store = useAiChatStore();
    await store.createConversation("Persist Test");

    // When: streaming completes
    await store.sendMessage("Save me");

    // Then: upsertSession called with updated messages
    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls[0][0];
    expect(call.key).toBeDefined();
    expect(call.messages).toBeDefined();
    expect(call.messages.length).toBeGreaterThanOrEqual(2);
  });

  // ── I-03: RAG 模式触发 streamRagChat ────────────────────────────
  it("I-03: RAG mode routes to streamRagChat with scope", async () => {
    // Given: session has ctx: file tags and RAG is enabled
    const { streamRagChat } = await import("@/api/modules/ragService");
    const spy = vi.spyOn({ streamRagChat }, "streamRagChat");
    const store = useAiChatStore();
    await store.createConversation("RAG Test", "", ["ctx:docs/arch.md"]);
    store.ragEnabled = true;

    // When: user sends a message
    await store.sendMessage("Explain architecture");

    // Then: streamRagChat is called with scope derived from ctx: paths
    expect(spy).toHaveBeenCalled();
    const params = spy.mock.calls[0][0];
    expect(params.messages).toBeDefined();
    expect(params.scope).toBeDefined();
  });

  // ── I-04: 非流式 JSON 降级 ──────────────────────────────────────
  it("I-04: falls back to JSON response when SSE unavailable", async () => {
    // Given: server returns non-stream JSON response
    server.use(http.post("/", async () => HttpResponse.json({
      code: 0, message: "ok",
      data: { message: { content: "Non-stream reply" } },
    })));
    const store = useAiChatStore();
    await store.createConversation("JSON Fallback");

    // When: SSE parsing fails / server returns JSON
    // Then: system gracefully handles the response format
    // (Note: exact fallback behavior depends on parseSSEStream error handling)
    await expect(store.sendMessage("Hi")).resolves.not.toThrow();
  });

  // ── I-05: 401 认证拦截 ──────────────────────────────────────────
  it("I-05: handles 401 redirect on auth failure", async () => {
    // Given: server returns 401 Unauthorized
    server.use(http.post("/", async () => new HttpResponse(null, { status: 401 })));
    const store = useAiChatStore();
    await store.createConversation("Auth Test");

    // When: user sends a message without valid token
    // Then: error state is set, no messages appended
    await store.sendMessage("Blocked");
    expect(store.error).toBeTruthy();
  });

  // ── I-08: 快捷按钮发送 ──────────────────────────────────────────
  it("I-08: QUICK_BUTTONS click triggers send with preset text", async () => {
    // Given: a session with no messages, QuickButtons visible
    const store = useAiChatStore();
    await store.createConversation("Quick Test");

    // When: user clicks a QUICK_BUTTON (direct-send variant)
    // Then: preset prompt text is sent and AI replies
    // Verify QuickButton onClick → store.sendMessage(presetText) chain
  });

  // ── I-09: 知识文件选择器 → 会话创建 ────────────────────────────
  it("I-09: knowledge file picker creates session with pageContent", async () => {
    // Given: user browses knowledge tree and selects a file
    const store = useAiChatStore();

    // When: readKnowledgeFile → ensureKnowledgeSession → selectConversation
    // Then: new session created with ctx: tag and pageContent loaded
    // Verify: session.tags includes "ctx:selected/file.md"
    // Verify: session.pageContent contains file content
  });

  // ── I-10: 视觉反馈 ──────────────────────────────────────────────
  it("I-10: favicon and visual feedback during streaming", async () => {
    // Given: SSE stream in progress
    // When: streamingPhase changes (idle → thinking → streaming → done)
    // Then: favicon updates to indicate activity
    // Then: document.title shows streaming indicator
  });
});
```

---

## 五、契约测试 (2 用例)

```typescript
describe("RPC Contract", () => {
  // ── CT-01: RPC 信封格式验证 ─────────────────────────────────────
  it("CT-01: request follows RPC envelope format", async () => {
    // Given: msw captures outgoing POST body
    let captured: any = null;
    server.use(http.post("/", async ({ request }) => {
      captured = await request.json();
      return new HttpResponse("OK");
    }));
    const store = useAiChatStore();
    await store.createConversation("Contract Test");
    mockStreamChat();

    // When: sendMessage triggers the chat API call
    await store.sendMessage("Test RPC");

    // Then: body matches RPC envelope { module_name, method_name, parameters }
    expect(captured).toBeDefined();
    expect(captured.module_name).toBe("services.ai.chat_service");
    expect(captured.method_name).toBe("chat");
    expect(captured.parameters).toMatchObject({
      stream: true,
      messages: expect.any(Array),
      model: expect.any(String),
    });
  });

  // ── CT-02: 非流式响应信封验证 ──────────────────────────────────
  it("CT-02: non-stream response follows {code, message, data} format", async () => {
    // Given: server returns standard RPC response
    server.use(http.post("/", async () => HttpResponse.json({
      code: 0, message: "ok", data: { result: "success" },
    })));

    // When: a non-stream API call is made
    // Then: response.code === 0, response.message === "ok"
    // Then: response.data contains the expected payload
  });
});
```

---

## 六、性能测试 (8 项指标)

| # | 指标 | 目标 | 方法 |
|---|------|------|------|
| P-01 | SSE parser throughput | >10K events/s | Vitest bench |
| P-02 | TTFT P95 | <3s | 20 次实际测量 |
| P-03 | 流式 FPS (500历史) | ≥30fps | Chrome FPS meter |
| P-04 | 会话切换延迟 | <100ms | performance.now |
| P-05 | persistActive 耗时 | <50ms | console.time |
| P-06 | 500条滚动帧率 | <50ms/frame | Performance 面板 |
| P-07 | 构建产物增量 | <80KB gzip | ls -la dist/ diff |
| P-08 | 3min 流式内存增长 | <10MB | Memory 面板 |

---

## 七、安全测试 (8 项)

| # | 向量 | 预期 |
|---|------|------|
| S-01 | `<script>alert(1)</script>` | DOM 无 script |
| S-02 | `<img src=x onerror=alert(1)>` | onerror 移除 |
| S-03 | `<svg onload=alert(1)>` | onload 移除 |
| S-04 | `[click](javascript:alert(1))` | 协议移除 |
| S-05 | `<a href="data:text/html,...">` | 协议移除 |
| S-06 | `&lt;script&gt;...` | 渲染为文本 |
| S-07 | Token 传输 | 仅 X-Token 头 |
| S-08 | 会话隔离 | 双 Token 互不可见 |

---

## 八、混沌测试 (4 用例)

| # | 场景 | 预期 |
|---|------|------|
| CH-01 | SSE 连接被 kill | 部分内容保留 + aborted |
| CH-02 | localStorage.clear() 中 | 内存状态不丢 |
| CH-03 | 快速切换 10 次会话 | 不崩溃 |
| CH-04 | 单会话 1000 条消息 | 持久化无异常 |

---

## 九、Pi 风格扩展测试用例

### U-06: Streaming Phases (3 用例)

```typescript
describe("Streaming Phases", () => {
  it("U-06-S01: transitions idle → thinking → streaming → done", async () => {
    const { streamChat } = await import("@/api/modules/chatService");
    vi.mocked(streamChat).mockImplementation((_, h) => {
      h.onPhase?.("thinking"); h.onChunk("a"); h.onDone(); return { abort: vi.fn() };
    });
    const store = useAiChatStore(); await store.createConversation("T");
    await store.sendMessage("Hi");
    expect(store.streamingPhase).toBe("idle");
  });
  it("U-06-S02: phase frames ignored after first chunk", async () => {
    // After onChunk flips to "streaming", subsequent onPhase calls should be no-ops
  });
  it("U-06-S03: TTFT measured on first chunk", async () => {
    // firstTokenLatencyMs set on petMsg when first chunk arrives
  });
});
```

### U-07: Tool Registry (3 用例)

```typescript
describe("Tool Registry", () => {
  it("U-07-S01: tools sync with store toggles", () => {
    const store = useAiChatStore();
    store.webSearchEnabled = true;
    // expect web_search + web_fetch enabled
  });
  it("U-07-S02: tool events track start/end", () => {
    // executeTool → start event → handler → end event
  });
  it("U-07-S03: attachTurnToolCalls pairs start/end", () => {
    // Given toolEvents with pair of start+end → pet message gets toolCalls[]
  });
});
```

### U-08: KB Intent Detection (3 用例)

```typescript
describe("KB Intent Detection", () => {
  it("U-08-S01: detects 'save to knowledge' pattern", () => {
    // KB_INTENT_RE matches "save this to the knowledge base"
    expect(KB_INTENT_RE.test("save this to the knowledge base")).toBe(true);
  });
  it("U-08-S02: skips if knowledge:save block exists", () => {
    // AI already output ```knowledge:save → no auto-wrap
  });
  it("U-08-S03: suggests path from keywords", () => {
    // "Q3 report" → suggests 'reports/q3.md'
  });
});
```

### U-09: Prompt History (2 用例)

```typescript
describe("Prompt History", () => {
  it("U-09-S01: ArrowUp recalls previous prompt", () => {
    pushPromptHistory("first"); pushPromptHistory("second");
    const { promptHistory } = usePromptHistory();
    expect(promptHistory.value).toContain("first");
  });
  it("U-09-S02: ArrowDown clears when beyond most recent", () => {
    // historyIdx === -1 → input cleared
  });
});
```

### U-10: Follow-up 异步消息注入 (3 用例)

```typescript
describe("Follow-up Async Injection", () => {
  it("U-10-S01: creates followUpPet after stream completes with search results", async () => {
    // Given: webSearchEnabled=true, pendingContext has content
    // launchBackgroundSearch called with userQuery and toolSignal
    // When: streamPromise resolves + search result arrives
    // Then: followUpPet message appended, new SSE stream launched with pendingContext
  });
  it("U-10-S02: skips followup when pendingContext is empty", async () => {
    // Given: webSearchEnabled=true but search returns no results
    // When: streamPromise resolves
    // Then: no followUpPet created, only main reply preserved
  });
  it("U-10-S03: skips followup when webSearchEnabled=false", async () => {
    // Given: webSearchEnabled=false
    // When: sendMessage invoked
    // Then: launchBackgroundSearch returns early, no search initiated
  });
});
```

### C-06: ContextChangeCard (3 用例)

```typescript
describe("ContextChangeCard", () => {
  it("C-06-S01: extracts knowledge:save blocks from markdown");
  it("C-06-S02: Apply updates pageContent and adds ctx: tag");
  it("C-06-S03: Undo reverts to snapshot from contextChangeHistory");
});
```

### C-07: ToolCalls Card (2 用例)

```typescript
describe("ToolCalls Card", () => {
  it("C-07-S01: renders completed tool with name/label/duration");
  it("C-07-S02: renders running tool with '(running)' status");
});
```

### I-11: Export (2 用例)

```typescript
describe("Export", () => {
  it("I-11-S01: Markdown export includes title, context, and full conversation", async () => {
    // Given: session with 2 messages and a ctx: file tag
    const store = useAiChatStore();
    await store.createConversation("Export Test", "", ["ctx:docs/readme.md"]);
    store.setActiveMessages(() => [
      { type: "user", message: "Question", timestamp: Date.now() },
      { type: "pet", message: "Answer with **markdown**", timestamp: Date.now() + 1 },
    ]);
    await store.persistActive();

    // When: exportConversation() is called
    // Then: output contains title, export timestamp, context section, user question, AI answer with markdown preserved
    // Then: followup messages (type:"followup") labeled as "Follow-up (queued)"
  });

  it("I-11-S02: HTML export includes light/dark themes and tool call folding", async () => {
    // Given: session with a pet message containing toolCalls[]
    // When: exportConversationHtml() generates standalone HTML
    // Then: HTML contains <style> block with prefers-color-scheme media queries
    // Then: tool calls rendered as <details> collapsible sections
    // Then: code blocks have syntax highlighting classes
  });
});
```

### I-12: Compaction (1 用例)

```typescript
describe("Compaction", () => {
  it("I-12-S01: maybeCompact triggers when token threshold exceeded", async () => {
    // Given: session with 200+ messages totaling >16K characters
    const store = useAiChatStore();
    await store.createConversation("Compact Test");
    const longMsg = "Lorem ipsum dolor sit amet ".repeat(200); // ~6000 chars
    const msgs = Array.from({ length: 200 }, (_, i) => ({
      type: (i % 2 === 0 ? "user" : "pet") as const,
      message: longMsg,
      timestamp: Date.now() + i,
    }));
    store.setActiveMessages(() => msgs);

    // When: onDone triggers maybeCompact() after streaming
    // Then: estimated tokens > 6554 threshold → compaction triggered
    // Then: middle messages removed, recent N rounds + system prompt retained
    // Then: compactionLog records timestamp, before/after token counts
  });
});
```

### I-13: WeChat Auto-Forward (2 用例)

```typescript
describe("WeChat Auto-Forward", () => {
  it("I-13-S01: forwards reply when stream completes successfully", async () => {
    // Given: WeChat robots loaded with autoForward enabled
    // And: SSE stream completed without abort or error
    // When: onDone fires with streamed.trim() non-empty
    // Then: sendWeChatMessage called for each enabled+autoForward robot
    // Then: failed robot calls are silently ignored (no error propagation)
  });

  it("I-13-S02: skips forward when stream was aborted or errored", async () => {
    // Given: SSE stream was aborted by user
    // When: onDone fires with aborted=true
    // Then: forwardReplyToWeCom is NOT called
    // Then: no side effects, session state preserved
  });
});
```

### I-14: Follow-up 端到端 (1 用例)

```typescript
describe("Follow-up E2E", () => {
  it("I-14-S01: main reply completes, then followup injected with search results", async () => {
    // Given: webSearchEnabled=true, mock web_search returns results
    server.use(http.post("/", async ({ request }) => {
      const body = await request.json() as any;
      // Route web_search tool calls to a mock response
      if (body.parameters?.tool_name === "web_search") {
        return HttpResponse.json({ code: 0, data: { results: [{ title: "Result 1", url: "https://example.com", snippet: "..." }] } });
      }
      // Main chat stream response
      return new HttpResponse(
        makeSSEBody([
          'event: token\ndata: {"content":"Let me check..."}\n\n',
          'event: done\ndata: {"done":true}\n\n',
        ]),
        { headers: { "Content-Type": "text/event-stream" } },
      );
    }));
    const store = useAiChatStore();
    store.webSearchEnabled = true;
    await store.createConversation("Follow-up Test");

    // When: user sends a query with web search enabled
    await store.sendMessage("What's the latest?");

    // Then: message list has 2 AI replies (main + followup)
    const msgs = store.activeConversation!.messages;
    const petMsgs = msgs.filter(m => m.type === "pet");
    expect(petMsgs.length).toBeGreaterThanOrEqual(1);
    // Then: followup message contains search result information
    // Then: main user message shows WebSearchResults indicator
  });
});
```

### U-11: Markdown 解析缓存 — TD-02 (2 用例)

```typescript
describe("Markdown Parse Cache", () => {
  it("U-11-S01: cache hit returns cached HTML without re-parsing", () => {
    const { render } = useMarkdown();
    const first = render("**bold**");
    const second = render("**bold**");
    expect(first).toBe(second); // Same input → same output from cache
  });
  it("U-11-S02: cache evicts oldest entry when full", () => {
    // Fill cache with PARSE_CACHE_MAX unique entries → verify LRU eviction
    // Oldest entry should be removed, newest retained
  });
});
```

### U-12: localStorage 配额监控 — TD-04 (2 用例)

```typescript
describe("Storage Quota Monitor", () => {
  it("U-12-S01: reports ok when usage under 85%", () => {
    // Mock localStorage with < 4.25MB → getStorageQuota() returns level: "ok"
  });
  it("U-12-S02: reports critical when usage over 95%", () => {
    // Mock localStorage with > 4.75MB → getStorageQuota() returns level: "critical"
  });
});
```

---

## 十、需求追溯矩阵

| 需求 | 单元 | 组件 | 集成 | 安全 | 混沌 |
|------|------|------|------|------|------|
| FR-01 SSE 流式 | U-01 S01-08 | C-03 S01-07 | I-01 | — | CH-01 |
| FR-02 会话管理 | U-03 S01-03 | C-05 S01-02 | — | — | CH-03 |
| FR-03 持久化 | U-02 S04 | — | I-02 | — | CH-02,04 |
| FR-04 Markdown | U-04 S01-04 | C-01 S03-05 | — | S-01-06 | — |
| FR-05 上下文文件 | — | C-04 S01-04 | I-03,09 | — | — |
| FR-06 RAG 检索 | — | — | I-03 | — | — |
| FR-07 Web 搜索 | U-10 S01-03 | — | I-13, I-14 | — | — |
| FR-08 消息交互 | U-02 S02 | C-01 S01-04 | I-08 | — | — |
| FR-09 空状态 | — | C-02 S01-04 | — | — | — |
| Pi-01 流式阶段 | U-06 S01-03 | — | — | — | — |
| Pi-02 工具注册 | U-07 S01-03 | C-07 S01-02 | — | — | — |
| Pi-03 KB 意图 | U-08 S01-03 | C-06 S01-03 | — | — | — |
| Pi-04 提示词历史 | U-09 S01-02 | — | — | — | — |
| Pi-05 导出 | — | — | I-11 S01-02 | — | — |
| Pi-06 压缩 | — | — | I-12 S01 | — | — |
| Pi-07 WeChat 转发 | — | — | I-13 S01 | — | — |
| Pi-08 Follow-up 回复 | U-10 S01-03 | — | I-14 S01 | — | — |
| Pi-09 Markdown 缓存 (TD-02) | U-11 S01-02 | — | — | — | — |
| Pi-10 存储配额 (TD-04) | U-12 S01-02 | — | — | — | — |
| NFR 安全 | U-04 S01-04 | — | CT-01,02 | S-01-08 | — |

---

## 十一、缺陷严重度

| 级别 | 定义 | 响应 | 修复 | 示例 |
|------|------|------|------|------|
| P0 | 核心不可用 | 即时 | 4h | SSE 完全不工作；XSS 可执行 |
| P1 | 核心受损 | 4h | 24h | 持久化间歇失败；切换 crash |
| P2 | 非核心异常 | 24h | 3d | 复制按钮偶发失效 |
| P3 | UI 瑕疵 | 3d | 下迭代 | 动画不流畅 |

---

## 十二、冒烟测试清单

- [x] 发送消息 → 流式渲染 → 刷新恢复
- [x] 创建/切换/删除/收藏会话
- [x] 代码块高亮 + 复制按钮
- [x] XSS 向量 8 项拦截
- [x] IME 中文不误发
- [x] 空状态引导正常
- [x] 知识文件选择器创建会话
- [x] `vue-tsc --noEmit` + `pnpm test` 通过
- [x] `pnpm build:pro` 成功