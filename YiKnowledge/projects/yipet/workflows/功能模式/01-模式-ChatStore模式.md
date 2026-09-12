---
title: Chat Store 模式
tags: [yipet, patterns, chat-store, pinia, state-management, stream, persistence]
category: projects/yipet/specs
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: pattern
status: active
---

# Pattern: Chat Store (Pinia)

> Chat Store 状态管理完整模式：Pinia Setup Store、响应式状态、操作分发、流式处理、多模式聊天、持久化策略、会话生命周期、错误恢复、与 Vue 组件集成、反模式。

## 概述

Chat Store 是 YiPet 聊天窗口的单一状态源，使用 **Pinia Setup Store（Composition API）** 模式。所有状态变更通过 Store Actions 完成，Vue 组件通过 `useChatStore()` 直接访问响应式状态。

**为什么选择 Pinia？**
- Chat Store 在 MAIN World 的 Vue 3 应用中运行，Pinia 是 Vue 3 官方状态管理
- 响应式状态自动追踪，无需手动 subscribe/emit
- Composition API 风格与 Vue 3 组件一致
- 支持 `storeToRefs()` 解构响应式状态
- Pinia devtools 支持，方便调试

> **历史说明**：早期版本使用独立的 `ChatController` 类 + 发布订阅模式。迁移到 Pinia 后，状态管理更简洁，组件代码更少。

**相关规范**：
- [核心模块](./架构设计/05-核心模块.md)
- [API 规范](./开发规范/01-API规范.md)
- [扩展架构](./架构设计/02-扩展架构.md)

---

## 核心模式

### Pinia Setup Store

```typescript
// src/chat/stores/chat.ts
export const useChatStore = defineStore("yipet-chat", () => {
  // 注入 API 服务
  const api = inject<ApiServices>(API_SERVICES_KEY)!;

  // ===== 响应式状态 =====
  const messages = ref<Message[]>([]);
  const sessions = ref<Session[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isProcessing = ref(false);
  const streamingType = ref("");
  const streamingPhase = ref<"" | "thinking" | "retrieving" | "streaming">("");
  const title = ref("New Chat");
  const knowledgeGrounded = ref(false);
  const ragScope = ref("");
  const ragScopeIsFile = ref(false);
  const ragSources = ref<RagSource[]>([]);
  const pageInfo = ref({ url: "", title: "", description: "", keywords: [] });
  const contextEnabled = ref(false);
  const contextEditorDraft = ref("");
  const sidebarCollapsed = ref(false);
  const sidebarView = ref<"sessions" | "knowledge" | "stories" | "bugs">("sessions");
  const chatVisible = ref(false);
  const model = ref("qwen3.5");
  const role = ref("cat");
  const color = ref("blue");
  const promptHistory = ref<string[]>([]);

  // ===== 计算属性 =====
  const currentSession = computed(() =>
    sessions.value.find(s => s.id === currentSessionId.value)
  );

  // ===== 操作方法 =====
  async function sendMessage(text: string) { /* ... */ }
  function stopSending() { /* ... */ }
  async function selectSession(id: string) { /* ... */ }
  async function createSession(opts?: CreateSessionOpts) { /* ... */ }
  // ... 50+ 方法

  return {
    messages, sessions, currentSessionId, isProcessing,
    streamingType, streamingPhase, title, knowledgeGrounded,
    ragScope, ragScopeIsFile, ragSources, pageInfo,
    contextEnabled, contextEditorDraft, sidebarCollapsed,
    sidebarView, chatVisible, model, role, color, promptHistory,
    currentSession,
    sendMessage, stopSending, selectSession, createSession,
    // ... 50+ 方法
  };
});
```

### 初始状态

初始状态通过 `ref()` 定义在 Store 内部，每个字段有明确的默认值。状态通过 Pinia 的响应式系统自动追踪，无需手动 `_emit()` 通知订阅者。

### Vue 组件集成

