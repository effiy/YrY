---
doc_type: test
title: "聊天消息导出 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["25-功能实现-聊天消息导出"]
source_modules: ["25-prd-task-聊天消息导出"]
---

# 聊天消息导出 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-EX01 | Markdown 导出 | 正确格式+frontmatter | P0 |
| TC-EX02 | JSON 导出 | 结构化数据 | P1 |
| TC-EX03 | 日期范围导出 | 仅导出范围内消息 | P1 |