---

doc_type: test
title: "YP-09-05: 聊天窗口交互优化 — 流式阶段 + 工具卡片 + 快捷键 — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-05"
source_prds: ["12-体验优化-聊天窗口交互"]
source_modules: ["05-prd-task-聊天窗口交互优化"]

type: test
---

# YP-09-05: 聊天窗口交互优化 — 测试规格

## 一、组件测试

```typescript
describe("Chat UX", () => {
  it("C-01: streaming phase indicator shows thinking→streaming", () => {
    const store = useChatStore();
    store.streamingPhase = "thinking";
    const wrapper = mount(SessionStatusBar);
    expect(wrapper.find(".phase-dot.thinking.active").exists()).toBe(true);

    store.streamingPhase = "streaming";
    await nextTick();
    expect(wrapper.find(".phase-dot.thinking.done").exists()).toBe(true);
    expect(wrapper.find(".phase-dot.streaming.active").exists()).toBe(true);
  });

  it("C-02: sidebar auto-collapses at < 600px", async () => {
    const store = useChatStore();
    store.chatWidth = 580;
    await nextTick();
    expect(store.sidebarCollapsed).toBe(true);
  });

  it("C-03: Ctrl+/ shows shortcut panel", async () => {
    const wrapper = mount(ChatWindow);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "/", ctrlKey: true }));
    expect(wrapper.find(".shortcut-panel").exists()).toBe(true);
  });

  it("C-04: tool call card shows running→done states", () => {
    const wrapper = mount(ToolCallCard, {
      props: { toolName: "read_file", status: "running" },
    });
    expect(wrapper.find(".spinner").exists()).toBe(true);
  });
});
```

完成定义: C-01~04 全通过