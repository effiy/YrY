---
title: "YV-07-02: AI Chat 模块迁移 — CLI Ollama 直调 → RPC 信封 SSE 流式"
tags: [需求文档, 管理后台, AI Chat, SSE, RPC, 流式聊天, 会话管理]
category: 项目/管理后台/需求
created: 2026-07-15
updated: 2026-09-16
source: 内部
type: 需求
status: stable
priority: P0
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202607"
prd_task_id: YV-07-02
estimate_frontend: 5.0
review_status: 已评审
issue_type: 功能
roles: [engineer, aier]
source_okr: [yivad-001]
---

# YV-07-02: AI Chat 模块迁移

> 需求编号：YV-07-02 · 优先级：P0 · 人天：5.0d · 状态：已完成
> 开发方案：[02-prd-task-AI聊天模块迁移.md](../../devs/2026-07/02-prd-task-AI聊天模块迁移.md)
> 测试规格：[02-prd-test-AI聊天模块迁移.md](../../tests/2026-07/02-prd-test-AI聊天模块迁移.md)

---

## 一、商业目标与成功指标

### 1.1 商业价值

将 AI Chat 从 CLI 工具升级为 Web 管理后台核心模块，使非技术团队成员能直接使用 AI 能力。

### 1.2 成功指标

| 指标 | 现状 | 目标 |
|------|------|------|
| AI 功能周活跃用户 | 1-2 人（仅工程师） | ≥ 10 人 |
| 会话 7 天留存率 | 0%（无持久化） | ≥ 80% |
| 首 Token 延迟 (TTFT) | 无测量 | P95 < 2s |

---

## 二、用户故事

| ID | 用户 | 需求 | 价值 | 优先级 |
|----|------|------|------|--------|
| US-01 | 所有用户 | 在 Web 界面输入消息，逐字流式查看 AI 回复 | 实时反馈，减少等待焦虑 | **P0** |
| US-02 | 所有用户 | 创建、切换、删除、重命名、收藏会话 | 管理不同主题的多轮对话 | **P0** |
| US-03 | 所有用户 | 刷新页面后恢复全部会话和消息 | 不丢失对话记录 | **P0** |
| US-04 | 所有用户 | 查看 AI 回复中的 Markdown 格式（代码高亮、表格、列表） | 阅读结构化回复 | **P0** |
| US-05 | 所有用户 | 为会话关联知识库文件作为上下文 | AI 基于特定知识回答问题 | **P0** |
| US-06 | 所有用户 | 中断正在生成的 AI 回复 | 控制对话节奏 | P1 |
| US-07 | 所有用户 | 编辑/删除/重新生成消息 | 修正对话内容 | P1 |
| US-08 | 所有用户 | AI 主动提议修改上下文文件 | 无需手动编辑知识库 | P2 |

---

## 三、功能需求

### FR-01: SSE 流式聊天

| 属性 | 描述 |
|------|------|
| 输入 | 文本消息，支持多行（Enter 发送，Shift+Enter 换行）；可选图片附件（≤ 4 张，base64） |
| 输出 | AI 回复逐 token 实时渲染，流式状态指示器（思考中/检索中/回复中） |
| 中断 | 生成中可随时停止（Stop 按钮 / Escape），已接收内容保留 |
| 错误 | 连接中断/超时显示具体错误提示 |
| 模型 | 支持切换可用模型列表 |

### FR-02: 会话管理

| 操作 | 行为 |
|------|------|
| 创建 | 点击 New Chat 或首次发送消息时自动创建 |
| 切换 | 侧边栏点击会话切换，URL 同步 `?session={key}` |
| 删除 | 确认弹窗后删除，自动切换到下一会话或空状态 |
| 重命名 | 首条消息前 30 字符自动作为标题，可手动编辑 |
| 收藏 | ★ 收藏/取消，收藏会话置顶排序 |
| 搜索 | 侧边栏搜索框按标题模糊过滤 |

### FR-03: 消息持久化

| 属性 | 描述 |
|------|------|
| 存储 | 会话和消息持久化到 localStorage，同步到后端 MongoDB |
| 恢复 | 刷新后完整恢复会话列表、活跃会话、全部消息 |
| 降级 | 单会话超 500 条或 localStorage 接近 5MB → IndexedDB |

### FR-04: Markdown 渲染

| 格式 | 行为 |
|------|------|
| 标题/列表/表格/引用/分隔线 | 正常渲染 |
| 代码块 | 语法高亮 + 语言标签 + 右上角复制按钮 |
| 链接 | 外部链接添加 noopener noreferrer nofollow |
| 安全 | 移除 `&lt;script&gt;`、事件处理器、`javascript:` 协议 |
| 流式 | 未闭合代码块临时补全，不吞噬后续内容 |

### FR-05: 会话上下文文件 (Context Files)

