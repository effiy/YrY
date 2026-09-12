---
title: Build — Architecture & Development
tags: [leaf, build, architecture, design, development, dx, api]
category: engineer/build
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers find architecture patterns, API design guides, and development references"
acceptance_criteria:
  - "BUILD phase scope clearly bounded"
  - "Cross-references to related phases are present"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ./cross-project-rpc-protocol.md
  - ./implement-cross-project-rpc-call.md
  - ./implement-sse-streaming.md
  - ../ship/
  - ../run/
  - ../learn/
---

# Build — 架构与开发

> **作为** Engineer，**我希望**在编码之前找到架构模式、API 设计规范和开发参考，**以便**以正确的方式设计系统，避免前期决策失误导致后期大规模返工。

BUILD 是 Engineer 流水线的第一个阶段——在这里定义系统的骨架。这个阶段的核心问题是"怎么设计"而非"怎么实现"。一个好的 Build 阶段决策可以避免 Ship 阶段的大量补救工作。

## Build 阶段的四项核心活动

### 1. 架构模式选择

在 YrY 单体仓库中，架构模式在不同项目中表现形式不同：

- **YiAi**：分层架构（Routes → Services → Domain → Data → Shared），每层职责清晰，禁止越层调用
- **YiVad**：组件化架构（Views → Components/Hooks → Stores → API Modules → RequestHttp），ProTable 驱动数据展示
- **YiPet**：双世界架构（ISOLATED World + MAIN World），四层 API 封装（Client → Endpoints → Types → Services）

### 2. API 设计契约

RPC 信封是 YrY 中所有跨项目通信的唯一协议：

```
POST /  body: { module_name, method_name, parameters }
response: { code: 0, message: "ok", data: <any> }
```

关键约束：参数名是合同。`filter` 不是 `query`，`target_file` 不是 `path`，`cname` 不是 `collection_name`。这些不匹配曾导致生产级 Bug——后端静默忽略未知参数。

### 3. 开发环境配置

YrY 全栈开发环境启动顺序：

```bash
# 1. 启动 MongoDB（本地或 Docker）
# 2. 启动 Ollama（如需 AI 功能）
# 3. 启动 YiAi 后端
cd YiAi && python main.py
# 4. 启动 YiVad 前端
cd YiVad && pnpm dev
# 5. 构建 YiPet 扩展
cd YiPet && npm run build
```

### 4. 开发者体验（DX）

- YiVad 使用 Rsbuild 1，支持热更新（HMR）、自动导入（unplugin-auto-import）、SVG 雪碧图
- YiPet 使用 4 个独立 Rsbuild 配置（popup/chat/CDN/bootstrap），每个入口有独立的构建流程
- YiAi 使用 uvicorn 热重载（`reload: true`），修改代码后自动重启

## 文档清单

| 文件 | 描述 | 适用场景 |
|---|---|---|
| [cross-project-rpc-protocol.md](./cross-project-rpc-protocol.md) | RPC 信封规范、参数名契约（`filter`/`target_file`/`cname`）、已知 Bug 模式——所有跨项目调用的唯一事实来源 | 每次添加新的跨项目 API 调用前必读 |
| [implement-cross-project-rpc-call.md](./implement-cross-project-rpc-call.md) | 跨 YiVad/YiPet 到 YiAi 添加新 RPC 调用的分步指南：后端 Service 创建 → 前端 Service 封装 → 参数验证 | 实施新的跨项目功能时使用 |
| [implement-sse-streaming.md](./implement-sse-streaming.md) | AI 聊天的 SSE 流式实现指南，含中止处理（`AbortController`）、超时管理、增量渲染策略 | 实现或调试流式 AI 响应时使用 |

## 此处应包含的内容（规划中）

以下主题当前尚未有独立文档，但属于 Build 阶段的核心关注点。当有足够的实践经验后应补充：

- **系统架构模式与设计决策**：YrY 中使用的具体架构模式（分层架构、发布-订阅、CQRS 等）及其适用场景
- **数据建模与 Schema 设计**：MongoDB 文档模型设计原则、集合命名规范、索引策略
- **项目启动与工具链设置**：新项目的脚手架模板、构建工具对比（Rsbuild vs Vite vs Webpack）
- **依赖管理与技术栈指南**：Python（pip/poetry）vs Node.js（npm/pnpm）依赖管理最佳实践
- **开发环境故障排查**：常见启动问题的解决方案（MongoDB 连接失败、Ollama 模型未加载、端口冲突）

## 反模式 — Build 阶段常见错误

| 反模式 | 为什么失败 | 正确做法 |
|---|---|---|
| 跳过架构设计直接编码 | 缺乏整体视角，后期需要大规模重构 | 先画出数据流图，明确模块边界，再动手编码 |
| 前端绕过 RPC 信封直接调后端原始端点 | 破坏统一的错误处理和认证流程 | 所有跨项目调用必须通过 RPC 信封（`module_name.method_name`） |
| 在 Python 和 TypeScript 之间复制协议定义 | 参数名不一致（`filter` vs `query`）导致静默 Bug | 以 RPC 协议文档为唯一事实来源，两端对齐验证 |
| 一开始就过度设计 | 为"可能"需要的功能创建抽象层，增加维护负担 | 遵循 YAGNI 原则（You Aren't Gonna Need It），需要时再抽象 |

## 交叉引用

- [../ship/](../ship/) — 质量保障、安全加固、数据迁移、韧性模式（Build 之后的下一阶段）
- [../run/](../run/) — 团队工作流、新人入职指南、竞品调研
- [../learn/](../learn/) — 经验教训与项目特定文档（从实践中验证 Build 阶段的决策）
- [../../leader/架构/](../../leader/架构/) — 技术选型与成熟度模型
- [../../leader/decisions/](../../leader/decisions/) — 架构决策记录（ADR）