---
doc_type: module
prd_task_id: "YP-08-01"
title: "YP-08-01: 提示词历史与分支管理 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-16
project: YiPet
project_id: yipet
prd_month: "202608"
estimate_frontend: 4.0
source_prd: "01-聊天核心-提示词历史与分支管理"
source_okr: [yipet-002]
---

# YP-08-01: 提示词历史与分支管理 — 开发方案

> 来源 PRD：[01-聊天核心-提示词历史与分支管理.md](../../prds/2026-08/01-聊天核心-提示词历史与分支管理.md)
> 需求编号：YP-08-02 · 优先级：P0 · 人天：4.0d

---

## 一、方案概述

在 YP-07-03（聊天框架）基础上，实现对标 YiVad aiChat 的完整会话体验：提示词历史导航、自动标题、会话搜索过滤、分支管理、消息操作增强、会话导出。

### 1.1 架构关系

```
ChatInput (ArrowUp/Down 导航)
  └── usePromptHistory composable (localStorage 持久化, 100 条上限)

ChatToolbar (提示词历史弹窗 + 导出按钮)
  ├── 弹窗: 搜索 + 最近 3 条快捷芯片 + 完整列表 (复制/删除/清空)
  └── 导出: Blob → a.click() 下载 .md 文件

ChatSidebar (搜索 + 过滤 + 分支列表)
  ├── SearchBar (客户端模糊匹配 title)
  ├── FilterTabs (全部/收藏/今天/本周)
  └── SessionListItem (标题 + 分支标识)

ChatStore (store 扩展)
  ├── branchFromMessage(sessionId, messageId) → 创建分支会话
  ├── regenerateMessage(idx) → 清空 AI 回复 + 保留上下文重新流式
  ├── editMessage(idx, content) → 更新用户消息 + 持久化
  └── deleteMessage(idx) → 移除 + 持久化
```

---

## 二、核心模块设计

### 2.1 提示词历史 (`usePromptHistory`)

```typescript
// src/chat/composables/usePromptHistory.ts
const STORAGE_KEY = "yipet:prompt_history";
const MAX_HISTORY = 100;

// 单例 composable (跨组件共享)
export function usePromptHistory() {
  const promptHistory = ref<string[]>(loadFromStorage());

  function push(text: string) {
    const trimmed = text.trim(); if (!trimmed) return;
    // 去重：已存在 → 移到最前；新增 → unshift；超出 → pop
    const idx = promptHistory.value.indexOf(trimmed);
    if (idx >= 0) promptHistory.value.splice(idx, 1);
    promptHistory.value.unshift(trimmed);
    if (promptHistory.value.length > MAX_HISTORY) promptHistory.value.pop();
    persist();
  }
  function removeAt(idx: number) { promptHistory.value.splice(idx, 1); persist(); }
  function clear() { promptHistory.value = []; persist(); }

  return { promptHistory, push, removeAt, clear };
}
```

**ChatInput 集成**：

```typescript
// ChatInput.vue → onKeydown
const { promptHistory } = usePromptHistory();
const historyIdx = ref(-1);

function onKeydown(e: KeyboardEvent) {
  // ArrowUp: 光标在行首或空输入 → 上一条历史
  if (e.key === "ArrowUp" && (caretPos === 0 || !store.input)) {
    e.preventDefault();
    if (historyIdx === -1) historyIdx = promptHistory.length - 1;
    else if (historyIdx > 0) historyIdx--;
    store.input = promptHistory[historyIdx] || "";
    // 光标移到末尾
  }
  // ArrowDown: 光标在行尾且正在导航 → 下一条
  if (e.key === "ArrowDown" && caretPos === store.input.length && historyIdx >= 0) {
    e.preventDefault();
    if (historyIdx < promptHistory.length - 1) historyIdx++;
    else { historyIdx = -1; store.input = ""; }
    if (historyIdx >= 0) store.input = promptHistory[historyIdx];
  }
  // 其他键 → 重置导航
  if (!["ArrowUp", "ArrowDown"].includes(e.key)) historyIdx = -1;
  // Enter 发送前 → push to history
  if (e.key === "Enter" && !e.shiftKey && store.input.trim()) {
    pushPromptHistory(store.input); historyIdx = -1;
  }
}
```

