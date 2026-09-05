---
title: Build — Architecture & Development
tags: [leaf, build, architecture, design, development, dx, api]
category: engineer/build
created: 2026-08-06
updated: 2026-08-24
last_verified: 2026-08-24
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

> **作为** engineer，**我希望**找到架构和开发参考，**以便**高效地设计和构建系统。

BUILD 是 engineer pipeline 的第一个阶段——设计系统、选择方案，并在编写代码之前打好基础。

## 现有内容

| 文件 | 描述 |
|---|---|
| [cross-project-rpc-protocol.md](./cross-project-rpc-protocol.md) | RPC 信封、参数名契约、已知 bug 模式——所有跨项目调用的单一事实来源 |
| [implement-cross-project-rpc-call.md](./implement-cross-project-rpc-call.md) | 跨 YiVad/YiPet → YiAi 添加新 RPC 调用的分步指南 |
| [implement-sse-streaming.md](./implement-sse-streaming.md) | AI 聊天的 SSE 流式实现指南，含中止处理和超时管理 |

## 此处应包含的内容

- 系统架构模式与设计决策
- API 设计契约（REST、RPC、SSE、事件）
- 数据建模与 schema 设计
- 项目启动与工具链设置
- 依赖管理与技术栈指南
- 开发者体验与生产力

## 交叉引用

- [../ship/](../ship/) — 质量、安全、数据、韧性、可观测性
- [../run/](../run/) — 团队工作流、onboarding、横切场景
- [../learn/](../learn/) — 经验教训与项目特定文档
- [../../leader/架构/](../../leader/架构/) — 技术选型与成熟度模型
- [../../leader/decisions/](../../leader/decisions/) — 架构决策记录