| 添加/管理方式 | 入口 | 行为 |
|-------------|------|------|
| 知识文件选择器 | ChatToolbar 按钮 | 弹窗浏览知识库 → 选择文件 → 创建会话 + 加载内容为上下文 |
| @文件提及 | ChatInput 输入 `@` | 下拉搜索知识库 → 选中添加 `ctx:` 标签 |
| 工具栏编辑 | ChatToolbar "Context: N" 胶囊 → Edit 按钮 | 内联弹窗编辑上下文文件内容 → Save 更新 pageContent |

**上下文文件作用**：关联的知识文件（`ctx:` 标签）及其内容（`pageContent`）是会话的**默认上下文**。每次对话时，上下文文件的完整内容作为 system context 注入到 LLM 请求中，使 AI 回答始终基于指定文件内容。

**与 RAG 模式的关系**：
- **RAG 关闭**：仅使用 `pageContent` 中的上下文文件内容作为 AI 参考，不触发检索
- **RAG 开启**：上下文文件内容**仍然注入**作为 system context，同时开启知识库向量检索——RAG 会对**知识库中所有已索引文件**进行语义搜索，不限于当前会话的 `ctx:` 文件。`ctx:` 文件仅作为 scope 参数限定检索范围

### FR-06: RAG 知识库检索

| 属性 | 描述 |
|------|------|
| 开关 | ChatToolbar "RAG" 胶囊按钮，一键切换 |
| 激活条件 | RAG 开启 + 会话有关联的 `ctx:` 上下文文件 |
| 检索范围 | 对知识库**所有已索引文件**进行向量 + BM25 混合检索，`ctx:` 文件用作 scope 限定参数 |
| 检索模式 | 混合检索（向量 + BM25），可开启重排序、引用标注 |
| 上下文叠加 | 上下文文件内容始终作为 system context 注入，RAG 结果作为**补充参考**叠加 |
| 范围控制 | 单文件→scope=文件路径；多文件→公共目录前缀；无→全库检索 |
| 配置 | 混合检索、重排序、引用标注开关。检索模式固定为 simple（最快），无分类/标签过滤 |
| 状态指示 | 胶囊颜色：绿色=激活+有文件 / 灰色=关闭 / 黄=开启但无文件 |

### FR-07: Web 搜索

| 属性 | 描述 |
|------|------|
| 开关 | ChatToolbar "Web" 胶囊按钮（Search 图标 + 滑动开关） |
| 执行时机 | 用户发送消息时，如 Web 搜索开启，前端先发起搜索请求 |
| 结果注入 | 搜索结果作为系统上下文注入到 LLM 请求的 messages 中 |
| 状态显示 | 胶囊高亮 + "Searching web..." placeholder |
| 搜索来源 | 后端 search_service → 返回标题/URL/摘要列表 |
| 两阶段回复 | 主回复同步流式 + 后台搜索异步完成后 inject follow-up 补充回复 |
| 深度抓取 | 对搜索结果 top 3 URL 自动 web_fetch，丰富上下文 |
| 降级 | 搜索失败静默跳过，仅保留主回复，不中断用户体验 |

### FR-08: 消息交互

| 操作 | 适用消息 | 行为 |
|------|----------|------|
| 复制全文 | AI 消息 | 写入剪贴板 → "Copied" 反馈 |
| 编辑 | 用户消息 | 弹窗修改 → 持久化 |
| 删除 | 所有消息 | 从列表移除 → 持久化 |
| 重新生成 | AI 消息 | 清空回复 → 保留上下文重新流式 |

### FR-09: 空状态与引导

| 场景 | 展示 |
|------|------|
| 无会话 | 欢迎界面：标题 + 描述 + "Start new chat" 按钮 + "Browse knowledge" 按钮 |
| 有会话无消息 | Welcome Card（会话元数据）+ 快捷提示词按钮（8 个，含 emoji） |

---

## 四、非功能需求

| 类别 | 指标 | 目标 |
|------|------|------|
| 性能 | SSE 首 Token 延迟 | P95 < 2s |
| 性能 | 流式渲染帧率 | ≥ 30fps（500 条历史） |
| 性能 | 会话切换延迟 | < 100ms |
| 性能 | 持久化耗时 | < 50ms |
| 安全 | XSS 防护 | DOMPurify 清洗所有 Markdown 渲染 |
| 安全 | 会话隔离 | X-Token 区分用户 |
| 安全 | 链接安全 | 外部链接 noopener noreferrer nofollow |
| 可用性 | 键盘操作 | Enter/Shift+Enter/Escape/Ctrl+K/Ctrl+L 全支持 |
| 可用性 | IME 兼容 | 中文输入法 composition 期间 Enter 不发送 |
| 可用性 | 加载/错误态 | 骨架屏 + 错误提示 + 重试按钮 |

---

## 五、验收标准

