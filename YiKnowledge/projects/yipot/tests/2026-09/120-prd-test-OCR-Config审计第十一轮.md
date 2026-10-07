---
doc_type: test
title: "YiPot OCR 服务与 Config 审计（第十一轮）— 测试方案"
tags: [测试方案, OCR, config, null-safety]
category: 项目/桌面应用/测试
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: test
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
test_id: YP-09-120
prd_ref: YP-09-74
dev_ref: YP-09-115
roles: [engineer]
---

# YiPot OCR 服务与 Config 审计（第十一轮）— 测试方案

> 测试编号：YP-09-120 · 关联 PRD：YP-09-74 · 关联开发：YP-09-115

---

## 一、测试用例

### TC-01: Baidu OCR — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 client_id/secret，直接使用 Baidu OCR |
| **预期** | config 为 `{}`，client_id/secret 为 undefined → API 返回认证错误（非 TypeError） |

### TC-02: Baidu OCR — 正常识别

| 项 | 内容 |
|-----|------|
| **步骤** | 配置有效凭据 → 截图 OCR |
| **预期** | 文字识别成功，返回文本 |

### TC-03: Tencent OCR — config 缺失

| 项 | 内容 |
|-----|------|
| **步骤** | 不配置 secret_id/key，直接使用 Tencent OCR |
| **预期** | 无 TypeError，API 返回认证错误 |

### TC-04: Tencent OCR — 正常识别

| 项 | 内容 |
|-----|------|
| **步骤** | 配置有效凭据 → 截图 OCR |
| **预期** | 文字识别成功 |

### TC-05: Service 管理页 — 翻译服务

| 项 | 内容 |
|-----|------|
| **步骤** | 设置 → 服务 → 翻译 → 添加/删除/拖拽排序 |
| **预期** | 服务列表正常更新 |

### TC-06: Service 管理页 — OCR 服务

| 项 | 内容 |
|-----|------|
| **步骤** | 设置 → 服务 → OCR → 添加服务 |
| **预期** | OCR 服务列表正常更新 |

---

## 二、回归测试

- Baidu/Tencent OCR 各一次
- 服务管理页 4 个 tab 正常切换

## 三、关联文档

| 关联类型 | 文件 |
|----------|------|
| PRD | `../prds/2026-09/74-prd-OCR-Config审计第十一轮.md` |
| 开发方案 | `../devs/2026-09/115-prd-task-OCR-Config审计第十一轮.md` |