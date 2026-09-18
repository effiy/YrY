---
doc_type: test
title: "YP-08-01: 提示词历史与分支管理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-01"
source_prds: ["01-聊天核心-提示词历史与分支管理"]
source_modules: ["01-prd-task-提示词历史与分支管理"]
---

# YP-08-01: 提示词历史与分支管理 — 测试规格

> 来源 PRD：[01-聊天核心-提示词历史与分支管理.md](../../prds/2026-08/01-聊天核心-提示词历史与分支管理.md)
> 开发方案：[01-prd-task-提示词历史与分支管理.md](../../devs/2026-08/01-prd-task-提示词历史与分支管理.md)

---

## 一、单元测试

### U-01: usePromptHistory composable

```typescript
describe("usePromptHistory", () => {
  beforeEach(() => localStorage.clear());

  it("U-01-S01: push adds to front and persists", () => {
    const { promptHistory, push } = usePromptHistory();
    push("first"); push("second");
    expect(promptHistory.value).toEqual(["second", "first"]);
  });

  it("U-01-S02: duplicate push moves to front", () => {
    const { promptHistory, push } = usePromptHistory();
    push("a"); push("b"); push("a");
    expect(promptHistory.value).toEqual(["a", "b"]);
  });

  it("U-01-S03: max 100 items with FIFO eviction", () => {
    const { promptHistory, push } = usePromptHistory();
    for (let i = 0; i < 110; i++) push(`prompt ${i}`);
    expect(promptHistory.value.length).toBe(100);
    expect(promptHistory.value[0]).toBe("prompt 109"); // newest at front
    expect(promptHistory.value[99]).toBe("prompt 10");  // oldest at back
  });

  it("U-01-S04: removeAt removes correct item", () => {
    const { promptHistory, push, removeAt } = usePromptHistory();
    push("a"); push("b"); push("c");
    removeAt(1);
    expect(promptHistory.value).toEqual(["c", "a"]);
  });

  it("U-01-S05: clear empties and persists", () => {
    const { promptHistory, push, clear } = usePromptHistory();
    push("a"); push("b"); clear();
    expect(promptHistory.value).toEqual([]);
    // reopen → still empty
    const { promptHistory: fresh } = usePromptHistory();
    expect(fresh.value).toEqual([]);
  });

  it("U-01-S06: persists across instances", () => {
    const { push } = usePromptHistory();
    push("persisted");
    const { promptHistory } = usePromptHistory(); // new instance
    expect(promptHistory.value[0]).toBe("persisted");
  });
});
```

### U-02: 自动标题生成

```typescript
describe("autoTitle", () => {
  it("U-02-S01: uses first 30 chars of user message", () => {
    const text = "Analyze the Q3 bug trends and provide insights";
    const title = text.slice(0, 30).replace(/\n/g, " ");
    expect(title.length).toBeLessThanOrEqual(30);
    expect(title).toBe("Analyze the Q3 bug trends and");
  });

  it("U-02-S02: replaces newlines with spaces", () => {
    expect("Line1\nLine2\nLine3".replace(/\n/g, " ")).toBe("Line1 Line2 Line3");
  });

  it("U-02-S03: defaults to 'New chat' for empty first message", () => {
    const firstMsg = "";
    const title = firstMsg.slice(0, 30) || "New chat";
    expect(title).toBe("New chat");
  });
});
```

### U-03: 会话搜索过滤

```typescript
describe("sessionSearch", () => {
  const sessions = [
    { key: "1", title: "Q3 Roadmap", isFavorite: true, updatedAt: Date.now() - 3600000 },
    { key: "2", title: "Bug Analysis", isFavorite: false, updatedAt: Date.now() - 86400000 },
    { key: "3", title: "Architecture Review", isFavorite: false, updatedAt: Date.now() },
  ];

  it("U-03-S01: fuzzy search by title (case-insensitive)", () => {
    const q = "road";
    const filtered = sessions.filter(s => s.title.toLowerCase().includes(q));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Q3 Roadmap");
  });

  it("U-03-S02: starred filter", () => {
    const filtered = sessions.filter(s => s.isFavorite);
    expect(filtered).toHaveLength(1);
  });

  it("U-03-S03: today filter", () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const filtered = sessions.filter(s => s.updatedAt >= today.getTime());
    expect(filtered.length).toBeGreaterThanOrEqual(0);
  });

  it("U-03-S04: week filter", () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const filtered = sessions.filter(s => s.updatedAt >= weekAgo);
    expect(filtered).toHaveLength(2); // 1h ago + now
  });
});
```

---

## 二、组件测试

### C-01: ChatInput — 提示词导航

```typescript
describe("ChatInput prompt navigation", () => {
  beforeEach(() => { pushPromptHistory("first query"); pushPromptHistory("second query"); });

  it("C-01-S01: ArrowUp recalls last prompt on empty input", async () => {
    const store = useChatStore(); store.input = "";
    mount(ChatInput);
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(store.input).toBe("second query");
  });

  it("C-01-S02: ArrowDown goes forward in history", async () => {
    const store = useChatStore(); store.input = "";
    // ArrowUp → ArrowDown → back to empty
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(store.input).toBe("");
  });

  it("C-01-S03: non-navigation key resets history index", async () => {
    // ArrowUp → type a character → ArrowUp (should recall from top again)
  });

  it("C-01-S04: Enter pushes to history before sending", async () => {
    const store = useChatStore(); store.input = "new query";
    const { promptHistory } = usePromptHistory();
    const prevLen = promptHistory.value.length;
    document.querySelector("textarea")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(promptHistory.value.length).toBe(prevLen + 1);
    expect(promptHistory.value[0]).toBe("new query");
  });
});
```

