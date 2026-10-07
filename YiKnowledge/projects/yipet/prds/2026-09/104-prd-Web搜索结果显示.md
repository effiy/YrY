---

doc_type: module
prd_id: "YP-09-104"
title: "YP-09-104: Web 搜索结果显示 — 搜索引用卡片 + 域名权威分级 + 图片缩略图"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
related_tasks: ["104-prd-task-Web搜索结果显示.md"]
related_tests: ["104-prd-test-Web搜索结果显示.md"]

type: 需求
---

# YP-09-104: Web 搜索结果显示

> **PRD 版本**：v3.0 · **状态**：已完成

## 1. 背景

YiPet 聊天支持基于知识库的 RAG 检索和 Web Search 增强。当启用 Web Search 时，后端返回搜索结果和图片，前端需以引用卡片形式展示，支持域名权威分级。

## 2. 用户问题

- **目标用户**：所有 YiPet 聊天用户
- **问题陈述**：作为用户，我想在聊天中看到 AI 引用的网页来源，以便验证信息的可靠性
- **证据**：强 — 代码已实现（`WebSearchResults.vue`）

## 3. 范围

**In scope**：搜索结果卡片 + 域名权威分级 + favicon + 图片灯箱 + 复制引用

**Out of scope**：搜索结果排序算法（后端负责）

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P0 | 查看搜索来源 | 显示 title/url/snippet |
| P1 | 权威分级 | high/medium/low 颜色区分 |
| P1 | 图片预览 | 灯箱点击放大 |

## 4. 时间线

全部 2026-09-23（Claude，文档补充）