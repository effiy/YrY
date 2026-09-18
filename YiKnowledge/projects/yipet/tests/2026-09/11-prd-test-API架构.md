---
doc_type: test
title: "API 架构合规 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["11-合规-API架构"]
source_modules: ["11-prd-task-API架构"]
---

# API 架构合规 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-API01 | 无直接 fetch | `rg "fetch(" src/ --not -path "*/api/*"` 零结果 | P0 |
| TC-API02 | 参数名 filter | `rg '"query"' src/api` 零结果 | P0 |
| TC-API03 | RPC 信封统一 | 所有 body 含 module_name/method_name | P0 |
| TC-API04 | Token 自动附加 | 无手动 X-Token 设置 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过