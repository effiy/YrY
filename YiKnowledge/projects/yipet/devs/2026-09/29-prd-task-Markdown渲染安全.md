---

doc_type: module
prd_task_id: "YP-09-22"
title: "YP-09-22: Markdown 渲染安全 — 开发方案"
status: 方案已编写
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["29-prd-test-Markdown渲染安全.md"]
source_prd: "29-架构设计-Markdown渲染安全.md"

type: task
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

---

## 一、需求背景

来源 PRD：29-架构设计-Markdown渲染安全.md

### 用户痛点

1. **4**：
1. **~25KB（DOMPurify）**：### 4.3 架构取舍
1. **安装 DOMPurify 依赖**：`npm ls dompurify`

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 威胁 | 防护 |
| `<script>` 注入 | DOMPurify 移除 |
| `onclick` 事件 | DOMPurify 移除 |
| `javascript:` URL | ALLOWED_ATTR 白名单 |
| # | 缺口 |
| — | 无 |
| — | ### 技术债 |
| 技术债 | 优先级 |

## 三、关键技术决策

| # | 决策 | 理由 |
|---|------|------|
| 1 | 纯前端浏览器 API 实现 | 无需服务端依赖，响应 < 50ms，离线可用 |
| 2 | 独立 Vue 3 Composable 封装 | 单一职责，可复用于 Popup + Side Panel |

## 四、实施步骤

| 步骤 | 任务 | 预估 |
|------|------|------|
| 1 | Composable 核心逻辑 + 状态管理 | 0.1d |
| 2 | Vue 3 UI 组件开发（含错误/空/加载状态） | 0.1d |
| 3 | 边界场景处理 + 集成测试 | 0.1d |

**总计：0.3d**

## 五、完成记录

> **状态**：方案已编写 · **日期**：2026-09-23 · 实施排期待定

## 六、技术债与缺口

| # | 项目 | 优先级 | 说明 | 状态 |
|---|------|--------|------|------|
| 1 | `src/chat/rendering/markdown.ts` | P1 | Markdown 渲染入口 | 待实施 |
| 2 | HTML 标签透传 | P1 | `marked` html 选项默认 true | 待实施 |

