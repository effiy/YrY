---
doc_type: test
title: "依赖版本管理 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["70-基础设施-依赖版本管理"]
---

# 依赖版本管理 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-DEP01 | npm audit | 0 高危漏洞 | P1 |
| TC-DEP02 | lock 文件 | 确定性构建 | P1 |