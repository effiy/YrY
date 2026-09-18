---
doc_type: test
title: "Shadow DOM 样式隔离增强 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["45-架构设计-ShadowDOM样式隔离增强"]
source_modules: ["45-prd-task-ShadowDOM样式隔离增强"]
---

# Shadow DOM 样式隔离增强 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-SD01 | CSS 变量穿透 | :host 继承宿主 CSS 变量 | P1 |
| TC-SD02 | 字体隔离 | `all:initial` 重置外部字体 | P1 |
| TC-SD03 | Teleport 修复 | el-dialog 正确挂载到 Shadow Root | P1 |
| TC-SD04 | 宿主 CSS 不影响 Pet | 页面样式不渗透到 Shadow DOM | P0 |

## 出口准则

- [ ] P0 用例 100% 通过