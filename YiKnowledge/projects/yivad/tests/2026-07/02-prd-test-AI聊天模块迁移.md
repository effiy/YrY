---
doc_type: test
title: "YV-07-02: AI Chat 模块迁移 — CLI Ollama 直调 → RPC 信封 SSE 流式 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202607"
prd_task_id: "YV-07-02"
source_prds: ["02-prd-AI聊天模块迁移"]
source_modules: []
---
# YV-07-02: AI Chat 模块迁移 — CLI Ollama 直调 → RPC 信封 SSE 流式 — 测试规格

> 来源 PRD：[02-prd-AI聊天模块迁移.md](../../prds/2026-07/02-prd-AI聊天模块迁移.md)
> 提取日期：2026-09-11

---

### 4.3 边缘场景处理（Edge Cases）

| 场景 | 描述 | 处理策略 | 实现细节 |
|------|------|---------|---------|
| SSE `event:` 字段 | YiAi 升级 SSE 协议增加 `event: token` / `event: error` 字段 | 维护 `currentEvent` 状态，`event:` 时记录类型，`data:` 时根据类型分发：token→追加文本，error→显示错误 Toast | `if (line.startsWith('event:')) { currentEvent = line.slice(6).trim() }` |
| SSE 未闭合代码块 | AI 流式输出代码块时，开头 ` ```python` 已到达但结尾 ` ``` ` 未到达，后续内容被错误的渲染为代码块 | 检测未闭合的代码块（``` 数量为奇数），临时追加 `\n``` ` 闭合，完整 token 到达后移除 | `if (content.split('```').length % 2 === 0) { tempClose = true }` |
| ReadableStream 未关闭 | `AbortController.abort()` 后 `reader.read()` 仍返回 `{ done: false }`，死循环 CPU 100% | `abort()` 后立即 `reader.cancel()` + `reader.releaseLock()` + 循环中检查 `abortController.signal.aborted` | `finally { reader.releaseLock(); abortController = null }` |
| localStorage 配额超限 | 单会话 500+ 条消息，`JSON.stringify` 后 3MB+，超出 5MB 配额 | `aiChat` Store 的消息体迁移到 IndexedDB (`idb-keyval`)，仅元数据保留在 localStorage | `localStorage` 存 key/title，IndexedDB 存 messages[] |
| Date 序列化 | `JSON.stringify` 将 `Date` 转为字符串，`dayjs(string).fromNow()` 返回 "Invalid date" | 自定义 serializer：`JSON.parse` + reviver 检测 ISO 8601 格式自动转 `new Date(value)` | `deserialize: (val) => JSON.parse(val, dateReviver)` |
| IME 输入法 Enter 误发送 | 中文输入法 composition 期间的 Enter 键发送拼音而非中文 | 检查 `e.isComposing \|\| e.keyCode === 229`，IME 中不发送消息 | `if (e.isComposing \|\| e.keyCode === 229) return` |
| iOS Safari 虚拟键盘 | 虚拟键盘弹出时 `visualViewport.resize` 触发 3-5 次，输入框位置跳动 | 100ms debounce + 键盘高度差 < 10px 稳定后才更新位置 | `transition: bottom 0.1s ease-out` |
| 多标签页会话同步 | 标签页 A 创建新会话，标签页 B 不知情 | `BroadcastChannel` 推送 `{ type: 'new-session', key }`，其他标签页重新加载列表 | `channel.postMessage({ type: 'session-change' })` |
| 快速切换会话 AbortController 残留 | 会话切换时 `abort()` 调用但旧 reader 未彻底关闭 | 在 `currentSessionKey` watch 中主动 `reader.cancel()` + `reader.releaseLock()` | `watch(currentSessionKey, () => { cleanupOldReader() })` |
| 空历史会话 AI 回复 | 首次对话时 `session_key` 为 null，后端需生成新的 | 首次请求不传 `session_key`，从首次 SSE 响应的首个 event 中提取后端生成的 key | `if (!currentSessionKey.value) { /* 从响应中提取 */ }` |
| v-memo 优化失效 | 流式更新时 `v-for` 仍触发全量 patch（500+ 消息时帧率 5fps） | `ChatMessage` 使用 `v-memo="[message.content.length]"` 仅当内容长度变化时重新渲染，历史消息 `shallowRef` | `<ChatMessage v-for="msg in messages" :key="msg.id" v-memo="[msg.content.length]" />` |
| 客户端时间不准确 | `new Date()` 使用客户端时间，不同时区用户看到不同时间 | 使用 YiAi 后端返回的 UTC ISO 8601 `updated` 字段 | `session.updated = response.updated` (来自后端) |

---

## 五、测试规格

### Requirement: SSE 流式消息接收