```typescript
// 组件中直接使用 Pinia Store
import { useChatStore } from "../stores/chat";
import { storeToRefs } from "pinia";

const chatStore = useChatStore();
// 解构响应式状态（保持响应性）
const { messages, isProcessing, sessions, chatVisible } = storeToRefs(chatStore);

// 调用 Actions
chatStore.sendMessage("Hello");
chatStore.stopSending();
chatStore.selectSession("abc123");
```

**关键规则**：
- 组件不直接修改状态，所有变更通过 Store Actions 完成
- 使用 `storeToRefs()` 解构状态以保持响应性
- 高频更新的状态（如流式 token）Vue 自动批量更新，无需手动缓冲

---

## 操作分类

### 消息操作

| 操作 | 触发 | 状态变更 | 持久化 |
|------|------|----------|--------|
| `sendMessage(text)` | 用户点击发送/回车 | `isProcessing=true`, 添加用户消息, 流式追加宠物消息 | 是 |
| `stopSending()` | 用户点击停止/ESC | `isProcessing=false`, 消息标记 `aborted=true` | 是 |
| `regenerateMessage(ts)` | 用户点击重新生成 | 替换最后一条宠物消息，重新流式生成 | 是 |
| `editMessage(ts, text)` | 用户编辑后重发 | 替换指定用户消息，截断后续消息，重新流式生成 | 是 |

### 会话操作

| 操作 | 触发 | 状态变更 | 持久化 |
|------|------|----------|--------|
| `selectSession(id)` | 点击侧边栏会话 | 切换 `currentSessionId`, 加载消息列表 | 否（加载） |
| `createSession(opts?)` | 新建会话按钮 | 创建空会话，切换到新会话 | 是 |
| `deleteSession(id)` | 删除会话 | 从列表移除，若为当前会话则切换到最近会话 | 是 |
| `renameSession(id, title)` | 编辑会话标题 | 更新 `sessions[i].title` | 是 |

### 知识库操作

| 操作 | 触发 | 状态变更 | 持久化 |
|------|------|----------|--------|
| `toggleKnowledgeGrounded()` | 切换知识库开关 | `knowledgeGrounded` 取反 | 是 |
| `setRagScopeFromNode(path, isFile)` | 点击知识树节点 | 设置 `ragScope` 和 `ragScopeIsFile` | 是 |
| `clearRagScope()` | 清除范围 | 重置 `ragScope` 为空 | 是 |

---

## 流式处理模式

### 完整流程

```
sendMessage(text)
  │
  ├── 1. 前置检查
  │     ├── isProcessing? → 拒绝（防止并发发送）
  │     ├── text 为空? → 拒绝
  │     └── 无当前会话? → 自动创建
  │
  ├── 2. 准备消息列表
  │     ├── systemPrompt: 角色定义 + 页面上下文（如果启用）
  │     ├── historyMessages: 最近 N 轮对话（保留上下文窗口）
  │     └── currentMessage: { role: "user", content: text }
  │
  ├── 3. 更新状态
  │     ├── isProcessing = true
  │     ├── streamingType = "send"
  │     ├── 添加用户消息到 messages
  │     └── 添加空宠物消息占位
  │
  ├── 4. 选择聊天模式并调用
  │     ├── knowledgeGrounded && ragScopeIsFile
  │     │     → RagService.streamFileChat({ target_file, question })
  │     ├── knowledgeGrounded && !ragScopeIsFile
  │     │     → RagService.streamChat({ messages, scope, category })
  │     └── 普通模式
  │           → ChatService.streamWithCallback({ messages, model, system })
  │
  ├── 5. SSE 流式回调
  │     ├── onThinking() → streamingPhase = "thinking"
  │     ├── onRetrieving() → streamingPhase = "retrieving"
  │     ├── onStreaming() → streamingPhase = "streaming"
  │     ├── onToken(text) → 追加到宠物消息 content
  │     ├── onSources(sources) → 更新 ragSources
  │     ├── onToolCall(call) → 追加 toolCalls 到消息
  │     ├── onDone() → 标记消息完成
  │     └── onError(err) → 消息标记 error
  │
  └── 6. 清理
        ├── isProcessing = false
        ├── streamingType = ""
        ├── streamingPhase = ""
        ├── 持久化会话
        ├── 自动生成标题（新会话首条消息）
        └── Vue 响应式自动更新 UI
```