| # | 关联 US | Given | When | Then |
|---|---------|-------|------|------|
| AC-01 | US-01 | 输入框有文本，非 IME | 按 Enter | 用户消息显示 + AI 逐 token 流式渲染 + 持久化 |
| AC-02 | US-06 | AI 正在流式回复 | 点击停止 / Escape | SSE 中断 + 部分内容保留 + aborted 标记 |
| AC-03 | US-02 | 无活跃会话 | 发送消息 | 自动创建会话 + 侧边栏同步 + 标题 = 首条消息前 30 字符 |
| AC-04 | US-02 | 2 个会话，当前在 A | 点击 B | 消息切换 + URL 同步 + 旧 SSE 中断 |
| AC-05 | US-02 | 3 个会话，当前在 B | 删除 B | B 移除 + 自动切换到 C |
| AC-06 | US-03 | 2 个会话 5 条消息 | F5 刷新 | 全量恢复，Date 正确反序列化 |
| AC-07 | US-04 | 含 Python 代码块的回复 | 渲染完毕 | 语法高亮 + 语言标签 + 复制按钮 |
| AC-08 | US-04 | 回复含 `&lt;script&gt;alert(1)&lt;/script&gt;` | 渲染完毕 | script 被移除，无 JS 执行 |
| AC-09 | US-05 | 点击 ChatToolbar 文件选择按钮 | 选择知识文件 → Start Chat | 会话创建 + `ctx:` 标签 + pageContent 加载 |

---

## 六、不做 (Out of Scope)

| 范围 | 说明 | 后续规划 |
|------|------|----------|
| 多模态输入（图片理解） | 依赖 YiAi 接入多模态模型，当前模型栈仅支持文本推理 | YiAi 模型升级后评估 |
| 消息全文搜索 | 需后端建立消息倒排索引，当前仅支持会话标题搜索 | 独立需求，YiAi data_service 扩展 |
| 多人协作会话 | 涉及实时同步协议、冲突解决、权限模型，需独立架构设计 | 待协作场景验证后启动 |
| Token 用量与计费 | 需计费系统支撑，当前仅客户端粗粒度估算 | 待组织级 Token 管理平台上线 |
| 语音输入/输出 | 依赖浏览器 Speech API + TTS 服务，当前无相关基础设施 | 用户反馈收集后评估 |
| 会话导入/导出兼容 | 导入外部平台会话格式，需设计通用会话交换格式 | 数据迁移需求出现后评估 |

---

## 七、现有功能及实现效果

以下为实际实现中超出原 PRD 范围或对原需求做了细化实现的功能与交互效果。

### 7.1 页面布局与架构

```
aiChat/index.vue  (整体编排)
├── ChatError        — 加载失败/网络错误时全屏展示错误 + 重试按钮
├── ChatSkeleton     — 加载中骨架屏（sidebar/messages 两种变体）
├── ConversationSidebar (左侧知识侧边栏, 可拖拽 220–600px)
│   ├── 搜索框 + 同步按钮
│   └── el-tree (知识库目录树, 点击节点预览文件)
├── Resizer (4px 拖拽条, hover 高亮)
└── AiChatBox (fill mode, 占据剩余全部空间)
    ├── ConversationSessionSidebar (会话列表面板, 可折叠 180-480px)
    │   ├── 搜索框 + 新建按钮 + 批量管理按钮
    │   ├── ConversationListItem[] (带来源标签/文件数/消息数/相对时间)
    │   └── 批量操作栏 (全选/删除/取消)
    ├── SessionSidebar Resizer (4px)
    └── ai-chat-box__chat (flex column, flex:1)
        ├── ChatHeader (标题 + 模型选择器 + 新建/导出按钮)
        ├── MessageList
        │   ├── Welcome Card (会话元数据, 可折叠)
        │   ├── MessageBubble[] (v-for + v-memo)
        │   └── ScrollToBottom FAB
        ├── QuickButtons (8 快捷按钮, 仅无消息时显示)
        ├── ChatInput
        │   ├── ChatToolbar (左侧胶囊按钮组 + 右侧模型/操作区)
        │   ├── FileMentionDropdown (@ 文件提及下拉)
        │   ├── DraftImageList (草稿图片预览)
        │   └── Textarea + Send/Stop 按钮
        └── LlamaIndexPanel (RAG 配置面板, 4 Tab)
```

**响应式断点**：≤1023px 侧边栏变 absolute 覆盖层 + 阴影；≤767px 侧边栏全宽，多处 UI 紧凑化。

### 7.2 ChatHeader（聊天头部栏）

位于 fill 模式的消息列表上方，固定高度 40px，显示：

| 元素 | 行为 |
|------|------|
| 会话侧边栏折叠按钮 | ←/→ 箭头切换，折叠后会话内栏消失，右侧腾出更多空间 |
| 会话标题 | 单行省略 (`max-width: 280px`)，`title` 属性显示全称 |
| 上下文文件徽章 | `ctx:` 标签计数 → "N files"，绿色圆角胶囊 |
| 模型选择器 | CPU 图标 + 模型名，点击弹出 radio-group 列表；首次打开时自动 `fetchModels()`；加载中显示 spinner，无模型显示 "No models available" |
| 新建会话 | + 图标按钮，调用 `createConversation()` |
| 导出 HTML | ↓ 图标按钮，生成包含 light/dark 双主题 + 对话全文的独立 HTML 文件并触发下载 |

