---
doc_type: test
title: "Markdown 渲染安全 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["29-安全-Markdown渲染安全"]
source_modules: ["29-prd-task-Markdown渲染安全"]
---

# Markdown 渲染安全 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-MD01 | script 标签清洗 | `<script>` 被 DOMPurify 移除 | P0 |
| TC-MD02 | onclick 事件清洗 | 事件处理器被移除 | P0 |
| TC-MD03 | javascript: URL | ALLOWED_ATTR 白名单拦截 | P0 |
| TC-MD04 | 正常 Markdown | 加粗/列表/代码块正确渲染 | P0 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 无 XSS 漏洞