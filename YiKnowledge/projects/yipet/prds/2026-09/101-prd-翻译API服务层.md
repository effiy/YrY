---

doc_type: module
prd_id: "YP-09-101"
title: "YP-09-101: 翻译 API 服务层 — TranslationService 四层架构实现"
status: 已完成
priority: P0
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
related_tasks: ["101-prd-task-翻译API服务层.md"]
related_tests: ["101-prd-test-翻译API服务层.md"]

type: 需求
---

# YP-09-101: 翻译 API 服务层

> 子 PRD，主 PRD：[100-基础设施-即时翻译功能](./100-基础设施-即时翻译功能.md)

## 背景

YiPet 需新增 TranslationService API 层，遵循四层架构（client → endpoints → types → services），封装 YiAi 翻译 RPC 调用。

## 范围

**In scope**：`createTranslationService(client)` 工厂，提供 translate/queryHistory/feedback 三个方法

**Out of scope**：SSE 流式翻译 → 后续 PRD

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P0 | 调用 YiAi 翻译 | translate() 返回 TranslateResult[] |

## 时间线

全部 2026-09-23（Claude）