### 7.3 ChatInput 输入框

**输入区域**：
- `el-input` textarea，`autosize: { minRows:1, maxRows:6 }`
- 发送中 `disabled`，placeholder 根据 streamingPhase 动态显示：
  - `thinking` → "AI is thinking..."
  - `retrieving` → "Retrieving knowledge..."
  - `streaming` → "AI is responding..."
  - 默认 → "Ask anything... (Enter to send, Shift+Enter for newline)"
- focus-within 时边框 + 内阴影高亮
- 发送中显示红色 Stop 方块按钮；有内容时显示蓝色 Send 按钮；无文本仅图片时显示清除按钮

**键盘快捷键**：

| 按键 | 条件 | 行为 |
|------|------|------|
| Enter | 非 IME, 非 Shift, 有内容 | 发送消息，历史记录推入 promptHistory |
| Shift+Enter | 任意 | 插入换行 |
| Escape | 发送中 | 停止 SSE |
| Escape | 空闲有内容 | 清空输入框 |
| Ctrl/Cmd+L | 空闲 | 清空输入框 |
| ArrowUp | 光标在行首或输入为空 | 从 promptHistory 召回上一条 (shell 风格) |
| ArrowDown | 光标在行尾且正在导航历史 | 召回下一条 / 清空输入 |
| @ 触发 | 行首或空格后输入 `@` | 打开 FileMentionDropdown，支持 ArrowUp/Down/Enter/Escape 选择 |

**IME 兼容**：`compositionstart` 标记 `isComposing`，`compositionend` 清除；`isComposing` 为 true 或 `keyCode===229` 时 Enter 不发送。

**粘贴处理**：超过 5000 字符时显示 ElMessage.warning 并截断。

**@文件提及**：检测输入中最后一个 `@` 位置，实时更新 mentionQuery，过滤知识库文件下拉列表。选中后替换 `@query` 文本并调用 `store.addTag("ctx:"+path)` 添加上下文文件。

**图片附件**：
- 点击 ChatToolbar 图片按钮或粘贴图片触发
- `&lt;input type="file" accept="image/*" multiple&gt;` 读取为 DataURL
- 通过 `readFileAsDataUrl` → `addDraftImageFiles` 存入 `draftImages`
- 最多 4 张，超限弹 ElMessage.warning
- DraftImageList 组件水平滚动预览，每张可单独删除或全部清除
- 发送时合并到 `ChatMessage.imageDataUrls` 字段

### 7.4 ChatToolbar 工具栏

工具栏分为左右两区，左侧为功能胶囊按钮，右侧为模型选择器。

#### 左侧功能按钮

| 按钮 | 图标 | 功能 |
|------|------|------|
| FAQ | ChatLineSquare | 开关 FAQ 弹窗，显示常见问题列表 |
| 图片 | Picture | 触发图片文件选择器 |
| 标签管理 | CollectionTag | 打开 TagManagerDialog |
| Skills/MCP | Tools | 打开技能/MCP 工具面板（含全局搜索、工具列表、pin 管理） |
| RAG | ChatDotRound | 三态胶囊：绿色(N files)=激活有文件 / 黄色(+file)=激活无文件 / 灰色=关闭 |
| Web 搜索 | Search | 滑动开关，开启=蓝色高亮，搜索中显示 "Searching web..." |
| 提示词历史 | Clock | Popover 面板：最近 3 条芯片 + 搜索框 + 过滤列表 + 模糊建议 + 复制/删除/清空 |
| 模型选择 | Cpu | 下拉选择可用模型，支持搜索过滤 |
| 上下文文件 | FolderChecked | 显示关联文件数，Popover 内可预览/编辑/移除文件 |
| 企业微信 | — | 打开 WeChatSettingsDialog，配置自动转发 |
| LlamaIndex | — | 切换 LlamaIndexPanel（RAG 4 Tab 面板） |
| 知识文件选择 | — | 弹窗浏览知识库 → 选择文件 → 创建会话并加载上下文 |

#### Skills/MCP 工具系统

- **工具注册**：内置工具 (web_search, web_fetch, rag_search, context_edit) + MCP 工具
- **全局搜索**：支持拼音模糊搜索，trigram Jaccard 相似度建议
- **Pin 管理**：内置/MCP 工具分别 pin，火花图 (sparkline) 展示最近性能趋势
- **排序模式**：按名称/调用次数/平均耗时/失败率，可循环切换
- **内联执行**：展开工具 → 填写参数 (JSON Schema 驱动) → 运行 → 查看结果
- **LLM Prompt 预览**：查看当前会话发送给 LLM 的完整 system prompt + tools 描述

#### RAG 配置面板 (LlamaIndexPanel)

4 个 Tab：

