---
title: Chat Store 架构
tags: [yipet, patterns, chat, store, state-machine, pinia, sse, rag]
category: projects/yipet/specs
created: 2026-09-08
updated: 2026-09-10
source: YiPet
type: spec
status: active
---

# Chat Store 架构

> YiPet 聊天窗口核心状态机——Pinia Setup Store 驱动的完整聊天架构。涵盖消息发送状态机、RAG 混合路由、会话管理、流式控制、跨项目桥接。

## 一、架构概览

```
ChatStore（Pinia Setup Store）
  │ 构造函数注入 ApiServices（ChatService, RagService, SessionService, DataService）
  │
  ├── State（40+ 响应式字段，通过 store 暴露给 Vue 组件）
  │   ├── 会话：sessions, currentSessionId, messages
  │   ├── 视图：viewState, sidebarView, sidebarCollapsed
  │   ├── RAG：knowledgeGrounded, ragScope, ragSources
  │   ├── 流式：streamingPhase, isProcessing
  │   └── 其他：promptHistory, contextEditorDraft, contextEnabled
  │
  ├── Actions（50+ 方法）
  │   ├── 会话管理：createSession, selectSession, deleteSession, renameSession
  │   ├── 消息发送：sendMessage, stopSending, regenerateMessage
  │   ├── 流式控制：_runStream, _streamChat, _streamRagChat
  │   ├── RAG：loadKnowledgeTree, setRagScope, previewRagSources
  │   ├── 导出：exportMarkdown, branchFromMessage, summarizeSession
  │   └── 跨项目：discussInYiVadAiChat, createSessionFromKnowledgeFile
  │
  └── watch() → chrome.storage.local 自动持久化
```

## 二、消息发送状态机

```
用户提交消息
  │
  ▼
sendMessage(text)
  │
  ├── 前置检查
  │   ├── text 为空 → return
  │   ├── isProcessing === true → return（防止重复发送）
  │   └── currentSessionId 不存在 → 自动 createSession
  │
  ├── 1. 写入 promptHistory（去重，最近优先）
  │
  ├── 2. messages.push({ role: "user", content: text })
  │
  ├── 3. messages.push({ role: "assistant", content: "", streaming: true })
  │     streamingPhase: "thinking"               ← 开始思考
  │     isProcessing: true
  │
  ├── 4. 路由选择
  │   │
  │   ├── knowledgeGrounded && ragScopeIsFile
  │   │   → RagService.streamFileChat({ target_file, question })
  │   │
  │   ├── knowledgeGrounded && !ragScopeIsFile
  │   │   → RagService.streamChat({ messages, scope, category })
  │   │
  │   └── 默认
  │       → ChatService.streamWithCallback({ model, messages, stream, system })
  │
  ├── 5. 流式回调
  │   │
  │   ├── onChunk(text)
  │   │   ├── streamingPhase: "streaming"        ← 切换为流式输出
  │   │   └── assistantMsg.content += text       ← 增量追加
  │   │
  │   ├── onThinking(thought)
  │   │   └── assistantMsg.thinking = thought    ← 显示思考过程
  │   │
  │   ├── onSources(sources)
  │   │   └── ragSources = sources               ← RAG 引用源
  │   │
  │   ├── onDone()
  │   │   ├── assistantMsg.streaming = false
  │   │   ├── streamingPhase: ""                 ← 重置
  │   │   ├── isProcessing: false
  │   │   └── 自动 persist 到 chrome.storage
  │   │
  │   └── onError(err)
  │       ├── assistantMsg.streaming = false
  │       ├── assistantMsg.error = err.message
  │       ├── streamingPhase: ""
  │       ├── isProcessing: false
  │       └── ElMessage.error(err.message)
  │
  └── 6. abort（用户中断）
        ├── chatService.abort()                  ← AbortController
        ├── assistantMsg.streaming = false
        ├── assistantMsg.aborted = true
        ├── streamingPhase: ""
        ├── isProcessing: false
        └── persist 已接收的部分内容
```

## 三、会话管理

### 3.1 会话生命周期

```
createSession()
  │ 生成 sessionId（uuid）
  │ 初始化 messages: []
  │ sessions.unshift(newSession)
  │ currentSessionId = newSession.id
  │ 触发 persist
  ▼
selectSession(sessionId)
  │ currentSessionId = sessionId
  │ messages = 目标会话的 messages
  ▼
deleteSession(sessionId)
  │ 从 sessions 中移除
  │ 如果删除的是当前会话 → 切换到最近的会话
  │ 如果是最后一个会话 → 自动创建新会话
  │ 触发 persist
  ▼
renameSession(sessionId, title)
  │ 更新 session.title
  │ 如果 title 为空 → 使用第一条用户消息的前 30 个字符
  │ 触发 persist
```

### 3.2 持久化策略

```typescript
// 选择性持久化 — 仅保留必要数据
watch(
  () => [
    sessions.value,
    currentSessionId.value,
    knowledgeGrounded.value,
    ragScope.value,
    contextEnabled.value,
  ],
  () => {
    chrome.storage.local.set({
      sessions: sessions.value.map(s => ({
        id: s.id,
        title: s.title,
        messages: s.messages.slice(-100), // 只保留最近 100 条消息
        createdAt: s.createdAt,
        updatedAt: Date.now(),
      })),
      currentSessionId: currentSessionId.value,
      knowledgeGrounded: knowledgeGrounded.value,
      ragScope: ragScope.value,
    }).catch((err) => {
      // chrome.storage 写入失败（配额满等）
      console.warn("[ChatStore] 持久化失败:", err);
    });
  },
  { deep: true }
);
```

