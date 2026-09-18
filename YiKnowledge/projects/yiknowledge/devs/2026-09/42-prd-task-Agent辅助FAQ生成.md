---
doc_type: module
prd_task_id: "YK-09-39"
title: "YK-09-39: Agent 辅助 FAQ 生成 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "42-架构设计-Agent辅助FAQ生成.md"
source_okr: [yiknowledge-001]
related_tests: ["42-prd-test-Agent辅助FAQ生成"]
---

# YK-09-39: Agent 辅助 FAQ 生成 — 开发方案

> 需求编号：YK-09-39 · 人天：1.0d

---

## 一、架构总览

基于 RAG 自动扫描知识库文档，提取高频问题和关键概念，LLM 生成 Q&A 对。输出为结构化 FAQ 文件（Markdown 格式），人工审核后发布。复用 YiAi chat_service 和 RAG 检索。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 文档关键概念提取 + 问题生成 Prompt | 0.3 |
| 2 | Q&A 对生成 + 格式化输出 | 0.3 |
| 3 | 人工审核工作流 + 测试 | 0.4 |

**总计：1.0d**

## 三、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | FAQ 质量依赖 RAG 检索质量 | P3 | 检索不完整→FAQ 覆盖不完整 | 待持续改进 |

---