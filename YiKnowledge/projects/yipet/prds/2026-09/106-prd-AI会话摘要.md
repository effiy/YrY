---

doc_type: module
prd_id: "YP-09-106"
title: "YP-09-106: AI 会话摘要 — LLM 驱动的对话要点提炼"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: 需求
---

# YP-09-106: AI 会话摘要

> **PRD 版本**：v3.0

## 1. 背景

长会话（20+ 条消息）难以快速回顾关键内容。AI 驱动的会话摘要自动提取 5-8 个要点（问过什么/决定了什么/待解决问题），用户可复制到 YiVad/YiKnowledge/外部笔记。

## 2. 范围

**In scope**：`SessionSummaryDialog` — LLM 流式摘要 → markdown 渲染 → 复制到剪贴板

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P1 | 生成会话摘要 | 5-8 个要点，流式输出 |
| P1 | 复制摘要 | 一键复制 markdown |

## 3. 时间线

2026-08-05 实现