| Tab | 功能 |
|-----|------|
| Query (检索) | Hybrid 开关、Rerank 开关、Citations 开关、Top-K、Q-variants、分类过滤、标签过滤 |
| Decompose (分解) | 查询分解结果显示 |
| Index (索引) | 知识库索引状态、重建索引按钮 |
| History (历史) | RAG 检索历史记录 |

#### 上下文文件管理

- **Popover 面板**：显示当前会话所有 `ctx:` 文件列表
- **预览**：点击文件名调用 `openKnowledgePreview(path)` 打开知识预览弹窗
- **内联编辑**：Edit 按钮 → 内联 textarea 编辑 → Save 更新 pageContent
- **移除**：× 按钮调用 `removeContextFile(path)` 移除标签 + 对应 pageContent 段落
- **Context Files** 胶囊计数 (如 "3 files")，绿色

#### 提示词历史面板

- 最近 3 条芯片 (recent chips)，一键复用
- 搜索框实时过滤历史
- Trigrams Jaccard 模糊匹配：当精确过滤无结果时，显示 top-3 相似建议
- 每条记录：复制按钮 + 删除按钮
- "Clear all" 确认弹窗 → `clearPromptHistory()`

### 7.5 MessageList 消息列表

**四种状态**：

| 状态 | 渲染 |
|------|------|
| 无会话 | 欢迎界面：「AI Chat」标题 + 描述 + 空状态引导 |
| 有会话无消息 | Welcome Card：会话标题 + 元数据（创建时间、上下文文件数）+ 可折叠按钮 |
| 有消息 | v-for 渲染 MessageBubble，v-memo="[message.content.length]" 优化 |
| 流式中 | 最后一条 pet 消息持续更新，scrollTick 触发自动滚动 |

**滚动行为**：
- 发送消息时自动滚到底部
- 用户手动上滚时出现 ScrollToBottom FAB 按钮
- RAF 限流 120ms (8 次/秒)，避免每 token (50-100/s) 都触发重绘
- Tab 不可见时 (`visibilitychange`) 跳过 RAF 滚动

**加载/错误状态**：ChatSkeleton (骨架屏) + ChatError (全屏错误提示 + 重试按钮)

### 7.6 MessageBubble 消息气泡

消息分为 UserMessage（用户消息）和 PetMessage（AI 回复）两种类型。

#### UserMessage 渲染
- 右对齐，显示消息文本
- 如有 `imageDataUrls`，渲染图片缩略图
- 如有 `searchContext`，显示 Web 搜索结果指示器 (WebSearchResults 组件)

#### PetMessage 渲染管道
```
raw Markdown → 未闭合代码块检测 (odd ``` → 临时补全) 
  → marked.parse() → DOMPurify.sanitize(白名单) 
  → highlight.js (pre code 语法高亮 + 语言标签) 
  → mermaid.run() (Mermaid 图表渲染) 
  → sanitizeLinks() (外部链接 noopener)
  → v-html 渲染
```

**安全处理**：
- DOMPurify 白名单：`p,br,strong,em,code,pre,h1-h6,ul,ol,li,blockquote,a,img,table,thead,tbody,tr,th,td,span,div,hr`
- 移除 `&lt;script&gt;`, `&lt;iframe&gt;`, `&lt;object&gt;`, 事件处理器, `javascript:`/`data:` 协议
- 外部链接自动添加 `target="_blank" rel="noopener noreferrer nofollow"`

**流式状态**：
- 空内容 + streaming=true → 打字指示器 (typing indicator，三个跳动点)
- streamingPhase 显示当前阶段文本 (thinking/retrieving/streaming)
- 未闭合代码块临时追加 `\`\`\`` 防止吞噬后续内容，完整后移除

**消息元数据**：
- 时间戳 (MM/DD HH:mm:ss 格式)
- Token 估算 (字符数 / 4) + 与上一条同角色消息的 Token 趋势 (↑/→/↓)
- 字符/词/行计数
- `firstTokenLatencyMs` (首 Token 延迟，客户端测量)
- `ragMeta` (RAG 检索模式/来源/评分)
- `toolCalls[]` (工具调用时间线卡片)
- `sources[]` (RAG 检索来源列表)
- 错误状态：红色边框 + error 消息
- 中断状态：`aborted` 标记，部分内容保留

**消息交互**：

| 操作 | 适用消息 | UI/行为 |
|------|----------|---------|
| 复制全文 | AI 消息 | MessageActions 工具栏 Copy 按钮 → `navigator.clipboard.writeText` → "Copied" |
| 编辑 | 用户消息 | ElMessageBox.prompt → `editMessage(idx, content)` |
| 删除 | 所有 | ElMessageBox 确认 → `deleteMessage(idx)` → 持久化 |
| 重新生成 | AI 消息 | `regenerateMessage(idx)` → 清空该条 pet → 从该位置重新流式 |
| 跳转上一条 | 任意 | 点击 Token 趋势区 → 平滑滚动到上一条同角色消息 + 2s flash 动画 |