### 2.2 提示词历史弹窗 (ChatToolbar)

**UI 结构**：
```
┌──────────────────────────────────┐
│ Prompt history · 42     [清空]   │
├──────────────────────────────────┤
│ Recent: [芯片1] [芯片2] [芯片3]  │
├──────────────────────────────────┤
│ 🔍 Search prompts...            │
├──────────────────────────────────┤
│ 分析最近的 Bug 趋势        📋 ✕  │
│ 总结 Q3 项目进展           📋 ✕  │
│ ...                             │
└──────────────────────────────────┘
```

**功能**：
- 搜索框：客户端 trigram Jaccard 模糊匹配，0 结果时展示 "did you mean" 建议
- 最近 3 条快捷芯片：点击直接插入输入框
- 每条历史：点击插入 / 复制按钮 / 删除按钮
- 清空按钮（含确认弹窗）

### 2.3 自动标题生成

```typescript
// ChatStore → sendMessage
async function sendMessage(text: string) {
  // ... 创建会话逻辑 ...
  // 首条消息 → 自动标题
  if (session.messages.length === 0) {
    session.title = text.slice(0, 30).replace(/\n/g, " ");
  }
  // ... 发送逻辑 ...
}
```

**SessionEditDialog**：允许手动修改标题，调用 `updateSessionMeta(key, { title })`。

### 2.4 会话搜索与过滤

```typescript
// ChatSidebar → computed
const searchQuery = ref("");
const activeFilter = ref<"all" | "starred" | "today" | "week">("all");

const filteredSessions = computed(() => {
  let list = store.sessions;

  // 1. 过滤标签
  if (activeFilter.value === "starred") list = list.filter(s => s.isFavorite);
  if (activeFilter.value === "today") {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    list = list.filter(s => s.updatedAt >= today.getTime());
  }
  if (activeFilter.value === "week") {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    list = list.filter(s => s.updatedAt >= weekAgo);
  }

  // 2. 搜索匹配
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(s => s.title?.toLowerCase().includes(q));
  }

  return list; // 保持排序：收藏优先 → 更新时间倒序
});
```

### 2.5 会话分支

```typescript
interface SessionBranch {
  id: string;              // 新会话 key
  parentSessionId: string; // 父会话 key
  parentMessageIdx: number; // 分叉点消息索引
}

// ChatStore
async function branchFromMessage(sessionId: string, messageIdx: number) {
  const parent = conversations.value.find(c => c.key === sessionId);
  if (!parent) return;

  // 复制分叉点及之前的消息
  const branchedMessages = parent.messages.slice(0, messageIdx + 1);
  const key = newKey();
  const newSession: SessionDocument = {
    key, title: `${parent.title} (branch)`, url: parent.url,
    messages: branchedMessages, tags: [...parent.tags],
    createdAt: Date.now(), updatedAt: Date.now(),
  };
  await upsertSession(newSession);
  conversations.value = [newSession, ...conversations.value];
  activeConversation.value = newSession;
  rememberActive(key);
}
```

**分支可视化**：SessionListItem 检测 `title.includes("(branch)")` → 展示分支图标 + 父会话引用。

### 2.6 消息操作

```typescript
// 重新生成
async function regenerateMessage(idx: number) {
  // 1. 找到此 AI 消息之前的最后一条用户消息
  let userIdx = -1;
  for (let i = idx - 1; i >= 0; i--) {
    if (messages[i].type === "user") { userIdx = i; break; }
  }
  if (userIdx < 0) return;

  // 2. 重置 AI 消息
  const resetMessages = [...messages];
  resetMessages[idx] = { ...resetMessages[idx], message: "", error: false, aborted: false };
  activeConversation.value = { ...activeConversation.value!, messages: resetMessages };

  // 3. 重新流式
  await runStream(userIdx, resetMessages[idx].timestamp, "regenerate");
}

// 编辑消息
async function editMessage(idx: number, content: string) {
  const next = [...messages];
  next[idx] = { ...next[idx], message: content };
  activeConversation.value = { ...activeConversation.value!, messages: next, updatedAt: Date.now() };
  await persistActive();
}

// 删除消息
async function deleteMessage(idx: number) {
  if (sending.value) return;
  const next = messages.filter((_, i) => i !== idx);
  activeConversation.value = { ...activeConversation.value!, messages: next, updatedAt: Date.now() };
  const ok = await persistActive();
  if (!ok) { /* rollback */ }
}
```

