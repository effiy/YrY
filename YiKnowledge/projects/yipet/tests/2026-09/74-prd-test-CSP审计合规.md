---
doc_type: test
title: "CSP 审计合规 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["74-合规-CSP审计合规"]
source_modules: ["74-prd-task-CSP审计合规"]
---

# CSP 审计合规 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CSP01 | 无 eval | `rg "eval\(" ` 零匹配 | P0 |
| TC-CSP02 | 无 inline script | CSP `script-src 'self'` | P0 |
| TC-CSP03 | 无远程代码 | 仅 YiAi 地址 | P0 |
| TC-CSP04 | web_accessible 精确 | 仅 assets/*, cdn/* | P1 |