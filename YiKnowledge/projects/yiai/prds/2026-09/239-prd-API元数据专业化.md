---
doc_type: prd
prd_task_id: "YA-09-239"
title: "YiAi API 元数据专业化 — 需求规格"
tags: [需求文档, YiAi, OpenAPI, 元数据, 文档质量]
category: projects/yiai/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P2
project: YiAi
project_id: yiai
owner: Chengliang.Yi
prd_month: "202609"
estimate_backend: 0.1
review_status: 已评审
issue_type: 文档质量
roles: [engineer]
acceptance_criteria:
  - OpenAPI description 准确描述项目后端角色
  - /docs Swagger UI 显示正确描述
  - /openapi.json 自动生成文档正确
related_modules: ["YA-09-239"]
related_tests: ["YA-09-239"]
---

# YiAi API 元数据专业化 — 需求规格

> 编号: YA-09-239 · 优先级: P2 · 工时: ~0.1d · 状态: 已完成

> **文档职责**: 修正 YiAi FastAPI 的 OpenAPI 元数据，准确描述其架构中的后端角色。

---

## 一、背景

`YiAi/src/app.py` 中 FastAPI 实例化时使用的 OpenAPI 描述为 `"YiPet AI Service API"`——仅提到 YiPet，忽略了 YiAi 同时服务于 YiVad 和 YiPet。

作为共享后端的唯一数据源，API 文档的元数据应准确反映其架构角色。

## 二、功能需求

### FR-1: OpenAPI 描述修正

**文件**: `YiAi/src/app.py` line 57

**Before**: `description="YiPet AI Service API"`

**After**: `description="Yi Family Backend — RPC envelope API serving YiVad and YiPet"`

### FR-2: 影响面

| 端点 | 影响 |
|------|------|
| `/docs` (Swagger UI) | 页面标题和描述更新为全栈后端说明 |
| `/openapi.json` | 自动生成的 JSON schema 包含新描述 |
| `/redoc` | ReDoc 页面同步更新 |
| 运行时 | 无影响 |

---

## 三、验收标准

- [x] `/docs` 页面标题显示 "Yi Family Backend..."
- [x] `/openapi.json` 中 `info.description` 字段为新值
- [x] 无运行时行为变更
- [x] 所有现有 API 端点不变

---

## 四、影响范围

| 维度 | 影响 |
|------|------|
| API 文档 | ✅ OpenAPI 描述准确反映架构角色 |
| API 行为 | ✅ 无变更 |
| 客户端 | ✅ 无变更（openapi.json 仅用于文档生成） |
| 向后兼容 | ✅ 纯元数据修正 |