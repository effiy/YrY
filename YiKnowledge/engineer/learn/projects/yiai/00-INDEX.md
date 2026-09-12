---
title: YiAi Engineering — INDEX
tags: [index, yiai, navigation]
category: engineer/learn/projects/yiai
created: 2026-08-24
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate YiAi project documentation"
related:
  - ./README.md
  - ../../INDEX.md
---

# YiAi — 项目索引

> FastAPI 后端。AI 聊天、RAG 检索、知识库管理。YrY 所有前端项目的唯一数据源。

## 核心文档

| 文档 | 用途 | 适合人群 |
|---|---|---|
| [01-架构设计](./01-项目-架构设计.md) | 技术栈全景、分层架构、数据流、降级策略 | 所有开发者 |
| [02-开发规范](./02-项目-开发规范.md) | 命名约定、分层纪律、RPC 字段契约、配置管理、测试规范 | 开发者 |
| [03-功能模块](./03-项目-功能模块.md) | 10 个 Domain 模块 + 7 个 Service + 13 条路由的完整清单 | 开发者 |

## 用户故事

| 故事 | 领域 | 状态 |
|---|---|---|
| [YiAi 路由模块分析](./stories/yiai-routes-module-analysis/story.md) | 路由架构分析——10 个路由模块、52 个 API 端点的三层分类 | testing |
| [用户导入与导出](./stories/user-import-and-export/story.md) | 用户管理——CSV/JSON 批量导入导出、离线审计验证 | testing |

## 架构决策记录（ADR）

| ADR | 状态 | 说明 |
|---|---|---|
| [Agent 上线](../../../leader/decisions/yiai-agent-launch.md) | 进行中 | Agent 多轮对话和工具调用能力上线 |
| [LLM 多供应商推展](../../../leader/decisions/yiai/llm-multi-provider-rollout.md) | 已实施 | 从单一 Ollama 扩展到 OpenAI/Anthropic 多后端 |
| [RAG 评估基础设施](../../../leader/decisions/yiai/rag-evaluation-infra.md) | 规划中 | RAG 检索质量的自动化评估 |
| [Pytest 引入](../../../leader/decisions/yiai/pytest-introduction.md) | 规划中 | 从 0 测试到 pytest 测试框架的引入路线 |
| [知识库监听器部署](../../../leader/decisions/yiai/knowledge-watcher-deployment.md) | 已实施 | apscheduler 轮询替代 FSEvents 的决策 |
| [Agent 模式 — 通用数据工具](../../../leader/decisions/yiai/agent-mode-generic-data-tools.md) | 已实施 | Agent 中通用 CRUD 工具的设计与安全控制 |

## 跨项目链接

- [YiAi CLAUDE.md](../../../../YiAi/CLAUDE.md) — 实时项目档案（模块边界、约束、近期变更）
- [RPC 协议](../../build/cross-project-rpc-protocol.md) — RPC 信封规范、参数名契约、已知 Bug 模式
- [产品管理](../../../producter/projects/yiai/project-management.md) — 迭代节奏、交付物
- [入职指南](../../run/onboarding/01-入职-YiAi入职.md) — 新人第一天快速上手

## 快速导航

### 我是 YiAi 新人开发者

1. 先读 [入职指南](../../run/onboarding/01-入职-YiAi入职.md) 完成环境搭建
2. 再读 [架构设计](./01-项目-架构设计.md) 理解分层架构
3. 然后读 [开发规范](./02-项目-开发规范.md) 了解关键约束
4. 最后查 [功能模块](./03-项目-功能模块.md) 定位你要修改的模块