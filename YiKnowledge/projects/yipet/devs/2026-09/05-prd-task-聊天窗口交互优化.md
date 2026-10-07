---

doc_type: module
prd_task_id: "YP-09-05"
title: "YP-09-05: 聊天窗口交互优化 — 流式阶段动画 + 工具调用卡片 + 键盘快捷键 — 开发方案"
status: 已完成
priority: P2
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "12-体验优化-聊天窗口交互.md"
source_okr: [yipet-002]

type: task
---

# YP-09-05: 聊天窗口交互优化 — 开发方案

> 来源 PRD：[12-体验优化-聊天窗口交互.md](../../prds/2026-09/12-体验优化-聊天窗口交互.md)
> 需求编号：YP-09-05 · 优先级：P2 · 人天：2.0d

---

## 一、方案概述

增强聊天窗口的视觉反馈和操作效率：3 段流式阶段动画 (thinking/retrieving/streaming)、Agent 工具调用卡片、键盘快捷键面板、响应式侧边栏布局。

### 流式阶段指示器

```
┌─ SessionStatusBar ──────────────────────────────────────┐
│  [●thinking] ──→ [●retrieving] ──→ [●streaming]        │
│   当前阶段发光，已完成阶段绿色勾选                          │
└─────────────────────────────────────────────────────────┘
```

---

## 二、核心模块设计

### 2.1 流式阶段指示器

```typescript
// SessionStatusBar.vue
type StreamingPhase = "idle" | "thinking" | "retrieving" | "streaming";

const phases: { phase: StreamingPhase; label: string }[] = [
  { phase: "thinking", label: "Thinking" },
  { phase: "retrieving", label: "Retrieving" },
  { phase: "streaming", label: "Streaming" },
];

const currentPhase = computed(() => store.streamingPhase);

// CSS: 当前阶段发光动画
// .phase-dot.active { animation: pulse-glow 1.5s ease-in-out infinite; }
// 已完成阶段: .phase-dot.done { background: #22c55e; }
```

### 2.2 工具调用卡片

```typescript
// ToolCallCard.vue
interface ToolCallCard {
  toolName: string;        // "read_file", "search", "execute"
  status: "running" | "done" | "error";
  input?: string;          // 工具输入摘要
  result?: string;         // 工具输出摘要
}

// Agent SSE 事件: tool_call_start, tool_call_progress, tool_call_end
// 对应渲染: running (spinner) → done (check) / error (cross)

function renderToolCallCard(call: ToolCallCard) {
  return `
    <div class="tool-card" data-status="${call.status}">
      <span class="tool-icon">${iconFor(call.toolName)}</span>
      <span class="tool-name">${call.toolName}</span>
      <span class="tool-status">${statusIcon(call.status)}</span>
      ${call.result ? `<pre class="tool-result">${call.result}</pre>` : ""}
    </div>
  `;
}
```

### 2.3 键盘快捷键面板

```typescript
// useKeyboardShortcuts.ts
const SHORTCUTS = [
  { key: "Ctrl+Shift+X", desc: "Toggle chat window" },
  { key: "Ctrl+Shift+P", desc: "Toggle pet visibility" },
  { key: "Ctrl+/", desc: "Show shortcut panel" },
  { key: "Ctrl+B", desc: "Toggle sidebar" },
  { key: "Ctrl+K", desc: "Toggle knowledge grounding" },
  { key: "Ctrl+N", desc: "New session" },
  { key: "Escape", desc: "Close chat / modal" },
];

// Ctrl+/ 触发快捷键面板 Popover
```

### 2.4 响应式布局

```typescript
// ChatWindow.vue — 响应式断点
const BREAKPOINT_SIDEBAR_COLLAPSE = 600; // px
const BREAKPOINT_COMPACT = 400;

watch(chatWidth, (w) => {
  if (w < BREAKPOINT_SIDEBAR_COLLAPSE && !sidebarCollapsed.value) {
    sidebarCollapsed.value = true;
  }
});
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 人天 |
|------|------|---------|------|
| 1 | 流式阶段指示器 + CSS 动画 | `SessionStatusBar.vue` | 0.5 |
| 2 | 工具调用卡片组件 | `ToolCallCard.vue` | 0.5 |
| 3 | 键盘快捷键面板 | `useKeyboardShortcuts.ts`, `ShortcutPanel.vue` | 0.5 |
| 4 | 响应式布局 + 集成测试 | `ChatWindow.vue`, `tests/` | 0.5 |

**合计：2.0d**

## 四、完成定义

- [ ] thinking → retrieving → streaming 三阶段动画
- [ ] Agent 工具调用卡片 (running/done/error)
- [ ] Ctrl+/ 快捷键面板
- [ ] 窗口 < 600px 侧边栏自动折叠
- [ ] 动画仅 Composite (transform/opacity)
- [ ] `tsc --noEmit` 零错误