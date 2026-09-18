---
doc_type: test
title: "扩展构建优化 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["20-基础设施-扩展构建优化与代码分割"]
source_modules: ["20-prd-task-扩展构建优化与代码分割"]
---

# 扩展构建优化 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-BO01 | Tree Shaking | Element Plus 按需 <2MB | P1 |
| TC-BO02 | Vendor chunk | 缓存命中率提升 | P2 |
| TC-BO03 | 禁用 filenameHash | manifest 固定引用 | P0 |