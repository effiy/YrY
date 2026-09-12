---
title: AI Code Review (AICR)
key: 57fe323b-3e95-4617-9a3e-5aa14690018d
tags:
- ai
- code-review
- quality
- developer-tools
category: engineer/learn/projects/yivad/stories
created: '2025-08-01'
updated: 2026-09-10
source: internal
type: story
status: design
project: YiVad
story_name: ai-code-review-aicr
---

# AI 代码审查（AICR）

AI 驱动的代码审查助手——自动分析代码变更、检测问题，并在开发工作流中提供可执行的审查评论。

## 功能概述

AICR 的目标是将 AI 的代码分析能力集成到 YiVad 的开发流程中，让开发者可以在提交代码前获得自动化的审查反馈。

### 核心能力

| 能力 | 描述 |
|---|---|
| 代码变更分析 | 基于 git diff 自动分析变更的代码，识别潜在问题 |
| 问题检测 | 检测常见问题模式：未处理边界情况、潜在的空指针、类型不安全操作 |
| 审查评论生成 | 生成结构化的审查评论，包含问题描述、严重程度、建议修复方案 |
| 工作流集成 | 与 Story Board 和分析文件功能联动，形成完整的代码质量闭环 |

### 与 YiVad 其他功能的联动

- **分析文件 (Analysis Files)**：场景定义 → AI Prompt 生成 → 关联源文件列表 → 传递到 AICR 页面进行审查
- **Story Board**：故事管理看板 → 场景管理 → Gherkin 格式 Given/When/Then 步骤 → AI 生成 Claude Code Prompt

## 技术要点

- **AI 后端**：通过 YiAi 的 Agent 服务进行代码分析，支持多模型（Ollama 本地 + OpenAI/Anthropic 云端）
- **数据流**：`git diff` → `Analysis File Prompt` → `YiAi Agent` → `审查结果` → `AICR 页面展示`
- **RPC 通信**：通过 `agentService.ts` 发送 RPC 请求到 YiAi 的 Agent 端点

## 开发状态

当前处于 **design** 阶段——功能架构已设计，核心交互流程已定义，等待开发资源实施。