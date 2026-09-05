# CLAUDE.md — YiPet

> Chrome MV3 浏览器扩展。Gentle Companion — 浏览器中的交互式宠物伴侣，支持多角色 AI 聊天、React 18 + Ant Design 5 弹窗、按需 CDN 资源注入、完整的 i18n（en + zh_CN）以及时区感知显示。使用 **Rsbuild + TypeScript** 构建。

---

## 目录

- [基础信念](#基础信念)
- [铁律](#铁律)
- [架构方向](#架构方向)
- [项目概况](#项目概况)
- [项目结构](#项目结构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [项目约束](#项目约束)
- [降级对策](#降级对策)
- [自我约束](#自我约束)
- [近期变更](#近期变更)
- [指引](#指引)

---

## 基础信念

- **信任模型，验证现实** — 代码结构反映运行时架构。MV3 双执行上下文（ISOLATED 世界 + MAIN 世界）是 YiPet 的核心现实；所有代码变更必须尊重这一边界。TypeScript 类型描述契约，但只有 Chrome 的运行时才能验证它。
- **珍惜注意力** — 注意上下文窗口的经济性。优先使用简洁的代码，避免冗余的脚手架。花在样板代码上的每个 token 都是没有花在问题上的 token。
- **先思考再编码** — 明确陈述假设。如果存在多种解释，呈现出来。如果有更简单的方案，说出来。

## 铁律

1. **简单优先** — 不添加超出需求的功能；不为单次使用的代码做抽象；不为不可能的场景做错误处理。
2. **精准变更** — 只改必须改的。不要"改进"相邻代码；匹配现有风格；每一行改动都要追溯到用户的需求。
3. **目标驱动执行** — 定义成功标准，循环直到验证通过。将任务转化为可验证的目标；对于多步骤任务，给出简要计划并附上每步的验证检查。
4. **提交前构建** — 在认为工作完成之前，运行 `npm run typecheck && npm run build`。类型错误和构建失败是不可接受的。

## 架构方向

> **组件化 + API 分层。**
>
> YiPet 是一个 Rsbuild + TypeScript Chrome 扩展。前端（弹窗 UI、内容脚本宠物渲染、聊天窗口）使用来自 npm 的 React 18.3，配合函数组件 + hooks。API 层（`src/api/`）遵循四层架构：**client → endpoints → types → services**。HTTP 客户端包装了 `public/cdn/utils/api-client.ts`（与 MAIN 世界 CDN 注入共享的规范基础），增加了扩展的开发模式日志和 SSE 流式传输。
>
> 工程规范参考 **Ant Design Pro** 模式：`@/` 路径别名、桶导出（`index.ts`）、按功能模块就近放置组件（`components/` 每个功能一个目录）、`.editorconfig` 用于编辑器一致性、`src/typings.d.ts` 用于模块声明。**组件样式就近放置** — 组件的 CSS 与组件放在同一目录（例如 `ChatWindow/ChatWindow.tsx` + `ChatWindow/ChatWindow.css`）；`rsbuild.config.ts → buildChatCSS()` 将这些按组件的 CSS 文件拼接为运行时加载的 `dist/cdn/styles/chat.css`。
>
> 另见：[../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## 项目概况

| 维度 | 值 |
|-----------|-------|
| 项目名称 | YiPet |
| 类型 | 前端（Chrome MV3 扩展） |
| 版本 | 1.2.0 |
| 架构 | 单仓库，无 workspace |
| 运行时 | Chrome Extension Manifest V3 |
| 语言 | TypeScript 5.5（strict 模式） |
| 构建工具 | Rsbuild 1.0（多入口：popup、chat、CDN utils、bootstrap） |
| UI 框架 | React 18.3 + Ant Design 5.21 |
| 代码检查 / 格式化 | Biome 2.5（替代 ESLint + Prettier） |
| 测试框架 | Vitest 2 + jsdom 29 |
| 自托管 | 是（API → `http://localhost:10086` / YiAi FastAPI 后端） |

## 项目结构

```
src/
├── api/           # 四层 API 层（client → endpoints → types → services）
├── background/    # Service worker — 命令分发 + 消息路由
├── chat/           # 聊天窗口（Rsbuild 多入口构建）
├── config/         # defaults.ts（数据）+ config.ts（环境感知编排器）
├── content/        # bootstrap、cdn 目录/注入器、ipc、渲染、状态
├── popup/          # React 弹窗 — App.tsx、components/、services/
├── shared/         # i18n、主题、角色、locale、timezone、datetime、env、log、state
├── types/          # React CDN 全局类型 + JSX 命名空间
└── utils/          # datetime、env、log 辅助函数
```

## 模块边界

### API 层（四层）

| 层 | 文件 | 公共 API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` 类 — 包装 `public/cdn/utils/api-client.ts`（fetch + 重试 + 错误提取），增加开发模式日志 + SSE 流式传输。其他层禁止直接调用 `fetch`。 |
| 2 — Endpoints | `src/api/endpoints.ts` | 按域划分的路径常量。 |
| 3 — Types | `src/api/types.ts` | 请求/响应接口 — 所有 API 形状的单一数据源。第 4 层及调用方消费。 |
| 4 — Services | `src/api/services/*.ts` | 域服务类（`AuthService`、`ChatService`、`SessionService`、`ConfigService`、`DatabaseService`、`FaqService`）。每个通过构造函数注入接收 `ApiClient`。`createApiServices(config)` 聚合。 |

### 跨项目协议契约

| 操作 | 请求形状 | 备注 |
|---|---|---|
| RPC | `{ module_name, method_name, parameters }` | 每个数据操作使用的信封 |
| `data_service.query_documents` | `{ cname, filter?: dict, pageNum?, pageSize?, limit? }` | **`filter`，不是 `query`** — 后端会静默忽略 `query`。 |
| `data_service.create_document` | `{ cname, data }` | |
| `data_service.update_document` | `{ cname, key, data }` | |
| `data_service.delete_document` | `{ cname, key }` | |
| Chat（SSE） | `{ model, messages, stream: true, system?, images? }` | 通过 `services.ai.chat_service.chat` 发送 |
| RAG 查询/聊天 | `{ question, scope? }` / `{ messages, scope? }` | YiAi `/rag` 端点（可用，YiPet 尚未调用） |
| Knowledge 扫描/读取 | `{ path?, ... }` | YiAi `/knowledge` 端点（可用，YiPet 尚未调用） |

### UI 层

| 模块 | 公共 API |
|---|---|
| `src/popup/` | `App.tsx`（根组件）、`index.tsx`（挂载）、`data.ts`（配置适配器）、`components/*`（每个 UI 组件一个文件夹，就近放置 TSX + CSS） |
| `src/chat/` | `controller.ts`（状态/流式/操作，通过 `useSyncExternalStore`）、`components/*`、`types.ts` |
| `src/content/` | `bootstrap.ts`（双世界入口）、`cdn/catalog.ts` + `cdn/injector.ts`、`ipc/messages.ts`、`rendering/overlay.ts`、`state/` |
| `src/shared/` | `i18n/`、`theme/`、`roles.ts`、`locale/`、`timezone/`、`datetime/`、`env.ts`、`log.ts`、`state.ts` |
| `src/popup/services/` | `chrome.ts`（标签页/存储）、`connect.ts`（内容脚本 ping）、`notify.ts`（通知） |

## 数据流

### 聊天（流式）

```
用户在聊天框中输入
   ▼
api.chat.stream({ user, system?, model?, images?, conversation_id? })
   ▼ fetch POST /  body: {module_name: "services.ai.chat_service",
                         method_name: "chat",
                         parameters: {model, messages, stream: true, system?, images?}}
                         signal: AbortController
   ▼
YiAi FastAPI → StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
ApiClient 解析 SSE → onChunk(text) / onDone() / onError(err)
   ▼
ChatController 追加增量 → useSyncExternalStore → React 重新渲染
   on abort: 消息标记为 aborted=true 并持久化
```

### 会话持久化

```
ChatController 在发送/接收/编辑/删除时
   ▼ api.sessions.upsert({key, messages, ...})
   ▼ fetch POST /  body: {module_name: "services.database.data_service",
                         method_name: "update_document" | "create_document",
                         parameters: {cname: "sessions", key, data}}
   ▼ YiAi data_service → repository → MongoDB sessions 集合
```

### 弹窗 → 内容脚本 → MAIN 世界

```
弹窗（React）分发操作
   ▼ chrome.tabs.sendMessage(tabId, {type: 'TOGGLE_PET', payload})
   ▼ 内容脚本（ISOLATED）通过 chrome.runtime.onMessage 接收
   ▼ 通过 CustomEvent 转发到 MAIN 世界
   ▼ Bootstrap（MAIN 世界）监听 window，修改宠物 DOM
```

## 项目约束

- **TypeScript strict 模式** — `tsconfig.base.json` 中 `"strict": true`。`tsc --noEmit` 必须通过。Rsbuild/SWC 在构建时剥离类型但不检查。
- **React 18 函数组件 + hooks** — 不允许 class 组件，不允许在用户代码中调用 `React.createElement`（JSX 由 `@rsbuild/plugin-react` 处理）。Ant Design 组件通过 `antd` 包使用；图标通过 `@ant-design/icons`。
- **双执行上下文** — `src/content/bootstrap.ts` 首先作为内容脚本运行（ISOLATED 世界），然后自我注入到 MAIN 世界。`chrome.runtime.getURL` 仅在 ISOLATED 中可用。
- **路径别名 `@/`** — `@/` 映射到 `src/`（在 tsconfig、rsbuild 和 vitest 中配置）。跨模块导入优先使用 `@/`；仅同目录或兄弟文件使用相对路径。示例：`import { t } from '@/shared/i18n'` 而非 `'../../../shared/i18n'`。
- **全局使用 ES modules** — 不使用 IIFE，不使用全局命名空间。导入在构建时由 Rsbuild 解析。目录结构即是命名空间。
- **CDN 资源在 `public/cdn/`** — Rsbuild 将 `public/` 原样复制到 `dist/`。所有 vendor 库均为本地文件（MV3 CSP 合规）。`src/content/cdn/catalog.ts` 中的目录是唯一数据源。
- **i18n 通过 `chrome.i18n`** — 所有面向用户的字符串使用 `src/shared/i18n/index.ts` 中的 `t('key')`。消息文件位于 `public/_locales/<lang>/messages.json`。`MessageKey` 类型联合必须保持同步。
- **API 层在 `src/api/`** — 四层：`client.ts`（fetch 包装器）→ `endpoints.ts`（路径常量）→ `types.ts`（接口）→ `services/*.ts`（域类）。服务类通过构造函数注入接收 `ApiClient`。
- **UTC 优先的日期时间** — 所有时间戳以 ISO 8601 UTC 存储。显示转换通过 `src/shared/datetime.ts` 使用 `Intl.DateTimeFormat` 并指定显式时区。
- **构建输出在 `dist/`** — Chrome 从 `dist/` 目录加载。运行 `npm run build` 生成可加载的扩展（manifest 自动复制）。

## 降级对策

| 情况 | 措施 |
|-----------|--------|
| YiAi 后端不可达 | API 客户端使用指数退避重试，然后将类型化错误传递给调用方 |
| CDN 资源已加载 | 全局存在性检查短路了重复注入 |
| Chrome 存储配额超出 | 状态写入静默失败；日志记录器在开发模式下发出警告 |
| 区域设置消息缺少键 | 回退到 `en` 源语言，然后回退到键本身 |
| TS strict 模式违规 | `npm run typecheck` 使构建失败 |
| 开发模式 React 插件 + 生产环境 `NODE_ENV` | 聊天打包开发脚本运行 `--mode production` 以避免 `jsxDEV is not a function` |

## 自我约束

- **API 层是四层的。** 任何层都不能跳过一级 — services 使用 client + endpoints + types；types 永远不导入 services；client 永远不导入 services。
- **就近放置的 CSS。** 组件的 CSS 放在其组件目录中。`buildChatCSS()` 将按组件的 CSS 拼接为运行时加载的 `dist/cdn/styles/chat.css`。
- **`filter` 不是 `query`。** 调用 `data_service.query_documents` 时，Mongo 过滤器参数是 `filter`。后端会静默忽略 `query`。这是一个真实的 bug — 见近期变更。
- **MV3 CSP 合规。** 不允许远程代码，不允许 `eval`，不允许内联脚本。所有 vendor 库位于 `public/cdn/vendor/` 下，通过 `chrome-extension://` URL 加载。
- **双世界边界。** `chrome.runtime.*` 仅在 ISOLATED 中可用。页面上下文全局变量仅在 MAIN 中。不要尝试从 MAIN 世界代码中调用 chrome API。

## 近期变更

### 2026-08-15 — 弹窗皮肤中心重构 + 宠物覆盖层皮肤环

参照 deepseek-harness 的"一切都是插件 / 皮肤中心 / 宠物预览"美学，弹窗被重构为实时皮肤中心，浮动宠物现在佩戴所选皮肤。

- **`src/popup/data.ts`**：`COLOR_OPTIONS` 每个色块增加 `gradient` 字段（复用 `THEME_PALETTES[i].primaryGradient` / `NONE_PALETTE.primaryGradient`）；新增 `ROLE_NAMES`、`roleImageUrl(role)`（chrome.runtime.getURL 解析的资源路径）和 `MODELS`（`qwen3.5` / `qwen3.5-think` / `qwen3-coder`）。`DEFAULTS.MODEL` 现在是 `'qwen3.5'`（之前是 `null`）；`PopupConfig.COLORS` 类型为 `ColorOption[]`。
- **`src/popup/types.ts`**：`PopupState.model` 是 `string`（之前是 `string | null`）。
- **`src/popup/components/AppHeader`**：渐变头部，包含扩展图标 + 标题 + 副标题 + 脉冲状态指示器（`visible` / `statusText` props）。
- **`src/popup/components/PetPreview`**（新增）：实时宠物预览 — 角色图片在 `--primary-gradient` 环内，由大小滑块缩放，带有浮动动画 + `prefers-reduced-motion` 防护。
- **`src/popup/components/ColorPicker`**（新增）：6 色块网格；选中色块显示勾选 + 圆环高亮。
- **`src/popup/components/RolePicker`**（新增）：2 列角色卡片，带图片 + 名称，`--border-focus` 高亮。
- **`src/popup/components/AppFooter`** + **`AboutCard`**：提示/版本页脚；关于信息折叠到 antd `Collapse` 中（移除了生产/开发依赖列表）。
- **`src/popup/App.tsx`**：集成预览 + 选择器 + 模型 `Select`；新增 `updateModel` 操作直接持久化到全局状态（模型不需要内容脚本操作）。
- **`src/content/rendering/overlay.ts`**：浮动宠物现在佩戴活动皮肤 — `#yipet-overlay` 获得 `--primary-gradient` 环 + `--primary-rgb` 发光（之前是 `padding:24px;border-radius:50%` 无背景），宠物图片为圆角 + `draggable=false`，角色名称作为原生 tooltip 显示。
- **`src/chat/index.tsx` + `controller.ts` + `types.ts` + `ChatHeader` + `ChatWindow`**：聊天头部现在显示活动角色的头像（之前是通用的 💕）。`ChatState` 增加 `roleName` / `roleImageUrl`；新增 `setRole(name, imageUrl)` 操作在启动和 `yipet:roleChanged` 时调用，使头部头像与覆盖层宠物保持同步。`index.tsx` 解析扩展根路径（`EXT_ROOT`）和角色图标 URL（在 MAIN 世界中，没有 `chrome.runtime.getURL`）。
- **`public/_locales/*/messages.json`** + **`src/shared/i18n/index.ts`**：添加了 `popupSubtitle`、`popupPreviewTitle`、`popupModelLabel`、`notifyModelUpdated`。
- **`vitest.config.ts`**：移除了未使用的 `@vitejs/plugin-react`（v6 需要 Vite 6，与 Vitest 2 的 Vite 5 不兼容）— 测试是纯 `.ts`，无 JSX。
- **`tests/config/data.test.ts`**：`DEFAULTS.MODEL` 断言现在期望 `'qwen3.5'`；`COLORS` 断言使用 `toMatchObject` + 渐变存在性检查。

跨项目关联：弹窗现在是一个皮肤中心 — 选择角色（角色系统提示词）、颜色皮肤（通过 `applyThemeColors` 全页面表面重新着色）、模型，并在宠物预览中实时查看效果；相同的皮肤环在每个宿主页面的浮动宠物上渲染。镜像了 deepseek-harness 皮肤中心建立的弹窗预览 ↔ 页面上宠物环的循环。

`npm run typecheck` ✓，`npm run build` ✓，`npm test` ✓（97/97）。

### 2026-08-05 — 自动生成会话标题

- **`src/chat/controller.ts`**：新增操作 `autoGenerateSessionTitle(opts?: { apply?: boolean; onResult?: (title: string) => void })` — 取前 4 条用户消息（每条截断至 300 字符），通过 `_chat.streamWithCallback` 向 LLM 请求，使用"标题生成器"系统提示词 + "4-6 个词的标题，无引号、无 markdown、无末尾标点"用户提示词。剥离 LLM 响应中的残留引号/标点。截断至 80 字符。当 `apply !== false`（默认）时，通过 `_sessions.update` 持久化标题并更新 `state.sessions[i].title` + `state.title`。显示成功/错误通知。当提供 `onResult` 时，使用生成的标题触发（SessionEditDialog 使用它来填充输入框而不保存 — 用户仍可在点击保存前编辑）。
- **`src/chat/components/SessionEditDialog/SessionEditDialog.tsx`**：新增 `ThunderboltOutlined` 按钮作为"会话标题"`Input` 的 `addonAfter`。加载状态由本地 `titleLoading` useState 跟踪。调用 `autoGenerateSessionTitle({ apply: false, onResult: (t) => setTitle(t) })` — 标题进入输入框供审阅；现有的保存按钮仍需持久化。Tooltip："从消息自动生成"。
- 跨项目关联：YiPet 会话跨越所有项目（YiAi / YiVad / YiKnowledge / 外部页面）。有了自动生成的标题，侧边栏树变得可识别 — 每个会话不再是"Current page title.md"，而是"分支 · auth 中间件重构"或"讨论 YiVad bug 1234 根本原因"。与迭代 11（导出）+ 迭代 12（分支）配对 — 生成的标题使导出和分支在下游可识别。同时减少认知负担：用户不再需要手动为每个想保留的会话命名。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 会话摘要模态框

- **`src/chat/types.ts`**：`ChatState` 增加了 `sessionSummaryVisible`、`sessionSummaryLoading`、`sessionSummaryText`、`sessionSummaryError`。
- **`src/chat/controller.ts`**：新增操作 `summarizeCurrentSession()`、`closeSessionSummary()`、`copySessionSummary()`。`summarizeCurrentSession` 从 `state.messages` 构建对话记录（每条消息截断至 800 字符以保持 LLM 载荷合理），通过 `_chat.streamWithCallback` 发送，使用"简洁摘要器"系统提示词和"5-8 个要点，聚焦于问过什么/决定什么/开放问题"用户提示词。摘要实时流式输出到 `sessionSummaryText`（逐 token `_emit`，使模态框实时更新）。出错时，`sessionSummaryError` 被填充并在 `Alert` 中显示。`copySessionSummary` 使用 `navigator.clipboard.writeText` + 成功/失败时通知。摘要保留在模态框中 — 不会追加到对话线程中，因此聊天保持干净。
- **`src/chat/components/SessionSummaryDialog/`**：新增 — 通过 `renderMarkdown` + `dangerouslySetInnerHTML` 渲染 markdown 摘要的模态框（源是 LLM，但 `renderMarkdown` 转义了不受信任的输入）。加载状态显示 `Spin` 和"正在摘要 N 条消息 — 可能需要几秒钟"提示。页脚有复制 + 关闭按钮（加载中或文本为空时复制按钮禁用）。就近放置的 CSS 用于列表/项目符号间距 + 滚动容器（max-height 60vh）。
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：模态框挂载在根节点（始终渲染，控制器控制可见性）。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：新增 `ProfileOutlined` 按钮，位于"导出为 markdown"（迭代 11）旁边。Tooltip："摘要会话"。无消息或 `isProcessing` 时禁用。
- 跨项目关联：在关于任何项目页面的 YiPet 对话中，用户可以随时点击"摘要"获取 5-8 个要点的回顾。与迭代 11（导出为 markdown — 摘要可复制，用户可以粘贴到其他地方：YiVad bug 报告的"描述"字段、YiKnowledge 笔记的摘要 frontmatter、外部邮件）配对。与迭代 12（从消息分支 — 摘要显示用户应该从哪条消息分支）配对。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 从消息分支（对话中途分叉线程）

- **`src/chat/controller.ts`**：新增操作 `branchFromMessage(timestamp)` — 找到给定时间戳的消息，切片 `messages[0..idx+1]`（深拷贝，`streaming: false`），通过 `SessionService.create` 创建新会话，包含这些消息（映射为 `{role, content, timestamp}` 记录）+ 从原始会话携带的 `pageContent` + 标签 `[branch-of:<origId>, from:<url>, source:YiPet, project:<detected>]`。标题为 `Branch · <origTitle>`（截断至 80）。将新会话推入 `state.sessions`，切换 `currentSessionId`，将 `state.messages` 设置为切片后的分支，设置 `viewState='messages'`。成功时通知"N 条消息已分支到新会话"。
- **`src/chat/components/MessageBubble/MessageBubble.tsx`**：新增 `BranchesOutlined` 操作按钮，添加到宠物消息和用户消息的操作行中（任何消息都可分支 — 从用户的问题或宠物的回复分叉）。`isProcessing` 时禁用。Tooltip："从此处分支 — 创建包含到此消息为止的新会话"。
- 跨项目关联：当用户跨项目（YiAi 文档 / YiVad 管理后台 / YiKnowledge / 外部）探索想法，而 YiPet 线程已经发散 — 比如前 5 条消息是关于主题 A，然后转向主题 B — 从第 5 条消息分支可以分叉出一个干净的主题 A 线程，而不会丢失主题 B 的延续。分支的标签包含 `branch-of:<origId>`，因此谱系可追溯。与迭代 11（导出为 markdown）配对：当对话需要分叉时分支，当需要落地到 YiPet 之外时导出。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 导出会话为 markdown

- **`src/chat/controller.ts`**：新增操作 `exportCurrentSessionMarkdown()` — 将当前会话的消息格式化为 markdown 文档，带有 frontmatter 风格头部（`# <title>`、导出时间戳、来源 URL、标签、创建时间），然后 `---` 分隔符，然后是每条消息的 `## 🧑 User · <ts>` / `## 🐾 Pet · <ts>` 段落，包含原始内容。错误/中止的消息获得斜体警告行。通过 `Blob` + `URL.createObjectURL` + 临时 `<a download>` 元素触发下载。文件名是截断至 50 字符的 slug 化会话标题 + `.md`。成功时通知"N 条消息已导出为 markdown"，会话为空时通知"没有可导出的内容"。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：新增 `DownloadOutlined` 按钮，位于工具栏中"编辑会话"旁边。无消息时禁用。Tooltip："导出会话为 markdown"。
- 跨项目关联：关于任何项目页面的 YiPet 对话都可以被捕获为可移植的 markdown 文件 — 粘贴到 YiKnowledge（知识库）、YiVad 文档/缺陷报告/需求故事，或外部笔记。与迭代 10（每条消息的 YiVad 桥接）配对：每条消息 = 发送一个线程到 YiVad，导出 = 捕获整个线程到任何地方。两者共同使 YiPet 成为跨项目产物的生产者，而不仅仅是消费者。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 每条消息的"在 YiVad aiChat 中打开"桥接

- **`src/chat/controller.ts`**：新增操作 `openMessageInYiVad(timestamp)` — 找到给定时间戳的消息，然后通过 `SessionService.create` 和 `window.open` 植入一个新的 YiVad aiChat 会话，`window.open` 打开 `http://localhost:8848/#/aiChat?session=<key>`。对于宠物回复，包含前置用户问题作为第一条用户消息 + 第二条"从这个助手回复继续：\n\n<response>"用户消息，以便 YiVad 的聊天以完整上下文开始（用户可以立即发送一个基于宠物答案的后续问题）。对于用户消息，仅植入该单条消息。会话标题为 `YiPet → <消息前 60 字符>`。标签包含 `via:per-message-bridge` 以便追踪来源。
- **`src/chat/components/MessageBubble/MessageBubble.tsx`**：新增 `ExportOutlined` 操作按钮，位于宠物消息操作行中（在保存到 YiKnowledge 旁边）。流式传输/处理中或消息无内容时禁用。Tooltip："在 YiVad aiChat 中打开"。
- 跨项目关联：现有的工具栏级别 `discussInYiVadAiChat()` 植入一个带有页面上下文（用户当前页面上的内容）的会话。这个新的每条消息版本植入的是*特定宠物回复*中的内容 — 当用户阅读了宠物答案并想在 YiVad 更丰富的 UI 中深入（工具调用、文件选择器、更长的上下文窗口）时很有用。工具栏 = "讨论这个页面"，每条消息 = "讨论这个答案"。在任何宠物回复上点击一次即可打开 YiVad，对话已经就绪。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 工具调用时间线（3 段阶段指示器）

- **`src/chat/types.ts`**：`ChatState` 增加了 `streamingPhase: '' | 'thinking' | 'retrieving' | 'streaming'`。
- **`src/chat/controller.ts`**：`_runStream` 现在设置 `streamingPhase` — 如果 `knowledgeGrounded` 开启（等待 RAG 检索 + 来源），则为 `'retrieving'`，否则为 `'thinking'`（等待 LLM 的第一个 token）。在第一个 `onToken` 回调时，`phaseFlipped` 锁存器将其转换为 `'streaming'`。在 `finally` 和 `stopSending` 中与 `streamingType` 一起清除。
- **`src/chat/components/SessionStatusBar/SessionStatusBar.tsx`**：现有的阶段指示器（发送/重新生成/重新发送）现在还渲染一个 3 段迷你时间线 `<span className="yp-ssb-timeline">` — 三个 14×4px 的条形（thinking | retrieving | streaming）。活动段以 `currentColor` + 4px box-shadow 发光点亮；其余保持暗灰色。指示器上的 Tooltip 现在还显示子阶段：`Phase: send · streaming`。
- **`src/chat/components/SessionStatusBar/SessionStatusBar.css`**：`.yp-ssb-timeline`（inline-flex，2px 间距）+ `.yp-ssb-tl-seg`（14×4，2px 圆角，默认暗色）+ `.yp-ssb-tl-seg.is-active`（currentColor + 发光）。`currentColor` 让段继承指示器的阶段颜色（send 为靛蓝色，regenerate 为紫罗兰色，resend 为天蓝色）。
- 跨项目关联：受 Pi 启发，简化版。YiVad aiChat 的 `ToolCallTimeline.vue` 是一个更大的界面，展示每个工具调用 + 其参数 + 其结果。YiPet 还没有 MCP/工具调用，所以这里的时间线改为展示*流式*阶段的粒度 — 当用户等待一个基于知识库的提问时很有用（"retrieving" 段在 RAG 后端扫描知识库时点亮，然后当 token 开始流动时切换到"streaming"）。用户一眼就能知道等待的是检索还是 LLM — 在开启知识库的情况下聊任何项目页面时，这是一个重要的诊断信息。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 迷你图悬停 → 滚动到消息气泡

- **`src/chat/components/SessionStatusBar/SessionStatusBar.tsx`**：成本迷你图现在是可交互的。`stats` useMemo 现在返回 `points[]`（每条消息在 56×12 viewBox 上的 {x, y} 坐标）和 `bandW`（每条消息的悬停带宽）。在现有 SVG 路径之上，渲染 N 个不可见的 `<rect>` 带 — 每个覆盖迷你图的一个垂直切片。`onMouseEnter` 和 `onClick` 在带上调用 `scrollToMessageByCostIdx(i)`，查询 `#yipet-chat-messages [data-chat-idx="i"]` 并调用 `scrollIntoView({ behavior: 'smooth', block: 'center' })`。每个带还暴露一个 `<title>` tooltip：`Msg N · $X.XXXX`。
- 依赖 `MessageBubble` 上已有的 `data-chat-idx={index}` 属性 — 无需更改 MessageBubble。
- 跨项目关联：将迭代 5（成本迷你图）和迭代 4（每条消息的 token 芯片）联系起来。在聊任何项目页面（YiAi / YiVad / YiKnowledge / 外部）时，用户可以悬停迷你图来扫描成本轨迹并跳转到任何消息 — 当长会话有 20+ 条消息，用户想找到成本最高的那条，或回滚比较早期答案和当前答案时很有用。
- 受 Pi 启发：迷你图不再只是静态指示器；它是一个导航界面。YiVad aiChat 有一个类似的 `scrollToMessageByTs` 模式，按时间戳键控；这里按消息索引键控，因为成本历史是按消息数组顺序构建的。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 聊天窗口顶部边缘拖拽调整大小手柄

- **`src/chat/controller.ts`**：`_resizeStart` 增加了 `wy`（窗口 Y 原点）字段。`_onResizeMove` 现在处理 `'n'` 方向 — 当向下拖动顶部边缘时，高度缩小，`y` 跟随（钳制使窗口永远不会超过 `MIN_HEIGHT` 或飞出视口顶部）。镜像现有的 `'w'`（左侧边缘）分支：宽度/高度变化与 `x`/`y` 耦合，使对侧边缘保持锚定。
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：在窗口顶部边缘渲染了一个新的 `.yipet-resize-n` 条（与现有的 SE/SW 角手柄并列），连接到 `onResizeMouseDown('n', …)`。全屏时隐藏（与角手柄相同的条件）。
- **`src/chat/components/ChatWindow/ChatWindow.css`**：`.yipet-resize-n` — 全宽条（每侧 8px 内边距以避免与圆角冲突），4px 高，`cursor: ns-resize`，`z-index: 11` 使其位于头部之上（头部拖拽移动仍然在下方工作）。悬停和 `.resizing` 状态使其像角手柄一样着色为主色调。
- 跨项目关联：聊天窗口位于任何项目页面之上。仅有 SE/SW 角手柄时，用户只能抓取底部角来调整大小 — 这意味着聊天总是向下增长，覆盖更多底层项目页面的内容。有了顶部边缘，用户可以将聊天下推到视口底部同时使其变高 — 保持任何项目页面的上部可见（例如 YiVad 管理后台头部、YiAi 文档标题、YiKnowledge 树）。YiVad aiChat 有顶部 + 左侧 + 右侧边缘手柄；此迭代添加了顶部边缘（对浮动窗口最有用的那个）。如有需要，左侧/右侧边缘可以稍后添加。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 拖放知识文件到会话

- **`src/chat/controller.ts`**：新增操作 `createSessionFromKnowledgeFile(path)` — 通过 `KnowledgeService.read` 读取文件内容，使用合成 URL `yipet://knowledge/<path>` 进行会话去重（重新拖放会重新打开同一线程而不是堆叠重复项，镜像 YiVad 的 `ensureKnowledgeSession` 模式）。如果存在带有该合成 URL 的会话，从文件刷新其 `pageContent`（使线程始终反映最新的文件内容）并重新选择它；否则通过 `SessionService.create` 创建新会话文档，标签为 `['source:YiKnowledge', 'from:<href>']`。内联了 `selectSession` 的消息加载逻辑，然后调用 `setRagScopeFromNode(path, true)` + 如果尚未开启则自动启用知识库，使第一个提问即能通过文件级 RAG 利用文件内容。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：`renderKnowledgeTitle` 现在使叶子节点 `draggable={true}`，`onDragStart` 设置 `e.dataTransfer.setData('application/x-yipet-knowledge-file', path)` + `effectAllowed = 'link'`。Tooltip 更新为提及拖拽到聊天。
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：`.yipet-chat-main` Layout 现在是放置目标 — `onDragEnter`/`onDragOver`/`onDragLeave`/`onDrop` 处理程序，由自定义 MIME 类型门控。`useRef<number>(0)` 计数器 + `useState<boolean>` 标志驱动一个 `.yipet-chat-drop-overlay`，当用户将知识文件拖到聊天区域上时渲染。放置时，解析路径并调用 `ctrl.createSessionFromKnowledgeFile(path)`。
- **`src/chat/components/ChatWindow/ChatWindow.css`**：添加了 `.yipet-chat-drop-overlay`（绝对定位 inset-0，虚线主色边框，12% 主色透明度）+ `.yipet-chat-drop-overlay-inner`（居中卡片，带 `FileTextOutlined` + 说明文字）。`pointer-events: none` 使覆盖层本身不会吞掉放置事件。
- 跨项目关联：当用户在任何页面（YiAi / YiVad / YiKnowledge / 外部）上时，可以直接从侧边栏将知识文件拖到聊天区域来植入一个线程 — 文件内容成为会话的 `pageContent` 和文件级 RAG 范围，因此后续提问基于该文件。与现有的 `@` 提及文件下拉菜单配对：`@` 用于键盘驱动的范围限定，拖放用于鼠标驱动的会话植入。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — SessionStatusBar 中的紧凑成本迷你图

- **`src/chat/components/SessionStatusBar/SessionStatusBar.tsx`**：扩展了现有的 `stats` useMemo，跟踪累积的 `costHistory[]`（每条消息的 $ 花费，按 chars/4 token 估算 × `INPUT_RATE_PER_1K = $0.0005` / `OUTPUT_RATE_PER_1K = $0.0015`），计算 `sparkPath`（SVG `M..L..` 字符串，56×12 viewBox），并显示 `estimatedCost`。在 token 芯片和 Ctx/RAG 指示器之间渲染一个新芯片：一个小型 SVG 迷你图 + `$X.XXXX` 标签，包裹在 antd `Tooltip` 中，显示按角色细分 + 轨迹最小值/最大值/最新值。
- **`src/chat/components/SessionStatusBar/SessionStatusBar.css`**：添加了 `.yp-ssb-cost`（琥珀色，等宽数字）+ `.yp-ssb-cost-spark` 样式。迷你图仅在 ≥2 条消息时渲染（否则没有轨迹可绘制）。
- 受 Pi 启发但紧凑：无参考线/预测/p90/卡住标记（YiVad 的 `SessionStatusBar.vue` 有 2200 行 — 这只是其中一小部分）。自然地与 `MessageBubble` 中的每条消息 token 芯片（迭代 4）配对 — 用户通过颜色编码芯片看到每条消息的成本，通过迷你图看到累积轨迹。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — MessageBubble 中的每条消息 token 芯片

- **`src/chat/components/MessageBubble/MessageBubble.tsx`**：在 `mb-meta` 中的时间戳旁边添加了一个 token 芯片。显示 `~Nt`（粗略的 chars/4 估算，与 `SessionStatusBar` 相同的启发式方法）。颜色编码：用户消息 = 输入（信息蓝色），宠物消息 = 输出（成功绿色）。Tooltip 分解输入/输出角色 + 原始字符数。
- **`src/chat/components/MessageBubble/MessageBubble.css`**：添加了 `.mb-token-chip` + `--in` / `--out` 变体 — 小型药丸形状（10px，0 5px 内边距，8px 圆角），等宽数字，70% 不透明度（匹配现有的 `mb-meta` 暗色样式，使其不突兀）。
- 受 Pi 启发：输入 vs 输出经济性在消息层面展示 — 用户无需打开 tooltip 即可看到每条消息的 token 成本，角色颜色与 SessionStatusBar 的堆叠柱状图一致。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — 侧边栏拖拽调整大小手柄已连接

- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：在 `<Sider>` 和 `<Layout className="yipet-chat-main">` 之间插入了一个 `<div className="yipet-sidebar-resizer">`。将 `onMouseDown` 连接到控制器已有的 `onSidebarResizeMouseDown` 处理程序（该处理程序已在 `controller.ts:2227-2252` 中实现，带有 `MIN`/`MAX` 钳制 + 持久化到 `chrome.storage.local`（键为 `sidebarWidth`），但没有 UI）。
- **`src/chat/components/ChatWindow/ChatWindow.css`**：添加了 `.yipet-sidebar-resizer` — 4px 宽的垂直分隔线，`cursor: col-resize`，默认透明，悬停或 `#yipet-chat-window.resizing` 设置时为主色高亮。`flex-shrink: 0` 使 Layout flex 容器将调整大小器保留为 Sider/main Layout 的兄弟元素。
- 当 `sidebarCollapsed` 为 true 时隐藏（调整大小器与 `Sider` 在同一个条件块内）。
- `npm run typecheck` ✓，`npm run build` ✓。

### 2026-08-05 — ContextScopeBar（活动上下文芯片）

- **`src/chat/components/ContextScopeBar/`**：新增 — 聊天区域顶部的紧凑条，显示将在下一次发送时附带的活动上下文。镜像 YiVad aiChat 的 `ContextFilesPanel.vue`，但只占一小部分空间 — YiPet 的浮动窗口没有空间放置单独的上下文列，因此上下文以芯片形式展示。
- 芯片：
  - **RAG 范围** — 文件或文件夹路径。文件范围点击打开 `KnowledgePreviewDialog`；文件夹范围仅查看（通过现有流程导航到侧边栏 Knowledge 标签页）。X 通过现有 `clearRagScope()` 清除范围。
  - **页面上下文** — 当 `contextEnabled` 且活动会话有 `pageContent`（或 `contextEditorDraft`）时启用。点击打开 `PageContextEditor`；X 通过 `toggleContext()` 禁用页面上下文（保留已保存的内容，重新切换可恢复而无需重新输入）。
- 跨项目关联：在聊任何项目页面时，用户一眼就能看到除了输入的提示词外，还有哪些内容被发送给 LLM — 并且可以一键静音任一来源。
- 在 `ChatWindow.tsx` 中连接在 `ChatMessages` 之上；添加到桶导出 + `rsbuild.config.ts` `buildChatCSS` 文件列表。
- `npm run typecheck` ✓，`npm run build` ✓（chat.css 包含 `yp-csb-*` 规则）。

### 2026-08-05 — SessionStatusBar（受 Pi 启发的紧凑版）

- **`src/chat/components/SessionStatusBar/`**：新增 — 紧凑栏，镜像 YiVad aiChat 的 `SessionStatusBar.vue`，但只占一小部分空间。在 `ChatWindow.tsx` 中渲染在 `ChatMessages` 和 `ChatInput` 之间。
- 显示：模型（`DEFAULT_MODEL` = `qwen3.5`）、消息计数（`user/pet`）、~token 估算（chars/4 vs 8192 上下文窗口），带有低/中/高颜色级别 + 分解输入 vs 输出 token + 页面上下文 token 的 tooltip、上下文开启 / RAG 开启指示器芯片，以及流式阶段指示器（`send` / `regenerate` / `resend`，各有不同颜色）。
- 跨项目关联：在聊任何项目页面（YiAi、YiVad、YiKnowledge、外部）时，用户一眼就能看到 8K 上下文窗口的消耗情况 — 当页面内容也被作为上下文发送时，这是最重要的预算压力。
- 连接到 `src/chat/components/index.ts` 桶导出 + `rsbuild.config.ts` `buildChatCSS` 文件列表（使得就近放置的 CSS 进入 `dist/cdn/styles/chat.css`）。
- 还修复了 `controller.ts` `createInitialState` 中 `sessionProjectFilter` 缺少初始化的既有问题（类型检查运行时暴露了 TS2741）。
- `npm run typecheck` ✓。`npm run build` ✓（chat.css 包含 `yp-ssb-*` 规则）。

### 2026-08-05 — 聊天输入中的 @ 提及文件下拉菜单

- **`src/chat/controller.ts`**：新增 `knowledgeFileMatches(query, limit = 8)` 辅助函数 — 遍历 `state.knowledgeTree`，返回 `path` 或 `name` 包含查询（不区分大小写）的文件节点（type === 'file'）。上限为 `limit`。
- **`src/chat/components/FileMentionDropdown/`**：新增组件 — 当用户在输入框中输入 `@` 时，在 textarea 上方渲染一个下拉菜单。每行显示文件的完整路径（等宽字体，省略）。空状态显示"没有文件匹配 `<query>`"或"没有知识文件"（当树尚未加载时）。
- **`src/chat/components/ChatInput/ChatInput.tsx`**：`useMemo` 根据 `inputValue` + textarea 光标位置跟踪 `mentionVisible` / `mentionQuery` / `mentionAtIdx`。`@` 必须在输入开头或前有空格，且 @query 内不允许空格（一个 token）。选择文件时：从输入中去除 `@query` 子字符串，调用 `setRagScopeFromNode(path, true)`，如果尚未开启则自动启用知识库。键盘：当提及可见时，`Esc` 去除 `@query` 并关闭；`Enter` 选择第一个匹配项（或当没有匹配项时传递给发送）；`ArrowUp`/`ArrowDown` 被吞掉，不会触发提示词历史回忆。
- **`src/chat/components/index.ts`**：导出 `FileMentionDropdown`。
- 镜像 YiVad 的 `FileMentionDropdown.vue`。比打开侧边栏 Knowledge 标签页并点击节点更快 — 输入 `@`，看到实时匹配，选择，RAG 范围即被限定。

### 2026-08-05 — 工具栏中的提示词历史弹出框

- **`src/chat/types.ts`**：`ChatState` 增加了 `promptHistoryVisible: boolean`。
- **`src/chat/controller.ts`**：新增操作 `openPromptHistory()` / `closePromptHistory()` / `invokePromptHistory(idx)`（将提示词推送到 `inputTemplate` + 如果聊天关闭则自动打开 — 不自动发送，以便用户可以编辑）/ `removePromptHistoryAt(idx)`。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：新增 `HistoryOutlined` 按钮（在 FAQ 旁边），包裹在 antd `Popover` 中。内容：`state.promptHistory` 的最近优先列表；每行点击 → `invokePromptHistory`；每行删除按钮（阻止冒泡）；页脚"清除全部"按钮。Tooltip："提示词历史（在输入框中按 ArrowUp 回忆）"。
- 补充了上一个迭代的 ArrowUp/ArrowDown 回忆 — 现在用户既可以内联导航，也可以从弹出框中可视化选择。

### 2026-08-05 — 提示词历史导航（ArrowUp/ArrowDown 回忆）

- **`src/chat/types.ts`**：`ChatState` 增加了 `promptHistory: string[]`（最近的在最后）。
- **`src/chat/controller.ts`**：新增操作 `pushPromptHistory(text)`（去重连续重复项，上限 100，持久化到 chrome.storage.local 键 `promptHistory`）、`recallPromptHistory(delta, currentIdx)`（返回 `{ idx, text }` 或 `null`；delta -1 = 更旧，+1 = 更新；`idx === -1` 表示"退出导航，恢复历史前的输入"）和 `clearPromptHistory()`。`sendMessage` 在流式传输前将裁剪后的文本推送到历史。`_loadPersistedState` 现在也从 chrome.storage.local 拉取 `promptHistory`（过滤非字符串，上限 100）。
- **`src/chat/components/ChatInput/ChatInput.tsx`**：跟踪 `historyIdxRef`（-1 = 未导航）+ `preHistoryInputRef`（用户回忆前的输入，在 ArrowDown 超过最新时恢复）。在光标为 0 或空输入时按 ArrowUp → 回忆更旧的提示词并设置输入。在导航时按 ArrowDown 光标在末尾 → 回忆更新的（或当 idx 达到 -1 时恢复历史前的输入）。Enter 发送 + Escape 重置 `historyIdxRef` 为 -1。
- 镜像 YiVad 的 `usePromptHistory`（受 Pi 启发的 shell 回忆）。通过 chrome.storage.local 持久化，因此历史在会话间保留，并在所有宿主页面间共享（扩展存储，而非按源的 localStorage）。

### 2026-08-05 — 页面感知上下文芯片（YiVad 详情页）

- **`src/api/services/bug.ts`**：新增 `detectPageTypeFromUrl(url)` 辅助函数 — 返回 `{ kind, key? }`，其中 `kind` 为 `yivad-bug-detail` / `yivad-brd-detail` / `yivad-story-detail` / `yivad-aichat` / `unknown` 之一。`key` 是从 URL 路径中提取的实体键（已解码）。
- **`src/chat/controller.ts`**：新增 getter `pageContextChip` — 基于检测到的页面类型，返回 `{ label, prompt, bugKey? }`（或 `null`）。对于 bug 详情页，芯片标签为 `Discuss bug <key…>`，提示词要求根本原因 + 影响 + 修复方案，并设置 `bugKey`。对于 BRD 详情页，标签 `Summarize BRD <key…>` + 摘要提示词。对于需求故事详情页，标签 `Walk me through <key…>` + 入门引导提示词。新增操作 `applyPageContextChip()` 将提示词推送到 `state.inputTemplate`；对于 bug 详情芯片，还将 RAG 范围限定到 `lessons/failures/bugs/<key>.md` 并自动启用知识库，使答案基于 bug 的 markdown 内容。
- **`src/chat/components/QuickButtons/QuickButtons.tsx`**：当 `pageContextChip` 非空时，一个绿色 `success` 芯片渲染在行首，显示芯片的标签。点击 → `applyPageContextChip()`。处理中时禁用。
- 跨项目：YiPet 检测用户正在哪个 YiVad 详情页上，并提供一键式上下文提示词 — 无需输入或记住 bug 键/BRD ID。与现有的 `discussBugInChat`（侧边栏 Bugs 标签页）和 `discussInYiVadAiChat`（工具栏）一起，这意味着 YiPet 根据用户当前访问的项目页面调整其 UI。

### 2026-08-05 — "插入选中文本为提示词"工具栏按钮

- **`src/chat/controller.ts`**：新增 `insertSelectionAsInput()` 操作 — 读取 `window.getSelection()?.toString()`，如果为空则通知"请先在页面上选择一些文本"，否则自动打开聊天（如果已关闭）并将选中文本推送到 `state.inputTemplate`，以便现有的 `ChatInput` 模板同步机制接收。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：`HighlightOutlined` 按钮位于跨项目下拉菜单旁边 — 调用新操作。Tooltip："插入选中文本为提示词"。
- 跨项目：适用于任何项目中的任何页面 — 用户在任何地方选择文本（YiAi 文档、YiVad 管理后台、YiKnowledge markdown、外部站点），点击按钮（或自动打开），选中文本进入聊天输入框，准备发送。

### 2026-08-05 — 页面感知会话过滤器（跨项目记忆）

- **`src/chat/types.ts`**：`ChatState` 增加了 `sessionSiteFilter: string`。当非空时，`filteredSessions` 仅包含 URL 的站点键（hostname + pathname + hash-path，无查询参数）匹配的会话。
- **`src/chat/controller.ts`**：新增静态辅助函数 `ChatController.siteKeyFromUrl(url)`（小写 hostname + pathname + hash-path，去除查询参数）。新增操作：`filterSessionsByCurrentPage()`（切换 — 如果尚未过滤，将 `sessionSiteFilter` 设置为当前页面的站点键；如果已过滤，清除）和 `clearSessionSiteFilter()`。`filteredSessions` getter 现在在现有搜索查询之前应用站点过滤器。
- **`src/chat/components/SearchBar/SearchBar.tsx`**：新增 `EnvironmentOutlined` 按钮，位于批量模式按钮旁边。过滤器激活时渲染为 `type="primary"`（以便用户看到它已开启）。Tooltip："按当前页面过滤" / "正在按此页面过滤 — 点击清除"。
- 与现有的"在 YiVad aiChat 中讨论此页面"桥接一起，这让 YiPet 能够记住每个页面的对话：访问一个页面 → 点击过滤器 → 查看你曾经关于此确切页面的所有对话（跨 YiAi、YiVad、YiPet 或任何外部站点）。关闭切换则再次查看所有会话。

### 2026-08-05 — 工具栏中的跨项目导航下拉菜单

- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：将单个 `GlobalOutlined` 按钮替换为 `Dropdown` 菜单（点击触发，左下角定位）。项目：
  - "在 YiVad aiChat 中讨论此页面"（顶部，调用现有的 `controller.discussInYiVadAiChat()` 操作，植入一个带有页面上下文的 YiVad 会话）。
  - 分隔线。
  - "YiAi 后端（端口 10086）" → `http://localhost:10086`。
  - "YiVad 管理后台" → `http://localhost:8848`。
  - "YiVad aiChat" → `http://localhost:8848/#/aiChat/index`。
  - "YiVad 代码审查 / 缺陷" → `http://localhost:8848/#/code-review/bugs`。
  - "YiVad BRD" → `http://localhost:8848/#/brd`。
  - "YiVad 需求故事板" → `http://localhost:8848/#/story`。
- 所有外部链接通过 `window.open(url, '_blank', 'noopener,noreferrer')` 打开。
- 与现有的 bug 报告 + 最近缺陷 + 讨论缺陷 + 讨论页面桥接一起，这使 YiPet 的工具栏成为跨项目中心：任何项目中的任何标签页，YiPet 位于顶部，一键导航到任何地方。

### 2026-08-05 — 到 YiVad aiChat 的跨项目桥接

- **`src/chat/controller.ts`**：新增 `discussInYiVadAiChat()` 操作 — 捕获 `state.pageInfo`（URL + 标题）+ `state.contextEditorDraft`（或 `document.body.innerText` 截断至 8000 字符）作为页面上下文，通过 `SessionService.create` 创建 `sessions` 文档，包含第一条用户消息（`Page: <title>\nURL: <url>\n\n<content>`）+ 标签（`from:<url>`、`source:YiPet`、`project:<detected>`），然后 `window.open` 打开 `http://localhost:8848/#/aiChat?session=<key>`。YiVad 的 `aiChat/index.vue` onMounted 读取 `?session=<key>` 并选择已植入的会话，因此用户进入 YiVad aiChat 时页面上下文已经准备就绪。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：`GlobalOutlined` 按钮位于 bug 报告按钮旁边 — 打开桥接。
- 与 BugReportDialog（记录器）+ Recent Bugs 标签页（查看器）+ discussBugInChat（聊天植入）一起，这使 YiPet 成为真正的跨项目中心：捕获任何页面 → 植入缺陷或聊天 → 导航到 YiVad 处理详情/进一步工作。

### 2026-08-05 — 侧边栏中的 Recent Bugs 标签页（跨项目缺陷中心）

- **`src/chat/types.ts`**：`ChatState.sidebarView` 扩展为 `'sessions' | 'knowledge' | 'stories' | 'bugs'`；增加了 `recentBugs: BugDocument[]`、`recentBugsLoading`、`recentBugsError`。
- **`src/chat/controller.ts`**：新增操作 `loadRecentBugs(params?)`（调用 `BugService.listBugs` — pageSize 30，最新优先）、`openBugInYiVad(key)`（在新标签页中深层链接 `http://localhost:8848/#/code-review/bugs/detail/<key>?mode=view`）、`discussBugInChat(bug)`（用缺陷的标题 + 键 + "帮我理解"提示词植入聊天输入，将 RAG 范围限定到缺陷的 `contentPath`（如果已知），并自动启用知识库）。`setSidebarView('bugs')` 在首次访问时触发 `loadRecentBugs`。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：第四个标签页"Bugs" — 渲染 `recentBugs` 的 `List`。每行显示缺陷标题（省略）+ 红色严重性 `Tag` + 项目 `Tag` + 模块；行点击在 YiVad 中打开缺陷详情；内联"Discuss"按钮阻止冒泡并调用 `discussBugInChat`。
- 与 2026-08-05 BugReportDialog 迭代形成闭环：从任何页面记录缺陷 → 显示在 Bugs 标签页中 → 点击在 YiVad 中打开详情，或点击"Discuss"从缺陷的 `contentPath` 植入聊天输入 + RAG 范围。YiPet 成为跨项目缺陷中心。

### 2026-08-05 — 跨项目缺陷报告（YiPet 作为缺陷收集器）

- **`src/api/types.ts`**：添加了 `BugSeverity` / `BugPriority` / `BugStatus` / `BugType` / `BugFrequency` 联合类型 + `BugDocument` + `BugContent` 接口。`BugDocument` 镜像 YiVad 的 `/bug` MongoDB schema（`key`、`project`、`module`、`severity`、`priority`、`status`、`type`、`frequency`、`assignee`、`reporter`、`environment`、`affectedVersion`、`fixedVersion`、`tags`、`contentPath`、时间戳）。
- **`src/api/services/bug.ts`**（新增）：`BugService.createBug(meta, content)` 首先通过 `knowledge_service.write_entry_markdown` 将长文本内容写入 `~/YiKnowledge/lessons/failures/bugs/<key>.md`，然后通过 `data_service.create_document` 在 MongoDB `bugs` 中创建元数据文档。`listBugs(params)` 通过 `data_service.query_documents` 查询，支持标题/模块正则 + 项目/严重性/优先级/状态/类型过滤器。辅助函数：`makeBugKey(title)`（slug + base36 时间戳）、`detectProjectFromUrl(url)`（8848→YiVad，10086→YiAi，YiKnowledge/YiPet/unknown）、`bugToday()`。
- **`src/api/services/index.ts` + `src/api/index.ts`**：`BugService` 添加到 `ApiServices` 接口 + `createApiServices` 工厂 + 类型桶导出。
- **`src/chat/types.ts`**：`ChatState` 增加了 `bugReportVisible`、`bugReportLoading`、`bugReportDraft`（title/project/module/severity/priority/status/type/frequency/assignee/reporter/environment/affectedVersion/fixedVersion/tags/description/stepsToReproduce/expectedResult/actualResult — tags 和 steps 为纯字符串，提交时分割）。
- **`src/chat/controller.ts`**：构造函数现在接收 `bug: BugService`。新增操作：`openBugReport()`（通过 `detectProjectFromUrl(state.pageInfo.url)` 自动填充 `project` + 从 URL 填充 `environment`）、`closeBugReport()`、`setBugReportDraft(patch)`、`confirmBugReport()`（按逗号分割 tags，按换行分割 steps，生成 key，调用 `bug.createBug`，显示通知）。
- **`src/chat/components/BugReportDialog/`**：表单模态框，使用 antd `Select` 选择 severity / priority / status / type / frequency / project，自由文本输入 title/module/assignee/reporter/affectedVersion/fixedVersion/environment/tags，`Input.TextArea` 输入 description / steps / expected / actual。两列行布局用于紧凑分组。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：`BugOutlined` 按钮始终在工具栏中可见，打开模态框。
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：对话框挂载在根节点。
- 形成闭环：在任何页面上发现缺陷 → 从 YiPet 记录 → 元数据进 MongoDB，长文本内容进 YiKnowledge/lessons/failures/bugs → 显示在 YiVad 的 `/bug` 列表视图中。

### 2026-08-05 — 侧边栏中的 Stories 标签页（项目入门故事）

- **`src/chat/types.ts`**：`ChatState.sidebarView` 扩展为 `'sessions' | 'knowledge' | 'stories'`；增加了 `knowledgeStories: KnowledgeStory[]`、`knowledgeStoriesLoading`、`knowledgeStoriesError`。
- **`src/chat/controller.ts`**：新增操作 `loadKnowledgeStories(project?)`（通过 `listStoriesAsItems` 调用 `KnowledgeService.listStories`）和 `openKnowledgeStory(project, storyName)`（调用 `KnowledgeService.readStory`，填充现有的 `knowledgePreviewData`，使现有的 `KnowledgePreviewDialog` 渲染故事 markdown + frontmatter 条）。`setSidebarView('stories')` 在首次访问时触发加载。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：第三个标签页"Stories" — 渲染带有 `ProjectOutlined` 头像的项目 `List`；点击打开故事预览模态框。镜像 YiVad 的 Story Board（`src/views/story/index.vue`），但在聊天侧边栏中。
- 复用现有的 `KnowledgePreviewDialog` — 无需新的模态框组件。

### 2026-08-05 — 子问题分解（rag.decompose）

- **`src/api/endpoints.ts`**：添加了 `RAG.DECOMPOSE = '/rag-decompose'`。
- **`src/api/types.ts`**：添加了 `RagSubQuestion { sub_q, answer, sources }` 和 `RagDecomposeResponse { original, synthesis, sub_questions, error? }`。
- **`src/api/services/rag.ts`**：新增 `decompose(params)` 方法 — 同步（非流式）；后端的 SubQuestionQueryEngine 内部组合多个 LLM 调用。
- **`src/chat/types.ts`**：`ChatState` 增加了 `ragDecomposeVisible`、`ragDecomposeLoading`、`ragDecomposeData: RagDecomposeResponse | null`、`ragDecomposeQuestion`。
- **`src/chat/controller.ts`**：新增操作 `decomposeRagQuestion(question)`（传递 `scope` + `category`）和 `closeRagDecompose()`。
- **`src/chat/components/RagDecomposeDialog/`**：模态框显示每个子问题的文本 + 综合答案（markdown）+ 来源列表，然后是最终综合块和可选的错误横幅。加载旋转器带有"可能需要一段时间"提示。
- **`src/chat/components/ChatInput/ChatInput.tsx`**：当 `knowledgeGrounded` 为 ON 时，"Decompose"按钮（`PartitionOutlined`）出现在"Preview sources"旁边。两个按钮在任一加载时禁用。
- 完成三角：预检（仅来源，无 LLM）→ 分解（子问题 + 每个子问题的答案 + 综合）→ 基于知识库的聊天（完整流式答案）。

### 2026-08-05 — 类别过滤器下拉菜单（知识树 + RAG 查询）

- **`src/chat/types.ts`**：`ChatState` 增加了 `ragCategories: RagCategoriesResponse | null`、`ragCategoriesLoading: boolean`、`knowledgeCategoryFilter: string`。
- **`src/chat/controller.ts`**：
  - 新增 `loadRagCategories()` 操作 — 调用 `RagService.categories()` 并存储 `{categories: [{name, file_count}], tags, total_files}`。
  - 新增 `setKnowledgeCategoryFilter(category)` — 写入过滤器，然后通过 `KnowledgeService.scan(category)` 重新加载限定到该类别的 `knowledgeTree`。
  - `loadKnowledgeTree(category?)` 现在在没有传参时默认使用当前过滤器。
  - `setSidebarView('knowledge')` 在首次访问时触发 `loadKnowledgeTree()` 和 `loadRagCategories()`。
  - `_runStream` 知识库分支在非文件范围时传递 `category` 给 `RagService.streamChat`。`previewRagSources` 传递 `category` 给 `RagService.query`。文件级聊天/文件查询本质上是类别范围的（一个文件）— 不传递 `category`。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：一个 `Select` 位于知识标签页的范围指示器下方 — 选项为"All categories" + 每个 `{name} ({file_count})`。选择一个值调用 `setKnowledgeCategoryFilter`，这既缩小了可见树，也应用于后续的 RAG 查询。

### 2026-08-05 — RAG 预检来源预览

- **`src/chat/types.ts`**：`ChatState` 增加了 `ragPreviewSources: RagSource[]`、`ragPreviewLoading`、`ragPreviewVisible`、`ragPreviewQuestion`。
- **`src/chat/controller.ts`**：新增异步操作 `previewRagSources(question)` — 运行一次性检索（无 LLM 调用）并存储来源。按 `ragScopeIsFile` 路由：叶子范围 → `RagService.fileQuery({target_file, question})`；文件夹范围 → `RagService.query({question, scope})`。`closeRagPreview()` 清除状态。
- **`src/chat/components/RagSourcesPreviewDialog/`**：模态框列出每个来源的路径（等宽字体，省略）+ 数值分数 + 3 行片段（截断）。头部显示问题 + 当前范围。
- **`src/chat/components/ChatInput/ChatInput.tsx`**：当 `knowledgeGrounded` 为 ON 时，"Preview sources"按钮（带 `FileSearchOutlined`）出现在输入元数据行中 — 将当前 `inputValue` 传递给 `previewRagSources`。处理中、加载中或空输入时禁用。
- **`src/chat/components/ChatInput/ChatInput.css`**：`.yipet-chat-preview-btn` 样式为小型药丸按钮。
- 形成闭环：输入问题 → 预览来源 → 优化 → 发送基于知识库的答案。

### 2026-08-05 — 保存到 YiKnowledge（聊天 → 知识生产者）

- **`src/chat/types.ts`**：`ChatState` 增加了 `saveToKnowledgeVisible`、`saveToKnowledgeDraftPath`、`saveToKnowledgeDraftMetadata {title, category, tags, type}`、`saveToKnowledgeLoading`、`saveToKnowledgeTimestamp`。
- **`src/chat/controller.ts`**：新增操作 `openSaveToKnowledge(timestamp)`（预填充目标路径 `notes/<today>/<slug>.md` + 从消息内容派生的 slug）、`closeSaveToKnowledge()`、`setSaveToKnowledgeDraft(patch)`（path / title / category / tags / type）和 `confirmSaveToKnowledge()`（调用 `KnowledgeService.write`，带有元数据 → `title` / `category` / `type` / `tags[]` / `created` / `source_scope`（如果已限定范围）；成功时自动刷新知识树）。
- **`src/chat/components/SaveToKnowledgeDialog/`**：新增模态框，带有 path、title、category、type、tags 的 Form 字段。保存时显示加载旋转器。
- **`src/chat/components/MessageBubble/MessageBubble.tsx`**：新增 `SaveOutlined` 操作按钮，位于宠物消息上（流式传输中或空内容时禁用）。
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：模态框挂载在根节点。

### 2026-08-05 — 工具栏中的 RAG 状态徽章

- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：当 `knowledgeGrounded` 为 ON 时，一个状态徽章出现在 `BookOutlined` 切换按钮旁边。徽章颜色：绿色（已构建）/ 黄色（未构建）/ 蓝色旋转器（加载中）。Tooltip 显示文档计数 + 最后构建时间（`just now` / `5m ago` / `2h ago` / 日期）。点击徽章触发 `rebuildRagIndex()` — 加载中时禁用。
- 使用 antd 的 `Badge` 配合 `status` prop + `DatabaseOutlined` 图标。

### 2026-08-05 — ChatController 中的 RAG 状态 + 文件级知识库

- **`src/chat/types.ts`**：`ChatState` 增加了 `ragScopeIsFile: boolean`、`ragStatus: RagStatusResponse | null`、`ragStatusLoading: boolean`。
- **`src/chat/controller.ts`**：
  - `_runStream` 知识库分支现在按 `ragScopeIsFile` 路由。当用户限定到叶子（文件）时，调用 `RagService.streamFileChat({target_file, question})`（文件级索引 — 单轮，系统提示词合并到问题中）。当限定到文件夹时，仍调用 `streamChat({messages, scope})`。
  - `setRagScopeFromNode(path, isFile)` 现在接受 `isFile` 标志，并将 `ragScopeIsFile` 与 `ragScope` 一起持久化。
  - `toggleKnowledgeGrounded` 在首次 ON 时自动获取 `ragStatus`，以便 UI 在用户提问前警告未构建的索引。
  - 新增 `loadRagStatus()` 操作拉取 built / num_docs / last_built_at。
  - 新增 `rebuildRagIndex()` 操作触发 `/rag-build` 并重新轮询状态。
  - 新增 `knowledgeNodeByPath(path)` 辅助函数 — 遍历 `state.knowledgeTree` 查找原始节点（ChatSidebar 用于从点击的 antd Tree key 传递 `isFile`）。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：`onKnowledgeSelect` 通过 `knowledgeNodeByPath` 查找原始节点，推断 `isFile = node.type === 'file'`，并传递给 `setRagScopeFromNode`。
- `ragScope` 和 `ragScopeIsFile` 在初始化时从 `chrome.storage.local` 恢复。

### 2026-07-28 — Bug 修复（API 层）

- **`src/api/services/sessions.ts`**：`SessionService.list()` 和 `SessionService.get(id)` 在 RPC 参数中发送了 `query: {...}`，但 YiAi 的 `query_documents` 只识别 `filter`。两者现在都发送 `filter: {...}`。没有此修复，list/get 会静默返回所有会话或空。
- **`src/api/types.ts`**：`QueryParams.query` 重命名为 `QueryParams.filter`，并添加了说明后端合并契约的文档注释。

### 2026-07-27 — 聊天框移植（YiPett）

- 移植了 YiPett 的快捷键 + 聊天框：`Esc` 关闭聊天，`Ctrl+Shift+X` 切换，角色系统提示词已连接，对话持久化。YiPett 的完整功能集不在范围内。

### 2026-07-28 — 技术栈迁移

- React 15 + Bootstrap → **React 18.3 + Ant Design 5.21**。ESLint → **Biome 2.5**。文档已更新匹配。

### 2026-07-28 — 聊天开发模式 jsxDEV 不匹配

- 开发模式 React 插件 + 生产环境 `NODE_ENV` define = `jsxDEV is not a function`。聊天打包开发脚本现在运行 `--mode production`。

### 2026-08-05 — KnowledgePreviewDialog（文件预览模态框）

- **`src/chat/types.ts`**：`ChatState` 增加了 `knowledgePreviewVisible`、`knowledgePreviewPath`、`knowledgePreviewData: KnowledgeReadResponse | null`、`knowledgePreviewLoading`。
- **`src/chat/controller.ts`**：新增异步操作 `openKnowledgePreview(path)`（调用 `KnowledgeService.read`，设置状态）、`closeKnowledgePreview()`。
- **`src/chat/components/KnowledgePreviewDialog/KnowledgePreviewDialog.tsx` + `.css`**：模态框渲染文件的 markdown 内容（复用 `renderMarkdown`）+ frontmatter 元数据条（status / lifecycle / review_cycle / tacit / type / category + tags）+ 可点击的 `related` 链接，重新打开链接文件的预览。Esc 关闭。镜像 YiVad 的 `KnowledgePreviewDialog.vue`。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：叶子节点渲染自定义 `titleRender`，捕获 `dblclick` 打开预览；单击仍设置 `ragScope`。文件夹节点不受影响（仅展开）。
- **`src/chat/components/ChatWindow/ChatWindow.tsx`**：模态框挂载在根节点，始终渲染（控制器控制可见性）。

### 2026-08-05 — 侧边栏中的知识树浏览器

- **`src/chat/types.ts`**：`ChatState` 增加了 `sidebarView: 'sessions' | 'knowledge'`、`knowledgeTree: KnowledgeTreeNode[]`、`knowledgeLoading: boolean`、`knowledgeError: string`。
- **`src/chat/controller.ts`**：新增操作 `setSidebarView(view)`、`loadKnowledgeTree(category?)`、`setRagScopeFromNode(path)`、`clearRagScope()` 和 `knowledgeTreeData()`（flat `KnowledgeTreeNode[]` → antd `TreeDataNode[]`）。切换到知识标签页在首次加载时触发扫描。
- **`src/chat/components/ChatSidebar/ChatSidebar.tsx`**：顶部的标签切换 — Conversations / Knowledge。知识标签页显示扫描的树（antd `Tree`，`showLine`），每个节点点击调用 `setRagScopeFromNode(path)`，将路径写入 `state.ragScope` 并通过树顶部的药丸指示器显示。"Clear"按钮重置范围；重新加载图标重新扫描。批量栏仅在会话视图下显示。
- 与工具栏的 `BookOutlined` 切换一起，形成闭环：选择知识节点 → 开启知识库 → 提问 → 答案仅基于该范围。

### 2026-08-05 — 在 MessageBubble 中渲染 RAG 来源

- **`src/chat/components/MessageBubble/MessageBubble.tsx`**：在最新的宠物消息下方，当 `knowledgeGrounded` 为 ON 且 `state.ragSources` 非空时，渲染"Sources"列表 — 每个来源的路径（等宽字体，省略）+ 数值分数。使用新的 `FileSearchOutlined` 图标。绑定到 `index === totalMessages - 1`，因此不会显示在较旧的宠物消息下方。
- **`src/chat/components/MessageBubble/MessageBubble.css`**：添加了 `.mb-sources` / `__title` / `__list` / `__item` / `__path` / `__score` 样式。
- 来源在每次 `_runStream` 调用开始时清除，因此它们仅属于正在进行/刚刚完成的基于知识库的轮次。

### 2026-08-05 — Knowledge + RAG 接入聊天

**API 层**（services + types + endpoints）：见上方 2026-08-05 条目。

**控制器 + UI 接线**：

- **`src/chat/types.ts`**：`ChatState` 增加了 `knowledgeGrounded: boolean`、`ragScope: string`、`ragSources: RagSource[]`。
- **`src/chat/controller.ts`**：构造函数现在接收 `KnowledgeService` + `RagService`。新增操作 `toggleKnowledgeGrounded`、`setRagScope`、`clearRagSources`。`_runStream` 分支：当 `knowledgeGrounded` 开启时，调用 `RagService.streamChat({messages, scope})` 而非 `ChatService.streamWithCallback`，并通过 `onSources` 回调将返回的来源展示到 `state.ragSources`。切换开关 + 范围持久化到 `chrome.storage.local`（`knowledgeGrounded`、`ragScope`）。
- **`src/chat/index.tsx`**：`ChatController` 使用 `api.knowledge` + `api.rag` 构造。
- **`src/chat/components/ChatToolbar/ChatToolbar.tsx`**：新增 `BookOutlined` 切换按钮。当 ON 时，按钮渲染为实心主色状态；tooltip 反映当前状态。
- **来源渲染**：尚未在消息气泡 UI 中展示 — `state.ragSources` 已填充但未显示。下一迭代：在最新宠物消息下方渲染来源。

### 2026-08-05 — Knowledge + RAG services 已落地（仅 API 层）

- **`src/api/endpoints.ts`**：添加了 `KNOWLEDGE`（`/knowledge-scan`、`/knowledge-read`、`/knowledge-stories`、`/knowledge-story-read`、`/knowledge-sync`、`/knowledge-write`）和 `RAG`（`/rag-query`、`/rag-status`、`/rag-build`、`/rag-categories`、`/rag-chat`、`/rag-file-query`、`/rag-file-chat`）路径组。
- **`src/api/types.ts`**：添加了 `KnowledgeTreeNode` / `KnowledgeScanResponse` / `KnowledgeReadResponse` / `KnowledgeStory` / `KnowledgeStoriesResponse` / `KnowledgeSyncResponse` / `KnowledgeWriteResponse` 和 `RagSource` / `RagQueryResponse` / `RagStatusResponse` / `RagBuildResponse` / `RagCategoriesResponse` / `RagChatPayload` / `RagFileChatPayload` / `RagFileQueryResponse`。
- **`src/api/services/knowledge.ts`**：`KnowledgeService` — scan / read / listStories / readStory / sync / write。通过共享的 `ApiClient` 直接 REST（与其他所有服务相同的 X-Token 认证路径）。
- **`src/api/services/rag.ts`**：`RagService` — query / status / build / categories / fileQuery / streamChat / streamFileChat。SSE 流式传输复用 `client.stream`，因此 abort + 信封解包共享现有路径。
- **`src/api/services/index.ts` + `src/api/index.ts`**：`KnowledgeService` 和 `RagService` 添加到 `ApiServices` 和桶导出。
- **下一步（尚未接线）**：聊天控制器 + UI 需要知识库切换开关和调用 `RagService.streamChat` 而非 `ChatService.streamWithCallback` 的 `sendGroundedAsk` 操作。Services 已就绪；仅控制器 + UI 待完成。

### 2026-07-31 — 后端 RAG/知识能力（尚未接入 YiPet）

- YiAi 后端现在暴露 `/rag`（查询 + 聊天 + 文件级变体）和 `/knowledge`（扫描 / 读取 / 写入 / 元数据 CRUD）端点。YiPet 的 `ApiClient` 已支持 SSE 流式传输；每个服务的包装器已于 2026-08-05 添加（见上方）。控制器/UI 接线仍在进行中。

## 指引

| 要做这个 | 看这里 |
|------------|-----------|
| [docs/specs/](./docs/specs/) | 架构规范 + 模式模板（API 层、组件、双世界、聊天） |
| [docs/workflows/](./docs/workflows/) | 任务工作流（添加聊天功能、API 服务、UI 组件） |
| 了解整体架构 | [CLAUDE.md](./CLAUDE.md)（本文件） |
| 构建和类型检查项目 | `npm run build`、`npm run typecheck` — 见 [package.json](./package.json) |
| 运行单元测试 | `npm test` — 见 [vitest.config.ts](./vitest.config.ts) |
| 代码检查 / 格式化 | `npm run lint`、`npm run format` — 见 [biome.json](./biome.json) |
| 了解 Rsbuild 多入口设置 | [rsbuild.config.ts](./rsbuild.config.ts)、[rsbuild.config.chat.ts](./rsbuild.config.chat.ts)、[rsbuild.config.cdn.ts](./rsbuild.config.cdn.ts)、[rsbuild.config.bootstrap.ts](./rsbuild.config.bootstrap.ts) |
| 了解内容脚本双世界注入 | [src/content/bootstrap.ts](./src/content/bootstrap.ts) + [src/content/ipc/](./src/content/ipc/) |
| 了解 CDN 资源目录 | [src/content/cdn/catalog.ts](./src/content/cdn/catalog.ts) |
| 了解 CDN 注入机制 | [src/content/cdn/injector.ts](./src/content/cdn/injector.ts) |
| 了解宠物渲染覆盖层 | [src/content/rendering/overlay.ts](./src/content/rendering/overlay.ts) |
| 修改默认配置 | [src/config/defaults.ts](./src/config/defaults.ts) |
| 修改环境感知配置 | [src/config/config.ts](./src/config/config.ts) |
| 修改弹窗 UI（状态、操作、生命周期） | [src/popup/App.tsx](./src/popup/App.tsx) |
| 修改弹窗入口点 | [src/popup/index.tsx](./src/popup/index.tsx) |
| 添加/修改弹窗组件 | [src/popup/components/](./src/popup/components/) |
| 了解服务层（Chrome API、连接） | [src/popup/services/](./src/popup/services/) |
| 添加/修改 i18n 字符串 | [public/_locales/en/messages.json](./public/_locales/en/messages.json) + [src/shared/i18n/index.ts](./src/shared/i18n/index.ts) |
| 了解语言检测 | [src/shared/i18n/locale.ts](./src/shared/i18n/locale.ts) |
| 了解时区处理 | [src/shared/i18n/timezone.ts](./src/shared/i18n/timezone.ts) |
| 了解日期时间格式化 | [src/utils/datetime.ts](./src/utils/datetime.ts) |
| 了解 IPC 消息类型 | [src/shared/ipc/messages.ts](./src/shared/ipc/messages.ts) |
| 了解 Chrome 存储辅助函数 | [src/shared/state.ts](./src/shared/state.ts) |
| 了解聊天组件 | [src/chat/components/](./src/chat/components/) |
| 了解聊天控制器 | [src/chat/controller.ts](./src/chat/controller.ts) |
| 调用 YiAi 后端 API | [src/api/services/](./src/api/services/) — 使用 `createApiServices(config)`。客户端包装 `public/cdn/utils/api-client.ts` 并注入日志。 |
| 了解 API 客户端（基础：fetch、重试、错误提取） | [public/cdn/utils/api-client.ts](./public/cdn/utils/api-client.ts) |
| 了解 API 客户端（扩展：日志 + SSE 流式传输） | [src/api/client.ts](./src/api/client.ts) |
| 了解 API 端点路径 | [src/api/endpoints.ts](./src/api/endpoints.ts) |
| 了解 API 请求/响应形状 | [src/api/types.ts](./src/api/types.ts) |
| 修改设计变量 | [public/cdn/styles/variables.css](./public/cdn/styles/variables.css) |
| 了解扩展权限和入口 | [manifest.json](./manifest.json) |
| 添加新的 CDN 资源 | [src/content/cdn/catalog.ts](./src/content/cdn/catalog.ts)（CDN_CATALOG 数组） |
| 了解开发/生产模式配置 | [.env](./.env) + [.env.production](./.env.production) + [src/utils/env.ts](./src/utils/env.ts) |
| 了解共享辅助函数 | [src/utils/](./src/utils/) — datetime、env、log |
| 查找桶导出索引 | [src/utils/index.ts](./src/utils/index.ts) + [src/popup/components/index.ts](./src/popup/components/index.ts) + [src/chat/components/index.ts](./src/chat/components/index.ts) |
| 模块类型声明（*.css、*.png） | [src/typings.d.ts](./src/typings.d.ts) |
| 编辑器设置（缩进、字符集等） | [.editorconfig](./.editorconfig) |
| 架构方向规则 | `../../rules/architecture-direction.md` |