#### ToolCalls 卡片

当 pet 消息包含 `toolCalls` 时，渲染工具调用时间线卡片：
- 工具名称、标签、参数 (可折叠)
- 执行结果/错误信息
- 耗时 (durationMs)
- 运行中状态 "(running)" 显示

### 7.7 QuickButtons 快捷按钮

两套按钮，仅在 `messages.length === 0` 时显示：

**QUICK_BUTTONS (4 个)**：直接发送完整内容的提示词
- 🗺 Tech roadmap review
- 📋 Architecture decision records
- 📊 Engineering productivity metrics
- 🛠 Tech debt inventory

**QUICK_BUTTONS_NEW (3 个)**：template 模式，点击填充输入框而非直接发送
- 🔍 Tech selection evaluation
- 🏢 Org productivity diagnosis
- 🚨 Incident postmortem

单击直接发送；template 按钮点击填充 `store.input` 后用户可编辑再发送。发送中 disabled。

### 7.8 ConversationSessionSidebar 会话内栏

位于 AiChatBox fill 模式的左侧，通过 resizer 可拖拽 180–480px，可折叠。

**功能**：
- **搜索**：el-input 搜索框，按标题/key/tags 模糊过滤
- **新建**：+ 按钮 → `createConversation()`，创建中显示 loading
- **批量管理**：Operation 图标按钮 → 切换 batchMode
  - 每项显示 checkbox
  - 底部批量栏：全选/已选计数/删除/Cancel
  - `bulkDelete()` 并行删除全部选中会话
- **ConversationListItem** 每项显示：
  - 来源域名标签 (TL/CR/Story/RAG/AI/Bug)，可点击跳转回源页面
  - 标题 (单行省略)
  - 元信息：N files · N msgs · 相对时间 (just now/Xm/Xh/Xd/MM-DD)
  - Hover 时出现操作按钮：收藏(★)/重命名/删除 (hover 可见 + active 可见)
  - 收藏会话自动置顶排序
  - 右键/双击重命名 (调用 SessionEditDialog)

**排序**：收藏优先 → 按 `updatedAt` 倒序。

**Loading/Empty 状态**："Loading sessions..." / "No matching sessions" / "No sessions yet"

### 7.9 Context File System（上下文文件系统）

**标签协议**：`ctx:{file_path}` 存储在 `SessionDocument.tags` 中。
**内容存储**：`pageContent` 字段，分段格式：`## path\n\ncontent\n\n---\n\n`

**4 种添加方式**：

| 入口 | 触发 | 代码路径 |
|------|------|----------|
| 知识文件选择器 | ChatToolbar → Open → 选择文件 → Start Chat | `readKnowledgeFile()` → `ensureKnowledgeSession()` → `selectConversation()` |
| @ 文件提及 | ChatInput 输入 `@` → 下拉选择 | `onMentionSelect(path)` → `addTag("ctx:"+path)` |
| ChatToolbar Context 编辑 | 上下文 Popover → Edit → Save | 更新 pageContent |
| 拖拽文件到聊天区 | `onDrop` → `mergeContextNode` → `onSave` | `addContextFile()` |

**变更管理**：通过 `useContextChanges` 管理 pageContent 段落变更，支持撤销恢复。历史最多 50 条，FIFO。

- Apply → 更新 pageContent + 添加 ctx: tag
- Undo → 从 `contextChangeHistory` 恢复快照，移除条目
- 历史 FIFO，最多 50 条

**RAG 激活**：`ragActive = tags 中有 ctx:` 前缀 → streamRagChat + 计算 scope。

### 7.10 RAG 知识库检索

**配置状态** (通过 `useRagSettings` composable，localStorage 持久化)：
- `ragEnabled`: 开关 (默认 false)
- `ragHybrid`: 混合检索 (向量 + BM25，默认 true)
- `ragRerank`: 重排序 (默认 false)
- `ragCitations`: 引用标注 (默认 true)

检索模式固定为 `simple`（最快，无对话压缩开销），不提供分类/标签过滤和查询数量配置。

**Scope 计算**：单 ctx: 文件 → scope=文件路径；多文件 → 公共目录前缀；无 → 全库。

**流式集成** (`runStream`)：当 `ragEnabled && ragActive` 时走 `streamRagChat`，否则走 `streamChat`。

**工具栏指示**：
- 关闭：灰色胶囊 "RAG"
- 开启+有 ctx 文件：绿色胶囊 "N"
- 开启+无 ctx 文件：黄色胶囊 "+file"

### 7.11 Web 搜索

**配置**：`webSearchEnabled` (localStorage 持久化)，工具栏 Search 图标 + 滑动开关。

**两阶段执行管道**：

| 阶段 | 函数 | 执行方式 | 作用 |
|------|------|----------|------|
| 前置抓取 | `executePreStreamTools` | **同步**（阻塞主流启动） | 检测用户消息中 URL → web_fetch 抓取 → 注入 `searchContext` 到 UserMessage |
| 后台搜索 | `launchBackgroundSearch` | **异步**（fire-and-forget） | web_search API → web_fetch 深度抓取 top 3 → 主流完成后 inject follow-up 消息 |

