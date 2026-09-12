# YrY 单体仓库

> 包含 3 个应用 + 1 个知识库的 AI 驱动全栈开发平台。YiVad（Vue 3.5 管理后台）、YiAi（FastAPI 后端）、YiPet（Chrome MV3 扩展）和 YiKnowledge（Markdown 知识库）。所有前端应用通过统一的 RPC 信封与 YiAi 后端通信。

## 特性

- **YiVad** — Vue 3.5 管理后台，ProTable 声明式表格、动态路由、按钮级权限控制、4 种布局模式、完整 i18n
- **YiAi** — FastAPI 后端，AI 聊天（Ollama + DeepSeek 多提供商）、RAG（llama_index 混合检索）、文件管理、RSS 聚合、企业微信消息、Agent 循环
- **YiPet** — Chrome MV3 扩展，向任意页面注入交互式 AI 伴侣，多角色聊天、知识库集成、跨项目桥接
- **YiKnowledge** — Markdown 知识库，7 个角色目录（leader/engineer/producter/srer/executiver/aier/curator），同时服务于人类和 AI（YiAi RAG 数据源）

## 快速开始

```bash
# 1. 启动 YiAi 后端（端口 10086）
cd YiAi && python main.py

# 2. 启动 YiVad 前端（端口 8848）
cd YiVad && pnpm dev

# 3. 构建并加载 YiPet 扩展
cd YiPet && npm run build
# 在 Chrome 中以解压扩展的形式加载 dist/
```

## 架构

```
YiPet（浏览器）──fetch──→ YiAi（FastAPI :10086）←──fetch── YiVad（SPA :8848）
     │                          │
     │ chrome.storage           │ MongoDB · Ollama · llama_index
     │                          │
     └── YiKnowledge ←──知识监视器（apscheduler 5s 轮询）──┤
```

**数据流：** 前端 → RequestHttp/ApiClient → RPC 信封 `{module_name, method_name, parameters}` → YiAi 路由 → Service → MongoDB/Ollama

## 配置

| 变量 | 项目 | 默认值 |
|----------|---------|---------|
| `RSBUILD_API_BASE` | YiPet, YiVad | `http://localhost:10086` |
| YiAi 端口 | YiAi | `10086`（uvicorn） |
| YiVad 开发端口 | YiVad | `8848`（Rsbuild dev server） |

## 开发

```bash
# Conventional Commits 由 commitlint 强制执行
pnpm commit     # YiVad — 启动 cz-git
npm run commit  # YiPet — 启动 cz-git
```

### 跨项目修改

1. 阅读两个项目的 `CLAUDE.md` 文件
2. 验证 RPC 参数名称契约（`filter` 而非 `query`，`target_file` 而非 `path`）
3. 测试双方（YiAi 必须运行）
4. 如有新架构模式或经验教训，更新 YiKnowledge

### 关键参数名称契约（曾导致 Bug）

| 正确 | 错误 | 上下文 |
|---------|-------|---------|
| `filter` | `query` | `data_service.query_documents` 参数 |
| `target_file` | `path` | `/read-file`、`/write-file` 端点 |
| `cname` | `collection_name` | `data_service` collection 参数 |

## 项目结构

```
YrY/
├── CLAUDE.md              # 单体仓库级 AI 助手配置
├── YiVad/                 # Vue 3.5 管理后台（端口 8848）
│   前端 SPA — ProTable 驱动、动态路由、按钮级权限
├── YiAi/                  # FastAPI 后端（端口 10086）
│   Python 后端 — AI 聊天、文件管理、RAG、Agent 循环
├── YiPet/                 # Chrome MV3 扩展
│   浏览器扩展 — 交互式宠物伴侣、跨项目桥接
└── YiKnowledge/           # Markdown 知识库
    7 个角色目录 — 同时服务于人类和 AI（RAG 数据源）
```

## 技术栈

| 层 | YiVad | YiAi | YiPet |
|---|-------|------|-------|
| 语言 | TypeScript 5.x | Python 3.10+ | TypeScript 5.x |
| 框架 | Vue 3.5 | FastAPI | Vue 3.5 + React 18 |
| 构建 | Rsbuild 1 | uvicorn | Rsbuild 1 |
| UI | Element Plus 2.14 | — | Element Plus 2.14 |
| 状态 | Pinia 4 | — | Pinia 4 |
| 测试 | Vitest | pytest 8 | Vitest 2 |
| 数据库 | — | MongoDB (Motor) | — |

## 相关资源

- [CLAUDE.md](./CLAUDE.md) — 完整项目文档和模块边界
- [YiKnowledge/README.md](./YiKnowledge/README.md) — 知识库体系总览
- [YiKnowledge/INDEX.md](./YiKnowledge/INDEX.md) — 知识库导航索引