### Token 追加优化

Vue 3 的响应式系统自动批量更新，高频 token 追加无需手动缓冲：

```typescript
// Pinia Store 中直接追加 token，Vue 自动批量更新 DOM
function _onToken(token: string): void {
  const lastMsg = messages.value[messages.value.length - 1];
  if (lastMsg?.role === "pet") {
    lastMsg.content += token;
    // Vue 内部自动批量更新，无需手动 setTimeout 缓冲
  }
}
```

> **为什么不需要手动缓冲？** Vue 3 的异步更新队列（`nextTick`）自动将同一事件循环中的多次响应式变更合并为一次 DOM 更新。Pinia 的 `$patch` 也可用于批量更新，但常规属性修改已足够高效。

### 错误处理

```typescript
// Chat Store（Pinia）中的流式错误处理
function _onStreamError(error: Error): void {
  const lastMsg = messages.value[messages.value.length - 1];
  if (!lastMsg) return;

  if ((error as Error).name === 'AbortError') {
    lastMsg.aborted = true;
  } else {
    lastMsg.error = error.message || '发生未知错误';
    lastMsg.retryable = true;
  }
    lastMsg.retryable = true;
  }

  lastMsg.streaming = false;
  isProcessing.value = false;
  streamingType.value = "";
  streamingPhase.value = "";
  _persistSession();
}

// 重新生成（重试）
async function regenerateMessage(timestamp: number): Promise<void> {
  const msg = messages.value.find(m => m.timestamp === timestamp);
  if (!msg || !msg.retryable) return;

  messages.value = messages.value.filter(m => m.timestamp !== timestamp);

  const lastUserMsg = [...messages.value].reverse().find(m => m.role === "user");
  if (lastUserMsg) {
    await sendMessage(lastUserMsg.content);
  }
}
```

---

## 会话生命周期

### 创建

```typescript
async function createSession(opts?: CreateSessionOpts): Promise<string> {
  const sessionId = opts?.sessionId || generateId();

  const newSession: Session = {
    id: sessionId,
    title: opts?.title || "New Chat",
    model: model.value,
    messageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: opts?.tags || [],
  };

  sessions.value = [newSession, ...sessions.value];
  currentSessionId.value = sessionId;
  messages.value = [];
  title.value = newSession.title;

  if (opts?.messages) {
    messages.value = opts.messages.map(m => ({
      id: generateId(),
      role: m.role as MessageRole,
      content: m.content,
      timestamp: Date.now(),
    }));
    newSession.messageCount = opts.messages.length;
  }

  await _persistSessions();
  return sessionId;
}
```

### 选择

```typescript
async function selectSession(id: string): Promise<void> {
  if (id === currentSessionId.value) return;

  if (currentSessionId.value) {
    await _persistSession();
  }

  const session = sessions.value.find(s => s.id === id);
  if (!session) return;

  try {
    const fullSession = await api.session.getByKey(id);
    currentSessionId.value = id;
    messages.value = fullSession.messages || [];
    title.value = fullSession.title || session.title;
  } catch (error) {
    console.error(`Failed to load session ${id}:`, error);
    currentSessionId.value = id;
    messages.value = [];
    title.value = session.title;
  }
}
```

### 删除

```typescript
async function deleteSession(id: string): Promise<void> {
  sessions.value = sessions.value.filter(s => s.id !== id);

  let newCurrentId = currentSessionId.value;
  if (id === currentSessionId.value) {
    newCurrentId = sessions.value[0]?.id || null;
  }
  currentSessionId.value = newCurrentId;

  try {
    await api.session.delete(id);
  } catch (error) {
    console.error(`Failed to delete session ${id}:`, error);
  }

  await _persistSessions();

  if (newCurrentId && newCurrentId !== id) {
    await selectSession(newCurrentId);
  }
}
```

