---
doc_type: test
title: "构建优化与产物分析 — 测试用例"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["100-基础设施-构建优化与产物分析"]
source_modules: ["100-prd-task-构建优化与产物分析"]
---

# 构建优化与产物分析 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-BLD01 | 4 入口并行构建 | `npm run build` 成功 | P0 |
| TC-BLD02 | Tree Shaking | Element Plus 按需导入产物 < 2MB | P1 |
| TC-BLD03 | 构建元数据 | `build-meta.json` 正确生成 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过