#### Scenario: 正常流式聊天
- **GIVEN** 用户在输入框输入消息并发送
- **WHEN** YiAi 返回 SSE 流式响应
- **THEN** 消息列表实时显示 AI 回复，逐 token 渲染
- **AND** 流式完成后消息自动持久化

#### Scenario: 用户中断生成
- **GIVEN** AI 正在流式回复中
- **WHEN** 用户点击"停止生成"按钮
- **THEN** SSE 连接被 abort，已接收的部分内容保留在消息列表中

#### Scenario: SSE 连接中断自动重连
- **GIVEN** SSE 流式连接意外中断
- **WHEN** 中断发生
- **THEN** 显示"连接中断，正在重连..."提示
- **AND** 自动重试连接（最多 3 次）

### Requirement: 会话管理

#### Scenario: 创建新会话
- **GIVEN** 用户点击"新建会话"按钮
- **WHEN** 会话创建成功
- **THEN** 侧边栏出现新会话，自动切换到新会话
- **AND** 聊天区域显示空状态

#### Scenario: 删除会话
- **GIVEN** 会话列表中存在多个会话
- **WHEN** 用户删除某个会话
- **THEN** 会话从列表中移除
- **AND** 如果删除的是当前会话，自动切换到下一个会话

#### Scenario: 会话持久化
- **GIVEN** 用户进行了多轮对话
- **WHEN** 刷新页面
- **THEN** 会话列表和消息历史完整恢复

### Requirement: 消息渲染

#### Scenario: Markdown 代码块渲染
- **GIVEN** AI 回复中包含代码块（```python...```）
- **WHEN** 消息渲染
- **THEN** 代码块语法高亮显示，支持复制按钮

#### Scenario: 流式 Markdown 渲染
- **GIVEN** AI 正在流式回复 Markdown 内容
- **WHEN** 内容逐 token 到达
- **THEN** Markdown 实时渲染，不出现闪烁或格式错误

---


## 边缘场景处理

| # | 场景 | 触发条件 | 预期行为 | 处理方式 |
|---|------|----------|----------|----------|
| 1 | SSE 连接中断 | 网络波动导致 EventSource 断开 | 自动重连，恢复后从断点继续 | `EventSource` 自动重连 + 重连次数限制(3次) + 手动重试按钮 |
| 2 | SSE 流中包含不完整 JSON | 网络分包导致数据帧被截断 | 累积 buffer，仅在 JSON 完整时解析 | `buffer += chunk; while (extractComplete(buffer)) parse(buffer)` |
| 3 | AI 返回超长 Token 流 | LLM 无限循环或上下文过长 | 超过 4096 token 自动截断 + 提示 | `tokenCount > MAX_TOKENS → abort() + "回复过长已截断"` |
| 4 | 用户快速连续发送消息 | 前一条未完成就发送下一条 | 前一条 abort，新消息正常发送 | `abortController.abort()` + 新建 controller |
| 5 | 聊天输入框粘贴大段文本 (>5000 字) | 用户从外部粘贴大段内容 | 粘贴成功但显示警告"内容过长，可能影响回复质量" | `onPaste` 检查 `text.length > 5000` → warning |
| 6 | 会话列表为空时打开 aiChat | 新用户无历史会话 | 显示欢迎引导卡片 + 示例提示词 | 条件渲染 `<WelcomeCard />` + 3 个示例 query |
| 7 | Markdown 代码块中包含 `<script>` | AI 返回带恶意脚本的代码块 | 代码块正常渲染，脚本被转义为文本 | DOMPurify 保留 `<pre><code>` 但移除 `<script>` |
| 8 | 浏览器 Tab 不可见时 SSE 持续接收 | 用户切换到其他 Tab | SSE 继续接收，但渲染暂停以免消耗资源 | `document.visibilitychange` → `hidden` 时暂停 DOM 更新 |
| 9 | LocalStorage 会话缓存满 | 聊天历史过多 | 旧会话自动归档，仅保留最近 50 个会话的摘要 | LRU 淘汰策略 + `chrome.storage` 迁移方案 |
| 10 | 暗色主题下代码块对比度不足 | 用户切换暗色主题 | 代码块自动适配暗色主题 | CSS 变量 `--code-bg` 跟随 `html.dark` |
| 11 | AI 回复包含不支持的 Markdown 扩展语法 | LLM 输出 GFM/Mermaid/数学公式 | 已知语法正常渲染，未知语法降级为纯文本 | marked 插件链 + fallback 渲染 |
| 12 | 多 Tab 同时打开 aiChat 页面 | 用户在不同 Tab 各打开一个 aiChat | 各 Tab 独立会话，互不影响 | Pinia store 实例隔离，使用 `createPinia()` 非单例 |

