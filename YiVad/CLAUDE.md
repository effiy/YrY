# CLAUDE.md — YiVad

> Vue 3.5 管理后台 — Yi 家族的管理 UI 成员。以 ProTable 为核心驱动，支持四种布局模式，基于后端菜单 API 的动态路由，通过 `v-auth` 实现按钮级权限控制。与 **YiAi**（FastAPI 后端）和 **YiPet**（Chrome MV3 扩展）协同工作。

---

## 目录

- [基本信念](#基本信念)
- [铁律](#铁律)
- [架构方向](#架构方向)
- [项目概况](#项目概况)
- [项目结构](#项目结构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [项目约束](#项目约束)
- [降级对策](#降级对策)
- [自我约束](#自我约束)
- [最近变更](#最近变更)
- [参考指引](#参考指引)

---

## 基本信念

- **信任模型。** Claude 有足够的能力深入理解这个代码库。给它需要的上下文，信任它做出正确的判断。
- **珍惜注意力。** 你写的每一行代码被阅读的次数远多于被编写的次数。为读者而写，而非为作者而写。
- **验证现实。** 运行代码，读取结果。断言胜过自信。最快出错的方式就是跳过验证。
- **先思考再编码。** 明确陈述假设；如果存在多种解释，将其列出；如果有更简单的做法，直接说出来。

## 铁律

- **简单优先。** 不做超出需求的功能；不为一次性代码引入抽象；不为不可能发生的场景做错误处理。如果写了 200 行而 50 行就能搞定，重写它。
- **精准修改。** 不要"顺手优化"相邻代码；匹配现有风格；每一行改动都要追溯到用户的需求。当你的改动产生了孤儿代码（未使用的导入、死变量），清理它们——但不要主动清理既有的死代码，除非明确要求。
- **目标驱动执行。** 将任务转化为可验证的目标；对于多步骤任务，给出简要计划并附上每步的验证检查。强成功标准让你能独立循环推进；弱成功标准则需要不断澄清。

## 架构方向

> **组件化。**
>
> 作为 Vue 3 前端项目，YiVad 沿组件提取轴前进。提取可复用组件、composables 和共享 UI 原语。定义清晰的 props/events API。消除重复的标记代码。

## 项目概况

| 属性 | 值 |
|----------|-------|
| 名称 | YiVad |
| 类型 | 前端 (SPA) |
| 版本 | 1.0.0 |
| 框架 | Vue 3.5 + TypeScript 6 |
| 构建 | Rsbuild 1 |
| 状态管理 | Pinia 4（搭配 `pinia-plugin-persistedstate`）|
| UI | Element Plus 2.14 |
| 图表 | ECharts 6 |
| 路由 | Vue Router 5（hash 模式，动态路由）|
| HTTP | Axios（自定义 `RequestHttp` 封装）|
| i18n | Vue-i18n 11（中文 + 英文）|
| 架构 | 单页 SPA，动态路由 |
| 测试框架 | Vitest + @vue/test-utils + jsdom |
| 代码检查/格式化 | ESLint 10 + Prettier 3 + Stylelint 17，husky 9 + lint-staged 17 |
| 提交 | commitlint 21 + cz-git |
| 运行环境 | 浏览器（Chrome、Edge、Firefox、Safari — 最近 2 个版本）|

## 项目结构

```
src/
├── api/          — HTTP 请求层（Axios 拦截器、取消请求、错误处理）
├── assets/       — 静态资源（字体、图标、图片、mock JSON）
├── components/   — 可复用组件（ProTable、ECharts、Upload、WangEditor 等）
├── config/       — 全局常量（HOME_URL、DEFAULT_PRIMARY、路由白名单）
├── directives/   — 自定义指令（auth、copy、debounce、throttle、draggable、longpress、watermark）
├── enums/        — HTTP 状态码、请求方法、内容类型
├── hooks/        — Composables（useTable、useTheme、useAuthButtons、useSelection 等）
├── languages/    — i18n 配置（中文 + 英文）
├── layouts/      — 多布局系统（vertical、classic、transverse、columns）
├── routers/      — 动态路由，含权限守卫和菜单到路由的映射
├── stores/       — Pinia stores（global、user、auth、tabs、keepAlive、aiChat、knowledge、knowledgeTree、rag、story、bug）
├── styles/       — 全局 SCSS、Element 样式覆盖、主题变量
├── typings/      — 全局 TypeScript 类型声明
├── utils/        — 通用工具（颜色、菜单树操作、localStorage 等）
└── views/        — 按功能域组织的页面组件
```

## 模块边界

### 前端分层（自上而下）

| 层 | 公共 API |
|---|---|
| `src/views/` | 按功能域组织的页面组件。每个页面从 `@/components`、`@/hooks`、`@/stores`、`@/api/modules` 导入。 |
| `src/layouts/` | 四种布局模式（vertical、classic、transverse、columns）— 共享 Header / Menu / Footer / Tabs 组件。不要按布局分别复刻。 |
| `src/components/` | 可复用组件：`ProTable/`、`ECharts/`、`Upload/`、`WangEditor/`、`SearchForm/` 等。ProTable 是标准表格 — 不要使用原始的 `el-table`。 |
| `src/hooks/` | Composables：`useTable`、`useTheme`、`useAuthButtons`、`useSelection` 等。文件名与 composable 同名（如 `useTable.ts`）。 |
| `src/stores/` | Pinia setup-function 语法的 stores。Store 可以从 `@/api/modules` 和 `@/hooks` 导入，但**严禁**直接导入 `axios`。 |
| `src/api/modules/` | 领域服务函数（`sessions.ts`、`chatService.ts`、`dataService.ts`、`fileService.ts`、`faqService.ts`、`weChatService.ts`、`knowledgeService.ts`、`ragService.ts` 等）。面向 stores 和 views 的公共 API 层面。 |
| `src/api/index.ts` | `RequestHttp` 类 — Axios 封装，含拦截器、取消请求、错误映射。模块调用 `http.post(...)`；其他任何地方不得直接导入 axios。 |
| `src/directives/` | `v-auth`、`v-copy`、`v-watermark`、`v-drag`、`v-debounce`、`v-throttle`、`v-longpress`。通过 `src/directives/index.ts` 注册。 |
| `src/routers/` | Hash 模式 Vue Router 5，基于后端菜单 API 的动态路由。守卫在 `src/routers/beforeEach.ts`。 |

### 跨项目协议（YiVad ↔ YiAi）

每次跨项目调用使用的"RPC 信封"：

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <方法特定的结构> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

| 方法 | 契约 |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`。`filter` 字典通过 `_build_filter` 合并到 Mongo 查询中。**请勿使用 `query` — 它会被静默忽略。** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |
| Chat (SSE) | `streamChat({model, messages, system?, images?})` 通过 `services.ai.chat_service.chat` |
| `/read-file`、`/write-file` | 字段名为 **`target_file`**（而非 `path`）；`content`；可选 `is_base64` |
| `/upload-image-to-oss` | `{ data_url, filename, directory }` |
| `/delete-file`、`/delete-folder`、`/rename-file`、`/rename-folder` | `target_file` / `target_dir` / `old_path`+`new_path` / `old_dir`+`new_dir` |
| `/knowledge/*` | 知识库扫描 / 读取 / 写入 / 元数据 CRUD（MongoDB `knowledge_files` 中的 markdown 树镜像）|
| `/rag/*` | RAG 查询（单次）+ RAG 对话（SSE）+ 按文件变体；`scope` 按 `file_path` 子串过滤 |

## 数据流

### 表格获取（ProTable）

```
View 定义 columns + requestApi
   ▼ requestApi({ pageNum, pageSize, ...filters })
api/modules/<domain>.ts → callService("services.database.data_service",
                                      "query_documents",
                                      { cname, filter, pageNum, pageSize })
   ▼ http.post("", {module_name, method_name, parameters})
RequestHttp 拦截器：附加 X-Token，转换响应，出错时 checkStatus
   ▼ fetch POST http://localhost:10086/
YiAi data_service.query_documents → repository.query_documents
   ▼ _build_filter(query_params) → MongoDB find().sort().skip().limit()
   ▼ { list: [...], total, pageNum, pageSize, totalPages }
ProTable 接收 { list, total } → 渲染行 + Pagination
```

### 对话（SSE 流式）

```
aiChat store — sendMessage / regenerateMessageAt / resendMessageAt
   ▼ streamChat(payload, onChunk, onDone, onError)
fetch POST /  body: {module_name: "services.ai.chat_service",
                     method_name: "chat",
                     parameters: {model, messages, stream: true, system?, images?}}
                     signal: AbortController
   ▼
YiAi FastAPI → StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
streamChat 逐行解析 SSE → onChunk(text) / onDone() / onError(err)
   ▼
Store 将增量追加到进行中的 pet 消息；中止时标记 aborted=true
   on done: upsertSession(...) + autoForwardToWeCom(streamed) [中止时跳过]
```

### 文件读写

```
View → fileService.readFile(path)
   ▼ fetch POST /read-file  body: { target_file: path }
   ▼ YiAi read_file → 磁盘（主）+ MongoDB（回退）→ { content }
View → fileService.writeFile(path, content)
   ▼ fetch POST /write-file  body: { target_file: path, content }
   ▼ YiAi write_file → 磁盘 + MongoDB upsert → 成功
```

## 项目约束

### 不可妥协的基线

- TypeScript 严格模式（`tsconfig.json`）— `vue-tsc --noEmit` 必须通过。
- ESLint 10 + Prettier 3 + Stylelint 17 预提交钩子（通过 husky 9 + lint-staged 17）。
- Conventional Commits 由 commitlint 21 + cz-git 强制执行。
- 所有 API 调用必须通过 `src/api/index.ts` 的 `RequestHttp` 类 — 不得直接调用原始 `axios`。
- 按钮权限通过 `v-auth` 指令检查 — 不得内联 `v-if` 基于权限控制。
- 动态路由从后端菜单 API 加载（回退到 `authMenuList.json`）。
- 页面组件使用 `<script setup lang="ts">` — 不得使用 Options API。

### 编码规范

| 领域 | 规范 |
|---|---|
| 组件风格 | `<script setup lang="ts">` + Composition API |
| Props / Emits | `defineProps<{...}>()` 和 `defineEmits<{...}>()` 使用类型泛型 |
| 状态 | Pinia 使用 setup-function 语法（`defineStore(() => {...})`）|
| 样式 | 作用域 SCSS，变量来自 `src/styles/`，除动态值外不使用内联样式 |
| Element Plus | `el-` 前缀，遵循 Element Plus 2.14 API |
| 路径导入 | 跨模块导入使用 `@/` 别名，同级文件使用相对路径 |
| 命名 | 组件 PascalCase，composables camelCase，CSS 类 kebab-case |
| 环境变量 | 前缀 `RSBUILD_ENV_*`（自 Vite 迁移至 Rsbuild 后）|

## 降级对策

| 条件 | 措施 |
|-----------|--------|
| 菜单 API 不可用 | 回退到 `src/assets/json/authMenuList.json` |
| Token 过期 | 401 拦截器重定向到登录页，清除 user/auth stores |
| 构建/类型检查失败 | `vue-tsc --noEmit` 阻断 `pnpm build:*`；提交钩子在 lint 错误时阻断 |
| 测试/类型检查失败 | `vue-tsc --noEmit` 阻断 `pnpm build:*`；CI 中运行 `vitest run`；提交钩子在 lint 错误时阻断 |
| 浏览器不支持 (IE) | 构建仅面向现代浏览器；ES module 输出 |
| SSE 流中止 | Pet 消息标记 `aborted=true`；持久化写入部分内容；跳过自动转发到 WeCom（参见 `aiChat.ts` 修复）|

## 自我约束

- **ProTable 是标准表格模式** — 新的表格页面必须使用它；不要直接使用原始 `el-table`。
- **新的 composables 放在 `src/hooks/`**，新的指令在 `src/directives/modules/` — 通过中心的 `index.ts` 注册。
- **布局模式共享 Header / Menu / Footer / Tabs 组件集** — 不要按布局分别复刻。
- **禁止 Options API** — 仅使用 `<script setup>`；使用 `ref` / `reactive` 定义状态，而非 `data()`。
- **Store 不得导入 axios** — 它们调用 `@/api/modules/*` 函数，这些函数进而调用 `@/api/index.ts` 中的 `http.post(...)`。
- **`filter`（而非 `query`）和 `target_file`（而非 `path`）** — 这两个字段名曾是过去 bug 的根源。调用 YiAi 时始终使用契约名称。
- **SSE `onDone` 在自动转发到外部渠道（WeCom）之前必须检查 `!aborted && !error`** — 参见 `src/stores/modules/aiChat.ts` 2026-07-28 修复。（早期对 `aicr/chat.ts` 的引用已经过时 — 不存在 aicr store。）

## 最近变更

### 2026-08-24 — 跨页面导航和流水线闭环

- **`src/components/EntityBreadcrumb/EntityBreadcrumb.vue`**（新增）：可复用面包屑组件，展示实体层级（项目 → 周期 → 版本 → 当前）。延迟获取父级名称；渲染可点击的链接，带有实体类型图标。已在 `src/components/index.ts` 中注册。
- **`src/views/cycle/detail.vue`**：面包屑 + 关联版本及进度条（`releaseProgressPct`）。
- **`src/views/release/detail.vue`**：面包屑 + 贡献周期及进度条（`releaseCycleProgressPct`）。
- **`src/views/issue/detail.vue`**：面包屑（项目 → 周期 → 版本 → 问题）。
- **`src/views/bug/detail.vue`**：面包屑（项目 → Bug）。
- **`src/views/module/detail.vue`**：面包屑（项目 → 模块）。
- **`src/views/project/detail.vue`**：交付流水线区域 — 5 阶段可视化流程（需求 → 活跃周期 → 进行中 → 待发布 → 已发布），每个阶段可点击。
- **`src/views/issue/index.vue`**：卡片视图在元数据行下方显示跨实体关联标签（项目/周期/版本）。
- **`src/views/kanban/index.vue`**：卡片显示项目/版本关联标签。添加了 `projectName`、`releaseName`、`goProject`、`goRelease` 辅助函数；`loadNames()`。

### 2026-08-08 — 队列中的 `/followup` 消息反映在对话记录中（pi Agent.followUp）

- **`src/stores/modules/aiChat.ts`** `sendMessage` `/followup` 分支：成功排队的 follow-up 现在作为 **`followup` 类型气泡**追加到对话中 — 用户的延迟意图在对话记录中保持可见，而非仅存在于瞬时的 toast 中（与 auto-steer 路径不一致，后者将其消息反映为气泡）。专用类型确保它**不会进入请求历史**（`runStream` 的 `aiMessages` 过滤器仅传递 `user` / 非空 `pet`），因此已被循环消费的 follow-up 不会在后续运行中再次发送 — 这会重新执行已完成的任务。符合 pi 的 `Agent.followUp` 语义：消息等待直到 agent 即将停止，然后触发新一轮。
- **`src/views/aiChat/components/MessageBubble.vue`**：`followup` 气泡在**用户侧**渲染（`isUser` 包含它们），带有独特的 "⏱ Follow-up 已排队 — agent 完成后执行" 标记（`isFollowUp`），使排队指令显示为延迟而非已执行。导入中添加了 `Clock` 图标；添加了 `.mb-followup-tag` 样式。
- **`src/api/interface/yiweb.ts`**：`ChatMessage.type` 联合类型增加 `"followup"`。对话记录/导出标签（`aiChat.ts` markdown + HTML，`MessageBubble.vue` 分支记录）将其映射为 "Follow-up（已排队）" 而非通用的 "AI"。
- 类型检查：0 个新错误（18 个既有错误，均在无关文件中）。气泡反映的后端排空已由 `/tmp/test_followup_drain.py` 验证（确定性：外部 `/agent/follow-up` 存储在第一个无工具边界处排空，并作为新一轮执行 — 4 次 LLM 调用，2 次确认，2 次 `db_create` 执行，存储为空）以及线上 `/tmp/e2e_followup.py`（qwen3-coder：follow-up 在 `agent_start` 时排队，主 follow-up 和后续菜单均已确认并创建，`stop=completed`；第二次运行遇到了已知的仅侦察停滞问题，模型从未提议写入 — 与 follow-up 无关）。

### 2026-08-08 — 跳过的工具调用在 agent 时间线中显示（拒绝/超时/阻止）

- **`src/stores/modules/aiChat.ts`** `tool_execution_end` 处理程序：当结束的工具与待确认的工具匹配时，立即清除 `pendingConfirmation`。当后端呈现工具结束时确认即已解决 — 无论它是执行了还是被跳过（拒绝/超时/自动阻止）。在此之前，超时确认的横幅会持续存在直到 120 秒的前端自动拒绝计时器，点击它是对已解决 id 的无操作。补充了后端变更（参见 `YiAi/CLAUDE.md`），其中跳过的受确认门控调用现在会发出 `tool_execution_start`+`tool_execution_end` 对并附带错误 — 因此用户可以在每轮工具时间线中看到写入未执行的原因（与现有的 length-stop 行为一致）。类型检查：0 个新错误（18 个既有错误，均在无关文件中）。

### 2026-08-08 — 仅对真正的延续恢复（pi 持久化循环）

- **`src/utils/continuation.ts`**（新增，纯函数/无依赖）：`isContinuationMessage(text)` 判断聊天消息是继续上一次运行（`继续`/`继续完成`/`接着来`/`continue`/`go on`/`keep going`/`接着`… 加上 `继续`/`接着`/`continue` 前缀）还是开启新任务。与 `YiAi/src/domain/ai/agent.py::_is_continuation` 完全保持一致，确保前端和后端对 `max_turns` 后的消息分类相同（一致性是关键）。单元测试 21/21 通过（13 个延续-true + 8 个新任务-false + 1 个边界一致性案例），通过 `tsc` 编译并在 node 中断言。
- **`src/stores/modules/aiChat.ts`** `runStream`：按会话恢复现在受**真正的延续**条件约束。当上一次运行达到 `max_turns` 时，仅对 `继续` 类消息发送 `resume: true`（仅发送用户的延续内容；服务器恢复已持久化的忠实轨迹）；**在 max_turns 之后发送的新任务作为全新运行**（`resume: false`，完整历史）— 这是已知的可靠路径。在此之前，任何下一次发送都会恢复，而后端的 `[RESUME]` 合并注入了为 `继续` 设计的 "db_* 请勿重复执行" 交接提示，告诉模型跳过新任务所需的写入操作（观察到：在 max_turns 之后的新 "create" 从未运行其 `db_create`）。使用 `lastUserMsg`（已在 `runStream` 作用域中）作为要分类的消息 — `content` 存在于 `sendMessage` 而非 `runStream`。类型检查：0 个新错误（18 个既有错误，均在无关文件中）。
- **线上验证**（`/tmp/e2e_resume.py`，qwen3-coder）：运行 1（`max_turns=2`）在会话 id 下持久化了轨迹；运行 2 使用相同会话的 `messages:[{user:"继续"}], resume:true` 恢复了它并完成了完整生命周期 — `db_update` + `db_delete`，**无 `db_create` 重新运行**（该修复防止的重复），`stop=completed`。无残留探测菜单（0 个 `/e2e-` 路径）。

### 2026-08-08 — 对话确认应答（pi 自然语言权限）

- **`src/utils/confirmationAnswer.ts`**（新增，纯函数/无依赖）：`confirmationAnswerFor(text)` 将纯文本聊天消息分类为确认应答 — `{ action: "approve" | "reject", bare: boolean } | null`。肯定关键词（`可以/好/行/同意/批准/确认/yes/ok/…`）→ 批准；拒绝关键词（`不要/不行/取消/拒绝/不/no/stop/…`）→ 拒绝；多词短语前缀（`go ahead`、`好的`、`不要删除`…）→ 相同操作但 `bare:false`（携带修正）。精确关键词 = `bare:true`（无修正）。空/模糊/`now`/`not`/任务文本 → `null`（回退到引导）。单元测试 51/51 通过，通过 `tsc` 编译模块并在 node 中断言。
- **`src/stores/modules/aiChat.ts`** `sendMessage`：当有待确认时，纯文本聊天消息应答它，而不仅仅是引导 — **`可以`/`yes` 批准待处理的写入，`不要`/`no` 拒绝它，无需鼠标**。带额外文本的拒绝（`bare:false`，例如 "不要删除，改成更新 title"）还会将整个消息引导到运行中的循环中，使模型听到修正，而不仅仅是拒绝。此前用户必须点击横幅按钮；输入 "可以" 仅仅排队了一个引导，循环只在 120 秒等待超时后才读取。斜杠命令、图片和非应答文本保持原有行为（自动引导）。
- **`src/views/aiChat/components/MessageList.vue`**：确认横幅现在提示了聊天功能 — "或直接在输入框回复 — 可以/好/yes 批准，不要/取消/no 拒绝"。类型检查：0 个新错误（18 个既有错误，均在无关文件中）。
- **线上验证**（`/tmp/e2e_confirmation_chat.py`，qwen3-coder）：精确的前端序列 — 当第一个 `db_create` 确认待处理时，在聊天中回复拒绝（`POST /agent/confirm approve:false`），然后引导一个只读替代方案（`POST /agent/steer "不要创建菜单 /x，改为执行一次 db_list"`）。结果：`confirm_count=1`（拒绝的写入从未被重新提示 — 拒绝记忆保持），`created=False`（从未执行），`list_done=True`（引导的替代方案实际执行了），`stop=completed`。无残留探测菜单（68 个文档，0 个 `/e2e-` 路径）。

### 2026-08-08 — 将纯文本消息自动引导到运行中的 agent（pi Agent.steer）

- **`src/stores/modules/aiChat.ts`** `sendMessage`：当 agent 循环正在运行时（`sending && agentMode`），**纯文本聊天消息不再被静默丢弃** — 它现在通过 `POST /agent/steer` 引导运行中的循环（旧的守卫 `if (sending.value) return;` 丢弃了每条运行中的消息，因此用户在纠正任务时（"实际上用 X 替代"）的话会丢失）。引导的消息以用户气泡形式反映在对话中（使修正确认可见），并以 toast 确认。斜杠命令仍然不受影响地通过丢弃守卫（`/steer`、`/followup`、`/stop` 等）。运行中的图片保持旧的丢弃行为（引导仅限文本）。
- **`src/views/aiChat/components/ChatInput.vue`**：agent 模式占位符现在显示 "Agent 运行中 — 输入文本引导它，或 /followup <msg> 在完成后排队执行"，而非将能力隐藏在 `/steer <msg>` 语法背后。
- 补充了后端变更（即时引导排空 + 检查点延迟 — 参见 `YiAi/CLAUDE.md`）。类型检查：0 个新错误（18 个既有错误，均在无关文件中）。

### 2026-08-08 — 实时 agent 轮次进度指示器（用户看到预算）

- **`src/stores/modules/aiChat.ts`**：新增 `agentTurnProgress` 计算属性 — `{ current, max, active, nearLimit }` — 从响应式的 `agentTurnSummaries`（最后 `turnIndex`）、`agentMaxTurns`（用户可配置）和 `streamingPhase` 派生。`active` = agent 正在运行中（`thinking`/`streaming`/`retrieving`）；`nearLimit` = 距 `max_turns` 在 2 轮以内。在 store 返回中暴露。
- **`src/views/aiChat/components/MessageBubble.vue`**：当 agent 运行时，每轮时间线上方显示紧凑的一行 `Agent 运行中 · 第 X / N 轮`，附带 `el-progress` 进度条；当 `nearLimit` 时变为警告色，使用户看到 agent 接近轮次上限，可以回复 继续（或引导）而非等待 `max_turns_reached` 停止。补充了后端预算感知（模型知道其预算；现在用户也能实时看到）。类型检查：0 个新错误（18 个既有错误，均在无关文件中）。

### 2026-08-08 — 按会话恢复继续（pi 持久化循环）

- **`src/stores/modules/aiChat.ts`**：在 `agent_end` 且 `stop_reason=max_turns_reached` 之后，同一会话中的下一次发送不再重新发送完整历史 — 它仅发送**用户的延续内容**并附带 `resume: true`。后端恢复已持久化的忠实轨迹（包括 `tool_result` 消息），因此模型看到真实完成的调用并继续执行，而非重做它们。此前恢复时重新发送了纯文本叙述，模型重新运行了已完成的写入（实测 3/3 次恢复运行重新创建了 `db_create` 已经创建的菜单；现在 8/8 次恢复运行完成完整生命周期，零重复）。`lastAgentInterrupt`（在 `max_turns_reached` 的 agent_end 设置）标记会话；`resumeMessages` = 仅末尾用户消息，一次性清除。
- **`src/api/modules/agentService.ts`**：`AgentChatPayload.resume?: boolean` → 在 `/agent/chat` 请求体中作为 `resume: true` 转发。

### 2026-08-08 — 未完成任务提示（max_turns_reached）

- **`src/stores/modules/aiChat.ts`** + **`src/views/aiChat/components/KnowledgeChatPanel.vue`**：后端现在将 `agent_end` `stop_reason="max_turns_reached"`（循环在任务中途耗尽轮次）与 `"completed"` 区分开来 — 此前两者都是 "completed"，因此未完成的任务看起来像已完成。两个对话界面都追加 `> ⚠️ 已达到最大轮次，任务可能未完成。回复「继续」可接着完成。`，使用户知道回复 继续，循环从累积的历史中恢复。

### 2026-08-08 — aiChat agent model_switch 提示（主面板）

- **`src/stores/modules/aiChat.ts`**：在 agent `onEvent` switch 中添加了缺失的 `model_switch` 分支（与 `KnowledgeChatPanel` 保持一致）。当后端在任务中途升级（停滞模型 → 更强的回退），主聊天面板现在追加 `> ⚙️ 模型自动切换：from → to` 到流式 pet 消息中，而非对交接保持沉默。升级是循环恢复以完成具体任务的方式；现在恢复在主对话界面中可见。
- **`src/views/aiChat/components/AgentEventsPanel.vue`**：将 `events` prop 的 `message` 字段扩展为 `{ role, content } | { from, to }` — 修复了因更早的 `AgentStreamEvent.message` 扩展（`model_switch` 的 `{from,to}` 载荷不符合面板的局部类型）导致的既有 TS 错误。验证 `pnpm type:check` — agent 相关文件零错误（18 个既有错误仅存在于无关的 dashboard/proTable/rag 视图中）。

### 2026-08-08 — aiChat agent 工具确认 UI

- **`src/views/aiChat/components/MessageList.vue`**：工具确认横幅，带有**批准/拒绝**按钮（取代旧的"为安全跳过"死胡同）。渲染待处理工具名称和参数；120 秒后自动拒绝，与后端等待超时匹配。
- **`src/stores/modules/aiChat.ts`**：`pendingConfirmation` 现在携带 `confirmationId`；添加了 `approvePendingConfirmation()` / `rejectPendingConfirmation()` 操作，使用活跃对话密钥调用 `confirmAgentTool`；`confirmation_required` 处理程序捕获 `event.confirmation_id`。Agent 模式 `system_prompt` 省略了前端的 `getToolsForSystemPrompt()` 块（它与后端的 `<tool_call>` 循环矛盾）。添加了 `tool_execution_start` / `tool_execution_end` 处理程序：start 将 `(running)` 条目推入当前轮次的 toolCalls 中（AgentTimeline 渲染 Loading 旋转器），end 填充最终内容/错误 — 完成 Pi 的实时工具生命周期，使时间线在工具执行时即显示，而非仅在 `turn_end` 时（这也解锁了既有的 `tool_execution_update` 部分进度处理程序，此前它永远无法匹配调用，因为 toolCalls 在轮次结束前为空）。
- **`src/api/modules/agentService.ts`**：添加了 `confirmAgentTool(sessionId, confirmationId, approve)` → `POST /agent/confirm`；`AgentStreamEvent` 增加 `confirmation_id`/`tool_name`/`tool_args`。

由 `YiAi` 的通用数据工具（`db_list`/`db_schema`/`db_create`/`db_update`/`db_delete` — agent 通过 `db_schema` 对 `menus` 集合进行推理，而非菜单特定代码）+ 原生 Ollama 工具调用支持 — 参见 `YiAi/CLAUDE.md` 和 `YiKnowledge/engineer/projects/yivad/manage-menu-catalog.md` → "Agent chat data tools (aiChat)"。

- **`src/views/aiChat/components/KnowledgeChatPanel.vue`**：知识文件预览弹窗的聊天模块现在端到端支持 **agent 模式**（Pi 启发），因此之前失效的 Agent 切换开关现在实际工作。`ChatToolbar` Agent 控件完全接线（`agentMode` + 最大轮次 + system-prompt + 模型轮换，按文件持久化）。当 agent 模式开启时，`send()` 通过 `streamAgentChat` 路由到 `/agent/chat`（优先于 RAG），处理轮次/工具生命周期事件：多轮次 `---` 分隔符，实时 `tool_execution_start`/`end` 标签渲染在 pet 消息上（可展开的工具结果），以及输入框上方的 `confirmation_required` 横幅，带有**批准/拒绝**按钮，调用 `confirmAgentTool` 针对稳定的按文件 `kchat:{path}` 会话 id。这使用户能够直接从文件预览聊天完成具体任务 — 例如通过通用 `db_*` 数据工具对 `menus` 集合进行菜单目录 CRUD。还处理后端的 `model_switch` 事件（Pi 启发的升级 — 活跃模型停滞，因此循环交接给更强的模型）：在流式消息中显示 `> ⚙️ 模型自动切换：from → to`。
- **`src/api/modules/agentService.ts`**：`AgentStreamEvent.message` 扩展为 `{role,content} | {from,to}` 以支持 `model_switch` 事件；`AgentChatPayload` 增加可选的 `model_fallback`（停滞时升级到的有序回退模型列表 — 省略 ⇒ 服务器默认，`[]` ⇒ 禁用）。

### 2026-08-05 — KnowledgeMetaStrip 用户体验改进

- **`src/components/KnowledgeMetaStrip.vue`**：在 `KnowledgePreviewDialog` 和 Story Board 抽屉中展示的 frontmatter 条上的两个用户体验修复：
  - **字符串 `tacit` 渲染** — 1573 个知识文件使用 `tacit:` 作为字符串声明（例如，"Brand Architecture is more than a logo; it is a contract..."），而非布尔值。此前该条仅渲染 `tacit === true`（布尔值），隐藏了这些声明。现在字符串值渲染为警告色调的提示框（左边框 + 背景 + 3 行截断），位于标签行上方；布尔 `true` 仍然渲染为 "tacit: yes" 警告标签。
  - **外部 `related` 链接** — 带有 `http(s):` / `mailto:` / `tel:` 协议的 `related:` 条目此前渲染为不可点击的标签（点击无效果）。现在它们通过 `window.open(href, "_blank", "noopener,noreferrer")` 在新浏览器标签页中打开；内部相对路径仍通过父级的 `navigate-related` 事件导航。
- **`src/api/interface/yiweb.ts:411`**：将 `KnowledgeMeta.tacit` 从 `boolean` 扩展为 `boolean | string` 以匹配实际数据形状。

### 2026-07-31 — Knowledge + RAG api 模块

- **`src/api/modules/`**：添加了 `knowledgeService.ts`（扫描/读取/写入/故事）和 `ragService.ts`（RAG 对话使用现有的 SSE 解析器）。后端路由位于 `YiAi/src/server/routes/knowledge.py` 和 `rag.py`。
- **`src/stores/modules/`**：添加了 `knowledge.ts`、`knowledgeTree.ts`、`story.ts` Pinia stores，支持 aiChat 知识功能。`story.ts` 暴露 `storyMarkdown`（KnowledgeReadResponse）+ `loadStoryMarkdown(story)` 操作，从 `openDetail` 调用。
- **`src/views/aiChat/components/KnowledgePreviewDialog.vue`**：知识详情对话框 — 渲染 markdown 正文 +（自 2026-08-05 起）展示 `status / lifecycle / review_cycle / tacit / type / roles / tags` 和可点击 `related` 链接的 frontmatter 条。
- **`src/views/story/index.vue`**：Story Board 列表 + 详情抽屉。自 2026-08-05 起，Overview 标签页渲染 `store.storyMarkdown`（markdown 正文 + frontmatter 元数据条）— 此前 store 已加载但视图未展示。
- **不存在独立的 `/knowledge/*`、`/aicr/*` 或 `/bug/*` 路由或页面** — 早期会话中声称的"知识叶子视图文件夹"+"KnowledgeLeafList/Detail"+`src/views/{knowledge,aicr,bug}/`+`KnowledgeTree.vue`+`useAicrKnowledgeStore` 从未落地到 master。stores 和 api 模块仅支持 aiChat 功能。

### 2026-07-30 — 侧边栏对齐 + RSS → YiKnowledge 卸载

- **侧边栏对齐**：ChatSidebar + ConversationSidebar + ConversationSessionSidebar（均在 `src/views/aiChat/components/` 下）对齐到 FileTree 风格基线 — 收藏 + 批量操作 + 悬停操作行 + 内联重命名。（早期会话中声称的 `ConversationSidebar (aicr)` + `FileTree (aicr)` 已过时 — 不存在 aicr 页面树。）
- **RSS 卸载**：RSS 正文内容移至 `YiKnowledge/{category}` 下的 YiKnowledge markdown；MongoDB 现在仅存储元数据（`category_path` + `file_path`）。

### 2026-07-28 — Bug 修复

- **`src/api/modules/fileService.ts`**：`readFile` 和 `writeFile` 发送的是 `{ path }`，但 YiAi 的 `/read-file` / `/write-file` 端点要求 `target_file`（Pydantic `FileReadRequest` / `FileWriteRequest`）。每次调用都会 422。已修复两者，发送 `{ target_file: path, content }`。
- **`src/stores/modules/aiChat.ts`**：在 SSE `onDone` 时，store 现在在调用 `autoForwardToRobots(streamed)` 之前检查 `!lastPet?.aborted && !lastPet?.error`。此前，如果用户在中途中止，部分内容仍会自动转发到 WeCom 机器人。（早期对 `aicr/chat.ts` 的引用已过时 — 此守卫位于 aiChat store 中，而非 aicr。）

### 2026-07-28 — Vite → Rsbuild 迁移

- 从 Vite 8 迁移到 **Rsbuild 1**。环境变量前缀现为 `RSBUILD_ENV_*`（不再有 `VITE_` 泄漏）。`svg-sprite` + `views-glob` 自定义插件复现了被移除的 Vite 功能。

### 2026-07-27 — aiChat 移植（来自 YiWeb）

- 移植了 YiWeb 的 `sessionChat` 页面。每条消息操作（重新生成/重试/重新发送/删除/编辑）、`streamingType`、`aborted` 标志、`scrollTick` 节流。修复了 `index.vue` `useResizable` 脚手架 bug。

### 2026-07-27 — aicr 移植（来自 YiWeb）— 已过时

- **声称**：端到端移植了 YiWeb 的 `aicr` 页面：9 个 Pinia stores（`aicr/chat`、`sessions`、`faqs`、`fileTree`、`filters`、`modals`、`models`、`ui`、`weChat`）+ 8 个模态组件 + 卡片/图表视图 + 完整的 `CodeViewer`/`ChatPanel` 对等。构建通过。
- **实际情况（2026-08-04 审计）**：`src/views/aicr/` 和 `src/stores/modules/aicr/` 在 master 上不存在。0 个 aicr 特定提交。该声称从未落地 — 早期会话幻觉。aiChat 移植（如上）是真实的且已交付；aicr 风格的功能已被归入 aiChat 组件（`ConversationSidebar.vue`、`ConversationSessionSidebar.vue`、`KnowledgeChatPanel.vue`、`LlamaIndexPanel.vue` 等），而非独立的 aicr 页面树。

## 参考指引

| 文档 | 用途 |
|----------|---------|
| [docs/specs/](./docs/specs/) | 架构规格 + 模式模板（API、组件、stores、ProTable）|
| [docs/workflows/](./docs/workflows/) | 任务工作流（添加页面、API 调用、stores）|
| [README.md](./README.md) | 项目概述、快速入门、领域语言 |
| [.env](./.env) | 环境变量 |
| [rsbuild.config.ts](./rsbuild.config.ts) | 构建配置 |
| [tsconfig.json](./tsconfig.json) | TypeScript 配置 |
| [src/config/index.ts](./src/config/index.ts) | 应用级常量 |
| [src/api/index.ts](./src/api/index.ts) | RequestHttp 类 — Axios 封装 |
| [src/stores/modules/aiChat.ts](./src/stores/modules/aiChat.ts) | aiChat store — SSE 流式、agent 循环、确认 |
| [YiKnowledge/projects/YiVad/onboarding.md](../YiKnowledge/projects/YiVad/onboarding.md) | YiVad 入门指南 |