### 导出

```typescript
function exportCurrentSessionMarkdown(): void {
  const markdown = _formatSessionAsMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.value || "chat"}-${Date.now()}.md`;
  a.click();

  URL.revokeObjectURL(url);
}
```

---

## 持久化模式

### 会话持久化

```typescript
async function _persistSession(): Promise<void> {
  if (!currentSessionId.value) return;

  const session = sessions.value.find(s => s.id === currentSessionId.value);
  if (!session) return;

  session.messageCount = messages.value.length;
  session.updatedAt = Date.now();

  try {
    await api.session.upsert({
      key: session.id,
      messages: messages.value.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        model: m.model,
        sources: m.sources,
        toolCalls: m.toolCalls,
      })),
      title: title.value,
      model: model.value,
      tags: session.tags,
    });
  } catch (error) {
    console.error("[ChatStore] Session persist failed:", error);
    await _persistToLocalStorage(session.id);
  }

  await _persistSessions();
}

async function _persistToLocalStorage(sessionId: string): Promise<void> {
  const key = `session_backup_${sessionId}`;
  await chrome.storage.local.set({
    [key]: {
      messages: messages.value,
      title: title.value,
      updatedAt: Date.now(),
    },
  });
}
```

### 状态恢复

```typescript
async function restoreState(): Promise<void> {
  const result = await chrome.storage.local.get([
    "sessions", "currentSessionId", "knowledgeGrounded",
    "ragScope", "sidebarWidth", "promptHistory", "chatVisible",
  ]);

  sessions.value = result.sessions || [];
  currentSessionId.value = result.currentSessionId || null;
  knowledgeGrounded.value = result.knowledgeGrounded || false;
  ragScope.value = result.ragScope || "";
  sidebarWidth.value = result.sidebarWidth || 280;
  promptHistory.value = result.promptHistory || [];
  chatVisible.value = result.chatVisible ?? false;

  if (currentSessionId.value) {
    await selectSession(currentSessionId.value);
  }
}
```

---

## 反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 组件直接修改状态 | `chatStore.messages.push(msg)` | 通过 Store Action `chatStore.sendMessage(text)` | 破坏单一数据源 |
| 组件内调用 API | 在 ChatInput 中直接 `fetch()` | 通过 Store → ApiClient 调用 | 破坏 API 分层 |
| 不持久化会话 | 仅在内存中保存消息 | `_persistSession()` 写入后端 + chrome.storage | 刷新页面丢失所有对话 |
| 流式处理不处理 abort | 不检查 `signal.aborted` | finally 中清理状态 + 标记 `aborted=true` | 中止后状态残留 |
| 多个操作并发 | 发送中允许再次发送 | `isProcessing` 时禁用发送按钮 | 消息交叉，状态混乱 |
| 删除会话不切换 | 删除当前会话后 `currentSessionId` 悬空 | 自动切换到最近会话或创建新会话 | 界面空白 |
| 导出时未释放 Blob URL | `URL.createObjectURL` 但不 revoke | 下载后调用 `URL.revokeObjectURL` | 内存泄漏 |

---

## 约束

### 必须遵守
- Chat Store（Pinia）是聊天状态的唯一数据源，组件不直接修改状态
- 所有状态变更通过 Store Actions 完成
- Vue 组件通过 `useChatStore()` + `storeToRefs()` 访问状态
- 会话变更后立即持久化（后端优先，chrome.storage 降级）
- 流式处理在 finally 中清理 `isProcessing` 状态
- 删除当前会话时自动切换到最近会话

### 禁止
- 不在组件中直接修改 Store 状态
- 不在组件中直接调用 ApiClient 或 fetch
- 不跳过持久化步骤
- 不在流式处理中忽略 abort 信号
- 不允许多个消息操作并发执行