**前置抓取**（`executePreStreamTools`）：
- 解析用户消息中的 URL（`extractUrls`）
- 逐 URL 执行 `web_fetch` 工具，设置 `streamingPhase = "fetching"`
- 结果写入对应 UserMessage 的 `searchContext` 字段
- 同时作为 `searchContext` 参数传入主流，影响首次回复

**后台搜索 + Follow-up 注入**（`launchBackgroundSearch`）：
- 与主流并行执行（独立 `toolAbortController`）
- `web_search(query, maxResults: 6)` → 提取 URL → `web_fetch` top 3 深度抓取
- 等待 `await streamPromise`（主流完成） → `persistActive()` → 创建 `followUpPet` 消息
- 以 `pendingContext` 为 system context 启动新 SSE 流 → 补充回复
- 搜索失败/结果为空时静默跳过，不产生 follow-up 气泡

**搜索中状态**：placeholder 变为 "Searching the web..."，工具栏搜索按钮 loading。

### 7.12 Tool Registry（Pi 风格插件化工具系统）

自动根据 store 开关同步工具启用状态：
```
webSearchEnabled → web_search + web_fetch 启用
ragEnabled && ragActive → rag_search 启用
ragActive → context_edit 启用
```

**工具事件流**：`start(phase, name, label, args?)` → `end(phase, name, content?, error?, durationMs?)` → `attachTurnToolCalls` 将本轮工具调用附加到 pet 消息。

**双路 AbortController**：`abortController` (SSE 流) + `toolAbortController` (工具执行)，独立 abort，Stop 时两者同时终止。

### 7.13 Prompt History（Shell 风格提示词历史）

- `usePromptHistory` composable (单例，跨组件共享)
- `pushPromptHistory(text)`: Enter 发送时自动推入，去重
- ArrowUp/ArrowDown 导航：ArrowUp 在行首→召回上一条；ArrowDown 在行尾→下一条/清空
- 导航时自动将光标移到末尾 (`setSelectionRange`)
- 历史记录持久化到 localStorage

### 7.15 Streaming Phases（流式阶段）

6 个阶段，驱动 UI 状态变化：
```
idle → thinking → (retrieving) → streaming → done
                                ↘ error → idle
```

- **idle**: 无活跃流
- **fetching**: HTTP 请求进行中 (Sentinel 预请求阶段)
- **thinking**: LLM 推理中，发送按钮变 Stop，placeholder 显示 "AI is thinking..."
- **retrieving**: RAG 检索中 (由后端 SSE phase 帧触发)，placeholder 显示 "Retrieving knowledge..."
- **streaming**: 首个 token 到达后切换，开始逐字渲染
- **done**: 流结束，发送按钮恢复，触发 persistActive + auto-forward

**首 Token 延迟** (TTFT)：客户端在第一个 chunk 到达时计算 `Date.now() - streamStartAt`，写入 `petMsg.firstTokenLatencyMs`，供 UI 展示。

### 7.16 导出功能

**Markdown 导出**：
- 标题 + 导出时间 + Context 段落 + 完整对话
- Follow-up 消息标记为 "Follow-up (queued)"，与正常消息区分
- 工具调用以 `&lt;details&gt;` 折叠
- 文件名自动清理特殊字符

**HTML 导出**：
- 独立 HTML 文件，包含内联 CSS
- light/dark 双主题 (prefers-color-scheme)
- 用户消息 + Follow-up 消息灰色背景（`msg--user`），AI 消息蓝色左边框（`msg--ai`）
- 语法高亮代码块 (深色背景)
- 工具调用以 `&lt;details&gt;` 折叠
- 通过 `type` 字段区分角色：`user` → User、`pet` → AI、`followup` → Follow-up (queued)

### 7.17 WeChat/WeCom 企业微信集成

- **WeChatSettingsDialog**：管理启用的机器人列表
- **autoForward**：AI 回复完成后 (`onDone`)，自动调用 `forwardReplyToWeCom(content)` 转发到所有启用+autoForward 的机器人
- **Webhook 发送**：`sendWeChatMessage(webhook, text)` 并行发送，失败静默忽略
- **条件**：仅当 `!aborted && !error && streamed.trim()` 才转发

### 7.18 Compaction（对话压缩）

`useConversationCompact` composable 在每次 SSE 流完成后 (`onDone`) 自动调用 `maybeCompact()`：
- 检测 token 数是否超过阈值 (默认 6554 tokens，≈16K 字符)
- 超过时自动压缩：保留最近 N 轮对话 + 系统提示，移除中间历史
- 压缩日志 (`compactionLog`) 记录每次压缩的时间/前后 token 数/移除轮数

### 7.19 边缘场景处理

