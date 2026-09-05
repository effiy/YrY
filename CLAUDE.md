# CLAUDE.md — YrY 单体仓库

> 包含 3 个应用 + 1 个知识库的单体仓库。**YiVad**（Vue 3.5 管理后台）、**YiAi**（FastAPI 后端）、**YiPet**（Chrome MV3 扩展）和 **YiKnowledge**（markdown 知识库）。所有应用通过统一的 RPC 信封共享 YiAi 后端。

---

## 目录

- [核心理念](#核心理念)
- [铁律](#铁律)
- [架构方向](#架构方向)
- [项目概况](#项目概况)
- [项目结构](#项目结构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [跨项目关系](#跨项目关系)
- [共享约定](#共享约定)
- [开发工作流](#开发工作流)
- [项目约束](#项目约束)
- [指引](#指引)

---

## 核心理念

- **信任模型。** Claude 有能力深入理解这个代码库。给它所需的上下文，相信它能做出正确的判断。
- **珍惜注意力。** 你写的每一行代码被阅读的次数远多于被编写的次数。为读者而写，而非为写者而写。
- **验证现实。** 运行代码。阅读结果。断言胜过信心。最快的出错方式就是跳过验证。
- **先想后写。** 明确陈述假设；如果存在多种解释，指出来；如果有更简单的方法，说出来。如果有不清楚的地方，停下来询问，而不是猜测。

## 铁律

- **简洁优先。** 不添加超出需求的功能；不为单次使用的代码创建抽象；不为不可能发生的场景处理错误。如果你写了 200 行但可以缩减到 50 行，重写它。
- **精准修改。** 不要"改进"相邻代码；匹配现有风格；每一行修改都要追溯到用户的需求。当你的修改产生了孤立的代码（未使用的导入、死变量），清理它们——但除非被要求，不要删除已存在的死代码。
- **目标驱动执行。** 将任务转化为可验证的目标；对于多步骤任务，在每个步骤中陈述一个包含验证检查的简短计划。强有力的成功标准让你能独立迭代；薄弱的标准则需要不断澄清。
- **先阅读项目 CLAUDE.md。** 在接触任何项目之前，先阅读其 `CLAUDE.md`——它包含项目特定的约束、模块边界和近期变更。

## 架构方向

> **共享后端的单体仓库。**
>
> YrY 是一个单体仓库，其中 YiAi 作为所有前端项目的唯一后端。方向是朝着**清晰的跨项目契约**发展：RPC 信封（`{module_name, method_name, parameters}`）是通用协议，参数名称契约（`filter` 而非 `query`，`target_file` 而非 `path`）必须在所有三个代码库中强制执行。
>
> 每个项目沿着各自的轴线前进：YiVad → **组件化**，YiAi → **模块化**，YiPet → **组件化 + API 分层**。YiKnowledge 是同时服务于人类和 AI 的共享知识库（YiAi BRD Agent 的 RAG 数据源）。

## 项目概况

| 属性 | 值 |
|----------|-------|
| 名称 | YrY |
| 类型 | 单体仓库 |
| 主要语言 | TypeScript 5.x + Python 3.10+ |
| 包管理器 | pnpm（YiVad），npm（YiPet），pip（YiAi）|
| 测试框架 | Vitest |
| 架构 | 共享后端的单体仓库 |
| 分支前缀 | `claude/`（默认）|

## 项目结构

```
YrY/
├── CLAUDE.md              # 本文件——单体仓库级 AI 助手配置文件
├── YiVad/                 # Vue 3.5 管理后台（端口 8848）
│   前端 SPA——ProTable 驱动、动态路由、按钮级权限。
│   消费 YiAi 提供的聊天、数据、文件、知识、RAG 服务。
├── YiAi/                  # FastAPI 后端（端口 10086）
│   Python 后端——AI 聊天（Ollama）、文件管理、RAG、知识库、
│   RSS 聚合、企业微信消息、Agent 循环。唯一数据源。
├── YiPet/                 # Chrome MV3 扩展
│   浏览器扩展——向任意页面注入交互式宠物伴侣。
│   多角色聊天、知识基底、跨项目桥接到 YiVad。
│   消费 YiAi 提供的聊天、会话、数据、知识、RAG 服务。
├── YiKnowledge/           # Markdown 知识库
│   共享知识——8 个角色目录，4 个流水线阶段。
│   同时服务于人类（文档）和 AI（YiAi 的 RAG 数据源）。
│   YiAi 的知识监视器将此目录树扫描到 MongoDB + 向量索引中。
```

## 模块边界

### YiVad

| 拥有 | 禁止 |
|------|----------|
| 带动态路由的 Vue 3.5 SPA | 直接访问 MongoDB |
| ProTable 驱动的数据视图 | 绕过 RequestHttp 调用 API |
| 通过 `v-auth` 实现的按钮级权限 | 使用 Options API |
| 带持久化状态的 Pinia store | 在 store 中直接调用 axios |

### YiAi

| 拥有 | 禁止 |
|------|----------|
| 端口 10086 上的 FastAPI 后端 | 直接向前端暴露 MongoDB |
| RPC 信封路由（`module_name.method_name`）| 破坏 RPC 契约 |
| Ollama LLM 推理 | 允许未认证访问 |
| llama_index RAG 引擎 | 直接修改 YiKnowledge 文件 |
| MongoDB 数据持久化 | — |

### YiPet

| 拥有 | 禁止 |
|------|----------|
| Chrome MV3 扩展 | 访问 Node.js API |
| 4 层 API 层（ApiClient）| 绕过 ApiClient 调用 fetch |
| 双世界执行（content + service worker）| 混合 content 和 service worker 状态 |
| 跨项目桥接到 YiVad | — |

### YiKnowledge

| 拥有 | 禁止 |
|------|----------|
| Markdown 知识库 | 包含代码（仅文档）|
| 必须包含 frontmatter 的文件 | 文件名中使用下划线/数字 |
| 3 级目录层级 | 超过 3 级目录 |
| YiAi 的 RAG 数据源 | — |

## 数据流

```
YiPet（浏览器）──fetch──→ YiAi（FastAPI :10086）←──fetch── YiVad（SPA :8848）
     │                          │
     │ chrome.storage           │ MongoDB（Motor 异步）
     │                          │ Ollama（LLM 推理）
     │                          │ llama_index（RAG）
     │                          │
     └── YiKnowledge ←──知识监视器（apscheduler 轮询）──┤
         （markdown 目录树）                               │
         （RAG 数据源）←──────────────────────────────────┘
```

请求流程：`前端 → RequestHttp/ApiClient → RPC 信封 → YiAi 路由 → Service → MongoDB/Ollama`

## 跨项目关系

### RPC 协议（通用）

YiVad 或 YiPet 对 YiAi 的每次调用都使用此信封：

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

### 关键参数名称契约

| 正确 | 错误 | 上下文 |
|---------|-------|---------|
| `filter` | `query` | `data_service.query_documents` 参数 |
| `target_file` | `path` | `/read-file`、`/write-file` 端点 |
| `cname` | `collection_name` | `data_service` collection 参数 |

这些不匹配曾导致真实 bug——后端会静默忽略 `query`，对 `path` 返回 422。

### 跨项目桥接

| 桥接 | 从 | 到 | 机制 |
|--------|------|----|-----------|
| 聊天 | YiVad, YiPet | YiAi | 通过 `services.ai.chat_service.chat` 的 SSE 流式传输 |
| 数据 CRUD | YiVad, YiPet | YiAi | RPC 信封 → `data_service.query_documents` |
| 文件读写 | YiVad, YiPet | YiAi | `POST /read-file`、`/write-file` 使用 `target_file` |
| 知识扫描 | YiVad, YiPet | YiAi | `/knowledge/*` 端点 → YiKnowledge markdown 目录树 |
| RAG 查询 | YiVad, YiPet | YiAi | `/rag/*` 端点 → llama_index 混合检索 |
| YiPet → YiVad | YiPet | YiVad | 使用 session key 的 `window.open` → YiVad aiChat 页面 |
| Bug 报告 | YiPet | YiVad + YiKnowledge | MongoDB `bugs` + `YiKnowledge/lessons/failures/bugs/` |

## 共享约定

### 命名

| 约定 | 适用于 |
|------------|------------|
| kebab-case 文件 | YiKnowledge（仅连字符，不使用下划线或数字）|
| snake_case 文件 | YiAi（Python）|
| PascalCase 组件 | YiVad（Vue），YiPet（React）|
| camelCase composables/hooks | YiVad，YiPet |
| Conventional Commits | 所有项目（commitlint + cz-git）|

### 跨项目类型安全

- **YiVad ↔ YiAi**：不存在自动化契约测试。参数名称不匹配（`filter`/`query`、`target_file`/`path`）是最常见的 bug 模式。在添加新 API 调用之前，始终查阅项目 CLAUDE.md 的跨项目协议表。
- **YiPet ↔ YiAi**：相同的 RPC 信封，相同的参数名称契约。YiPet 的 `ApiClient` 封装了与 YiVad `RequestHttp` 相同的 fetch 模式。

### 环境变量

| 变量 | 项目 | 默认值 |
|----------|---------|---------|
| `RSBUILD_API_BASE` | YiPet, YiVad | `http://localhost:10086` |
| YiAi 端口 | YiAi | `10086`（uvicorn）|
| YiVad 开发端口 | YiVad | `8848`（Rsbuild 开发服务器）|

## 开发工作流

### 启动全栈

```bash
# 1. 启动 YiAi 后端
cd YiAi && python main.py

# 2. 启动 YiVad 前端（单独终端）
cd YiVad && pnpm dev

# 3. 构建并加载 YiPet 扩展（单独终端）
cd YiPet && npm run build
# 然后在 Chrome 中以解压扩展的形式加载 dist/
```

### 进行跨项目修改

1. **阅读两个项目的 CLAUDE.md 文件**——每个文件都有其特定的模块边界、约束和近期变更。同时查看 `docs/specs/` 和 `docs/workflows/` 以了解架构模式和任务工作流。
2. **检查 RPC 契约**——根据跨项目协议表验证参数名称。
3. **测试双方**——YiVad 中新增 API 调用的修改需要 YiAi 正在运行。
4. **更新 YiKnowledge**——如果修改引入了新的模式、坑点或经验教训，将其添加到适当的 YiKnowledge 角色目录中。

### 知识库维护

- YiKnowledge 由 YiAi 的知识监视器（apscheduler 每 5 秒轮询）扫描。
- Frontmatter 是必需的：`title`、`tags`、`category`、`created`、`updated`、`source`、`type`、`status`。
- 文件命名：kebab-case，不使用下划线或数字。
- 最多 3 级目录：`role/problem-domain/file.md`。
- 在添加新内容之前，运行[就绪检查清单](YiKnowledge/curator/governance/readiness-checklist.md)。

## 项目约束

### 不可协商的基线

- **YiAi 必须运行**才能让 YiVad 和 YiPet 正常工作——它是所有数据的唯一数据源。
- **TypeScript 严格模式**适用于 YiVad 和 YiPet——`vue-tsc --noEmit` / `tsc --noEmit` 必须通过。
- **Conventional Commits** 由所有项目中的 commitlint 强制执行。
- **RPC 信封**是跨项目调用的唯一协议——前端不能直接访问 MongoDB。
- **YiKnowledge frontmatter** 对所有知识文件是必需的——RAG 引擎依赖它。

## 指引

| 资源 | 用途 |
|----------|---------|
| [YiVad/CLAUDE.md](YiVad/CLAUDE.md) | YiVad 项目概况、模块边界、约束、近期变更 |
| [YiVad/docs/specs/](YiVad/docs/specs/) | YiVad 架构规范 + 模式模板 |
| [YiVad/docs/workflows/](YiVad/docs/workflows/) | YiVad 任务工作流 |
| [YiAi/CLAUDE.md](YiAi/CLAUDE.md) | YiAi 项目概况、模块边界、约束、近期变更 |
| [YiAi/docs/specs/](YiAi/docs/specs/) | YiAi 架构规范 + 模式模板 |
| [YiAi/docs/workflows/](YiAi/docs/workflows/) | YiAi 任务工作流 |
| [YiPet/CLAUDE.md](YiPet/CLAUDE.md) | YiPet 项目概况、模块边界、约束、近期变更 |
| [YiPet/docs/specs/](YiPet/docs/specs/) | YiPet 架构规范 + 模式模板 |
| [YiPet/docs/workflows/](YiPet/docs/workflows/) | YiPet 任务工作流 |
| [YiKnowledge/README.md](YiKnowledge/README.md) | 知识库流水线概述、角色目录、设计原则 |
| [YiKnowledge/INDEX.md](YiKnowledge/INDEX.md) | 知识库导航索引 |
| [YiKnowledge/MEMORY.md](YiKnowledge/MEMORY.md) | 知识库规则手册与命名约定 |
| [YiKnowledge/curator/governance/](YiKnowledge/curator/governance/) | 知识治理、生命周期、就绪检查清单 |
| Memory 文件 | `~/.claude/projects/-Users-ruiyi-YrY/memory/`——用户角色、反馈、项目参考 |