**不持久化的状态：**
- `isProcessing`, `streamingPhase` — 运行时状态
- `ragSources` — 临时展示数据
- `contextEditorDraft` — 临时编辑状态

## 四、RAG 接地对话路由

```
用户发送消息（knowledgeGrounded = true）
  │
  ├── ragScopeIsFile = true（用户拖入了文件）
  │     └── RagService.streamFileChat({
  │           target_file: ragScope,    // YAML 文件路径
  │           question: userMessage,
  │           session_id: currentSessionId,
  │         })
  │
  └── ragScopeIsFile = false（用户选择了目录/分类）
        └── RagService.streamChat({
              messages: chatHistory,    // 完整对话历史
              scope: ragScope,          // 检索范围
              category: ragCategory,
              stream: true,
            })
```

## 五、跨项目桥接

| 操作 | 触发 | 实现 |
|------|------|------|
| `discussInYiVadAiChat` | 工具栏 "在 YiVad 中讨论" 按钮 | `window.open(YiVAD_URL + '/aiChat?session=' + sessionKey)` |
| `openMessageInYiVad` | 消息气泡右键菜单 | 植入单条消息到 YiVad |
| `createSessionFromKnowledgeFile` | 拖放 `.md`/`.yaml` 文件到聊天窗口 | 读取文件内容 → 设置 ragScope → 创建新会话 |
| `openBugReport` | 侧边栏 "报告 Bug" 按钮 | 打开 BugReportDialog |
| `confirmBugReport` | BugReportDialog 提交 | `dataService.createDocument({ cname: "bugs", document })` |

## 六、关键状态字段

| 字段 | 类型 | 说明 | 持久化 |
|------|------|------|:---:|
| `sessions` | `Session[]` | 所有会话 | ✓ |
| `currentSessionId` | `string \| null` | 当前活跃会话 | ✓ |
| `messages` | `Message[]` | 当前会话消息（从 sessions 派生） | ✓（通过 sessions） |
| `isProcessing` | `boolean` | 是否正在生成回复 | ✗ |
| `streamingPhase` | `"" \| "thinking" \| "retrieving" \| "streaming"` | 流式阶段 | ✗ |
| `viewState` | `"messages" \| "landing"` | 聊天窗口状态 | ✗ |
| `sidebarView` | `"sessions" \| "knowledge" \| "stories" \| "bugs"` | 侧边栏标签 | ✗ |
| `knowledgeGrounded` | `boolean` | 是否启用 RAG | ✓ |
| `ragScope` | `string` | RAG 检索范围路径 | ✓ |
| `ragScopeIsFile` | `boolean` | 检索范围是否为单文件 | ✗ |
| `ragSources` | `RagSource[]` | 引用来源（展示用） | ✗ |
| `contextEnabled` | `boolean` | 是否附带页面上下文 | ✓ |
| `promptHistory` | `string[]` | 提示词历史（最近优先） | ✓ |

## 七、错误处理

```typescript
// 流式对话的错误处理层级
try {
  await chatService.streamWithCallback(payload, callbacks);
} catch (e) {
  if (e.name === "AbortError") {
    // 用户主动中止 — 正常行为，不提示
    assistantMsg.aborted = true;
  } else if (e.message?.includes("timeout")) {
    // 超时 — 提示用户
    assistantMsg.error = "响应超时，请重试";
    ElMessage.warning("AI 响应超时");
  } else if (e.message?.includes("NetworkError")) {
    // 网络错误 — 提示检查连接
    assistantMsg.error = "网络连接失败";
    ElMessage.error("网络连接失败，请检查后端服务");
  } else {
    // 未知错误 — 记录并提示
    assistantMsg.error = e.message || "未知错误";
    ElMessage.error("对话失败：" + e.message);
  }
} finally {
  assistantMsg.streaming = false;
  isProcessing.value = false;
}
```

## 八、性能优化

| 策略 | 实现 |
|------|------|
| 消息截断 | 持久化时只保留最近 100 条消息（`slice(-100)`） |
| Storage 配额管理 | 总 sessions 数据限制在 ~1MB（约 500 条消息） |
| 渲染优化 | 消息列表使用虚拟滚动（超过 50 条消息时） |
| Markdown 解析防抖 | 流式输出时 50ms debounce（减少 marked 解析频率） |
| Debounced Persist | chrome.storage 写入 2 秒 debounce（减少 IO 次数） |

## 九、调试

```javascript
// 浏览器控制台 — Content Script ISOLATED 上下文
const store = useChatStore();

// 查看当前状态
console.log("sessions:", store.sessions);
console.log("currentSessionId:", store.currentSessionId);
console.log("messages:", store.messages);
console.log("isProcessing:", store.isProcessing);
console.log("streamingPhase:", store.streamingPhase);

// 查看持久化数据
chrome.storage.local.get(["sessions", "currentSessionId"], console.log);

// 清除所有会话（重置）
chrome.storage.local.remove(["sessions", "currentSessionId"]);
```