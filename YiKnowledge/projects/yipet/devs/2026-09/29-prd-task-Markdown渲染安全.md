---
doc_type: module
prd_task_id: "YP-09-22"
title: "YP-09-22: Markdown 渲染安全 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "29-安全-Markdown渲染安全.md"
---

# YP-09-22: Markdown 渲染安全 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-22 · 优先级：P0

---

<a id="sec-1"></a>
## 一、方案概述

Markdown 渲染 XSS 防护：DOMPurify 清洗 + marked 渲染，禁止脚本注入。

### 安全渲染管道

```
raw markdown → marked.parse() → DOMPurify.sanitize() → innerHTML
```

### DOMPurify 配置

```typescript
DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ["p","a","code","pre","ul","ol","li","strong","em","h1","h2","h3","blockquote","table","thead","tbody","tr","th","td"],
  ALLOWED_ATTR: ["href","target","rel","class"],
});
```

### 防护项

| 威胁 | 防护 |
|------|------|
| `<script>` 注入 | DOMPurify 移除 |
| `onclick` 事件 | DOMPurify 移除 |
| `javascript:` URL | ALLOWED_ATTR 白名单 |

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |
