# YrY 单体仓库

> 包含 3 个应用 + 1 个知识库的单体仓库——一个全栈 AI 驱动的开发平台。

## 特性

- **YiVad** — Vue 3.5 管理后台，具备 ProTable、动态路由和按钮级权限
- **YiAi** — FastAPI 后端，具备 AI 聊天（Ollama）、RAG（llama_index）、文件管理和 RSS 聚合
- **YiPet** — Chrome MV3 扩展，向任意页面注入交互式 AI 伴侣
- **YiKnowledge** — Markdown 知识库，同时服务于人类和 AI（RAG 数据源）

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
     └── YiKnowledge ←──知识监视器（apscheduler）──┤
```

所有前端应用通过统一的 RPC 信封与 YiAi 通信：`{module_name, method_name, parameters}`。

## 配置

| 变量 | 项目 | 默认值 |
|----------|---------|---------|
| `RSBUILD_API_BASE` | YiPet, YiVad | `http://localhost:10086` |
| YiAi 端口 | YiAi | `10086` |
| YiVad 开发端口 | YiVad | `8848` |

## 开发

```bash
# Conventional Commits 由 commitlint 强制执行
pnpm commit  # YiVad——启动 cz-git
npm run commit  # YiPet——启动 cz-git
```

### 跨项目修改

1. 阅读两个项目的 CLAUDE.md 文件
2. 验证 RPC 参数名称（`filter` 而非 `query`，`target_file` 而非 `path`）
3. 测试双方
4. 如果有新的模式出现，更新 YiKnowledge

## 项目结构

```
YrY/
├── YiVad/          # Vue 3.5 管理后台
├── YiAi/           # FastAPI 后端
├── YiPet/          # Chrome MV3 扩展
└── YiKnowledge/    # Markdown 知识库
```
