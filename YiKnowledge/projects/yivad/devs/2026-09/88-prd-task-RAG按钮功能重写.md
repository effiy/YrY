---
prd_task_id: "YV-09-88"
title: "YV-09-88: RAG 按钮功能重写 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiVad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "88-prd-RAG按钮功能重写.md"
related_tests: [88-prd-test-RAG按钮功能重写]
tags: [RAG, UI重写, 按钮, 状态指示, 开发方案]
category: 项目/管理后台/开发
source: internal
type: task
benefit: "开发方案：task-RAG按钮功能重写"
lifecycle: active
---

# YV-09-88: RAG 按钮功能重写 — 开发方案

> 需求编号：YV-09-88 · 人天：0.5d

> **文档职责**：本文档定义**怎么做、为什么这么做**（HOW）。

---

<a id="sec-1"></a>
## 一、方案概述

将 RAG pill 从纯二元开关升级为智能状态指示器，增加索引健康指示、检索中动画、Fast Mode 支持和修正的角色范围选项。

### 架构

```
ChatToolbar/index.vue (RAG pill template + script)
  ├── props: ragFast, streamingPhase (新增)
  ├── computed: ragHealthDot, isRetrieving
  ├── template: 三态 pill (off / on-idle / retrieving)
  │   ├── 健康圆点 (green/orange/red)
  │   ├── 图标 (Cpu / Loading spinner)
  │   ├── 标签 ("RAG" / "RAG+Web" / "Retrieving")
  │   ├── FAST 徽章
  │   └── 齿轮弹窗 (Quick Settings + Advanced)
  └── styles: toolbar.scss (新增), global.scss (替换)
```

### 状态流转

```
关闭 (gray) → 点击 toggle → 开启-idle (blue + health dot)
开启-idle → 发送消息 → retrieving (orange pulse + "Retrieving")
retrieving → 收到 chunk → streaming (blue + source count)
streaming → 完成/停止 → 开启-idle (blue + stats)
开启-idle → 点击 toggle → 关闭 (gray)
```

---

<a id="sec-2"></a>
## 二、实现细节

### 2.1 索引健康指示器

新增 `ragHealthDot` 计算属性：

```typescript
const ragHealthDot = computed<"green" | "orange" | "red">(() => {
  if (!ragIndexStatus.value) return "red";
  if (ragIndexStatus.value.error) return "orange";
  if (ragIndexStatus.value.built && ragIndexStatus.value.num_docs > 0) return "green";
  if (ragIndexStatus.value.built) return "orange";
  return "red";
});
```

渲染为 `<span class="ct-rag-dot" :class="ragHealthDot" />`

### 2.2 检索中状态

通过 `streamingPhase` prop 传入，当值为 `"retrieving"` 时：
- 图标切换为旋转 `<Loading />` spinner
- 标签显示 "Retrieving"
- pill 获得 `retrieving` class 触发脉冲动画

### 2.3 Fast Mode

- 新增 `ragFast` prop，通过 store → ChatInput → ChatToolbar 传递
- 开启时 pill 边框变为虚线，显示橙色 "FAST" 徽章
- `streamRagChat` 调用传递 `fast: ragFast.value`

### 2.4 设置弹窗重组

弹窗内容分为两组：

**Quick Settings**：
- Scope（修正角色列表为 YiKnowledge 实际角色）
- Chat Mode
- Fast Mode toggle

**Advanced**：
- Query Variants
- Hybrid (BM25+Vector)
- Rerank (LLM)
- HyDE
- Citations [N]

每个设置项带 `?` tooltip 说明功能。

### 2.5 Scope 角色修正

旧：`curator, engineer, designer, researcher, strategist, analyst, operator`
新：`curator, engineer, product, leader, executive, sre, aier`

### 2.6 死代码删除

删除 `ChatToolbar/RagPill.vue`（独立组件，0 引用，与 ChatToolbar 内联代码重复）。

---

<a id="sec-3"></a>
## 三、完成定义（DoD）

- [x] RAG pill 三态渲染正确（off / idle / retrieving）
- [x] 健康圆点正确反映索引状态
- [x] Fast Mode badge 显示 + 虚线边框
- [x] 设置弹窗分两组，带 tooltip 说明
- [x] Scope 角色选项修正
- [x] `vue-tsc --noEmit` 0 错误
- [x] RagPill.vue 已删除

---

## 源码索引

| 文件 | 改动 |
|------|------|
| `ChatToolbar/index.vue` | RAG pill 模板重写 + 新增 computed/ref |
| `ChatToolbar/styles/toolbar.scss` | 新增 .ct-rag-dot, .ct-rag-fast-badge, .ct-rag-pulse keyframes |
| `ChatToolbar/styles/global.scss` | .ct-rag-settings → .ct-rag-pop 样式替换 |
| `stores/modules/aiChat.ts` | 暴露 ragFast (line 67, 253, 535) |
| `stores/.../useStreaming.ts` | StreamingDeps + ragFast, streamRagChat 传递 fast |
| `ChatInput.vue` | 新增 :rag-fast :streaming-phase props + event |
| `ChatToolbar/RagPill.vue` | **已删除** |