### 2.7 会话导出

```typescript
function exportConversation() {
  const s = activeConversation.value; if (!s) return;
  const lines: string[] = [];
  lines.push(`# ${s.title || "Chat"}`);
  lines.push(`> Exported: ${new Date().toISOString()}`);
  if (s.pageContent) { lines.push(""); lines.push("## Context"); lines.push(s.pageContent); }
  lines.push(""); lines.push("## Conversation");

  for (const m of s.messages ?? []) {
    const role = m.type === "user" ? "**User**" : "**AI**";
    const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
    lines.push(`### ${role} ${time ? `(${time})` : ""}`);
    lines.push(m.message || "_(empty)_");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${s.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_")}.md`;
  a.click(); URL.revokeObjectURL(url);
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | 提示词历史 composable + ArrowUp/Down 集成 | `usePromptHistory.ts`, `ChatInput.vue` | localStorage 读写 + 导航循环 | 1.0 |
| 2 | 提示词历史弹窗 (搜索/芯片/复制/删除/清空) | `ChatToolbar.vue` | 弹窗 UI + 交互 | 0.5 |
| 3 | 自动标题 + SessionEditDialog | `chat.ts`, `SessionEditDialog.vue` | 首条消息 → 标题 | 0.5 |
| 4 | 搜索 + 过滤 (SearchBar + FilterTabs) | `ChatSidebar.vue` | 搜索 + 4 过滤器 | 0.5 |
| 5 | 分支管理 (branchFromMessage + 分支可视化) | `chat.ts`, `SessionListItem.vue` | 分叉 → 新会话独立 | 0.5 |
| 6 | 消息操作 (编辑/删除/重新生成) | `chat.ts` | store 方法 + 持久化 | 0.5 |
| 7 | 会话导出 (Markdown) | `ChatToolbar.vue` | 下载 .md 文件 | 0.25 |
| 8 | 集成 + 回归测试 | `tests/` | 全量通过 | 0.25 |

**总计：4.0d**

---

## 四、边缘场景

| 场景 | 触发 | 处理 |
|------|------|------|
| 提示词历史为空 | 新用户首次 | ArrowUp 无反应，弹窗显示 "No prompts yet" |
| 提示词历史超上限 | >100 条 | FIFO 淘汰最旧条目 |
| 搜索无结果 | 无匹配 | "No prompts match" + trigram "did you mean" 建议 |
| 分支父会话被删除 | 删除父会话 | 分支独立存在，不级联删除 |
| 编辑消息后重生成 | 编辑历史用户消息 | 仅影响从编辑点起的消息 |
| 导出空会话 | 无消息 | 仅导出标题 + 时间戳 |
| 导出文件名含特殊字符 | 标题含 `/` `\` 等 | 正则替换为 `_` |

---

## 五、技术债务

| # | 债务 | 优先级 | 人天 |
|---|------|--------|------|
| TD-01 | LLM 自动摘要生成标题 | P2 | 0.3 |
| TD-02 | 分支树图形化可视化 | P3 | 0.5 |
| TD-03 | 全文消息搜索 | P2 | 0.5 |

---

## 六、完成定义

- [ ] 8 个步骤按 §3 清单落地
- [ ] ArrowUp/Down 提示词导航（空输入 + 行首 + 循环）
- [ ] 提示词历史弹窗（搜索 + 芯片 + 复制/删除/清空）
- [ ] 自动标题 + 手动编辑
- [ ] 侧边栏搜索 + 4 过滤器
- [ ] 分支创建 + 独立会话
- [ ] 编辑/删除/重新生成消息
- [ ] Markdown 导出 + 下载
- [ ] `tsc --noEmit` 通过
- [ ] `npm test` 全量通过