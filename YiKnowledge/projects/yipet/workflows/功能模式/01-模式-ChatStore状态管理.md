---
title: Chat Store 状态管理
tags: [yipet, patterns, chat-store, pinia, state-management, sse, rag, persistence]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-15
source: YiPet
type: pattern
roles: [engineer]
benefit: "Pinia Setup Store 状态机、SSE 流式处理、会话生命周期、跨项目桥接"
status: active
---

# Chat Store 状态管理

> Chat Store（Pinia Setup Store）是 YiPet 聊天窗口的单一状态源。涵盖状态机、流式处理、多模式聊天路由、会话生命周期、持久化策略、跨项目桥接。

**相关文档**：[核心模块](../架构设计/05-架构-核心模块.md) · [API 架构](../开发规范/05-规范-API架构与规范.md) · [导航与视图](./03-模式-导航与视图管理.md)

## 一、架构定位

```
ChatStore（Pinia Setup Store，Composition API）
  │ 构造函数注入 ApiServices
  │
  ├── State（40+ 响应式字段）
  │   ├── 会话：sessions, currentSessionId, messages
  │   ├── 流式：streamingPhase, isProcessing, streamingType
  │   ├── RAG：knowledgeGrounded, ragScope, ragScopeIsFile, ragSources
  │   ├── 视图：sidebarView, sidebarCollapsed, chatVisible
  │   └── 上下文：pageInfo, contextEnabled, promptHistory
  │
  ├── Actions（50+ 方法）
  │   ├── 消息：sendMessage, stopSending, regenerateMessage, editMessage
  │   ├── 会话：createSession, selectSession, deleteSession, renameSession
  │   ├── 流式：_runStream, _streamChat, _streamRagChat
  │   ├── RAG：setRagScopeFromNode, toggleKnowledgeGrounded
  │   └── 跨项目：discussInYiVadAiChat, openMessageInYiVad
  │
  └── watch() → chrome.storage.local 自动持久化
```

**为什么选择 Pinia？** MAIN World 运行 Vue 3 应用，Pinia 是官方状态管理。响应式状态自动追踪，无需手动 subscribe/emit。Composition API 风格与组件一致。`storeToRefs()` 解构保持响应性。

## 二、消息发送状态机

```
sendMessage(text)
  │
  ├── 前置检查：isProcessing? text为空? → 拒绝
  ├── 无当前会话 → 自动 createSession
  │
  ├── 1. 写入 promptHistory（去重）
  ├── 2. messages.push({ role: "user", content: text })
  ├── 3. messages.push({ role: "assistant", content: "", streaming: true })
  │     streamingPhase = "thinking", isProcessing = true
  │
  ├── 4. 路由选择聊天模式：
  │     knowledgeGrounded && ragScopeIsFile → RagService.streamFileChat
  │     knowledgeGrounded && !ragScopeIsFile → RagService.streamChat
  │     默认 → ChatService.streamWithCallback
  │
  ├── 5. SSE 流式回调：
  │     onThinking → streamingPhase = "thinking"
  │     onRetrieving → streamingPhase = "retrieving"  
  │     onChunk(text) → streamingPhase = "streaming", 追加到 assistant 消息
  │     onSources → 更新 ragSources
  │     onDone → 标记完成, 持久化, 自动生成标题（首条消息）
  │     onError → 消息标记 error, 区分 AbortError/超时/网络错误
  │
  └── 6. finally: isProcessing = false, streamingPhase = "", 持久化会话
```

## 三、三种聊天模式路由

| 模式 | 触发条件 | API 调用 | 说明 |
|------|----------|----------|------|
| 普通聊天 | `knowledgeGrounded = false` | `ChatService.streamWithCallback` | 直接 LLM，无 RAG |
| 文件 RAG | `knowledgeGrounded && ragScopeIsFile` | `RagService.streamFileChat({ target_file, question })` | 对单个知识文件检索 |
| 目录 RAG | `knowledgeGrounded && !ragScopeIsFile` | `RagService.streamChat({ messages, scope, category })` | 对目录范围检索 |

## 四、会话生命周期

