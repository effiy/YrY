---
doc_type: test
title: "测试体系与 CI — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["96-测试-测试体系与CI"]
---

# 测试体系与 CI — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CI01 | Vitest 单元测试 | `npm test` 通过 | P0 |
| TC-CI02 | tsc --noEmit | 零类型错误 | P0 |
| TC-CI03 | npm run build | 4 入口构建成功 | P0 |
| TC-CI04 | lint-staged | pre-commit 检查生效 | P1 |