| # | 场景 | 处理 |
|---|------|------|
| EC-01 | SSE 多事件类型帧 | currentEvent 路由分发 |
| EC-02 | 未闭合代码块 | 临时追加 ``` + 完整后移除 |
| EC-03 | abort 后死循环 | signal.aborted 检查 + reader.cancel() + reader.releaseLock() |
| EC-04 | localStorage 配额不足 | IndexedDB 降级 + LRU (TD-04) |
| EC-05 | Date 序列化丢失 | pinia persistedstate reviver 检测 ISO 8601 |
| EC-06 | IME 输入法 Enter | isComposing + keyCode===229 双重检查 |
| EC-07 | iOS 键盘 resize | CSS transition (非 JS，TD) |
| EC-08 | 多标签页同步 | BroadcastChannel (TD) |
| EC-09 | 快速切换会话残留 SSE | selectConversation 首行 stopSending |
| EC-10 | 首次 session_key | SSE 首帧提取 session_key event |
| EC-11 | 大段粘贴 (>5000 字) | ElMessage.warning + 截断 |
| EC-12 | Tab 不可见时滚动 | visibilitychange → 跳过 RAF |
| EC-13 | _persistChain 死锁 | 15s 超时 → resolve 继续 |
| EC-14 | 中文输入 @ 误触发 | @ 后紧跟空格不触发 mention |

### 7.20 四种核心状态全覆盖

| 状态 | 条件 | UI |
|------|------|-----|
| **空状态** | 无会话 + 无消息 | 欢迎界面：标题 + 描述 + 引导按钮 + 知识侧边栏自动展开 (首次访问) |
| **加载态** | `loading=true` | ChatSkeleton 骨架屏 (sidebar 或 messages 变体) |
| **错误态** | `error != null` | ChatError 全屏错误提示 + retry 按钮 |
| **流式态** | `sending=true` | typing 指示器 + streamingPhase 标签 + Stop 按钮 + 逐 token 渲染 |

### 7.21 响应式设计

| 断点 | 行为 |
|------|------|
| >1023px | 完整三栏布局 (知识侧边栏 + 会话内栏 + 聊天区) |
| ≤1023px | 知识侧边栏 absolute + 阴影 + transform 动画；会话内栏 absolute + 阴影；标题 max-width 降至 160px |
| ≤767px | 知识侧边栏全宽 (100% !important)；标题 max-width 100px；输入框紧凑化；padding/font-size 缩减 |

### 7.22 AiChatBox 双模式

| 模式 | 用途 | 特性 |
|------|------|------|
| fill | aiChat 页面主聊天区 | 完整功能：会话侧边栏 + ChatHeader + MessageList + QuickButtons + ChatInput |
| side (right/left) | 侧边面板 (如 Story 文件预览) | 精简功能：MessageList + ChatInput；可折叠+可拖拽+边框；支持 systemPrompt prop |

side 模式通过 `collapsible` / `resizable` / `clearActiveOnUnmount` / `defaultWidth` / `storageKey` 等 props 控制。

### 7.23 异步 Follow-up 回复机制

Web 搜索场景下，AI 回复采用**主回复 + Follow-up 补充回复**的两阶段模式：

```
用户发送消息 (Web 搜索开启)
    │
    ├─→ 主 SSE 流 (同步)
    │     chat_service.chat() → 逐 token 渲染 → done
    │     主回复中提示用户"正在检查最新信息..."
    │
    └─→ 后台搜索 (异步, fire-and-forget)
          web_search API → 抓取 top 结果 → web_fetch 深度抓取 (最多 3 篇)
              │
              └─→ 等待主流完成 (await streamPromise)
                    │
                    └─→ injectFollowUp()
                          创建 followUpPet 消息 (type: "pet")
                              │
                              └─→ 新 SSE 流
                                    runStream(prev, followUpPet.timestamp, "send", searchContext)
                                    将搜索结果作为 system context 注入 LLM
                                    逐 token 渲染补充回复
```

**关键时序**：
- 主 SSE 流和后台搜索**并行执行**，不互相阻塞
- Follow-up 注入在**两个条件同时满足**时触发：主流 `done` + 搜索结果就绪
- 搜索结果不足（空或异常）时，`pendingContext` 为空 → 跳过 follow-up，仅保留主回复

**UI 表现**：
- 主回复中提示 "Note: A web search has been initiated..."，告知用户后台搜索正在进行
- 主回复完成后，消息列表底部自动追加新的 AI 消息气泡，显示 "Searching the web..." 加载态
- 搜索完成后，Web 搜索结果指示器 (WebSearchResults 组件) 显示在主回复的 UserMessage 中
- 用户可见 2 条连续的 AI 回复：第 1 条为即时回答，第 2 条为基于搜索结果的补充

**导出兼容**：
- HTML/Markdown 导出中，follow-up 消息标记为 "Follow-up (queued)"，与正常消息区分
- 导出使用 `type` 字段区分角色：`user` → User、`pet`/`followup` → AI