---
title: Analysis Files Prompt Generation and AICR Linkage
key: 189f1953-295e-478b-859e-f0fe0e32ad29
tags:
- analysis-files
- ai-prompt
- claude-code
- ollama
- qwen3.5
- story-board
- aicr
- code-review
- scenario-files
- rpc
category: engineer/learn/projects/yivad/stories
created: '2026-07-26'
updated: 2026-09-10
source: internal
type: story
status: operations
project: YiVad
story_name: analysis-files-prompt-generation-and-aicr-linkage
---

# 分析文件 Prompt 生成与 AICR 联动

分析文件（Analysis Files）功能的核心：将场景定义（Scenario Definitions）映射到项目中的相关源文件，生成 AI 驱动的 Claude Code Prompt，并与 AICR（AI 代码审查）页面形成完整的代码分析闭环。

## 功能架构

### 三层联动

```
场景定义 (Scenario Definition)
  → 分析文件 Prompt 生成
    → 关联源文件列表（通过 RPC updateDocument API 填充 files 数组）
      → AICR 代码审查页面
        → 开发者审查 & 聊天分析 & 会话管理
```

### 核心设计原则

**生成的 Prompt 不修改任何源代码**——它是指令，告诉 Claude Code 如何分析场景并填充关联文件列表。这使得分析和审查完全分离：分析阶段只负责"找到哪些文件与此场景相关"，审查阶段负责"检查这些文件是否有问题"。

## 数据流

### 1. 场景定义

在 Story Board 中创建场景（Scenario），包含：
- Gherkin 风格 Given/When/Then 步骤
- 场景描述和目标
- 预期行为和验收标准

### 2. Prompt 生成

基于场景定义，通过 AI（Ollama 本地模型或 Claude API）生成分析指令：
- 分析场景的业务逻辑
- 识别相关的代码文件和模块
- 生成结构化的分析 Prompt

### 3. 文件关联

通过 RPC `updateDocument` API 更新场景的 `files` 数组，填充关联的源文件路径：
```json
{
  "module_name": "services.database.data_service",
  "method_name": "update_document",
  "parameters": {
    "cname": "scenarios",
    "filter": { "key": "scenario-key" },
    "update": { "$set": { "files": ["src/views/aiChat/index.vue", "..."] } }
  }
}
```

### 4. AICR 联动

填充完 `files` 数组后，开发者可以：
- 在 AICR 页面查看场景关联的所有源文件
- 对每个文件发起代码审查
- 在聊天模式下与 AI 讨论代码问题
- 管理审查会话和相关讨论

## 技术要点

- **AI 模型**：支持 Ollama 本地模型（qwen3.5）和 Claude API 云端模型
- **RPC 通信**：通过 `updateDocument` API 更新场景文件关联（`filter` 参数，不是 `query`）
- **前端组件**：YiVad 的 Story Board 页面提供场景管理 UI，AICR 页面提供代码审查 UI
- **状态管理**：通过 `story.ts` 和 `aiChat.ts` Pinia Store 管理场景和聊天状态

## 适用场景

| 场景 | 流程 |
|---|---|
| 新功能开发前的代码分析 | 创建场景 → 生成分析 Prompt → 找到相关文件 → 审查现有代码 → 开始开发 |
| Bug 修复前的根因定位 | 创建 Bug 场景 → 分析 Prompt 识别相关模块 → 审查代码 → 定位根因 |
| 代码重构前的依赖分析 | 创建重构场景 → 分析关联文件范围 → 审查依赖关系 → 制定重构计划 |

## 反模式

| 反模式 | 为什么有问题 | 正确做法 |
|---|---|---|
| 手动填写 files 数组 | 容易遗漏关联文件，审查不完整 | 依赖 AI 分析 Prompt 自动识别关联文件 |
| 跳过分析直接审查 | 没有上下文理解代码意图，审查质量低 | 先分析场景 → 再审查代码 |
| 在 Prompt 中修改源代码 | 混淆了分析和修改的边界 | Prompt 只做分析指令，修改由开发者手动执行或通过独立的修改任务完成 |