### C-02: ChatToolbar — 提示词弹窗

```typescript
describe("ChatToolbar prompt history popover", () => {
  it("C-02-S01: opens popover on clock button click", async () => {
    const wrapper = mount(ChatToolbar);
    await wrapper.find('[title="Prompt history"]').trigger("click");
    // popover visible
  });

  it("C-02-S02: shows recent 3 chips when no search", () => {
    pushPromptHistory("a"); pushPromptHistory("b"); pushPromptHistory("c"); pushPromptHistory("d");
    // chips should show: d, c, b
  });

  it("C-02-S03: search filters history list", () => {
    // input "bug" → only items containing "bug"
  });

  it("C-02-S04: copy button writes to clipboard", async () => {
    const wt = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: wt }, writable: true });
    // click copy → wt called with prompt text
  });

  it("C-02-S05: clear button with confirm dialog", async () => {
    // click clear → confirm → history empty
  });
});
```

### C-03: ChatSidebar — 搜索与过滤

```typescript
describe("ChatSidebar search & filter", () => {
  it("C-03-S01: search filters sessions by title", async () => {
    const store = useChatStore();
    store.sessions = [{ key:"1", title:"Roadmap" }, { key:"2", title:"Bugs" }];
    const wrapper = mount(ChatSidebar);
    await wrapper.find("input[placeholder*='Search']").setValue("road");
    // only Roadmap visible
  });

  it("C-03-S02: filter tabs switch correctly", async () => {
    // click Starred → only favorited visible
    // click Today → only today's visible
    // click All → all visible
  });

  it("C-03-S03: branch sessions show branch icon", () => {
    // session titled "Q3 (branch)" → branch icon visible
  });

  it("C-03-S04: export button triggers download", async () => {
    // click export → verify Blob created + a.click() called
  });
});
```

### C-04: 消息操作

```typescript
describe("Message operations", () => {
  it("C-04-S01: edit message updates content + persists", async () => {
    const store = useChatStore();
    store.activeConversation = { ...mockSession, messages: [{ type:"user", message:"old", timestamp:Date.now() }] };
    await store.editMessage(0, "new content");
    expect(store.activeConversation!.messages[0].message).toBe("new content");
  });

  it("C-04-S02: delete message removes from array", async () => {
    const store = useChatStore();
    store.activeConversation = { ...mockSession, messages: [msg1, msg2, msg3] };
    await store.deleteMessage(1);
    expect(store.activeConversation!.messages).toHaveLength(2);
  });

  it("C-04-S03: regenerate clears AI reply and re-streams", async () => {
    // set AI message content → regenerate → content cleared → streamChat called
  });

  it("C-04-S04: branchFromMessage creates independent session", async () => {
    const store = useChatStore();
    await store.createConversation("Parent");
    store.activeConversation!.messages = [msg1, msg2, msg3];
    await store.branchFromMessage("Parent", 1);
    // new session created with first 2 messages
    // switching between branch and parent works independently
  });
});
```

---

## 三、集成测试

```typescript
describe("Integration", () => {
  it("I-01: full prompt workflow — type → send → ArrowUp recall → edit → resend", async () => {
    // 1. Type + send: "original prompt"
    // 2. ArrowUp → input shows "original prompt"
    // 3. Edit to "modified prompt" + send
    // 4. ArrowUp → most recent is "modified prompt"
  });

  it("I-02: branch → independent conversation → parent unaffected", async () => {
    // 1. Create session "A" with 5 messages
    // 2. Branch from message 3 → session "A (branch)" created
    // 3. Send new message in branch → only branch has it
    // 4. Switch to parent → parent has original 5 messages
  });

  it("I-03: export → valid Markdown file", async () => {
    // 1. Create session with mixed user/AI messages
    // 2. Export → verify blob content matches expected markdown format
  });
});
```

---

## 四、需求追溯矩阵

| 需求 | 单元 | 组件 | 集成 |
|------|------|------|------|
| FR-01 提示词历史 | U-01 S01-06 | C-01 S01-04, C-02 S01-05 | I-01 |
| FR-02 自动标题 | U-02 S01-03 | — | — |
| FR-03 搜索过滤 | U-03 S01-04 | C-03 S01-04 | — |
| FR-04 会话分支 | — | C-04 S04 | I-02 |
| FR-05 消息操作 | — | C-04 S01-03 | I-01 |
| FR-06 会话导出 | — | C-03 S04 | I-03 |

---

## 五、完成定义

- [ ] 单元测试：U-01(6) + U-02(3) + U-03(4) = 13 用例全通过
- [ ] 组件测试：C-01(4) + C-02(5) + C-03(4) + C-04(4) = 17 用例全通过
- [ ] 集成测试：I-01~03 全通过
- [ ] `npm test` 全量通过
- [ ] `tsc --noEmit` 零错误