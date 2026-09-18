---
doc_type: module
prd_task_id: "YP-09-07"
title: "YP-09-07: 国际化与多语言支持 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "14-功能实现-国际化与多语言支持.md"
---

# YP-09-07: 国际化与多语言支持 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-07 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

en + zh_CN 完整双语覆盖，RTL 语言支持，智能日期格式化。

### 语言配置

| 语言 | 覆盖范围 |
|------|---------|
| en | Chat Window + Popup + Floating Pet |
| zh_CN | 同上 |

### 实现

```typescript
// chrome.i18n.getMessage 封装
const t = (key: string) => chrome.i18n.getMessage(key);

// Vue 组件中
<span>{{ $t("chat.send") }}</span>
```

### 实施步骤

| 步骤 | 内容 |
|------|------|
| 1 | `_locales/en/messages.json` + `zh_CN/messages.json` |
| 2 | RTL 支持 (direction: rtl) |
| 3 | Intl.DateTimeFormat 智能日期 |

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
