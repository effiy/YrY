---
title: Prompt Engineering 最佳实践指南
tags: [AI, Prompt Engineering, 大模型, 提示词, RAG, Agent]
category: methodology/ai-specific
created: 2024-04-05
updated: 2026-07-30
source: https://example.com/prompt-engineering-guide
type: summary
---

# Prompt Engineering 最佳实践指南

## 1. 基础技巧

### 1.1 角色设定
明确设定 AI 的角色和专业领域，提高回答准确性。
```
你是一位资深 Vue 3 + TypeScript 工程师，熟悉 Composition API、Pinia、Vitest。
```

### 1.2 结构化提示
- 使用分隔符（```、---、<task>...</task>）区分指令和内容
- 提供清晰的输出格式要求（JSON schema、表格、Markdown）
- 使用 few-shot 示例引导输出风格（3-5 个示例最佳）

### 1.3 思维链（Chain-of-Thought）
引导模型逐步推理，而非直接给结论。Opus 4.7 / GPT-5 / Gemini 2.5 Pro 已内置 thinking 模式，无需手动加 "let's think step by step"，但需要明确「是否启用 thinking」。

### 1.4 迭代优化
- 从简单提示开始，逐步增加复杂度
- 记录有效和失败的提示模式
- 建立团队内部的 Prompt 库（版本化、可回滚）

## 2. 进阶技巧

### 2.1 RAG（检索增强生成）
将外部知识检索结果注入 prompt，避免模型幻觉：
```
[系统] 你是售后业务文档助手。
[检索到的上下文]
- doc_1: 关于业务规则的规定...
- doc_2: 操作流程步骤...
[问题] {user_question}
[要求] 仅基于上述上下文回答，若上下文不足以回答请说明。
```

### 2.2 结构化输出
强制模型输出 JSON：
```
请以如下 JSON schema 输出，不要包含其他文本：
{
  "summary": "string",
  "action_items": ["string"],
  "confidence": 0.0-1.0
}
```
Claude / GPT-5 / Gemini 均支持 `response_format` 或 `tool_use` 强约束。

### 2.3 工具调用（Function Calling）
让模型决定调用哪个工具：
```
可用工具：
- get_weather(city: str): 获取天气
- send_email(to: str, subject: str, body: str): 发送邮件
[用户] 帮我把北京今天天气发给 zhang@x.com
[模型] 调用 get_weather("北京") → 然后调用 send_email(...)
```

### 2.4 Few-shot 选型
- **Zero-shot**：简单分类、转换任务
- **Few-shot（3-5 个）**：风格控制、复杂输出格式
- **Self-consistency**：对推理任务多次采样后投票

### 2.5 思考预算（Thinking Budget）
Opus 4.7 / GPT-5 等可设置 thinking token 上限：
- 简单任务：thinking budget = 0（关闭）
- 复杂推理：budget = 8000-16000 tokens
- Agent 多步任务：每步 budget = 2000-4000

## 3. 推荐格式

```
[角色] 你是一位...
[任务] 请帮我...
[约束] 1... 2... 3...
[输出格式] 请以...格式输出
[示例] ...
```

## 4. Prompt Caching 优化

对于带长 system prompt + few-shot 示例的提示：
- 将稳定部分（角色、规则、示例）放在 prompt 前部
- 将变量部分（用户输入）放在尾部
- 开启 5 分钟 / 1 小时 TTL 缓存，输入成本降至 10%

## 5. 评估与迭代

### 5.1 评估指标
- **准确率**：与 ground truth 匹配
- **格式合规率**：JSON schema / 表格结构是否正确
- **延迟与成本**：thinking 开启 vs 关闭的 P95 延迟
- **稳定性**：同 prompt 多次运行的结果方差

### 5.2 工具
- LangSmith / Langfuse：prompt 版本管理与追踪
- Promptfoo：批量评估与对比
- Braintrust：人工标注 + 自动评估

## 6. 常见陷阱

- 提示过于模糊导致输出不稳定
- 忽略模型的上下文窗口限制（超长输入被截断）
- 过度依赖单次提示，缺乏迭代
- 未开启 prompt caching，重复输入烧 token
- Few-shot 示例之间存在矛盾风格
- 用自然语言描述结构化输出，导致解析失败 → 改用 JSON schema
- 在推理任务上禁用 thinking，导致质量下降
- 在简单任务上启用 thinking，导致成本与延迟飙升