```
createSession() → sessions.unshift, currentSessionId = new
  ↓
selectSession(id) → 保存当前 → 加载目标 → 恢复消息列表
  ↓
deleteSession(id) → 从列表移除 → 若为当前则切换到最近会话
  ↓
renameSession(id, title) → 空标题时使用首条用户消息前30字符
```

**持久化策略**：后端优先（YiAi SessionService），chrome.storage.local 降级备份（`backup_` 前缀键）。写入 2 秒 debounce。

**不持久化的状态**：`isProcessing`, `streamingPhase`, `ragSources`, `contextEditorDraft` — 均为运行时临时数据。

## 五、关键状态字段

| 字段 | 类型 | 持久化 | 说明 |
|------|------|:---:|------|
| `sessions` | `Session[]` | ✓ | 所有会话列表 |
| `currentSessionId` | `string \| null` | ✓ | 当前活跃会话 |
| `messages` | `Message[]` | ✓ | 当前会话消息（通过 sessions 持久化） |
| `isProcessing` | `boolean` | ✗ | 是否正在生成回复 |
| `streamingPhase` | `"" \| "thinking" \| "retrieving" \| "streaming"` | ✗ | 流式阶段指示 |
| `knowledgeGrounded` | `boolean` | ✓ | RAG 开关 |
| `ragScope` | `string` | ✓ | RAG 检索范围路径 |
| `ragSources` | `RagSource[]` | ✗ | 引用来源（展示用） |
| `chatVisible` | `boolean` | ✓ | 聊天窗口显隐 |
| `promptHistory` | `string[]` | ✓ | 提示词历史（最近优先） |

## 六、性能优化

| 策略 | 实现 |
|------|------|
| 消息截断 | 持久化时只保留最近 100 条（`slice(-100)`） |
| Storage 配额 | 总 sessions 数据限制 ~1MB |
| 渲染优化 | 消息列表超 50 条启用虚拟滚动 |
| Markdown 防抖 | 流式输出 50ms debounce（减少 marked 解析频率） |
| 持久化防抖 | chrome.storage 写入 2 秒 debounce |

## 七、跨项目桥接

| 操作 | 触发 | 实现 |
|------|------|------|
| `discussInYiVadAiChat` | 工具栏按钮 | `window.open(YiVAD_URL + '/aiChat?session=' + sessionKey)` |
| `openMessageInYiVad` | 消息右键菜单 | 植入单条消息到 YiVad 会话 |
| `createSessionFromKnowledgeFile` | 拖放文件到聊天窗口 | 读取内容 → 设置 ragScope → 创建新会话 |
| `confirmBugReport` | BugReportDialog 提交 | `dataService.createDocument({ cname: "bugs", document })` |

## 八、反模式

| 反模式 | 正确做法 | 原因 |
|--------|----------|------|
| 组件直接修改状态 | 通过 Store Action | 破坏单一数据源 |
| 组件内调用 fetch | 通过 Store → ApiClient | 破坏 API 分层 |
| 不持久化会话 | `_persistSession()` 写入后端 + storage | 刷新丢失对话 |
| 流式处理不处理 abort | finally 中清理 + 标记 `aborted=true` | 状态残留 |
| 多操作并发 | `isProcessing` 时禁用发送 | 消息交叉混乱 |
| 删除会话不切换 | 自动切换到最近会话 | 界面空白 |

## 九、调试

```js
// 浏览器控制台 — Content Script 上下文
const store = useChatStore();
store.sessions;     // 会话列表
store.messages;     // 当前消息
store.isProcessing; // 是否处理中

// 查看持久化数据
chrome.storage.local.get(["sessions", "currentSessionId"], console.log);

// 清除所有会话
chrome.storage.local.remove(["sessions", "currentSessionId"]);
```

## 十、约束

**必须遵守：**
- Chat Store 是聊天状态的唯一数据源
- 所有状态变更通过 Store Actions
- 组件通过 `useChatStore()` + `storeToRefs()` 访问
- 会话变更后立即持久化（后端优先，storage 降级）
- 流式处理 finally 中清理 `isProcessing`

**禁止：**
- 不在组件中直接修改 Store 状态
- 不在组件中直接调用 ApiClient 或 fetch
- 不允许多个消息操作并发执行
- 不在流式处理中忽略 abort 信号