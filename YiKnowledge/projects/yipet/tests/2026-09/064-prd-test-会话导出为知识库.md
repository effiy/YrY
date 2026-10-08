---

doc_type: test
title: "会话导出为知识库 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["64-架构设计-会话导出为知识库.md"]
source_modules: ["64-prd-task-会话导出为知识库.md"]

type: test
---

# 会话导出为知识库 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-EXP01 | 导出 Markdown | frontmatter+对话格式正确 | P0 |
| TC-EXP02 | 写入 YiKnowledge | /write-file 成功 | P1 |
| TC-EXP03 | 摘要生成 | AI 自动生成会话摘要 | P2 |

