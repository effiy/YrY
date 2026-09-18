---
doc_type: test
title: "知识库与 RAG 集成 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202608"
source_prds: ["02-功能实现-知识库与RAG集成"]
source_modules: ["02-prd-task-知识库与RAG集成"]
---

# 知识库与 RAG 集成 — 测试用例

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-KB-001 | 知识树渲染 | 7 角色目录完整展示 | P0 |
| TC-KB-002 | 文件选择预览 | 点击文件→解析 frontmatter | P1 |
| TC-KB-003 | RAG 范围限定 | 文件级/目录级 scope 过滤 | P0 |
| TC-KB-004 | RAG 检索+引用 | 检索结果含内联引用 | P0 |
| TC-KB-005 | 子问题分解 | decompose 并行检索 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过